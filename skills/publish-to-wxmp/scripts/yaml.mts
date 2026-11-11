// Minimal YAML subset parser: nested maps, scalars, comments.
// Covers theme files (base/block/inline maps of strings -> string maps).
// Not a general YAML parser — intentionally tiny, zero deps.
type Yaml = Record<string, unknown>;

export function parse(text: string, options: { implicitEmptyMapsAsNull?: string[] } = {}): Yaml {
  const root: Yaml = Object.create(null);
  const implicitMaps = new Map<string, Yaml>();
  // stack of { indent, obj }
  const stack: { indent: number; obj: Yaml; key: string }[] = [{ indent: -1, obj: root, key: "" }];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/(^|\s)#.*$/, (m, p) => /["']/.test(rawLine.slice(rawLine.indexOf(m))) ? m : "").trimEnd();
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) throw new Error(`${stack.map(entry => entry.key).filter(Boolean).join(".")}: lists not supported in theme yaml`);
    const kv = trimmed.match(/^([^:]+):\s*(.*)$/);
    if (!kv) throw new Error(`cannot parse line: ${rawLine}`);
    const key = unquote(kv[1].trim());
    const valueRaw = kv[2].trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (valueRaw === "") {
      const child: Yaml = Object.create(null);
      parent[key] = child;
      if (parent === root && options.implicitEmptyMapsAsNull?.includes(key)) implicitMaps.set(key, child);
      stack.push({ indent, obj: child, key });
    } else {
      parent[key] = valueRaw === "{}" ? {} : scalar(unquote(valueRaw));
    }
  }
  // Opted-in top-level keys distinguish YAML null from an explicit {}.
  // Other sections keep the historical implicit-empty-map behavior.
  for (const [key, child] of implicitMaps) {
    if (root[key] === child && Object.keys(child).length === 0) root[key] = null;
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
