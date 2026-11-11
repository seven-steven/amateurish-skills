# wxmp-publisher 设计 spec

> 状态:已定稿(决策记录见 `.scratch/wxmp-publisher-migration/`)。本文件是本仓库全部工件的设计源。

## 1. 概述

把仓库里的 Markdown 笔记发布到微信公众号**草稿箱**的自动化工具链。最终发布永远由人工在公众号后台完成(API 群发无分发量,不值得自动化)。

三部分:

| 组件 | 位置 | 职责 |
| --- | --- | --- |
| skill | `skills/publish-to-wxmp/` | 自包含 agent 技能:SKILL.md(流程)+ WXPUSH.md(CLI 契约)+ scripts(walkthrough CLI)+ themes |
| server | `wxmp-server/` | 部署在公网服务器的 token 服务:持有 AppSecret,统一管理 access_token,代理图片上传与建草稿 |
| engine | `skills/publish-to-wxmp/engine/` | 排版引擎预构建产物(doocs/md @md/core 的 esbuild bundle)+ 构建脚本 + 归属说明 |

## 2. 架构与信任边界

```
┌─────────────┐  HTTPS + Bearer   ┌──────────────┐  白名单 IP   ┌──────────────┐
│ 本地 CLI     │ ────────────────▶ │ token 服务    │ ───────────▶ │ 微信 MP API  │
│ (skill 调用) │ ◀──────────────── │ (Docker,公网) │ ◀────────── │              │
└─────────────┘                   └──────────────┘              └──────────────┘
```

- AppSecret 只存在于服务端;本地不接触 access_token。
- 服务端出口 IP 必须加入公众号 IP 白名单。
- 排版(markdown → 内联样式 HTML)完全在本地离线完成;服务端只做需要 access_token 的三件事:正文图片上传、封面素材上传、创建草稿。

## 3. Skill 设计

