import { parseFragment } from "parse5";
import postcss from "postcss";
import valueParser from "postcss-value-parser";

// Only replace CSS var() functions, not strings, URLs or article/code text.
function expandVariables(value, lookup) {
  const parsed = valueParser(value);
  let valid = true;
  parsed.walk(node => {
    if (node.type !== "function" || node.value !== "var") return;
    const comma = node.nodes.findIndex(part => part.type === "div" && part.value === ",");
    const name = valueParser.stringify(comma < 0 ? node.nodes : node.nodes.slice(0, comma)).trim();
    let replacement = lookup(name);
    if (replacement === undefined && comma >= 0) {
      replacement = expandVariables(valueParser.stringify(node.nodes.slice(comma + 1)), lookup);
    }
    if (replacement === undefined) {
      valid = false;
    } else {
      node.type = "word";
      node.value = replacement;
      delete node.nodes;
    }
    return false;
  });
  return valid ? parsed.toString() : undefined;
}

function resolveScope(inherited, declarations) {
  const raw = new Map(inherited);
  const local = new Map();
  for (const declaration of declarations) {
    if (!declaration.prop.startsWith("--")) continue;
    const previous = local.get(declaration.prop);
    if (!previous?.important || declaration.important) local.set(declaration.prop, declaration);
  }
  for (const [name, declaration] of local) raw.set(name, declaration.value);

  const resolved = new Map();
  const path = [];
  const cyclic = new Set();
  function lookup(name) {
    if (resolved.has(name)) return resolved.get(name);
    if (!raw.has(name) || raw.get(name) === undefined) return undefined;
    const cycleStart = path.indexOf(name);
    if (cycleStart >= 0) {
      for (const member of path.slice(cycleStart)) cyclic.add(member);
      return undefined;
    }
    path.push(name);
    const value = expandVariables(raw.get(name), lookup);
    path.pop();
    resolved.set(name, cyclic.has(name) ? undefined : value);
    return resolved.get(name);
  }
  for (const name of raw.keys()) lookup(name);
  return resolved;
}

/**
 * Materialize inline CSS before preview/upload/push share the saved artifact.
 * WeChat drops declarations after a CSS custom property in a style attribute.
 * Resolve inherited/local variables first, then remove their definitions. An
 * unresolved value is omitted rather than shipping a broken var() dependency.
 * HTML/CSS parsers preserve quoted fonts, entities and data URLs.
 * These development dependencies are bundled; the CLI stays dependency-free.
 */
export function inlineWechatStyles(html) {
  const document = parseFragment(html, { sourceCodeLocationInfo: true });
  const replacements = [];
  function visit(node, inherited) {
    let variables = inherited;
    const style = node.attrs?.find(attribute => attribute.name === "style");
    if (style) {
      const css = postcss.parse(style.value);
      const declarations = css.nodes.filter(part => part.type === "decl");
      variables = resolveScope(inherited, declarations);
      for (const declaration of declarations) {
        if (declaration.prop.startsWith("--")) {
          declaration.remove();
          continue;
        }
        const value = expandVariables(declaration.value, name => variables.get(name));
        if (value === undefined) declaration.remove();
        else declaration.value = value;
      }
      // Rewrite only this attribute's source range. Serializing the whole DOM
      // would also escape image URLs, breaking upload's literal URL rewriting.
      const location = node.sourceCodeLocation.attrs.style;
      const escaped = css.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;");
      replacements.push({ start: location.startOffset, end: location.endOffset,
        value: `style="${escaped}"` });
    }
    for (const child of node.childNodes ?? []) visit(child, variables);
    if (node.content) visit(node.content, variables);
  }
  visit(document, new Map());
  const parts = [];
  let cursor = 0;
  for (const replacement of replacements.sort((a, b) => a.start - b.start)) {
    parts.push(html.slice(cursor, replacement.start), replacement.value);
    cursor = replacement.end;
  }
  parts.push(html.slice(cursor));
  return parts.join("");
}
