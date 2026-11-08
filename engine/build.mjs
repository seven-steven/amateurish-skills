#!/usr/bin/env node
/**
 * Build engine/engine.mjs — a single-file, dependency-free ESM bundle of the
 * doocs/md rendering core (@md/core + shared themeMap), for offline use by
 * skill/scripts/wxpush.ts.
 *
 * Usage: node engine/build.mjs [doocs-md-ref]   (default: v2.1.0)
 * Runs in a temp dir; needs network for npm install. Re-run to upgrade.
 *
 * Notes:
 * - isomorphic-dompurify is shimmed to a pass-through (trusted input; jsdom
 *   bundling is impractical). See ATTRIBUTION.md.
 * - mermaid stays external (dynamic, browser-only); CLI use doesn't need it.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { patchEngine } from "./local-patches.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REF = process.argv[2] || "v2.1.0";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wxp-engine-"));
process.on("exit", () => fs.rmSync(tmp, { recursive: true, force: true }));

const run = (cmd) => execSync(cmd, { cwd: tmp, stdio: "inherit" });

console.log(`# engine build: doocs/md#${REF}`);
run("npm init -y");
run("npm install --no-audit --no-fund --ignore-scripts esbuild marked fflate front-matter reading-time es-toolkit highlight.js csstype parse5 postcss postcss-value-parser");
run(`npm install --no-audit --no-fund --ignore-scripts github:doocs/md#${REF}`);

fs.writeFileSync(path.join(tmp, "dompurify-shim.mjs"),
  `// pass-through sanitizer shim: input is authored by the skill's own user (trusted).
export default { sanitize: html => html };\n`);
fs.copyFileSync(path.join(HERE, "geek-black.theme.mjs"), path.join(tmp, "geek-black.theme.mjs"));
fs.copyFileSync(path.join(HERE, "wechat-styles.mjs"), path.join(tmp, "wechat-styles.mjs"));
fs.writeFileSync(path.join(tmp, "entry.mjs"),
  `export * from "md/packages/core/src/index.ts";
export { inlineWechatStyles } from "./wechat-styles.mjs";
import { themeMap, themeOptions } from "md/packages/shared/src/configs/theme.ts";
export { themeMap, themeOptions };
import { registerGeekBlack } from "./geek-black.theme.mjs";
registerGeekBlack(themeMap, themeOptions);
`);

run([
  "node_modules/.bin/esbuild entry.mjs --bundle --platform=node --format=esm",
  "--alias:@md/shared=node_modules/md/packages/shared/src/index.ts",
  "--alias:isomorphic-dompurify=./dompurify-shim.mjs",
  "--external:mermaid",
  `--outfile=${path.join(tmp, "engine.mjs")}`,
].join(" "));

// Do not replace the checked-in bundle if an upstream change breaks a patch.
fs.writeFileSync(path.join(HERE, "engine.mjs"),
  patchEngine(fs.readFileSync(path.join(tmp, "engine.mjs"), "utf8")));

const kb = Math.round(fs.statSync(path.join(HERE, "engine.mjs")).size / 1024);
console.log(`built engine/engine.mjs (${kb} KB) from doocs/md#${REF}`);