- 自包含:`skills/publish-to-wxmp/` 目录携带运行所需的一切(scripts、themes、契约文档);安装 = `npx skills add seven-steven/amateurish-skills --skill publish-to-wxmp`(或项目 `.agents/skills/`)。
- 用户配置遵循仓库[配置约定](../README.md#配置约定),唯一位置为 `~/.config/skills/publish-to-wxmp/config.json`;不支持配置路径覆盖或旧配置读取/迁移。缺文件使用空配置,不可读或 JSON 损坏则报告路径与原因并中止。运行时状态(image-cache、output、drafts)仍在 `~/.local/state/wxmp-publisher/`,保留 `WXMP_STATE_DIR` 覆盖及从旧 `.bin/` 复制缺失状态的行为。配置和状态均在 skill 目录之外,重装/更新 skill 不覆盖。
- CLI 入口 `skills/publish-to-wxmp/scripts/wxpush.mts`,Node ≥22.20 可直接运行,也可用 `npx tsx`。macOS/无桌面 Linux 为正式平台;安装目录包含预构建引擎、图表 WASM 和中文字体,运行时不需要 npm install、系统图像库、浏览器或宿主字体。
- 流程:preflight(doctor)→ 内容适配 → build/upload/preview → push 草稿 → 返回精简推送回执(字段与异常语义见 [SKILL.md](../skills/publish-to-wxmp/SKILL.md#5-close))。原笔记保持只读,是否及如何回写由笔记侧规则决定。

## 4. CLI 契约摘要

命令:`doctor | themes | build | upload | push | preview`(完整契约见 `skills/publish-to-wxmp/WXPUSH.md`)。

- `build <note.md> [--theme <t>] [--out <dir>]` — markdown → 内联样式 HTML,Mermaid 图块自动经 Pele/SVG/PNG 成图。
- `upload <note.md>` — 从已完成构建发现图片(含生成图),上传微信 CDN,哈希缓存幂等,重写该 run 的 md/html。源笔记正文不变。后续命令也可用 `--out` 明确选择构建;构建新鲜度契约见下文。
- `push` — 封面素材 + 草稿;本地先校验 title ≤64、digest ≤120、封面 <2MB。
- `preview [--port] [--watch]` — 本地静态预览;`--watch` 监听产物变化自动刷新浏览器。

Front-matter `wechat: {title, digest, cover, author, source_url}` 覆盖默认值。

### 构建新鲜度

- 构建记录保存实际所选主题及完整有效配置的指纹,覆盖正文样式、已有 `renderOptions` 和 `pele`,并保留输入路径归属、笔记内容指纹及完成状态检查。主题选择优先级为显式 `--theme` > 全局 `theme` > `default`;消费时复核构建实际所选主题,不改用当前全局默认。
- `preview`、`upload`、创建草稿和 `push --update` 共用检查,默认 latest 和显式 `--out` 均适用。校验须在启动新预览、正文图片上传、封面上传或草稿创建/更新请求之前完成,过期操作没有远端副作用。
- 输入变更、另一篇笔记、失败/未完成构建、缺少新鲜度信息的旧格式构建均要求重建;所选主题有效配置变更、无法解析或已删除同样拒绝旧构建并明确提示重新 `build`。不自动重建,重建后按 build/upload/preview/确认流程恢复发布。
- 比较有效配置而非文件修改时间;仅 mtime 变化、等价配置或无关主题修改不使构建过期。运行中的 preview 不实时监视主题源文件,`--watch` 只刷新构建产物;新 run 需重启预览。

## 5. 主题系统(完整)

- 主题 = `skills/publish-to-wxmp/themes/<name>.yaml`,文件名即主题名。
- 结构:`base_theme`(可继承 default/grace/simple/geek-black)+ `base`/`block`/`inline` 三段 CSS 属性映射,以及可选 `renderOptions` 和 `pele` 配色映射。
- `block.h1_content` 至 `block.h6_content` 可选:为标题增加独立的 `<span class="content">`,支持外层通栏背景/细线与内层文字装饰;未配置时保持原来的单层标题。
- `renderOptions` 可选:`isMacCodeBlock`(代码块交通灯)、`isShowLineNumber`(行号)。与主题一起继承,未配置时沿用 CLI 默认值。
- 合并语义:**深合并**——用户样式递归覆盖到基础主题上,只写要改的属性。
- 发现机制:`themes`(或 `--list-themes`)列出内置 default、grace、simple、geek-black + themes/ 目录下全部 YAML。同一主题选择决定正文与图表,没有独立图表主题参数或全局配色段。
- geek-black 真源为 `skills/publish-to-wxmp/engine/geek-black.theme.mjs`,保留原 `#nice` CSS 的双层标题,并补齐参考效果依赖的基础间距、浅灰引用和代码块背景;代码文字为深灰,行号独立内联为浅灰,不依赖参考站点的样式表。
- 引擎内置主题随 engine bundle 分发(不依赖 node_modules)。独立示例 [`example-midnight.yaml`](../skills/publish-to-wxmp/themes/example-midnight.yaml) 继承 grace,展示正文强调色、深色图表和八个系列槽位;不修改现有主题或默认选择。

### Pele 配色

Pele 是渲染器,不是新文章主题。主题可选 `pele` 的所有字段如下,用户配置语法及示例以 [WXPUSH Themes](../skills/publish-to-wxmp/WXPUSH.md#themes) 为 CLI 契约:

| 字段 | 用途 |
| --- | --- |
| `background` | 图表背景和最终 PNG 画布 |
| `foreground` | 主要文字 |
| `muted` | 弱化文字 |
| `line` | 线条 |
| `border` | 边框 |
| `surface` | 节点/区域主要底色 |
| `surface_alt` | 交替/次级底色 |
| `accent` | 强调色 |
| `critical` | Pele 已有关键任务语义色 |
| `foreground_on_light` | Pele 已有浅底对比文字色 |
| `foreground_on_dark` | Pele 已有深底对比文字色 |
| `series_1`, `series_2`, `series_3`, `series_4`, `series_5`, `series_6`, `series_7`, `series_8` | 八个独立系列色槽位 |

- 全部字段可省略,按原有继承与深合并机制只覆盖需要的字段,不补色或重排稀疏系列。映射到固定 Pele 版本的公开变量,不保证每种图表都使用每个字段,不改写既有颜色用途。
- 值限带引号的不透明字符串 `"#RGB"`/`"#RRGGBB"`,十六进制大小写均可。所选主题加载时立即校验,即使没有图表也执行:非映射、未知键、错误类型、未加引号导致的错误值、非法字符/长度、透明/alpha 颜色、颜色名称/函数、CSS 变量、列表及超出八槽位均使构建非零退出,不能登记为成功构建。诊断定位主题文件和 `pele` 或 `pele.<字段>`。正文主题段仍遵循原有兼容规则。
- 逐项优先级为图内显式配色 > 主题配色 > Pele 默认配色。保留 `style`、`classDef` 字面量及初始化指令/frontmatter `themeVariables` 的显式颜色;只指定少数系列槽位不丢失其他主题或默认值。
- `background` 同时决定图表背景及 PNG 栅格画布(含留白),省略时沿用白色。深色画布由作者显式选择并负责对比度,工具不自动修正。只开放配色,字体、字号、圆角、字重、布局和尺寸限制不开放配置。
- 无 `pele` 或 `pele: {}` 保留旧图表资产名称、SVG、PNG 字节;既有内置主题不自动改色,不从正文 CSS/主色推导图表色。元数据为新鲜度升级不影响这一图表字节兼容约束。

## 6. Engine 设计

- `skills/publish-to-wxmp/engine/build.mjs`:npm 安装 `github:doocs/md#v2.x`,esbuild 打包 `@md/core`(含 shared 主题表,导出 `themeMap`)为单文件 ESM `skills/publish-to-wxmp/engine/engine.mjs`(含微信输出兼容层约 1.1MB),提交入库。
- 运行时零构建:wxpush.mts 直接 import 相对路径的 bundle;安装 skill 不需要 npm install。
- 构建入口注册本地内置主题,再由 `skills/publish-to-wxmp/engine/local-patches.mjs` 对 bundle 应用受校验的补丁:HTML 样式属性转义、可选双层标题、代码布局内联。补丁不匹配时中止,不覆盖已有产物。
- CLI 保存 `postProcessHtml` 的结果(包含容器和引用链接),去掉微信不保留的 `<style>`;排版所需规则必须内联。
- 保存前经 `skills/publish-to-wxmp/engine/wechat-styles.mjs` 的 `inlineWechatStyles` 输出兼容层:用 HTML/CSS 解析器按元素作用域展开 `var(...)`(含继承、局部变量与回退),再移除 `--...` 自定义属性声明。真实草稿最小复现表明,微信会丢弃自定义属性之后的普通样式;仅浏览器预览正常不足以验证。preview/upload/push 必须共用这一产物,不能只在发送时修补。解析器一起打包进 engine,不增加 CLI 运行时依赖。
- 升级引擎 = 改版本号重跑构建脚本,重新提交产物。内置主题、补丁与微信输出兼容层改动也必须重建,不可只手改 bundle;安装目录 `themes/` 的自定义 YAML 则由 CLI 直接加载,无需重建 bundle。
- 回归测试:`npm run test:engine`(Node ≥22.20 + Python 3)经实际 CLI 构建并解析 HTML;`npm run test:browser` 用主机已安装的 Google Chrome 检查 375px/768px 下的计算样式和布局,而非仅搜索样式字符串。`npm test` 同时覆盖类型检查、布局、引擎、服务端与浏览器测试;独立测试 workflow 在 macOS/Linux 上执行同一命令。安装和覆盖范围见 [skills/publish-to-wxmp/engine/tests/README.md](../skills/publish-to-wxmp/engine/tests/README.md)。
- 图表:独立、锁依赖的 Pele/resvg-wasm bundle 加随包完整 Noto 简体中文字体,离线成图。先由 agent 将 ASCII/说明性文本改写为 Mermaid,CLI 只做确定性渲染;不调用模型。全部 Pele 内置类型走统一入口,首版仅支持自包含文字/形状。图内网页链接移至图注并沿用脚注;外部图片、自定义图标、公式、缺字、可检测裁切及超限均使构建失败。保留 Mermaid、SVG、PNG,发布只嵌入 PNG;手机预览和用户确认仍是最终验收。
- 图表配色经 CLI 统一加载并校验主题后传入图表编译模块,不在 preview/upload/push 分别修图。保存 SVG 前将配色变量落实为具体样式并移除自定义属性,发布仍只嵌入 PNG。保持固定 Pele、随包中文字体、字号和栅格链路,深色背景不能使空图校验误判有效。所有影响最终图像的有效输入(包括仅 PNG 画布背景)均纳入图表资产/缓存身份;相同输入、有效主题与参考时间产物确定。原笔记不变,继续保留可编辑源码、SVG 与 PNG。
- 图表源码 `skills/publish-to-wxmp/engine/diagrams.mjs` 经 `node skills/publish-to-wxmp/engine/build-diagrams.mjs` 重建提交的 `diagrams.bundle.mjs`,使用 `engine/diagram-deps/` 锁定依赖及 `diagram-assets/manifest.json` 校验 WASM/字体。修改图表实现须按既有流程重建发行物,不可手改 bundle;独立安装仍离线、自包含。测试通过真实 CLI 消费提交的 bundle/字体/WASM,自定义主题使用临时安装副本,全部新测试从根 `npm test` 可达。
- 归属:排版引擎源自 doocs/md(Apache-2.0);图表发行物同时保留 Pele 的 MIT/ISC、resvg 的 MPL/对应源码信息与字体 OFL,见 `skills/publish-to-wxmp/engine/ATTRIBUTION.md`。

## 7. Server 设计

- Flask + gunicorn,单 worker(微信要求 token 集中管理,单进程内存缓存即可)。
- 端点:`GET /health`、`PUT /publish/img`(multipart `image`)、`PUT /publish`(JSON: title/content/cover_base64/…)。
- access_token 内存缓存,过期前 120s 刷新。
- Docker:`wxmp-server/Dockerfile` + `docker-compose.yml`(绑 127.0.0.1,反代终止 TLS)。
- 分发:GitHub Actions 构建发布 GHCR(tag + latest);服务器零构建。文档保留本地 build fallback。

安全设计独立成篇:[security.md](security.md)。

## 8. 仓库布局

```
README.md  LICENSE  AGENTS.md
docs/            spec.md, security.md, agents/
skills/publish-to-wxmp/    SKILL.md, WXPUSH.md, README.md, scripts/, themes/, engine/, config.example.json
skills/publish-to-blog/    SKILL.md, README.md, config.example.json
wxmp-server/               server.py, Dockerfile, docker-compose.yml, .env.example, deploy.md
skills/publish-to-wxmp/engine/          build.mjs, engine.mjs(产物), ATTRIBUTION.md
.github/         workflows/docker.yml
.scratch/        wayfinder 地图与决策票(过程工件)
```

## 9. 范围外

常驻 web UI、多用户/多公众号、mTLS/IP allowlist、skill 市场发布、API 自动群发。

## 10. 迁移说明

本仓库由 note 仓库 `tools/wxmp-publisher` + `.agents/skills/publish-to-wxmp` 迁移而来(决策票 03):只迁代码/文档/契约,运行时状态不迁;源库相关制品后续删除。
