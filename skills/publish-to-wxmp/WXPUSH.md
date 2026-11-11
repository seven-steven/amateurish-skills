# WXPUSH — wxmp-publisher CLI

`npx tsx <skill>/scripts/wxpush.mts` — push a Markdown note into the Wechat Official Account draft box. Rendering runs offline on Node ≥22.20, with no runtime npm install: prebuilt engines, WASM and a Chinese font are included in the skill. Official platforms: macOS and headless Linux.

Env: `WXMP_API_BASE`(token 服务地址,如 `https://wx.example.com`,也可由配置的 `api_base` 提供);连接受保护的服务端时设置 `WXMP_API_TOKEN`(与服务端 WX_TOKEN 一致)。离线构建无需这两项。

## Commands

- `doctor` — preflight:排版及图表 bundle、WASM/中文字体完整性、config env、API 可达性、主题列表。每次会话首个发布前跑。
- `themes` — 列出全部主题(内置 + `themes/` 自定义,带 `*` 标记)。
- `build <note.md> [--theme <name>] [--out <dir>]` — markdown → 内联样式 HTML;Mermaid 图块自动经 Pele → SVG → PNG。默认在机器本地状态的 output 下创建唯一 run dir;`latest` 指向本次 run,包括失败构建(不可上传/推草稿)。指定 `--out` 时同样登记本次构建。
- `upload <note.md> [--out <dir>]` — 读取已完成构建中的图片引用(含生成图),上传微信 CDN(`PUT <base>/publish/img`),重写该 run 的 md/html;哈希缓存于 `~/.local/state/wxmp-publisher/image-cache.json`,幂等可重试。原笔记正文不变。
- `push <note.md> --title <t> [--digest <d>] [--author <a>] [--source-url <u>]` — 前提 build+upload 已完成:上传封面素材、创建草稿。打印 `media_id`。默认总是新建草稿。
- `push <note.md> --update [--media-id <id>]` — 更新已有草稿而不是新建:调 `PUT <base>/publish/update`(微信 `draft/update`,整篇替换,media_id 不变)。`--media-id` 缺省用 `~/.local/state/wxmp-publisher/drafts.json` 里本笔记上次的 media_id;换设备或缓存丢失时手动传。创建和更新均遵循下文构建新鲜度检查。
- `preview <note.md> [--port 8099] [--watch] [--out <dir>]` — 本地静态服务器打开渲染结果;`--watch` 时监听 run dir 产物变化,浏览器自动刷新(upload 重写后的 html 即真实 CDN 图预览)。

### 构建新鲜度

后续命令默认消费 `latest`,也可用 `--out <dir>` 显式选择构建。`preview`、`upload`、`push` 创建及 `push --update` 共用检查:输入路径归属、笔记内容指纹、构建完成状态,以及本次构建实际所选主题的完整有效配置(正文样式、已有 `renderOptions` 和 `pele`)。检查在启动新预览及任何正文图片上传、封面上传、草稿创建/更新请求之前完成。

另一篇笔记、已变更输入、未完成构建、缺少新鲜度信息的旧格式构建,或所选主题配置已变更、无法解析、已删除,均拒绝消费旧产物并提示重新 `build`。工具不自动重建;重建后按 `build → upload → preview → push` 重新检查并确认。`push` 创建和更新均要求先完成 `upload`。

主题复核依据构建实际选择,而非后来改变的全局默认主题。比较有效配置,不比较文件 mtime:仅触碰文件时间、注释等未改变有效配置的编辑、修改无关主题均不使当前构建过期。已经启动的 preview 不实时监听主题源文件;`--watch` 只刷新 run dir 产物,构建到新 run 后需重启预览。

## Diagrams

仅文档中已有的 `mermaid` 图块自动成图;源码示例中的围栏、普通代码块不变。渲染与失败处理见 [DIAGRAMS.md](DIAGRAMS.md)。

- 本地渲染使用固定版本 Pele、resvg-wasm 及完整 Noto 简体中文字体,无需浏览器或宿主字体。保留 `.mmd`、已展开样式的 `.svg`、`.png`;最终文章仅嵌入 PNG。
- 源文件修改时间作为时间依赖图表的参考时间,记录在构建元数据中;同一输入和配置可重复生成相同图像。
- 图内网页链接转为图片下的引用,交给正文渲染器生成脚注;公众号链接保留可点击。笔记链接需先按 skill 规则适配。
- 外部图片、自定义图标、公式排版、缺失字形、可检测的隐藏标签/裁切及渲染错误会使构建失败,定位到图块和正文行号。支持范围是自包含文字和形状,不静默降级。
- 限制:单图源码 50,000 字符、流程图 1,000 条边、任一边长 ≤4096 SVG 像素、栅格像素 ≤8,000,000、PNG <10MB。超限则构建失败。自动校验不替代手机预览确认。
- 分发许可及对应源码获取见 [engine/ATTRIBUTION.md](engine/ATTRIBUTION.md)。Ctrl-C 退出。

## Config `~/.config/skills/publish-to-wxmp/config.json`

`{"api_base": "...", "author": "...", "theme": "default", "cover_dir": "..."}` — 各字段可选;需要连接服务端时提供 `api_base` 或 env `WXMP_API_BASE`。

这是唯一配置位置,`~` 为当前用户的 home,不受 `XDG_CONFIG_HOME` 影响。`WXMP_CONFIG_DIR` 已移除;旧位置 `~/.config/wxmp-publisher/config.json` 和 skill 内 `.bin/config.json` 不读取、不回退、不自动迁移,旧文件保持原样。

