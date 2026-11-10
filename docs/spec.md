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
- 用户配置在 `~/.config/wxmp-publisher/config.json`,运行时状态(image-cache、output、drafts)在 `~/.local/state/wxmp-publisher/`——均在 skill 目录之外,重装/更新 skill 不覆盖;首次运行自动从旧 `.bin/` 布局迁移。
- CLI 入口 `skills/publish-to-wxmp/scripts/wxpush.mts`,Node ≥22.20 可直接运行,也可用 `npx tsx`。macOS/无桌面 Linux 为正式平台;安装目录包含预构建引擎、图表 WASM 和中文字体,运行时不需要 npm install、系统图像库、浏览器或宿主字体。
- 流程(SKILL.md):preflight(doctor)→ 内容适配 → build/upload/preview → push 草稿 → 回写 front-matter。

## 4. CLI 契约摘要

命令:`doctor | build | upload | push | preview`(完整契约见 `skills/publish-to-wxmp/WXPUSH.md`)。

- `build <note.md> [--theme <t>] [--out <dir>]` — markdown → 内联样式 HTML,Mermaid 图块自动经 Pele/SVG/PNG 成图。
- `upload <note.md>` — 从已完成构建发现图片(含生成图),上传微信 CDN,哈希缓存幂等,重写该 run 的 md/html。上传/预览/推草稿校验输入归属和内容指纹;失败或过期构建需先重建,源笔记正文不变。后续命令也可用 `--out` 明确选择构建。
- `push` — 封面素材 + 草稿;本地先校验 title ≤64、digest ≤120、封面 <2MB。
- `preview [--port] [--watch]` — 本地静态预览;`--watch` 监听产物变化自动刷新浏览器。

Front-matter `wechat: {title, digest, cover, author, source_url}` 覆盖默认值。

## 5. 主题系统(完整)

- 主题 = `skills/publish-to-wxmp/themes/<name>.yaml`,文件名即主题名。
- 结构:`base_theme`(可继承 default/grace/simple/geek-black)+ `base`/`block`/`inline` 三段 CSS 属性映射。
- `block.h1_content` 至 `block.h6_content` 可选:为标题增加独立的 `<span class="content">`,支持外层通栏背景/细线与内层文字装饰;未配置时保持原来的单层标题。
- `renderOptions` 可选:`isMacCodeBlock`(代码块交通灯)、`isShowLineNumber`(行号)。与主题一起继承,未配置时沿用 CLI 默认值。
- 合并语义:**深合并**——用户样式递归覆盖到基础主题上,只写要改的属性。
- 发现机制:`build --list-themes` 列出内置 default、grace、simple、geek-black + themes/ 目录下全部 YAML。
- geek-black 真源为 `skills/publish-to-wxmp/engine/geek-black.theme.mjs`,保留原 `#nice` CSS 的双层标题,并补齐参考效果依赖的基础间距、浅灰引用和代码块背景;代码文字为深灰,行号独立内联为浅灰,不依赖参考站点的样式表。
- 引擎内置主题随 engine bundle 分发(不依赖 node_modules)。

## 6. Engine 设计

- `skills/publish-to-wxmp/engine/build.mjs`:npm 安装 `github:doocs/md#v2.x`,esbuild 打包 `@md/core`(含 shared 主题表,导出 `themeMap`)为单文件 ESM `skills/publish-to-wxmp/engine/engine.mjs`(含微信输出兼容层约 1.1MB),提交入库。
- 运行时零构建:wxpush.mts 直接 import 相对路径的 bundle;安装 skill 不需要 npm install。
- 构建入口注册本地内置主题,再由 `skills/publish-to-wxmp/engine/local-patches.mjs` 对 bundle 应用受校验的补丁:HTML 样式属性转义、可选双层标题、代码布局内联。补丁不匹配时中止,不覆盖已有产物。
- CLI 保存 `postProcessHtml` 的结果(包含容器和引用链接),去掉微信不保留的 `<style>`;排版所需规则必须内联。
- 保存前经 `skills/publish-to-wxmp/engine/wechat-styles.mjs` 的 `inlineWechatStyles` 输出兼容层:用 HTML/CSS 解析器按元素作用域展开 `var(...)`(含继承、局部变量与回退),再移除 `--...` 自定义属性声明。真实草稿最小复现表明,微信会丢弃自定义属性之后的普通样式;仅浏览器预览正常不足以验证。preview/upload/push 必须共用这一产物,不能只在发送时修补。解析器一起打包进 engine,不增加 CLI 运行时依赖。
- 升级引擎 = 改版本号重跑构建脚本,重新提交产物。主题、补丁与微信输出兼容层改动也必须重建,不可只手改 bundle。
- 回归测试:`npm run test:engine`(Node ≥22.20 + Python 3)经实际 CLI 构建并解析 HTML;`npm run test:browser` 用主机已安装的 Google Chrome 检查 375px/768px 下的计算样式和布局,而非仅搜索样式字符串。`npm test` 同时覆盖类型检查、布局、引擎、服务端与浏览器测试;独立测试 workflow 在 macOS/Linux 上执行同一命令。安装和覆盖范围见 [skills/publish-to-wxmp/engine/tests/README.md](../skills/publish-to-wxmp/engine/tests/README.md)。
- 图表:独立、锁依赖的 Pele/resvg-wasm bundle 加随包完整 Noto 简体中文字体,离线成图。先由 agent 将 ASCII/说明性文本改写为 Mermaid,CLI 只做确定性渲染;不调用模型。全部 Pele 内置类型走统一入口,首版仅支持自包含文字/形状。图内网页链接移至图注并沿用脚注;外部图片、自定义图标、公式、缺字、可检测裁切及超限均使构建失败。保留 Mermaid、SVG、PNG,发布只嵌入 PNG;手机预览和用户确认仍是最终验收。
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
