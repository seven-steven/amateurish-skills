# WXPUSH — wxmp-publisher CLI

`npx tsx <skill>/scripts/wxpush.ts` — push a Markdown note into the Wechat Official Account draft box. One command = one end state; every step is idempotent on the cache in `.bin/` next to the skill. Zero npm deps: the engine is a prebuilt bundle (`engine/engine.mjs`).

Env: `WXMP_API_BASE`(token 服务地址,如 `https://wx.example.com`)必需;`WXMP_API_TOKEN`(与服务端 WX_TOKEN 一致)必需。

## Commands

- `doctor` — preflight:engine bundle、config env、API 可达性、主题列表。每次会话首个发布前跑。
- `themes` — 列出全部主题(内置 + `themes/` 自定义,带 `*` 标记)。
- `build <note.md> [--theme <name>] [--out <dir>]` — markdown → 内联样式 HTML,产出 `.bin/output/<slug>-<时间戳>/`(`latest` 软链指向它)。
- `upload <note.md>` — 上传笔记内全部图片到微信 CDN(`PUT <base>/publish/img`),重写 run dir 里的 md/html,哈希缓存于 `.bin/image-cache.json`,幂等可重试。
- `push <note.md> --title <t> [--digest <d>] [--author <a>] [--source-url <u>]` — 前提 build+upload 已完成:上传封面素材、创建草稿。打印 `media_id`。
- `preview <note.md> [--port 8099] [--watch]` — 本地静态服务器打开渲染结果;`--watch` 时监听 run dir 产物变化,浏览器自动刷新(upload 重写后的 html 即真实 CDN 图预览)。Ctrl-C 退出。

## Config `.bin/config.json`

`{"api_base": "...", "author": "...", "theme": "default", "cover_dir": "..."}` — `api_base` 必填(env `WXMP_API_BASE` 可覆盖)。

## Themes

自定义主题 = `skill/themes/<name>.yaml`:

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
- `.bin/`(缓存、output、config)是机器本地运行时状态,gitignore。
