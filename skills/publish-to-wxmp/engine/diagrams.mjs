import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fromMarkdown } from "mdast-util-from-markdown";
import { parse, render } from "pele";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import opentype from "opentype.js";
import { parseFragment, serialize } from "parse5";
import postcss from "postcss";
import valueParser from "postcss-value-parser";

const ASSETS = new URL("./diagram-assets/", import.meta.url);
const FAMILY = "Noto Sans CJK SC";
let resources;
export function checkDiagramAssets() {
  const manifest = JSON.parse(fs.readFileSync(new URL("manifest.json", ASSETS)));
  for (const [name, entry] of Object.entries(manifest)) {
    const bytes = fs.readFileSync(new URL(name, ASSETS));
    if (bytes.length !== entry.bytes || crypto.createHash("sha256").update(bytes).digest("hex") !== entry.sha256) throw new Error(`missing or corrupt diagram asset: ${name}; reinstall the skill`);
  }
}
async function loadResources() {
  if (!resources) resources = (async () => {
    checkDiagramAssets();
    const bytes = fs.readFileSync(new URL("NotoSansCJKsc-Regular.otf", ASSETS));
    const font = opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    await initWasm(fs.readFileSync(new URL("resvg.wasm", ASSETS)));
    return { bytes, font };
  })();
  return resources;
}

// SVG presentation attributes also contain var(), so HTML-only style inlining
// is insufficient. Resolve inherited variables before handing SVG to resvg.
function concreteSvg(svg, font, palette = {}) {
  const tree = parseFragment(svg);
  function visit(node, inherited, presentation = {}) {
    if (!node.attrs) return;
    if (["image", "foreignObject", "script", "style"].includes(node.tagName)) throw new Error(`unsupported diagram resource: ${node.tagName}; use text and shapes`);
    const attrs = new Map(node.attrs.map(attr => [attr.name, attr]));
    const style = postcss.parse(`svg{${attrs.get("style")?.value || ""}}`).first;
    const vars = new Map(inherited);
    style.walkDecls(decl => { if (decl.prop.startsWith("--")) vars.set(decl.prop, decl.value); });
    function resolve(value, seen = new Set()) {
      const parsed = valueParser(value);
      parsed.walk(part => {
        if (part.type !== "function" || part.value !== "var") return;
        const comma = part.nodes.findIndex(child => child.type === "div" && child.value === ",");
        const name = valueParser.stringify(comma < 0 ? part.nodes : part.nodes.slice(0, comma)).trim();
        if (seen.has(name)) throw new Error(`cyclic SVG variable: ${name}`);
        const fallback = comma < 0 ? undefined : valueParser.stringify(part.nodes.slice(comma + 1));
        const replacement = vars.get(name) ?? fallback;
        if (replacement === undefined) throw new Error(`unresolved SVG variable: ${name}`);
        part.type = "word";
        part.value = resolve(replacement, new Set([...seen, name]));
        delete part.nodes;
        return false;
      });
      return parsed.toString();
    }
    style.walkDecls(decl => {
      if (decl.prop.startsWith("--")) decl.remove();
      else decl.value = resolve(decl.value);
    });
    if (attrs.has("style")) attrs.get("style").value = style.nodes.map(decl => decl.toString()).join(";");
    for (const attr of node.attrs) if (attr.name !== "style") attr.value = resolve(attr.value);
    const paint = { ...presentation };
    for (const attr of node.attrs) paint[attr.name] = attr.value;
    style.walkDecls(decl => { paint[decl.prop] = decl.value; });
    if (node.tagName === "text" || node.tagName === "tspan") {
      if (["none", "transparent"].includes(paint.fill?.toLowerCase()) || paint.opacity === "0" || paint.display === "none" || paint.visibility === "hidden") throw new Error("invisible diagram label; use high-contrast text");
      for (const child of node.childNodes || []) {
        if (child.nodeName !== "#text") continue;
        for (const character of child.value) if (!/\s/u.test(character) && !font.charToGlyphIndex(character)) throw new Error(`missing glyph U+${character.codePointAt(0).toString(16).toUpperCase()}: ${character}`);
      }
    }
    for (const child of node.childNodes || []) visit(child, vars, paint);
  }
  const aliases = { background: "bg", foreground: "fg", foreground_on_light: "fg-on-light", foreground_on_dark: "fg-on-dark" };
  const variables = new Map(Object.entries(palette).map(([key, value]) => [`--pele-${aliases[key] || key.replaceAll("_", "-")}`, value]));
  for (const node of tree.childNodes) visit(node, variables);
  return serialize(tree);
}

