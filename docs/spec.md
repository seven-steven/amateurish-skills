# wxmp-publisher 设计 spec

> 状态:已定稿(决策记录见 `.scratch/wxmp-publisher-migration/`)。本文件是本仓库全部工件的设计源。

## 1. 概述

把仓库里的 Markdown 笔记发布到微信公众号**草稿箱**的自动化工具链。最终发布永远由人工在公众号后台完成(API 群发无分发量,不值得自动化)。

三部分:

| 组件 | 位置 | 职责 |
| --- | --- | --- |
| skill | `skill/` | 自包含 agent 技能:SKILL.md(流程)+ WXPUSH.md(CLI 契约)+ scripts(walkthrough CLI)+ themes |
| server | `server/` | 部署在公网服务器的 token 服务:持有 AppSecret,统一管理 access_token,代理图片上传与建草稿 |
| engine | `engine/` | 排版引擎预构建产物(doocs/md @md/core 的 esbuild bundle)+ 构建脚本 + 归属说明 |

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

- 自包含:`skill/` 目录携带运行所需的一切(scripts、themes、契约文档);安装 = 克隆本仓库 + `install.sh` 软链/拷贝 skill 目录到 `~/.agents/skills/`(或项目 `.agents/skills/`)并落 config。README 提供 skills.sh 安装指引。
- 运行时状态(`.bin/`:config.json、image-cache.json、output/)是机器本地的,gitignore;不随仓库分发。
- CLI 入口 `skill/scripts/wxpush.mts`,以 `npx tsx` 运行,除 Node 外零外部依赖(引擎为预构建 bundle)。
- 流程(SKILL.md):preflight(doctor)→ 内容适配 → build/upload/preview → push 草稿 → 回写 front-matter。

## 4. CLI 契约摘要

命令:`doctor | build | upload | push | preview`(完整契约见 `skill/WXPUSH.md`)。

- `build <note.md> [--theme <t>] [--out <dir>]` — markdown → 内联样式 HTML。
- `upload <note.md>` — 图片上传微信 CDN,哈希缓存幂等,重写 run dir 里的 md/html。
- `push` — 封面素材 + 草稿;本地先校验 title ≤64、digest ≤120、封面 <2MB。
- `preview [--port] [--watch]` — 本地静态预览;`--watch` 监听产物变化自动刷新浏览器。

Front-matter `wechat: {title, digest, cover, author, source_url}` 覆盖默认值。

## 5. 主题系统(完整)

- 主题 = `skill/themes/<name>.yaml`,文件名即主题名。
- 结构:`base_theme`(可继承 default/grace/simple/geek-black)+ `base`/`block`/`inline` 三段 CSS 属性映射。
- `block.h1_content` 至 `block.h6_content` 可选:为标题增加独立的 `<span class="content">`,支持外层通栏背景/细线与内层文字装饰;未配置时保持原来的单层标题。
- `renderOptions` 可选:`isMacCodeBlock`(代码块交通灯)、`isShowLineNumber`(行号)。与主题一起继承,未配置时沿用 CLI 默认值。
- 合并语义:**深合并**——用户样式递归覆盖到基础主题上,只写要改的属性。
- 发现机制:`build --list-themes` 列出内置 default、grace、simple、geek-black + themes/ 目录下全部 YAML。
- geek-black 真源为 `engine/geek-black.theme.mjs`,保留原 `#nice` CSS 的双层标题,并补齐参考效果依赖的基础间距、浅灰引用和代码块背景。
- 引擎内置主题随 engine bundle 分发(不依赖 node_modules)。

## 6. Engine 设计

- `engine/build.mjs`:npm 安装 `github:doocs/md#v2.x`,esbuild 打包 `@md/core`(含 shared 主题表,导出 `themeMap`)为单文件 ESM `engine/engine.mjs`(约 572KB),提交入库。
- 运行时零构建:wxpush.mts 直接 import 相对路径的 bundle;安装 skill 不需要 npm install。
- 构建入口注册本地内置主题,再由 `engine/local-patches.mjs` 对 bundle 应用受校验的补丁:HTML 样式属性转义、可选双层标题、代码布局内联。补丁不匹配时中止,不覆盖已有产物。
- CLI 保存 `postProcessHtml` 的结果(包含容器和引用链接),去掉微信不保留的 `<style>`;排版所需规则必须内联。
- 升级引擎 = 改版本号重跑构建脚本,重新提交产物。主题与补丁改动也必须重建,不可只手改 bundle。
- 回归测试:`npm run test:engine`(Node ≥22.20 + Python 3)经实际 CLI 构建并解析 HTML;`npm run test:browser` 用 Chromium 检查 375px/768px 下的计算样式和布局,而非仅搜索样式字符串。`npm test` 运行两者,相关 push/PR 由 GitHub Actions 自动检查。安装和覆盖范围见 [engine/tests/README.md](../engine/tests/README.md)。
- 归属:引擎源自 doocs/md(Apache-2.0),见 `engine/ATTRIBUTION.md`。

## 7. Server 设计

- Flask + gunicorn,单 worker(微信要求 token 集中管理,单进程内存缓存即可)。
- 端点:`GET /health`、`PUT /publish/img`(multipart `image`)、`PUT /publish`(JSON: title/content/cover_base64/…)。
- access_token 内存缓存,过期前 120s 刷新。
- Docker:`server/Dockerfile` + `docker-compose.yml`(绑 127.0.0.1,反代终止 TLS)。
- 分发:GitHub Actions 构建发布 GHCR(tag + latest);服务器零构建。文档保留本地 build fallback。

安全设计独立成篇:[security.md](security.md)。

## 8. 仓库布局

```
README.md  LICENSE  AGENTS.md
docs/            spec.md, security.md, agents/
skill/           SKILL.md, WXPUSH.md, scripts/, themes/, config.example.json, install.sh
server/          server.py, Dockerfile, docker-compose.yml, .env.example, deploy.md
engine/          build.mjs, engine.mjs(产物), ATTRIBUTION.md
.github/         workflows/docker.yml
.scratch/        wayfinder 地图与决策票(过程工件)
```

## 9. 范围外

常驻 web UI、多用户/多公众号、mTLS/IP allowlist、skill 市场发布、API 自动群发。

## 10. 迁移说明

本仓库由 note 仓库 `tools/wxmp-publisher` + `.agents/skills/publish-to-wxmp` 迁移而来(决策票 03):只迁代码/文档/契约,运行时状态不迁;源库相关制品后续删除。
