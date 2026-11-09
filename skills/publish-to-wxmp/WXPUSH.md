# WXPUSH — wxmp-publisher CLI

`npx tsx <skill>/scripts/wxpush.ts` — push a Markdown note into the Wechat Official Account draft box. One command = one end state; every step is idempotent on the machine-local cache outside the skill dir. Zero npm deps: the engine is a prebuilt bundle (`skills/publish-to-wxmp/engine/engine.mjs`).

Env: `WXMP_API_BASE`(token 服务地址,如 `https://wx.example.com`)必需;`WXMP_API_TOKEN`(与服务端 WX_TOKEN 一致)必需。

## Commands

- `doctor` — preflight:engine bundle、config env、API 可达性、主题列表。每次会话首个发布前跑。
- `themes` — 列出全部主题(内置 + `themes/` 自定义,带 `*` 标记)。
- `build <note.md> [--theme <name>] [--out <dir>]` — markdown → 内联样式 HTML,产出 `~/.local/state/wxmp-publisher/output/<slug>-<时间戳>/`(`latest` 软链指向它)。
- `upload <note.md>` — 上传笔记内全部图片到微信 CDN(`PUT <base>/publish/img`),重写 run dir 里的 md/html,哈希缓存于 `~/.local/state/wxmp-publisher/image-cache.json`,幂等可重试。
- `push <note.md> --title <t> [--digest <d>] [--author <a>] [--source-url <u>]` — 前提 build+upload 已完成:上传封面素材、创建草稿。打印 `media_id`。默认总是新建草稿。
- `push <note.md> --update [--media-id <id>]` — 更新已有草稿而不是新建:调 `PUT <base>/publish/update`(微信 `draft/update`,整篇替换,media_id 不变)。`--media-id` 缺省用 `~/.local/state/wxmp-publisher/drafts.json` 里本笔记上次的 media_id;换设备或缓存丢失时手动传。更新前校验 run dir 产物不早于笔记 mtime,过期则报错提示先 build/upload。
- `preview <note.md> [--port 8099] [--watch]` — 本地静态服务器打开渲染结果;`--watch` 时监听 run dir 产物变化,浏览器自动刷新(upload 重写后的 html 即真实 CDN 图预览)。Ctrl-C 退出。

## Config `~/.config/wxmp-publisher/config.json`

`{"api_base": "...", "author": "...", "theme": "default", "cover_dir": "..."}` — `api_base` 必填(env `WXMP_API_BASE` 可覆盖)。缺失时从 `config.example.json` 引导生成。

## Draft registry `~/.local/state/wxmp-publisher/drafts.json`

`{ "<abs note path>": "<media_id>" }` — 每次 push 成功后自动回写,`push --update` 默认用它定位要更新的草稿。机器本地状态,丢失后可用 `--media-id` 手动指定。

## Themes

自定义主题 = `skills/publish-to-wxmp/themes/<name>.yaml`:

```yaml
base_theme: grace        # 可选,继承 default/grace/simple
base:
  "--md-primary-color": "#1a7f37"
block:
  h2:
    background: "#1a7f37"
inline: {}
```

合并语义:深合并覆盖到基础主题,只写要改的属性。文件名即主题名。

## Conventions

- Front-matter `wechat: {title, digest, cover, author, source_url}` 覆盖默认值。
- 封面必填:`wechat.cover`(相对笔记目录)→ `cover_dir` 中按标题 slug 匹配 → 笔记首图(警告)。
- 微信限制:正文图片 <10MB PNG/JPG/GIF;封面 <2MB;title ≤64 字;digest ≤120 字——工具先本地校验再请求。
- 用户配置在 `~/.config/wxmp-publisher/`,运行时状态(缓存、output、drafts)在 `~/.local/state/wxmp-publisher/`——均在 skill 目录之外,重装/更新 skill 不受影响;首次运行自动从旧 `.bin/` 布局迁移。
