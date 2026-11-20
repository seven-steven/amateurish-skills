# wxmp-cover

给 agent 一篇文章，它会提炼封面短词，直接用首选出图，同时给两个备选。例如：

> 用 wxmp-cover 给 `复盘.md` 做公众号封面，`--mode 单图`。保留“FDE”这个词。

生成只在本地进行：代码用实际字形轮廓绘制 SVG，再用随包的 resvg WASM 导出不透明 PNG。SVG 也保留，换机器查看不依赖系统字体。Node ≥ 22.20；使用 skill 无需 `npm install`、Chrome、API Key 或发布服务。备选文案由当前 agent 提供，不是命令再请求一个模型。

| `--mode` / 配置 `mode` | PNG 输出 | 布局 |
| --- | --- | --- |
| `头条` / `lead` | `lead.png`，940 × 400 | 一行居中；适合横版，**不保证**居中裁方后仍完整 |
| `次条` / `secondary` | `secondary.png`，400 × 400 | 两行分别居中，只在第一行底部加色条 |
| `两张` / `both`（默认） | 上述两张 | 同篇分别排字，不拉伸、不互裁 |
| `单图` / `single` | `single.png`，940 × 400 | 两行和色条全在中央 400 × 400；中心裁区为 `x=[270,670)`。横版同样是两行，不是左右拼图 |

所有版式共用上方中央聚光的单色系背景，色条在字后。设置相同的 `light`、`base` 即可改为严格纯色。输出按次放在独立 `run-*` 目录，不覆盖旧图。**默认根目录是系统临时目录下的 `wxmp-cover/`**，不是项目里的 `./tmp`；临时文件可能被系统清理，要长期保存请指定目录。

## 配置

只读 `~/.config/skills/wxmp-cover/config.json`，不跟随 `XDG_CONFIG_HOME`。缺文件即可按默认设置出图，不写配置。要保存偏好，可参考 [config.example.json](config.example.json)。例如，日常只做可裁方的单图并保存到图片目录：

```json
{ "mode": "single", "theme": "jade-serif", "outputDir": "~/Pictures/wxmp-covers" }
```

- **本次调用 > 配置文件 > 内置默认**。`--mode 次条 --theme slate-sans --output-dir ./预览` 只影响本次，不修改配置。CLI 相对输出路径以调用目录为基准；配置中的相对路径（含字体文件）以 `config.json` 所在目录为基准。两处均支持 `~/`。
- 内置 `jade-serif`（青绿·宋，思源宋体 CN Heavy，900）和 `slate-sans`（蓝灰·黑，思源黑体 CN Bold，700）。在 `themes` 中加命名对象，以 `theme` 或 `--theme` 选用。`preset` 指定内置基底，新增主题不指定时从 `jade-serif` 开始。`light`（光心）、`base`（暗部）、`ink`（字）、`bar`（强调条）均为 `#RRGGBB`。替换配色后，检查 56 px 缩略图上字与亮部、字与色条是否仍能分辨。
- **换字体/字重**：在选定主题中加入 `"fontWeight": 700, "fontFiles": {"700": "fonts/品牌黑体-Bold.otf"}`。`fontFiles` 是实际字重到本地静态 OTF/TTF 文件的映射，**整体替换**基底字体表；可同时登记 `400`、`700` 等文件，再用 `fontWeight` 选择。文件需存在、含所需字形，且 OS/2 标注的字重须匹配；不合成粗体、不回退系统字体。使用自备字体前请确认授权。

## 不经过 agent 复现首选图

在本 skill 目录执行（可用 `--help` 查看参数）：

```bash
node scripts/render.mjs --mode both --lead 'FDE交付' --line 'FDE' --line '交付'
```

这里传的是**选定的短词**而非 Markdown 路径。只做 `lead` 时可以只传 `--lead`，只做 `secondary/single` 时只需两次 `--line`。成功时 stdout 是 JSON，含实际模式、选中主题、字体及 `files[].{layout,lines,svg,png}`；出错时 stderr 给出原因并返回非零状态。相同字体、主题、版式与短词可重建相同的 PNG（输出路径每次不同）。

维护者：在仓库根目录运行 `npm run test:cover` 或 `npm test`。测试从 CLI 读取真实 PNG，检验安全区、强调条、主题等，不用线上的微信或生图服务。随包资产及授权见 [来源与许可](assets/licenses/SOURCES.md)。