function walkHtml(node, visit) {
  visit(node);
  for (const child of node.childNodes || []) walkHtml(child, visit);
}

function linkDescription(svg, link) {
  const labels = [];
  const descriptions = [];
  const text = node => node.nodeName === "#text" ? node.value : (node.childNodes || []).map(text).join("");
  walkHtml(parseFragment(svg), node => {
    if (node.tagName !== "a" || !node.attrs.some(attr => attr.name === "href" && attr.value === link.href)) return;
    for (let owner = node; owner; owner = owner.parentNode) {
      const id = owner.attrs?.find(attr => attr.name === "data-id")?.value;
      if (id) { if (id !== link.id) return; break; }
    }
    walkHtml(node, child => {
      if (child.tagName === "title") descriptions.push(text(child));
      if (child.tagName === "text") labels.push(text(child));
    });
  });
  const label = labels.join(" ").trim() || link.id;
  const description = descriptions.join(" ").trim();
  return description && description !== label ? `${label}：${description}` : label;
}

export function imageSources(html, baseDir) {
  const sources = new Set();
  walkHtml(parseFragment(html), node => {
    if (node.tagName === "img") {
      const src = node.attrs.find(attr => attr.name === "src")?.value;
      if (src) sources.add(src);
    }
  });
  return [...sources].map(src => ({ src, baseDir }));
}

export function replaceImage(html, src, url) {
  const tree = parseFragment(html);
  walkHtml(tree, node => {
    if (node.tagName === "img") {
      const attr = node.attrs.find(attr => attr.name === "src");
      if (attr?.value === src) attr.value = url;
    }
  });
  return serialize(tree);
}

