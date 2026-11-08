// Minimal YAML subset parser: nested maps, scalars, comments.
// Covers theme files (base/block/inline maps of strings -> string maps).
// Not a general YAML parser — intentionally tiny, zero deps.
type Yaml = Record<string, unknown>;

export function parse(text: string): Yaml {
  const root: Yaml = {};
  // stack of { indent, obj }
  const stack: { indent: number; obj: Yaml }[] = [{ indent: -1, obj: root }];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/(^|\s)#.*$/, (m, p) => /["']/.test(rawLine.slice(rawLine.indexOf(m))) ? m : "").trimEnd();
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) throw new Error("lists not supported in theme yaml");
    const kv = trimmed.match(/^([^:]+):\s*(.*)$/);
    if (!kv) throw new Error(`cannot parse line: ${rawLine}`);
    const key = unquote(kv[1].trim());
    const valueRaw = kv[2].trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (valueRaw === "") {
      const child: Yaml = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      parent[key] = scalar(unquote(valueRaw));
    }
  }
  return root;
}

function unquote(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
  return s;
}

function scalar(s: string): unknown {
  if (s === "true") return true;
  if (s === "false") return false;
  if (s === "null" || s === "~") return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}
