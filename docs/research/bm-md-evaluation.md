# bm.md（miantiao-me/bm.md）评估：能否借鉴或替换我们的渲染核心？

> 说明：本报告基于原始来源（GitHub 仓库克隆阅读 README、`docs/architecture.md`、`package.json`、`src/` 源码、GitHub API 元数据、npm 包页面）撰写，未依赖二手介绍。评估对象仓库：https://github.com/miantiao-me/bm.md

## 结论摘要

**bm.md 不是浏览器扩展，而是一个"纯前端 Web 应用 + 同源 CLI/REST API/MCP"三入口的 Markdown 排版系统，目标平台确实包含微信公众号（`--platform wechat`）。** 它的渲染核心是一条 unified（remark/rehype）管道（marked 的替代路线），与我们"Node CLI 离线渲染、产出微信可接受 HTML"的定位高度重合，且其 npm 包 `bmmd` 是**零运行时依赖的单文件 bundle**（`bin/bmmd.mjs`，Node ≥ 20），理论上可以直接被我们的 CLI 以 `child_process` 或直接 import `render()` 的方式复用。

**建议：不整体切换渲染引擎，但强烈值得借鉴（或直接抽取）两项能力**：① 用 `pele`（Obsidian 出品的 Mermaid→SVG 渲染器，无 DOM/Canvas 依赖，可在 Node 端运行）实现 CLI 端 mermaid 渲染为内联 SVG；② 微信适配层的具体技巧（代码块空白保护 `\u00A0`、外链转文末脚注、宽表格横向滚动容器）。理由见"评估结论"一节。

## 1) bm.md 是什么：架构与技术栈

