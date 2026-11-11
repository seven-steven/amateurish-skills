#!/usr/bin/env npx tsx
/**
 * wxpush — push a markdown note to the Wechat Official Account draft box.
 * Contract: ../WXPUSH.md. Zero npm deps: engine is a prebuilt bundle at
 * ../engine/engine.mjs (see engine/ATTRIBUTION.md).
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import os from "node:os";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import * as yaml from "./yaml.mts";
import { beginBuild, loadBuild, saveRecord, themeFingerprint } from "./artifacts.mts";

const HERE = import.meta.dirname;
  // make CJS deps (reading-time) able to require() node builtins under ESM
  const { createRequire } = await import("node:module");
  if (typeof (globalThis as any).require === "undefined") (globalThis as any).require = createRequire(import.meta.url);
  const ENGINE = path.join(HERE, "..", "engine", "engine.mjs");
if (!fs.existsSync(ENGINE)) die(`engine bundle missing: ${ENGINE} (run node engine/build.mjs)`);
const { initRenderer, renderMarkdown, postProcessHtml, inlineWechatStyles, themeMap } = await import(
  pathToFileURL(ENGINE)
);
function pathToFileURL(p: string): string {
  return `file://${p.split(path.sep).map(encodeURIComponent).join("/").replace(/^\/?/, "/")}`;
}

// user config and runtime state live OUTSIDE the skill dir so `skills add` reinstalls never clobber them
const CONFIG = path.join(os.homedir(), ".config", "skills", "publish-to-wxmp", "config.json");
const RUNTIME = envHome("WXMP_STATE_DIR") ?? path.join(os.homedir(), ".local", "state", "wxmp-publisher");
function envHome(k: string): string | undefined {
  const v = process.env[k]?.trim();
  if (!v) return undefined;
  return v.startsWith("~") ? path.join(os.homedir(), v.slice(1)) : v;
}
const RUNTIME_OUT = path.join(RUNTIME, "output");
const IMAGE_CACHE = path.join(RUNTIME, "image-cache.json");
const DRAFTS = path.join(RUNTIME, "drafts.json");
const THEMES_DIR = path.join(HERE, "..", "themes");

// Migrate runtime state only from the legacy skill-local `.bin/` layout.
const LEGACY_BIN = path.join(HERE, "..", ".bin");
function migrateLegacy(): void {
  if (!fs.existsSync(LEGACY_BIN)) return;
  fs.mkdirSync(RUNTIME, { recursive: true });
  for (const name of ["image-cache.json", "drafts.json", "output"]) {
    const src = path.join(LEGACY_BIN, name);
    if (fs.existsSync(src) && !fs.existsSync(path.join(RUNTIME, name)))
      fs.cpSync(src, path.join(RUNTIME, name), { recursive: true });
  }
}
migrateLegacy();

type Theme = {
  base?: Record<string, string>;
  block?: Record<string, Record<string, string>>;
  inline?: Record<string, Record<string, string>>;
  renderOptions?: { isMacCodeBlock?: boolean; isShowLineNumber?: boolean };
  pele?: Record<string, string>;
};
type Config = { api_base?: string; author?: string; theme?: string; cover_dir?: string };

function loadConfig(): Config {
  try {
    return JSON.parse(fs.readFileSync(CONFIG, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    die(`cannot load config ${CONFIG}: ${(error as Error).message}`);
  }
}
function env(k: string): string | undefined {
  return process.env[k]?.trim() || undefined;
}
function apiBase(): string {
  const base = env("WXMP_API_BASE") || loadConfig().api_base;
  if (!base) die(`no API base: set WXMP_API_BASE or api_base in ${CONFIG}`);
  return base.replace(/\/+$/, "");
}
function authHeaders(): Record<string, string> {
  const t = env("WXMP_API_TOKEN");
  return t ? { Authorization: `Bearer ${t}` } : {};
}
function die(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(1);
}

// ---------- front-matter ----------
type WechatMeta = {
  title?: string; digest?: string; cover?: string; author?: string; source_url?: string;
};
function splitFrontMatter(raw: string): { meta: WechatMeta; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta: WechatMeta = {};
  const wm = m[1].match(/^wechat:\r?\n((?:[ \t]+.*\r?\n?)*)/m);
  if (wm) {
    for (const line of wm[1].split(/\r?\n/)) {
      const kv = line.trim().match(/^(\w[\w-]*):\s*(.*)$/);
      if (!kv) continue;
      const key = kv[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof WechatMeta;
      (meta as any)[key] = kv[2].replace(/^["']|["']$/g, "");
    }
  }
  return { meta, body: raw.slice(m[0].length) };
}

// ---------- themes ----------
function deepMerge<T>(base: T, over: unknown): T {
  if (over === null || over === undefined) return base;
  if (Array.isArray(base) || Array.isArray(over) || typeof base !== "object" || typeof over !== "object") {
    return over as T;
  }
  const out: any = { ...base };
  for (const [k, v] of Object.entries(over as object)) out[k] = k in out ? deepMerge((out as any)[k], v) : v;
  return out;
}

function builtinThemes(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(themeMap));
}

function listThemes(): { name: string; source: string }[] {
  const out = Object.keys(themeMap).map(name => ({ name, source: "builtin" }));
  if (fs.existsSync(THEMES_DIR)) {
    for (const f of fs.readdirSync(THEMES_DIR)) {
      if (f.endsWith(".yaml") || f.endsWith(".yml")) out.push({ name: f.replace(/\.ya?ml$/, ""), source: "custom" });
    }
  }
  return out;
}

const PELE_COLORS = new Set([
  "background", "foreground", "muted", "line", "border", "surface", "surface_alt",
  "accent", "critical", "foreground_on_light", "foreground_on_dark",
  ...Array.from({ length: 8 }, (_, index) => `series_${index + 1}`),
]);

function validatePele(value: unknown, file: string): asserts value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${file}: pele must be a color mapping`);
  for (const [key, color] of Object.entries(value)) {
    if (!PELE_COLORS.has(key)) throw new Error(`${file}: pele.${key}: unknown color field`);
    if (typeof color !== "string" || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color))
      throw new Error(`${file}: pele.${key}: expected a quoted opaque #RGB or #RRGGBB color`);
  }
}

function loadTheme(name: string): Theme {
  const builtins = builtinThemes();
  if (builtins[name]) return builtins[name] as Theme;
  const file = ["yaml", "yml"].map(e => path.join(THEMES_DIR, `${name}.${e}`)).find(fs.existsSync);
  if (!file) throw new Error(`theme not found: ${name} (see --list-themes)`);
  let spec: { base_theme?: string } & Theme;
  try { spec = yaml.parse(fs.readFileSync(file, "utf8"), { implicitEmptyMapsAsNull: ["pele"] }) as typeof spec; }
  catch (error) { throw new Error(`${file}: ${(error as Error).message}`); }
  if (Object.hasOwn(spec, "pele")) validatePele(spec.pele, file);
  const base = spec.base_theme ? builtins[spec.base_theme] : undefined;
  if (spec.base_theme && !base) throw new Error(`unknown base_theme: ${spec.base_theme}`);
  const merged = base ? deepMerge(base, spec) : spec;
  return JSON.parse(JSON.stringify(merged));
}

function effectiveThemeFingerprint(theme: Theme): string {
  return themeFingerprint({
    base: theme.base ?? {}, block: theme.block ?? {}, inline: theme.inline ?? {},
    renderOptions: {
      isMacCodeBlock: theme.renderOptions?.isMacCodeBlock ?? true,
      isShowLineNumber: theme.renderOptions?.isShowLineNumber ?? false,
    },
    pele: theme.pele ?? {},
  });
}

// ---------- run dir ----------
function writeRun(dir: string, file: string, content: string) {
  fs.writeFileSync(path.join(dir, file), content);
}

// ---------- images ----------
type Cache = Record<string, string>; // sha256(source bytes) -> cdn url
function loadCache(): Cache {
  try { return JSON.parse(fs.readFileSync(IMAGE_CACHE, "utf8")); } catch { return {}; }
}
function saveCache(c: Cache) {
  fs.mkdirSync(RUNTIME, { recursive: true });
  fs.writeFileSync(IMAGE_CACHE, JSON.stringify(c, null, 2));
}

async function fetchBytes(src: string, noteDir: string): Promise<{ bytes: Buffer; mime: string; name: string }> {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) die(`download failed ${res.status}: ${src}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return { bytes: buf, mime: res.headers.get("content-type")?.split(";")[0] || "image/png", name: src.split("/").pop() || "img" };
  }
  if (src.startsWith("data:")) {
    const [h, b64] = src.split(",", 2);
    const mime = h.slice(5).split(";")[0] || "image/png";
    return { bytes: Buffer.from(b64, "base64"), mime, name: "img." + mime.split("/")[1] };
  }
  const p = path.resolve(noteDir, decodeURIComponent(src));
  if (!fs.existsSync(p)) die(`image not found: ${p}`);
  const buf = fs.readFileSync(p);
  const mime = p.match(/\.(png|gif|jpe?g|webp|bmp)$/i)
    ? "image/" + (p.match(/jpe?g$/i) ? "jpeg" : p.split(".").pop()!.toLowerCase())
    : "image/png";
  return { bytes: buf, mime, name: path.basename(p) };
}

async function uploadImage(bytes: Buffer, mime: string, name: string): Promise<string> {
  const form = new FormData();
  form.append("image", new Blob([new Uint8Array(bytes)], { type: mime }), name);
  const res = await fetch(`${apiBase()}/publish/img`, {
    method: "PUT", headers: { ...authHeaders() }, body: form,
  });
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok || !data.url) die(`image upload failed (${res.status}): ${data.error ?? "unknown"}`);
  return data.url;
}

function collectImages(body: string): string[] {
  const urls: string[] = [];
  const mdImg = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const m of body.matchAll(mdImg)) urls.push(m[1]);
  const htmlImg = /<img[^>]+src=["']([^"']+)["']/g;
  for (const m of body.matchAll(htmlImg)) urls.push(m[1]);
  return [...new Set(urls)];
}

// ---------- draft ----------
async function pushDraft(opts: { title: string; html: string; digest?: string; author?: string; cover: string; sourceUrl?: string; mediaId?: string }) {
  const coverData = await fetchBytes(opts.cover, process.cwd());
  if (coverData.bytes.length > 2 * 1024 * 1024) die(`cover > 2MB: ${opts.cover}`);
  const coverBase64 = `data:${coverData.mime};base64,${coverData.bytes.toString("base64")}`;
  const update = Boolean(opts.mediaId);
  const res = await fetch(`${apiBase()}${update ? "/publish/update" : "/publish"}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(update ? { media_id: opts.mediaId } : {}),
      title: opts.title, content: opts.html, digest: opts.digest || "",
      author: opts.author || "", cover_base64: coverBase64,
      content_source_url: opts.sourceUrl || "",
    }),
  });
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok || !(data.media_id)) die(`draft ${update ? "update" : "create"} failed (${res.status}): ${data.error ?? "unknown"}`);
  return data.media_id as string;
}

// ---------- draft registry: note path -> media_id of its draft ----------
type Drafts = Record<string, string>;
function loadDrafts(): Drafts {
  try { return JSON.parse(fs.readFileSync(DRAFTS, "utf8")); } catch { return {}; }
}
function saveDrafts(d: Drafts) {
  fs.mkdirSync(RUNTIME, { recursive: true });
  fs.writeFileSync(DRAFTS, JSON.stringify(d, null, 2));
}

// ---------- preview ----------
function preview(htmlPath: string, port: number, noteDir: string, watch: boolean) {
  const clients = new Set<import("node:http").ServerResponse>();
  const server = http.createServer((req, res) => {
    if (watch && req.url === "/__reload") {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache" });
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }
    let p = req.url!.split("?")[0];
    if (p === "/") p = "/" + path.basename(htmlPath);
    const candidates = [path.join(path.dirname(htmlPath), p), path.join(noteDir, p)];
    const file = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
    if (!file) { res.writeHead(404); res.end("not found"); return; }
    const ext = path.extname(file).toLowerCase();
    const mime = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml" }[ext] || "application/octet-stream";
    res.writeHead(200, { "content-type": mime });
    fs.createReadStream(file).pipe(res);
  });
  server.listen(port, () => {
    const url = `http://localhost:${port}/`;
    console.log(`preview: ${url} (Ctrl-C to stop${watch ? ", watching for rebuilds" : ""})`);
    const opener = process.platform === "darwin" ? "open" : "xdg-open";
    spawnSync(opener, [url], { stdio: "ignore" });
  });
  if (watch) {
    let timer: NodeJS.Timeout | undefined;
    fs.watch(path.dirname(htmlPath), () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("change detected, reloading clients");
        for (const c of clients) c.write("data: reload\n\n");
      }, 200);
    });
  }
  process.on("SIGINT", () => { server.close(); process.exit(0); });
}

// ---------- commands ----------
async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const note = args.find((a: string) => !a.startsWith("--"));
  const flag = (name: string): string | undefined => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const hasFlag = (name: string): boolean => args.includes(`--${name}`);

  if (cmd === "doctor") {
    let ok = true;
    const base = loadConfig().api_base || env("WXMP_API_BASE");
    console.log(`engine: ${fs.existsSync(ENGINE) ? "ok" : "MISSING " + ENGINE}`); ok &&= fs.existsSync(ENGINE);
    try {
      const { checkDiagramAssets } = await import("../engine/diagrams.bundle.mjs");
      checkDiagramAssets();
      console.log("diagrams: ok (offline renderer, WASM and Chinese font)");
    } catch (error) { console.log(`diagrams: ${(error as Error).message}`); ok = false; }
    console.log(`api_base: ${base ?? `MISSING (set WXMP_API_BASE or api_base in ${CONFIG})`}`); ok &&= !!base;
    if (base) {
      try {
        const res = await fetch(`${base.replace(/\/+$/, "")}/health`);
        console.log(`server health: ${res.status === 200 ? "ok" : `HTTP ${res.status}`}`); ok &&= res.ok;
      } catch (e) { console.log(`server health: unreachable (${(e as Error).message})`); ok = false; }
    }
    console.log(`themes: ${listThemes().map(t => t.name + (t.source === "custom" ? "*" : "")).join(", ")}`);
    console.log(ok ? "doctor: PASS" : "doctor: FAIL");
    process.exit(ok ? 0 : 1);
  }

  if (cmd === "themes" || flag("list-themes") !== undefined && !note) {
    for (const t of listThemes()) console.log(`${t.name}\t${t.source}`);
    return;
  }

  if (!note) die(`usage: wxpush <doctor|themes|build|upload|push|preview> <note.md> [options]`);
  const notePath = path.resolve(note);
  if (!fs.existsSync(notePath)) die(`note not found: ${notePath}`);
  const noteDir = path.dirname(notePath);
  const raw = fs.readFileSync(notePath, "utf8");
  const { meta, body } = splitFrontMatter(raw);
  const cfg = loadConfig();

  if (cmd === "build") {
    const { dir, record } = beginBuild(RUNTIME_OUT, notePath, raw, flag("out"));
    const theme = flag("theme") || cfg.theme || "default";
    const selectedTheme = loadTheme(theme);
    record.theme = { name: theme, fingerprint: effectiveThemeFingerprint(selectedTheme) };
    const renderer = initRenderer({
      theme: selectedTheme,
      fonts: `-apple-system,BlinkMacSystemFont,"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif`,
      size: "15px",
      isUseIndent: false,
      isUseJustify: true,
      legend: "alt-title",
      countStatus: false,
      citeStatus: true,
      isMacCodeBlock: selectedTheme.renderOptions?.isMacCodeBlock ?? true,
      isShowLineNumber: selectedTheme.renderOptions?.isShowLineNumber ?? false,
    });
    const { compileDiagrams, imageSources } = await import("../engine/diagrams.bundle.mjs");
    const diagramNow = fs.statSync(notePath).mtimeMs;
    const compiled = await compileDiagrams(body, dir, diagramNow, selectedTheme.pele);
    const { html, readingTime } = renderMarkdown(compiled.markdown, renderer);
    // Preserve the container/references and save the same concrete inline CSS
    // for preview and push. WeChat strips stylesheets and mishandles custom
    // property declarations, so resolve var() before removing their definitions.
    const full = inlineWechatStyles(postProcessHtml(html, readingTime, renderer)
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ""));
    writeRun(dir, "article.html", full);
    writeRun(dir, "article.md", compiled.markdown);
    writeRun(dir, "meta.json", JSON.stringify({ theme, meta, diagramNow }, null, 2));
    record.images = imageSources(full, noteDir).map(image => compiled.images.includes(image.src) ? { ...image, baseDir: dir } : image);
    record.state = "built";
    saveRecord(dir, record);
    console.log(`built: ${path.join(dir, "article.html")} (theme: ${theme})`);
    return;
  }

  const { dir: run, record } = loadBuild(RUNTIME_OUT, notePath, raw,
    name => effectiveThemeFingerprint(loadTheme(name)), flag("out"));

  if (cmd === "upload") {
    if (record.state === "uploaded") { console.log("already uploaded"); return; }
    const cache = loadCache();
    const { rewriteImageReferences, replaceImage } = await import("../engine/diagrams.bundle.mjs");
    let out = fs.readFileSync(path.join(run, "article.md"), "utf8");
    let html = fs.readFileSync(path.join(run, "article.html"), "utf8");
    for (const { src, baseDir } of record.images) {
      const { bytes, mime, name } = await fetchBytes(src, baseDir);
      const hash = crypto.createHash("sha256").update(bytes).digest("hex");
      let url = cache[hash];
      if (!url) {
        url = await uploadImage(bytes, mime, name);
        cache[hash] = url; saveCache(cache);
        console.log(`uploaded: ${src} -> ${url}`);
      } else console.log(`cached:   ${src}`);
      out = rewriteImageReferences(out, src, url);
      html = replaceImage(html, src, url);
    }
    writeRun(run, "article.md", out);
    writeRun(run, "article.html", html);
    record.state = "uploaded";
    saveRecord(run, record);
    console.log(`rewritten: ${path.join(run, "article.md")}`);
    return;
  }

  if (cmd === "push") {
    const update = hasFlag("update");
    const manualMediaId = flag("media-id");
    const drafts = loadDrafts();
    const noteKey = notePath;
    if (update && !manualMediaId && !drafts[noteKey])
      die("--update but no media_id on record for this note: push first, or pass --media-id <id>");
    if (record.state !== "uploaded") die("images not uploaded: run upload first");
    const title = flag("title") || meta.title || body.match(/^#\s+(.+)$/m)?.[1];
    if (!title) die("no title (front-matter wechat.title, --title, or an H1)");
    if (title.length > 64) die(`title ${title.length} chars > 64`);
    const digest = flag("digest") || meta.digest;
    if (digest && digest.length > 120) die(`digest ${digest.length} chars > 120`);
    const html = fs.readFileSync(path.join(run, "article.html"), "utf8");

    // cover: front-matter -> cover_dir by slug -> first note image
    const coverDir = cfg.cover_dir ? path.resolve(cfg.cover_dir) : path.join(noteDir, "..", "_assets", "wechat-covers");
    let cover = meta.cover ? path.resolve(noteDir, meta.cover) : "";
    if (!cover || !fs.existsSync(cover)) {
      if (fs.existsSync(coverDir)) {
        const slug = crypto.createHash("md5").update(title).digest("hex").slice(0, 8);
        const hit = fs.readdirSync(coverDir).find((f) => f.includes(slug));
        if (hit) cover = path.join(coverDir, hit);
      }
    }
    if (!cover || !fs.existsSync(cover)) {
      const first = collectImages(body)[0];
      if (first) {
        try { const p = path.resolve(noteDir, decodeURIComponent(first)); if (fs.existsSync(p)) { cover = p; console.warn(`warn: using first note image as cover: ${p}`); } } catch { /* remote */ }
      }
    }
    if (!cover || !fs.existsSync(cover)) die("no cover: set front-matter wechat.cover or drop one in cover_dir");

    const mediaId = await pushDraft({
      ...(update ? { mediaId: manualMediaId || drafts[noteKey] } : {}),
      title, html, digest,
      author: flag("author") || meta.author || cfg.author || "",
      cover, sourceUrl: flag("source-url") || meta.source_url,
    });
    drafts[noteKey] = mediaId;
    saveDrafts(drafts);
    console.log(update
      ? `draft updated: media_id=${mediaId}`
      : `draft created: media_id=${mediaId}`);
    if (!update) console.log("to update this draft in place later: push --update");
    console.log("next: open the Wechat admin, check the draft, publish manually.");
    return;
  }

  if (cmd === "preview") {
    const port = Number(flag("port") || 8099);
    preview(path.join(run, "article.html"), port, noteDir, flag("watch") !== undefined);
    return;
  }

  die(`unknown command: ${cmd}`);
}

main().catch((e) => die(e.stack ?? String(e)));
