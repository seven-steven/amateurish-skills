import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { registerGeekBlack } from "../geek-black.theme.mjs";
import { patchEngine } from "../local-patches.mjs";

// Match the CLI's shim for bundled CJS dependencies (reading-time).
globalThis.require = createRequire(import.meta.url);
const { getStyleString, themeMap, themeOptions } = await import("../engine.mjs");

test("the generated geek-black theme matches its source and does not mutate default", () => {
  const original = JSON.stringify(themeMap.default);
  const themes = { default: structuredClone(themeMap.default) };
  const options = [];
  registerGeekBlack(themes, options);
  registerGeekBlack(themes, options);
  assert.deepEqual(themes["geek-black"], themeMap["geek-black"]);
  assert.equal(JSON.stringify(themes.default), original);
  assert.equal(options.length, 1);
  assert.deepEqual(options[0], themeOptions.find(option => option.value === "geek-black"));
});

test("CSS attribute serialization escapes quotes, ampersands and angle brackets", () => {
  assert.equal(getStyleString({ "font-family": '"A&B", "<test>", sans-serif' }),
    "font-family: &quot;A&amp;B&quot;, &quot;&lt;test&gt;&quot;, sans-serif");
  assert.equal(getStyleString(), "");
});

test("upstream drift fails closed instead of silently losing local patches", () => {
  assert.throws(() => patchEngine("upstream changed"), /engine patch expected one match/);
});
