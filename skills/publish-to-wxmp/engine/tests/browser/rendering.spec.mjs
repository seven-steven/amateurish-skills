import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const fixture = path.join(root, "engine/tests/fixtures/geek-black.md");
const themes = ["default", "grace", "simple", "geek-black"];
const articles = new Map();
let directory;

test.beforeAll(() => {
  directory = mkdtempSync(path.join(os.tmpdir(), "wxmp-browser-test-"));
  for (const theme of themes) {
    const out = path.join(directory, theme);
    // Test the exact artifact used by upload/push, not a hand-written mock page
    // or renderMarkdown in isolation (which used to hide the CLI font bug).
    execFileSync(process.execPath, [
      path.join(root, "scripts/wxpush.mts"), "build", fixture,
      "--theme", theme, "--out", out,
    ], { cwd: root, timeout: 15000, env: { ...process.env,
      WXMP_STATE_DIR: path.join(directory, "state"),
      HOME: directory,
    } });
    articles.set(theme, readFileSync(path.join(out, "article.html"), "utf8"));
  }
});

test.afterAll(() => {
  if (directory) rmSync(directory, { recursive: true, force: true });
});

async function openArticle(page, theme = "geek-black") {
  await page.route("**/*", route => route.abort());
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head>
    <body style="margin:0">${articles.get(theme)}</body></html>`);
  // No host CSS or embedded stylesheet may be needed for these assertions:
  // WeChat can discard both. Only the built HTML's inline styles are present.
  await expect(page.locator("style, link[rel=stylesheet]")).toHaveCount(0);
}

test("geek-black renders the black ribbon, white bold text and full-width rail", async ({ page }) => {
  await openArticle(page);
  await expect(page.locator("h1 .content")).toHaveCSS("font-size", "13px");
  await expect(page.locator("h1 .content")).toHaveCSS("color", "rgb(160, 160, 160)");
  await expect(page.locator("h1")).toHaveCSS("border-bottom", "2px solid rgb(198, 196, 196)");
  const h2 = page.locator("h2");
  const ribbon = h2.locator(".content");
  await expect(h2).toHaveCSS("display", "block");
  await expect(h2).toHaveCSS("background-color", "rgb(251, 251, 251)");
  await expect(h2).toHaveCSS("height", "40px");
  await expect(ribbon).toHaveCSS("background-color", "rgb(33, 33, 34)");
  await expect(ribbon).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(ribbon).toHaveCSS("border-bottom-right-radius", "100px");
  await expect(ribbon).toHaveCSS("font-size", "16px");
  await expect(ribbon).toHaveCSS("line-height", "40px");
  await expect(ribbon.locator("strong")).toHaveCSS("color", "rgb(255, 255, 255)");
  const headingBox = await h2.boundingBox();
  const layoutWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(headingBox.width).toBe(layoutWidth - 60);
  for (const [tag, name] of [["h3", "三级标题"], ["h4", "四级标题"]]) {
    const heading = page.locator(tag).filter({ hasText: name });
    await expect(heading).toHaveCSS("border-top", "1px solid rgb(221, 221, 221)");
    await expect(heading.locator(".content")).toHaveCSS("border-top", "2px solid rgb(33, 33, 34)");
  }
});

test("paragraphs and quotes retain visible spacing and gray quote backgrounds", async ({ page }) => {
  await openArticle(page);
  const paragraph = page.locator("body > section > p").filter({ hasText: "PARA 由" });
  await expect(paragraph).toHaveCSS("font-size", "15px");
  await expect(paragraph).toHaveCSS("line-height", "26.25px");
  await expect(paragraph).toHaveCSS("margin-bottom", "16px");
  await expect(paragraph).toHaveCSS("padding-top", "8px");
  await expect(paragraph).toHaveCSS("text-align", "start");
  const next = page.locator("body > section > p").filter({ hasText: "第二段" });
  const firstBox = await paragraph.boundingBox();
  const nextBox = await next.boundingBox();
  expect(nextBox.y - firstBox.y - firstBox.height).toBeGreaterThanOrEqual(16);
  await expect(page.locator("blockquote")).toHaveCSS("background-color", "rgb(244, 244, 244)");
  await expect(page.locator("blockquote")).toHaveCSS("border-left", "4px solid rgb(221, 221, 221)");
  await expect(page.locator("blockquote p")).toHaveCSS("color", "rgb(119, 119, 119)");
});

test("long numbered code scrolls inside its gray box without widening the article", async ({ page }) => {
  await openArticle(page);
  const pre = page.locator("pre");
  await expect(pre).toHaveCSS("background-color", "rgb(248, 248, 248)");
  await expect(pre).toHaveCSS("padding", "0px");
  await expect(pre.locator(".mac-sign")).toBeHidden();
  await expect(pre.locator(".line-numbers > section")).toHaveText(["1", "2", "3"]);
  const code = pre.locator("code");
  await expect(code).toHaveCSS("display", "block");
  await expect(code).toHaveCSS("font-size", "14px");
  await expect(code).toHaveCSS("white-space", "normal");
  await expect(pre.locator(".code-scroll > div")).toHaveCSS("white-space", "pre");
  const overflow = await pre.locator(".code-scroll").evaluate(element => ({
    client: element.clientWidth, scroll: element.scrollWidth,
  }));
  expect(overflow.scroll).toBeGreaterThan(overflow.client);
  const pageWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(pageWidth.scroll).toBe(pageWidth.client);
  // Three lines must not acquire blank rows from structural HTML indentation.
  expect((await pre.boundingBox()).height).toBeLessThan(150);
});

test("geek-black code uses dark gray text and muted line numbers like the reference", async ({ page }) => {
  await openArticle(page);
  await expect(page.locator("pre code")).toHaveCSS("color", "rgb(51, 51, 51)");
  await expect(page.locator("pre .line-numbers")).toHaveCSS("color", "rgb(179, 179, 179)");
});

test("saved article keeps its padded container and appended references", async ({ page }) => {
  await openArticle(page);
  const container = page.locator("body > section");
  await expect(container).toHaveCount(1);
  await expect(container).toHaveCSS("padding", "30px");
  await expect(container).toContainText("引用链接");
  await expect(container).toContainText("https://example.com");
  await expect(container.locator('a[href^="https://mp.weixin.qq.com/"]'))
    .toHaveCSS("color", "rgb(239, 112, 96)");
});

for (const theme of themes) {
  test(`${theme}: quoted font names do not truncate background, size or bold heading styles`, async ({ page }) => {
    await openArticle(page, theme);
    const heading = page.locator("h2");
    await expect(heading).toHaveCSS("font-family", /Helvetica Neue/);
    const fontSize = { default: "18px", grace: "19.5px", simple: "19.5px", "geek-black": "16px" };
    await expect(heading).toHaveCSS("font-size", fontSize[theme]);
    await expect(heading.locator("strong")).toHaveCSS("color", "rgb(255, 255, 255)");
    if (theme !== "geek-black") {
      await expect(heading).toHaveCSS("background-color", "rgb(0, 0, 0)");
    }
  });
}