export function rewriteImageReferences(markdown, src, url) {
  const changes = [];
  function visit(node) {
    const { start, end } = node.position || {};
    let text;
    const escape = value => value.replace(/[\\\\\[\]"]/g, "\\$&");
    if (node.url === src) {
      const title = node.title ? ` "${escape(node.title)}"` : "";
      if (node.type === "image") text = `![${escape(node.alt || "")}](${url}${title})`;
      if (node.type === "definition") text = `[${escape(node.label || node.identifier)}]: <${url}>${title}`;
    } else if (node.type === "html") text = replaceImage(markdown.slice(start.offset, end.offset), src, url);
    if (text !== undefined) changes.push({ start: start.offset, end: end.offset, text });
    for (const child of node.children || []) visit(child);
  }
  visit(fromMarkdown(markdown));
  for (const { start, end, text } of changes.reverse()) markdown = markdown.slice(0, start) + text + markdown.slice(end);
  return markdown;
}

export async function compileDiagrams(markdown, directory, now = Date.now(), palette = {}) {
  const diagrams = [];
  function collect(node) {
    if (node.type === "code" && node.lang === "mermaid") diagrams.push(node);
    for (const child of node.children || []) collect(child);
  }
  collect(fromMarkdown(markdown));
  if (!diagrams.length) return { markdown, images: [] };
  const { bytes, font } = await loadResources();
  fs.mkdirSync(path.join(directory, "diagrams"), { recursive: true });
  const images = [];
  const replacements = [];
  for (const [index, node] of diagrams.entries()) {
    try {
      if (node.value.includes("$$")) throw new Error("math typesetting is unsupported; rewrite as text/shapes");
      if (/::icon\s*\(|\bfa[brs]?:fa-/i.test(node.value)) throw new Error("custom icons are unsupported; rewrite as text/shapes");
      const model = parse(node.value, { limit: 50000, maxEdges: 1000 });
      const seen = new Set();
      function validateResources(value) {
        if (!value || typeof value !== "object" || seen.has(value)) return;
        seen.add(value);
        if (value instanceof Map) {
          for (const child of value.values()) validateResources(child);
          return;
        }
        for (const [key, child] of Object.entries(value)) {
          if (["img", "image", "imageUrl"].includes(key) && child) throw new Error("diagram images are unsupported; rewrite as text/shapes");
          if (key === "icon" && typeof child === "string" && child.includes(":")) throw new Error("custom icons are unsupported; rewrite as text/shapes");
          validateResources(child);
        }
      }
      validateResources(model);
      const result = render(model, {
        idPrefix: "diagram", fontFamily: FAMILY, fontFamilyMono: FAMILY,
        fontSize: 16, maxWidth: 315, now,
        __wxmpPreserveSeriesSlots: Object.keys(palette).length > 0,
        icons() { throw new Error("custom icons are unsupported; rewrite as text/shapes"); },
        math() { throw new Error("math typesetting is unsupported; rewrite as text/shapes"); },
        measurer: { width(text, size) { return font.getAdvanceWidth(text, size, { kerning: true }); } },
      });
      if (![result.width, result.height].every(n => Number.isFinite(n) && n > 0 && n <= 4096) || result.width * result.height * 4 > 8000000) throw new Error("diagram dimensions exceed the raster limit; split the diagram");
      const svg = concreteSvg(result.svg, font, palette);
      const background = palette.background || "#ffffff";
      const hex = background.length === 4 ? background.slice(1).replace(/./g, "$&$&") : background.slice(1);
      const canvas = [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
      const renderer = new Resvg(svg, {
        background, fitTo: { mode: "zoom", value: 2 },
        font: { fontBuffers: [bytes], defaultFontFamily: FAMILY, sansSerifFamily: FAMILY, monospaceFamily: FAMILY, serifFamily: FAMILY, loadSystemFonts: false },
      });
      let image;
      let png;
      try {
        if (renderer.imagesToResolve().length) throw new Error("external image resources are unsupported");
        const bounds = renderer.innerBBox();
        try {
          if (!bounds) throw new Error("empty diagram");
          if (bounds.x < -1 || bounds.y < -1 || bounds.x + bounds.width > result.width + 1 || bounds.y + bounds.height > result.height + 1) throw new Error("diagram content is clipped; adjust layout or split the diagram");
        } finally { bounds?.free(); }
        image = renderer.render();
        const pixels = image.pixels;
        let visible = 0;
        for (let i = 0; i < pixels.length; i += 4)
          if (canvas.some((channel, index) => Math.abs(pixels[i + index] - channel) > 55)) visible++;
        if (visible < 10) throw new Error("blank diagram image");
        png = image.asPng();
        if (png.length >= 10 * 1024 * 1024) throw new Error("diagram PNG exceeds Wechat's 10MB image limit");
      } finally { image?.free(); renderer.free(); }
      const identity = crypto.createHash("sha256").update(svg);
      // The canvas may change PNG bytes without appearing in the concrete SVG.
      // Keep the historical SVG-only identity when no canvas was configured.
      if (palette.background) identity.update(`\0background:${hex.toLowerCase()}`);
      const key = identity.digest("hex").slice(0, 20);
      const name = `diagrams/${key}`;
      fs.writeFileSync(path.join(directory, `${name}.mmd`), node.value);
      fs.writeFileSync(path.join(directory, `${name}.svg`), svg);
      fs.writeFileSync(path.join(directory, `${name}.png`), png);
      const caption = `图 ${index + 1}：${result.type}`;
      const links = result.links.map(link => {
        if (link.internal || !/^https?:\/\//.test(link.href)) throw new Error("move note/non-web links into the article before rendering");
        const label = linkDescription(result.svg, link).replace(/[\\\\`*_[\]<>]/g, "\\$&").replace(/\s+/g, " ");
        return `[图 ${index + 1} ${label}](${link.href.replace(/\(/g, "%28").replace(/\)/g, "%29")})`;
      });
      const start = node.position.start.offset;
      const prefix = markdown.slice(markdown.lastIndexOf("\n", start - 1) + 1, start);
      const text = [`![${caption}](${name}.png)`, ...links].join("\n\n").replace(/\n/g, `\n${prefix}`);
      replacements.push({ start, end: node.position.end.offset, text });
      images.push(`${name}.png`);
    } catch (error) {
      throw new Error(`diagram ${index + 1} (line ${node.position.start.line}): ${error.message}`, { cause: error });
    }
  }
  let output = markdown;
  for (const { start, end, text } of replacements.reverse()) output = output.slice(0, start) + text + output.slice(end);
  return { markdown: output, images };
}
