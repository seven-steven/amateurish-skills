#!/usr/bin/env node
// Maintainer build for both standalone skills; neither distribution imports repository tooling.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const engine = path.resolve(here, "../../skills/publish-to-wxmp/engine");
const coverVendor = path.resolve(here, "../../skills/wxmp-cover/vendor");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "wxmp-graphics-build-"));
const modules = path.join(temporary, "node_modules");
const assets = path.join(engine, "diagram-assets");
const licenses = path.join(assets, "licenses");
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
function download(url) {
  return execFileSync("curl", ["--fail", "--location", "--silent", "--show-error", "--connect-timeout", "15", "--max-time", "90", url], { maxBuffer: 40 * 1024 * 1024 });
}
try {
  for (const file of ["package.json", "package-lock.json"]) fs.copyFileSync(path.join(here, file), path.join(temporary, file));
  execFileSync("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: temporary, stdio: "inherit" });
  fs.mkdirSync(licenses, { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(path.join(assets, "manifest.json")));
  for (const [name, entry] of Object.entries(manifest)) {
    const target = path.join(assets, name);
    if (entry.package) {
      // npm ci verifies the archive against the one lockfile. Record its actual
      // bytes in the runtime integrity manifest, not a second version pin.
      const bytes = fs.readFileSync(path.join(modules, entry.package));
      fs.writeFileSync(target, bytes);
      Object.assign(entry, { sha256: sha(bytes), bytes: bytes.length });
      continue;
    }
    if (!fs.existsSync(target) || sha(fs.readFileSync(target)) !== entry.sha256) {
      let bytes;
      for (const url of [entry.mirror, entry.url].filter(Boolean)) {
        try { bytes = download(url); if (sha(bytes) === entry.sha256) break; }
        catch { /* Try the other pinned source, never accept unchecked bytes. */ }
      }
      if (!bytes || sha(bytes) !== entry.sha256) throw new Error(`cannot obtain verified asset: ${name}`);
      fs.writeFileSync(target, bytes);
    }
    if (fs.statSync(target).size !== entry.bytes) throw new Error(`asset size mismatch: ${name}`);
  }
  // Keep the corresponding dependency sources locatable even though the npm
  // WASM archive itself omits its license. Preserve full license texts locally.
  const upstream = {
    "resvg-MPL-2.0.txt": "https://raw.githubusercontent.com/yisibl/resvg-js/9ca058462ac529120c8cc84ddcd6fef644cc5406/LICENSE",
    "resvg-Cargo.toml": "https://raw.githubusercontent.com/yisibl/resvg-js/9ca058462ac529120c8cc84ddcd6fef644cc5406/Cargo.toml",
    "Noto-OFL.txt": "https://raw.githubusercontent.com/notofonts/noto-cjk/f8d157532fbfaeda587e826d4cd5b21a49186f7c/Sans/LICENSE",
  };
  for (const [name, url] of Object.entries(upstream)) {
    const target = path.join(licenses, name);
    if (!fs.existsSync(target)) fs.writeFileSync(target, download(url));
  }
  const notices = [];
  for (const name of Object.keys(JSON.parse(fs.readFileSync(path.join(temporary, "package-lock.json"))).packages).filter(name => name.startsWith("node_modules/"))) {
    const directory = path.join(temporary, name);
    if (!fs.existsSync(directory)) continue;
    const pkg = JSON.parse(fs.readFileSync(path.join(directory, "package.json")));
    for (const file of fs.readdirSync(directory).filter(file => /^(license|copying|notice)(\.|$)/i.test(file))) {
      if (fs.statSync(path.join(directory, file)).isFile()) notices.push(`\n=== ${pkg.name}@${pkg.version} / ${file} ===\n${fs.readFileSync(path.join(directory, file), "utf8")}`);
    }
  }
  fs.writeFileSync(path.join(licenses, "npm-NOTICES.txt"), notices.join("\n"));
  // Pele 1.13 repeats sparse Venn colors. Only our nonempty theme palette
  // requests positional overrides; the unconfigured renderer stays unchanged.
  // This private render option cannot be supplied by Mermaid graph config.
  const peleFile = path.join(temporary, "node_modules/pele/dist/pele.js");
  let pele = fs.readFileSync(peleFile, "utf8");
  const patches = [
    ['function Zw(e,t){', 'function Zw(e,t,preserveSlots){'],
    ['let n=Kw[e];if(n===void 0)return;let r=[];',
      'let n=Kw[e];if(n===void 0)return;if(e==="venn"&&preserveSlots)n={...n,repeat:false};let r=[];'],
    ['function Nm(e,t){let n=Zw(e,Cm(t.themeVariables));',
      'function Nm(e,t,preserveSlots){let n=Zw(e,Cm(t.themeVariables),preserveSlots);'],
    ['Im(Nm(n,a),', 'Im(Nm(n,a,t.__wxmpPreserveSeriesSlots===true),'],
  ];
  for (const [expected, replacement] of patches) {
    if (pele.split(expected).length !== 2) throw new Error(`Pele Venn compatibility patch drift: ${expected}`);
    pele = pele.replace(expected, replacement);
  }
  fs.writeFileSync(peleFile, pele);
  fs.copyFileSync(path.join(engine, "diagrams.mjs"), path.join(temporary, "entry.mjs"));
  execFileSync(path.join(modules, ".bin/esbuild"), ["entry.mjs", "--bundle", "--platform=node", "--format=esm", "--external:./diagram-assets/rasterize.mjs", "--outfile=diagrams.bundle.mjs"], { cwd: temporary, stdio: "inherit" });

  fs.mkdirSync(coverVendor, { recursive: true });
  for (const dir of [assets, coverVendor]) {
    fs.copyFileSync(path.join(here, "rasterize.mjs"), path.join(dir, "rasterize.mjs"));
    fs.copyFileSync(path.join(modules, "@resvg/resvg-wasm/index.mjs"), path.join(dir, "resvg.mjs"));
  }
  fs.copyFileSync(path.join(assets, "resvg.wasm"), path.join(coverVendor, "resvg.wasm"));
  fs.copyFileSync(path.join(modules, "opentype.js/dist/opentype.min.js"), path.join(coverVendor, "opentype.cjs"));
  fs.writeFileSync(path.join(assets, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  fs.copyFileSync(path.join(temporary, "diagrams.bundle.mjs"), path.join(engine, "diagrams.bundle.mjs"));
  console.log("built diagram bundle and distributed the locked offline raster runtime to both skills");
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