文件不存在时 CLI 使用空配置,保留默认值和非路径环境变量,不生成配置文件;操作缺少必要设置时再报错。需持久化设置时可参考 `config.example.json` 在新位置自行创建。配置不可读或 JSON 损坏时,需要配置的操作报告具体路径和原因并中止,不静默降级。

## Draft registry `~/.local/state/wxmp-publisher/drafts.json`

`{ "<abs note path>": "<media_id>" }` — 每次 push 成功后自动回写,`push --update` 默认用它定位要更新的草稿。机器本地状态,丢失后可用 `--media-id` 手动指定。

## Themes

自定义主题 = `skills/publish-to-wxmp/themes/<name>.yaml`:

```yaml
base_theme: grace        # 可选,继承 default/grace/simple/geek-black
base:
  "--md-primary-color": "#1a7f37"
block:
  h2:
    background: "#1a7f37"
inline: {}
pele:                   # 可选,仅覆盖需要改变的图表默认色
  accent: "#1a7f37"
  series_2: "#d58c24"
```

合并语义:深合并覆盖到基础主题,只写要改的属性;已有 `renderOptions` 也沿用继承规则。文件名即主题名。选择优先级为显式 `build --theme <name>` > 固定位置配置中的全局 `theme` > `default`;同一次选择同时决定正文和图表配色,没有独立图表主题参数或全局配色段。

### Pele 配色契约

`pele` 是主题内可选的颜色映射,Pele 是渲染器,不是一个名为 `pele` 的文章主题。全部允许字段如下:

| 字段 | 含义 |
| --- | --- |
| `background` | 图表背景及最终 PNG 画布颜色 |
| `foreground` | 主要文字 |
| `muted` | 弱化文字 |
| `line` | 线条 |
| `border` | 边框 |
| `surface` | 节点或区域主要底色 |
| `surface_alt` | 交替或次级底色 |
| `accent` | 强调色 |
| `critical` | Pele 已有关键任务语义的颜色 |
| `foreground_on_light` | Pele 已有浅底对比文字色 |
| `foreground_on_dark` | Pele 已有深底对比文字色 |
| `series_1`, `series_2`, `series_3`, `series_4`, `series_5`, `series_6`, `series_7`, `series_8` | 八个独立系列色槽位 |

- 每个字段均可省略;部分覆盖不重排系列槽位,未覆盖的值仍由图内设置或 Pele 默认值提供。字段对应固定 Pele 版本已有的公开变量,并非每种图表都会使用每个字段,也不改变各图表已有的颜色用途。
- 值必须是**带引号的**不透明十六进制字符串 `"#RGB"` 或 `"#RRGGBB"`,十六进制大小写均可。YAML 中未加引号的 `#` 会被当作注释。没有列表或逗号分隔色板语法。
- 加载所选主题时严格校验,即使笔记没有图表也会执行。非映射 `pele`、未知键(包括 `series_9`)、非字符串、非法字符/长度、透明色/带 alpha 十六进制、颜色名称/函数、CSS 变量及列表均使构建非零退出,不静默忽略或回退。诊断包含主题文件和 `pele` 或具体 `pele.<字段>`;失败构建不能用于后续命令。正文主题字段保留原有兼容规则。
- 配色逐项遵循**图内显式配色 > 主题配色 > Pele 默认配色**。保留 `style`、`classDef` 字面量及初始化指令/frontmatter `themeVariables` 的显式颜色;图内只指定一个系列槽位时,其他槽位仍使用主题或默认值。
- `background` 同时作用于图表背景配色和 PNG 画布,可显式选择深色;省略时沿用白色画布。作者负责可读性和对比度,工具不自动修正低对比度。
- 没有 `pele` 或使用 `pele: {}` 时保持旧图表资产名称、SVG 和 PNG 字节;现有内置主题不自动获得新色,正文主色也不推导图表颜色。
- 这里只开放颜色,不开放字体、字号、圆角、字重、布局或尺寸配置;原有中文字体、隐藏标签/缺字、裁切和尺寸校验继续有效。

完整的独立示例是 [`themes/example-midnight.yaml`](themes/example-midnight.yaml):继承 grace 的正文,以青绿色正文强调色搭配显式深色图表及八个系列槽位。现有主题不变,默认主题也不变。可直接运行:

```bash
node <skill>/scripts/wxpush.mts themes
node <skill>/scripts/wxpush.mts build <note.md> --theme example-midnight
```

修改主题后按[构建新鲜度](#构建新鲜度)重新构建、上传和预览;图表检查步骤见 [DIAGRAMS.md](DIAGRAMS.md)。

## Conventions

- Front-matter `wechat: {title, digest, cover, author, source_url}` 覆盖默认值。
- 封面必填:`wechat.cover`(相对笔记目录)→ `cover_dir` 中按标题 slug 匹配 → 笔记首图(警告)。
- 微信限制:正文图片 <10MB PNG/JPG/GIF;封面 <2MB;title ≤64 字;digest ≤120 字——工具先本地校验再请求。
- 用户配置见上文;运行时状态(缓存、output、drafts)仍在 `~/.local/state/wxmp-publisher/`,可用 `WXMP_STATE_DIR` 覆盖。两者均在 skill 目录之外,重装/更新 skill 不受影响。旧 `.bin/` 中仅 `image-cache.json`、`drafts.json` 和 `output/` 在对应目标缺失时复制到状态目录,保留源文件。
