import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type ImageSource = { src: string; baseDir: string };
export type BuildRecord = {
  version: 1;
  notePath: string;
  sourceHash: string;
  state: "building" | "built" | "uploaded";
  images: ImageSource[];
  theme?: { name: string; fingerprint: string };
};

export function themeFingerprint(config: unknown): string {
  const canonical = (value: any): any => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object")
      return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
    return value;
  };
  return hash(JSON.stringify(canonical(config)));
}

const hash = (text: string) => crypto.createHash("sha256").update(text).digest("hex");

export function beginBuild(outputRoot: string, notePath: string, raw: string, out?: string) {
  fs.mkdirSync(outputRoot, { recursive: true });
  const requested = out ? path.resolve(out) : fs.mkdtempSync(path.join(outputRoot, `${path.basename(notePath, ".md")}-`));
  fs.mkdirSync(requested, { recursive: true });
  const dir = fs.realpathSync(requested);
  const article = path.join(dir, "article.md");
  if (fs.existsSync(article) && fs.realpathSync(article) === fs.realpathSync(notePath)) throw new Error("output would overwrite the source note: choose a separate --out directory");
  const record: BuildRecord = { version: 1, notePath: fs.realpathSync(notePath), sourceHash: hash(raw), state: "building", images: [] };
  saveRecord(dir, record);
  const latest = path.join(outputRoot, "latest");
  const link = `${latest}-${crypto.randomUUID()}`;
  fs.symlinkSync(dir, link);
  fs.renameSync(link, latest);
  return { dir, record };
}

export function saveRecord(dir: string, record: BuildRecord) {
  const target = path.join(dir, "build.json");
  fs.writeFileSync(target + ".tmp", JSON.stringify(record, null, 2));
  fs.renameSync(target + ".tmp", target);
}

export function loadBuild(outputRoot: string, notePath: string, raw: string, resolveTheme: (name: string) => string, out?: string) {
  let dir: string;
  let record: BuildRecord;
  try {
    dir = fs.realpathSync(out ? path.resolve(out) : path.join(outputRoot, "latest"));
    record = JSON.parse(fs.readFileSync(path.join(dir, "build.json"), "utf8"));
  } catch {
    throw new Error("no verifiable build: run build (and upload) first");
  }
  if (record.version !== 1) throw new Error("old build format: run build first");
  if (record.notePath !== fs.realpathSync(notePath)) throw new Error("build belongs to another note: run build for this note first");
  if (record.sourceHash !== hash(raw)) throw new Error("build is stale: note changed — run build (and upload) first");
  if (record.state !== "built" && record.state !== "uploaded") throw new Error("build did not complete: fix the error and run build first");
  if (!record.theme || typeof record.theme.name !== "string" || !record.theme.name || typeof record.theme.fingerprint !== "string")
    throw new Error("build has no verifiable theme: run build (and upload) first");
  let current: string;
  try { current = resolveTheme(record.theme.name); }
  catch (error) { throw new Error(`build theme cannot be loaded: ${(error as Error).message} — run build (and upload) first`); }
  if (current !== record.theme.fingerprint) throw new Error("build is stale: theme changed — run build (and upload) first");
  return { dir, record };
}
