# WXPUSH — wxmp-publisher CLI

`npx tsx <skill>/scripts/wxpush.mts` — push a Markdown note into the Wechat Official Account draft box. Rendering runs offline on Node ≥22.20, with no runtime npm install: prebuilt engines, WASM and a Chinese font are included in the skill. Official platforms: macOS and headless Linux.

Env: `WXMP_API_BASE`(token 服务地址,如 `https://wx.example.com`)必需;`WXMP_API_TOKEN`(与服务端 WX_TOKEN 一致)必需。

## Commands

- `doctor` — preflight:排版及图表 bundle、WASM/中文字体完整性、config env、API 可达性、主题列表。每次会话首个发布前跑。
- `themes` — 列出全部主题(内置 + `themes/` 自定义,带 `*` 标记)。
- `build <note.md> [--theme <name>] [--out <dir>]` — markdown → 内联样式 HTML;Mermaid 图块自动经 Pele → SVG → PNG。默认在机器本地状态的 output 下创建唯一 run dir;`latest` 指向本次 run,包括失败构建(不可上传/推草稿)。指定 `--out` 时同样登记本次构建。
- `upload <note.md> [--out <dir>]` — 读取已完成构建中的图片引用(含生成图),上传微信 CDN(`PUT <base>/publish/img`),重写该 run 的 md/html;哈希缓存于 `~/.local/state/wxmp-publisher/image-cache.json`,幂等可重试。原笔记正文不变。
- `push <note.md> --title <t> [--digest <d>] [--author <a>] [--source-url <u>]` — 前提 build+upload 已完成:上传封面素材、创建草稿。打印 `media_id`。默认总是新建草稿。
- `push <note.md> --update [--media-id <id>]` — 更新已有草稿而不是新建:调 `PUT <base>/publish/update`(微信 `draft/update`,整篇替换,media_id 不变)。`--media-id` 缺省用 `~/.local/state/wxmp-publisher/drafts.json` 里本笔记上次的 media_id;换设备或缓存丢失时手动传。创建和更新均校验构建归属、输入内容指纹及完成状态,输入变更或构建未完成则提示先 build/upload;仅修改文件 mtime 不使未变更的内容过期。
- `preview <note.md> [--port 8099] [--watch] [--out <dir>]` — 本地静态服务器打开渲染结果;`--watch` 时监听 run dir 产物变化,浏览器自动刷新(upload 重写后的 html 即真实 CDN 图预览)。

后续命令默认消费 `latest`,也可用 `--out <dir>` 显式选择构建。上传、预览及推草稿会校验输入路径及内容指纹;另一篇笔记、已变更输入、旧格式或未完成构建均要求重建。`push` 创建和更新均要求先完成 `upload`。

## Diagrams

仅真正的 `mermaid` 图块自动成图;源码示例中的围栏、普通代码块不变。发布前由 agent 将 ASCII/说明性文本改写为 Mermaid,规则见 [DIAGRAMS.md](DIAGRAMS.md)。

- 本地渲染使用固定版本 Pele、resvg-wasm 及完整 Noto 简体中文字体,无需浏览器或宿主字体。保留 `.mmd`、已展开样式的 `.svg`、`.png`;最终文章仅嵌入 PNG。
- 源文件修改时间作为时间依赖图表的参考时间,记录在构建元数据中;同一输入和配置可重复生成相同图像。
- 图内网页链接转为图片下的引用,交给正文渲染器生成脚注;公众号链接保留可点击。笔记链接需先按 skill 规则适配。
- 外部图片、自定义图标、公式排版、缺失字形、可检测的隐藏标签/裁切及渲染错误会使构建失败,定位到图块和正文行号。支持范围是自包含文字和形状,不静默降级。
- 限制:单图源码 50,000 字符、流程图 1,000 条边、任一边长 ≤4096 SVG 像素、栅格像素 ≤8,000,000、PNG <10MB。超限时拆图,保持含义完整。自动校验不替代手机预览确认。
- 分发许可及对应源码获取见 [engine/ATTRIBUTION.md](engine/ATTRIBUTION.md)。Ctrl-C 退出。

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