**定位：** "Markdown 排版工具，专为微信公众号与多平台排版设计，支持富文本复制、图片生成与矢量 PDF 导出"。三类平行入口：Web 交互界面（TanStack Start + React 19 SPA）、CLI（`bmmd`，基于 cac）、REST API / MCP（基于 oRPC），全部由统一的 Tool Registry（`src/lib/markdown/definitions.ts`）派生。来源：[README](https://github.com/miantiao-me/bm.md#readme)、[docs/architecture.md](https://github.com/miantiao-me/bm.md/blob/master/docs/architecture.md)。

**渲染技术栈（与我们直接相关的部分）：**
- Markdown 管道：`unified` + `remark-parse` / `remark-gfm` / `remark-math` / `remark-frontmatter` → `remark-rehype` → rehype 插件链 → `rehype-stringify`。即 micromark/remark 系（不是 marked）。
- 数学：`rehype-katex`（`output: 'htmlAndMathml'`，KaTeX 0.18.x），CSS 用 `katex/dist/katex.css`。
- 代码高亮：`rehype-highlight`（highlight.js 11）。
- Mermaid：`pele@1.6.0`（精确锁版），渲染为内联 SVG。
- 样式内联：`juice` 把排版样式（16 款）、代码主题（14 款）、KaTeX CSS、自定义 CSS 全部内联进 `style` 属性，最后包一层 `<section id="bm-md">`。
- 来源（直接源码证据）：[`src/lib/markdown/render/html.ts`](https://github.com/miantiao-me/bm.md/blob/master/src/lib/markdown/render/html.ts)。

**其余（仅 Web 端，与我们无关）：** snapDOM 截图导出 PNG/JPEG、takumi-pdf WASM 矢量 PDF、AnyDoc WASM 文档导入、PaddleOCR.js 端侧 OCR、IndexedDB/OPFS 多文件存储、S3/图床上传。来源：README、docs/architecture.md。

**依赖与体积：** 仓库 package.json 全部依赖均为 devDependencies（包括 katex、highlight.js、juice、pele、unified 全家桶），CLI 构建产物为单文件 `bin/bmmd.mjs`（tsdown 打包），npm 包 `files: ["bin"]`，**运行时依赖 0**——这与我们 `engine/engine.mjs` 的单文件离线 bundle 思路完全一致。来源：[package.json](https://github.com/miantiao-me/bm.md/blob/master/package.json)、[npmjs.com/package/bmmd](https://www.npmjs.com/package/bmmd)（页面显示 Dependencies: 0）。

**维护状态：** 仓库创建于 2026-01-10，最后 push 2026-10-25（调研时点，约 21 天前，非常活跃），621 stars / 76 forks / 7 个 open issues；npm `bmmd` v0.4.0 于约 21 天前发布。单人主导（miantiao，CHATDeski/Port Lib 等项目作者），watchers 仅 2，bus factor 低。版本仍处 0.x，API 未承诺稳定。来源：[GitHub API](https://api.github.com/repos/miantiao-me/bm.md)、npm 包页面。

**许可证：LGPL-3.0-only。** 这对我们是一个**硬约束**：如果直接抽取/复制其源码（如 wechat adapter 插件、样式表）嵌入我们的 engine bundle，我们的分发方式需要符合 LGPL（衍生文件以 LGPL 开源，或作为独立可替换组件动态链接）。仅借鉴算法思路自行实现则不受影响。来源：[LICENSE](https://github.com/miantiao-me/bm.md/blob/master/LICENSE)、package.json `"license": "LGPL-3.0-only"`。

## 2) 数学公式渲染方式

KaTeX，渲染发生在**渲染管道内（服务端/Worker/CLI 同一套代码，Node 可直接运行）**，`output: 'htmlAndMathml'`（HTML + MathML 双份，微信里 MathML 大概率被过滤，剩 HTML span 版式）；KaTeX CSS 检测到公式时（HTML 中出现 `class="katex"`）被一并加入 juice 内联。来源（直接源码证据）：[`src/lib/markdown/render/html.ts`](https://github.com/miantiao-me/bm.md/blob/master/src/lib/markdown/render/html.ts) 中 `rehypeKatex` 配置与 `collectRenderCss` 的 `hasKatex` 逻辑。

与我们现状（doocs/md 的 KaTeX 扩展，内联/行内公式）能力相当，无实质增益。

## 3) Mermaid / 流程图渲染方式（最值得借鉴的部分）

- **实现：`pele@1.6.0`**（Obsidian 官方出品的 Mermaid 纯文本→SVG 引擎，https://pele.run ，https://github.com/obsidianmd/pele ）。其渲染 API 在 **Web Worker、Cloudflare Workers 与 Node.js 之间共享，无需 DOM、无 native Canvas 依赖**；文本测量优先 OffscreenCanvas，Node 无 Canvas 环境回退内置 metrics（接受微小尺寸差异）。来源：[docs/architecture.md](https://github.com/miantiao-me/bm.md/blob/master/docs/architecture.md)、[skills/bm-md/references/mermaid.md](https://github.com/miantiao-me/bm.md/blob/master/skills/bm-md/references/mermaid.md)。
- bm.md 侧插件：rehype-mermaid 调 `renderPele(code, {...})` 得到 SVG，然后 `solidifyPeleSvgStyle`（用 `postcss-value-parser` 把字体族/颜色固化进 SVG 属性）+ `makeSvgResponsive`，**以内联 `<svg>` 嵌入正文**（figure 包裹，非外链图片）。默认禁外链/外图；限制：输入 50k 字符、输出 4M 字符、5000 条连线。来源：[`src/lib/markdown/render/plugins/rehype-mermaid.ts`](https://github.com/miantiao-me/bm.md/blob/master/src/lib/markdown/render/plugins/rehype-mermaid.ts)。
- **微信能否接受内联 SVG：bm.md 的立场是接受**——它对微信平台不做 SVG 转图片处理，mermaid 图在 wechat 平台输出同样走内联 SVG + juice 内联样式（wechat adapter 见第 4 节，不含 SVG 特殊处理）。⚠️ 但微信编辑器对 `<svg>` 内联的支持历来不稳定（部分属性/嵌套结构会被清洗），bm.md 文档未提供"微信端 mermaid 实测通过"的直接证据；我们如采用此路线需自行实测（可先发草稿验证）。这是源码解读 + 研究者推断，非 bm.md 明文陈述。
- 注意：pele 仓库 license 为 GitHub API 报告的 "Other / NOASSERTION"（非标准 SPDX 许可证），若直接依赖需先确认其授权条款。来源：https://api.github.com/repos/obsidianmd/pele 。

## 4) 目标平台与输出格式

- 目标平台**确实是微信公众号优先**（README 第一条特性："专门适配微信排版"），另有通用 HTML 平台（`platform: 'html' | 'wechat'`，见 [`src/lib/markdown/render/adapters/index.ts`](https://github.com/miantiao-me/bm.md/blob/master/src/lib/markdown/render/adapters/index.ts)）。
- wechat 适配器（[`src/lib/markdown/render/adapters/wechat.ts`](https://github.com/miantiao-me/bm.md/blob/master/src/lib/markdown/render/adapters/wechat.ts)）做三件事：
  1. **外链转文末脚注**：非 `mp.weixin.qq.com` 的 `<a>` 改为 `<span>` + 上标引用编号，文末生成"参考文献"列表（同 URL 去重）；
  2. **代码块空白保护**：行首空格→`\u00A0`、制表符→两个 `\u00A0`、换行→`<br>`、高亮 span 之间的空格→`\u00A0`，防止微信编辑器合并空白；
  3. 另有 `rehypeWechatList` 列表适配与宽表格横向滚动容器（README 提及）。
- 最终输出：**juice 完全内联样式的单段 HTML**（`<section id="bm-md">` 包裹，每个元素带 `style`），与微信"过滤 class/外部 CSS"的现实兼容。CLI 用法：`bmmd render article.md --platform wechat --output article.html`。来源：README、[`src/lib/markdown/render/html.ts`](https://github.com/miantiao-me/bm.md/blob/master/src/lib/markdown/render/html.ts)。

这与我们的产出形态（微信公众号可粘贴 HTML）**完全同构**。

## 5) 能否作为 Node 依赖被我们的 CLI 复用？

**技术上可以，工程上不建议整体依赖。**

- 可以：npm 包 `bmmd` 零依赖、Node ≥ 20、ESM，`render()` 位于 `src/lib/markdown/render/html.ts`（源码导出，但 npm 包 `files` 只含 `bin/`，未验证 bin 内是否 re-export `render()`；若只暴露 CLI，则需 `pnpm dlx bmmd render --platform wechat` 子进程方式调用）。来源：package.json、[npmjs.com/package/bmmd](https://www.npmjs.com/package/bmmd)。
- 不建议整体依赖/切换的理由：
  1. **LGPL-3.0**：作为库静态打进我们的分发包有传染性合规成本；子进程调用可规避但架构笨重。
  2. **0.x 版本 + 单维护者**：API 与行为（样式表、微信适配细节）随时可能变动，替换我们目前"从 doocs/md v2.1.0 锁版重建"的稳定策略风险更高。
  3. **能力重叠度极高**：marked+hljs+KaTeX vs remark+rehype+KaTeX，对我们用户而言收益主要是渲染风格差异，而非功能增量；真正缺的能力只有"CLI 端 mermaid"。
  4. doocs/md 社区体量与微信适配的历史积累（百万级使用）在微信过滤规则的对抗上经验更丰富。

## 评估结论与建议

**结论：借鉴其思路（并评估直接引入 pele），不切换渲染引擎。**

具体建议（按优先级）：

1. **优先评估 `pele` 作为我们 CLI 的 mermaid 渲染器**（替代当前"mermaid 保持浏览器外部"的空缺）：pele 无 DOM 依赖、可在 Node 运行、输出内联 SVG、bm.md 已在 0.4.0 中实战使用。这能让我们离线产出含流程图的完整微信 HTML。落地前两件事：① 确认 pele 许可证（GitHub 报 NOASSERTION）；② 向微信发草稿实测内联 SVG 存活率；若 SVG 被过滤，退路是 Node 端 SVG→PNG（如 sharp/resvg），bm.md 未做这层，需自研。
2. **借鉴其 wechat adapter 三个技巧**（自行实现，规避 LGPL）：代码块 `\u00A0` 空白保护（比我们可能现有的做法更细：含高亮 span 间空格处理）、外链→文末脚注（同 URL 去重、保留 mp.weixin.qq.com 链接）、宽表格横向滚动容器。源码量小（`wechat.ts` 约 200 行），思路可直接参考。
3. **参考其 CSS 交付方式**：16 款排版样式 + 检测公式后按需内联 KaTeX CSS + `juice` 全量内联——"条件性附加 KaTeX CSS"比全量常驻 CSS 更省字符（微信正文有 2 万字符/1MB 限制，见 `docs/research/wechat-mp-draft-update.md`）。
4. **不切换引擎**：维护风险（0.x/单人/LGPL）、迁移成本（marked→remark 生态差异会影响既有 HTML 输出的回归）均大于收益；我们现有"从 doocs/md 锁版重建单文件 bundle"的架构已经与 bm.md 的工程化程度相当，且许可证（doocs/md 为 Apache-2.0 类宽松许可——以我们既有评估为准）更友好。

## 矛盾与不确定性

- 未发现来源间矛盾。
- 不确定性：① npm `bmmd` 包是否可编程 import `render()`（`files` 仅含 `bin/`，倾向只能 CLI 用）；② 微信对内联 `<svg>` 的过滤程度（bm.md 未见实测证据，本研究未实测）；③ pele 的实际许可证文本未逐一阅读；④ 微信对外链转脚注后的"参考文献"文本块是否有额外限制。

## 来源清单（原始来源）

- 仓库首页/README：https://github.com/miantiao-me/bm.md
- 架构文档：https://github.com/miantiao-me/bm.md/blob/master/docs/architecture.md
- package.json：https://github.com/miantiao-me/bm.md/blob/master/package.json
- 渲染核心：https://github.com/miantiao-me/bm.md/blob/master/src/lib/markdown/render/html.ts
- 平台适配：https://github.com/miantiao-me/bm.md/blob/master/src/lib/markdown/render/adapters/wechat.ts 、.../adapters/index.ts
- Mermaid 插件：https://github.com/miantiao-me/bm.md/blob/master/src/lib/markdown/render/plugins/rehype-mermaid.ts
- Mermaid 参考（pele 细节）：https://github.com/miantiao-me/bm.md/blob/master/skills/bm-md/references/mermaid.md
- Registry/CLI：https://github.com/miantiao-me/bm.md/blob/master/src/lib/markdown/definitions.ts 、https://github.com/miantiao-me/bm.md/blob/master/src/cli/core.ts
- GitHub API 元数据：https://api.github.com/repos/miantiao-me/bm.md （stars/issues/许可证/时间）
- npm 包：https://www.npmjs.com/package/bmmd （v0.4.0、零依赖）
- pele 引擎：https://pele.run 、https://github.com/obsidianmd/pele 、https://api.github.com/repos/obsidianmd/pele （license: NOASSERTION）
