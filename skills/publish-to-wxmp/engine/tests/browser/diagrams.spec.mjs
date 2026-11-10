import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
let directory;
let html;
let images;
let vectors;
let font;
test.beforeAll(() => {
  directory = mkdtempSync(path.join(os.tmpdir(), "wxmp-diagram-browser-"));
  const note = path.join(directory, "note.md");
  writeFileSync(note, `# 发布流程

\`\`\`mermaid
flowchart LR
 A[中文笔记与资料] --> B{内容与引用完整?}
 B -- 是 --> C[预览并确认]
 B -- 否 --> D[修正后重新构建]
\`\`\`

\`\`\`mermaid
sequenceDiagram
 participant A as 作者
 participant B as 草稿箱
 A->>B: 上传并检查图片
 B-->>A: 确认后人工发布
\`\`\`

\`\`\`mermaid
mindmap
 root((笔记工作))
  写作
   记录
   整理
  发布
   预览
   确认
\`\`\`

\`\`\`mermaid
stateDiagram-v2
 [*] --> Ready
 Ready --> Done
\`\`\`

\`\`\`mermaid
classDiagram
 class Note {
 +String title
 }
\`\`\`

\`\`\`mermaid
erDiagram
 USER ||--o{ NOTE : writes
\`\`\`

\`\`\`mermaid
pie
 "完成": 70
 "待办": 30
\`\`\`

\`\`\`mermaid
gantt
 dateFormat YYYY-MM-DD
 section 发布
 工作 :2026-01-01, 2d
\`\`\`
`);
  execFileSync(process.execPath, [path.join(root, "scripts/wxpush.mts"), "build", note,
    "--theme", "default", "--out", path.join(directory, "out")], {
    env: { ...process.env, HOME: directory, WXMP_STATE_DIR: path.join(directory, "state") },
    timeout: 30000,
  });
  html = readFileSync(path.join(directory, "out/article.html"), "utf8");
  images = new Map([...html.matchAll(/src="(diagrams\/[^\"]+\.png)"/g)].map(match =>
    [match[1], readFileSync(path.join(directory, "out", match[1]))]));
  vectors = [...images.keys()].map(name => readFileSync(path.join(directory, "out", name.replace(/\.png$/, ".svg")), "utf8"));
  font = readFileSync(path.join(root, "engine/diagram-assets/NotoSansCJKsc-Regular.otf"));
});
test.afterAll(() => { if (directory) rmSync(directory, { recursive: true, force: true }); });

test("offline Chinese diagrams decode, retain visible content, and fit the article", async ({ page }, testInfo) => {
  await page.route("**/*", async route => {
    const name = new URL(route.request().url()).pathname.slice(1);
    if (!name) await route.fulfill({ contentType: "text/html; charset=utf-8", body: `<body style="margin:0">${html}</body>` });
    else if (name === "font.otf") await route.fulfill({ contentType: "font/otf", body: font });
    else if (images.has(name)) await route.fulfill({ contentType: "image/png", body: images.get(name) });
    else await route.abort();
  });
  await page.goto("https://offline.test/");
  await expect(page.locator("h1")).toHaveText("发布流程");
  const pictures = page.locator("img");
  await expect(pictures).toHaveCount(8);
  await expect(page.locator("script, pre.mermaid, svg, style")).toHaveCount(0);
  for (const picture of await pictures.all()) {
    const pixels = await picture.evaluate(async image => {
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let dark = 0;
      for (let i = 0; i < data.length; i += 4) if (Math.max(data[i], data[i + 1], data[i + 2]) < 150) dark++;
      return { width: canvas.width, height: canvas.height, dark };
    });
    expect(pixels.dark).toBeGreaterThan(200);
    const box = await picture.boundingBox();
    expect(box.width).toBeGreaterThan(100);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize().width);
  await page.screenshot({ path: testInfo.outputPath("chinese-diagrams.png"), fullPage: true });
  // Inspect source-vector text geometry with the same packaged font, not the
  // host fallback. Published articles still contain only the PNGs above.
  for (let index = 0; index < vectors.length; index++) {
    await pictures.nth(index).screenshot({ path: testInfo.outputPath(`diagram-${index + 1}.png`) });
    const layout = await page.evaluate(async svg => {
      const font = new FontFace("Noto Sans CJK SC", "url(https://offline.test/font.otf)");
      document.fonts.add(await font.load());
      const holder = document.createElement("div");
      holder.style.cssText = "position:absolute;left:0;top:10000px;width:315px";
      holder.innerHTML = svg;
      document.body.append(holder);
      for (const text of holder.querySelectorAll("text")) text.style.fontFamily = '"Noto Sans CJK SC"';
      const root = holder.querySelector("svg").getBoundingClientRect();
      const boxes = [...holder.querySelectorAll("text")].map(text => {
        const box = text.getBoundingClientRect();
        return { label: text.textContent, left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
      });
      const clipped = boxes.filter(box => box.left < root.left - 1 || box.top < root.top - 1 || box.right > root.right + 1 || box.bottom > root.bottom + 1).map(box => box.label);
      const overlaps = [];
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        const intersection = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        if (intersection > Math.min(a.width * a.height, b.width * b.height) * 0.1) overlaps.push([a.label, b.label]);
      }
      holder.remove();
      return { clipped, overlaps };
    }, vectors[index]);
    expect(layout, `diagram ${index + 1}: text geometry`).toEqual({ clipped: [], overlaps: [] });
  }
});
