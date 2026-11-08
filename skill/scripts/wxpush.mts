#!/usr/bin/env npx tsx
/**
 * wxpush — push a markdown note to the Wechat Official Account draft box.
 * Contract: ../WXPUSH.md. Zero npm deps: engine is a prebuilt bundle at
 * ../../engine/engine.mjs (see engine/ATTRIBUTION.md).
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as yaml from "./yaml.mts";

const HERE = import.meta.dirname;
  // make CJS deps (reading-time) able to require() node builtins under ESM
  const { createRequire } = await import("node:module");
  if (typeof (globalThis as any).require === "undefined") (globalThis as any).require = createRequire(import.meta.url);
  const ENGINE = path.join(HERE, "..", "..", "engine", "engine.mjs");
if (!fs.existsSync(ENGINE)) die(`engine bundle missing: ${ENGINE} (run node engine/build.mjs)`);
const { initRenderer, renderMarkdown, postProcessHtml, themeMap } = await import(
  pathToFileURL(ENGINE)
);
function pathToFileURL(p: string): string {
  return `file://${p.split(path.sep).map(encodeURIComponent).join("/").replace(/^\/?/, "/")}`;
}

// runtime state lives next to the skill install
const RUNTIME = path.join(HERE, "..", ".bin");
const RUNTIME_OUT = path.join(RUNTIME, "output");
const IMAGE_CACHE = path.join(RUNTIME, "image-cache.json");
const CONFIG = path.join(RUNTIME, "config.json");
const THEMES_DIR = path.join(HERE, "..", "themes");

type Theme = { base?: Record<string, string>; block?: Record<string, Record<string, string>>; inline?: Record<string, Record<string, string>> };
type Config = { api_base?: string; author?: string; theme?: string; cover_dir?: string };

function loadConfig(): Config {
  return fs.existsSync(CONFIG) ? JSON.parse(fs.readFileSync(CONFIG, "utf8")) : {};
}
function env(k: string): string | undefined {
  return process.env[k]?.trim() || undefined;
}
function apiBase(): string {
  const base = env("WXMP_API_BASE") || loadConfig().api_base;
  if (!base) die("no API base: set WXMP_API_BASE or .bin/config.json api_base");
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

function loadTheme(name: string): unknown {
  const builtins = builtinThemes();
  if (builtins[name]) return builtins[name];
  const file = ["yaml", "yml"].map(e => path.join(THEMES_DIR, `${name}.${e}`)).find(fs.existsSync);
  if (!file) die(`theme not found: ${name} (see --list-themes)`);
  const spec = yaml.parse(fs.readFileSync(file, "utf8")) as { base_theme?: string } & Theme;
  const base = spec.base_theme ? builtins[spec.base_theme] : undefined;
  if (spec.base_theme && !base) die(`unknown base_theme: ${spec.base_theme}`);
  const merged = base ? deepMerge(base, spec) : spec;
  return JSON.parse(JSON.stringify(merged));
}

// ---------- run dir ----------
function runDir(note: string): string {
  const slug = path.basename(note).replace(/\.md$/i, "");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = path.join(RUNTIME_OUT, `${slug}-${stamp}`);
  fs.mkdirSync(dir, { recursive: true });
  const latest = path.join(RUNTIME_OUT, "latest");
  try { fs.rmSync(latest); } catch { /* not a symlink yet */ }
  try { fs.symlinkSync(dir, latest); } catch { /* windows */ }
  return dir;
}
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
async function pushDraft(opts: { title: string; html: string; digest?: string; author?: string; cover: string; sourceUrl?: string }) {
  const coverData = await fetchBytes(opts.cover, process.cwd());
  if (coverData.bytes.length > 2 * 1024 * 1024) die(`cover > 2MB: ${opts.cover}`);
  const coverBase64 = `data:${coverData.mime};base64,${coverData.bytes.toString("base64")}`;
  const res = await fetch(`${apiBase()}/publish`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      title: opts.title, content: opts.html, digest: opts.digest || "",
      author: opts.author || "", cover_base64: coverBase64,
      content_source_url: opts.sourceUrl || "",
    }),
  });
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok || !data.media_id) die(`draft create failed (${res.status}): ${data.error ?? "unknown"}`);
  return data.media_id as string;
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

  if (cmd === "doctor") {
    let ok = true;
    const base = loadConfig().api_base || env("WXMP_API_BASE");
    console.log(`engine: ${fs.existsSync(ENGINE) ? "ok" : "MISSING " + ENGINE}`); ok &&= fs.existsSync(ENGINE);
    console.log(`api_base: ${base ?? "MISSING (set WXMP_API_BASE or .bin/config.json)"}`); ok &&= !!base;
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
    const theme = flag("theme") || cfg.theme || "default";
    const renderer = initRenderer({
      theme: loadTheme(theme),
      fonts: `-apple-system,BlinkMacSystemFont,"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif`,
      size: "15px",
      isUseIndent: false,
      isUseJustify: true,
      legend: "alt-title",
      countStatus: false,
      citeStatus: true,
      isMacCodeBlock: true,
      isShowLineNumber: false,
    });
    const { html, readingTime } = renderMarkdown(body, renderer);
    const full = postProcessHtml(html, readingTime, renderer);
    void full;
    const dir = flag("out") ? path.resolve(flag("out")!) : runDir(notePath);
    fs.mkdirSync(dir, { recursive: true });
    writeRun(dir, "article.html", html);
    writeRun(dir, "article.md", body);
    writeRun(dir, "meta.json", JSON.stringify({ theme, meta }, null, 2));
    console.log(`built: ${path.join(dir, "article.html")} (theme: ${theme})`);
    return;
  }

  const latest = path.join(RUNTIME_OUT, "latest");
  if (!fs.existsSync(latest)) die("no build yet: run build first");
  const run = fs.realpathSync(latest);

  if (cmd === "upload") {
    const cache = loadCache();
    const images = collectImages(body);
    let out = body;
    for (const src of images) {
      const { bytes, mime, name } = await fetchBytes(src, noteDir);
      const hash = crypto.createHash("sha256").update(bytes).digest("hex");
      let url = cache[hash];
      if (!url) {
        url = await uploadImage(bytes, mime, name);
        cache[hash] = url; saveCache(cache);
        console.log(`uploaded: ${src} -> ${url}`);
      } else console.log(`cached:   ${src}`);
      out = out.split(src).join(url);
    }
    writeRun(run, "article.md", out);
    const html = fs.readFileSync(path.join(run, "article.html"), "utf8");
    let newHtml = html;
    for (const src of images) {
      const { bytes } = await fetchBytes(src, noteDir);
      const hash = crypto.createHash("sha256").update(bytes).digest("hex");
      newHtml = newHtml.split(src).join(cache[hash] ?? src);
    }
    writeRun(run, "article.html", newHtml);
    console.log(`rewritten: ${path.join(run, "article.md")}`);
    return;
  }

  if (cmd === "push") {
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
      title, html, digest,
      author: flag("author") || meta.author || cfg.author || "",
      cover, sourceUrl: flag("source-url") || meta.source_url,
    });
    console.log(`draft created: media_id=${mediaId}`);
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
