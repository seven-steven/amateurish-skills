# publish-to-wxmp

把 Markdown 笔记发布到微信公众号**草稿箱**的 agent skill:本地排版渲染 + 服务端 token 代理,最终群发永远由人工在公众号后台完成。

流程与工具契约见 [SKILL.md](SKILL.md) 与 [WXPUSH.md](WXPUSH.md)(CLI 命令的 source of truth)。

## 安装

```bash
npx skills add seven-steven/amateurish-skills --skill publish-to-wxmp
```

要求 Node ≥22.20,正式支持 macOS 与无桌面的 Linux。可直接用 `node <skill 目录>/scripts/wxpush.mts ...`,也可通过 `npx tsx` 运行。

文档中已有的 Mermaid 图表由随包 Pele、resvg WASM 和完整简体中文字体离线渲染成 PNG,无需另装浏览器、图像工具、字体或 npm 依赖。字体/WASM 约 19 MB(未压缩),另有预构建 JS。渲染规则及失败处理见 [DIAGRAMS.md](DIAGRAMS.md)。

需要配套部署服务端(持有 AppSecret、统一管理 access_token),见 [wxmp-server/deploy.md](../../wxmp-server/deploy.md)。

## 配置

```bash
# ~/.config/skills/publish-to-wxmp/config.json
{ "api_base": "https://wx.example.com", "author": "", "theme": "default", "cover_dir": "" }
export WXMP_API_TOKEN=<与服务端 WX_TOKEN 一致>
```

- 需要连接服务端时提供 `api_base` 或 env `WXMP_API_BASE`,其余可选;各字段与缺配置行为见 [WXPUSH.md](WXPUSH.md)。
- 仅支持上述固定位置,不受 `XDG_CONFIG_HOME` 影响;`WXMP_CONFIG_DIR` 已移除,旧配置不读取、不回退、不自动迁移。
- 配置与运行时状态(image-cache、output、草稿登记)都在 skill 目录之外,重装/更新 skill 不会覆盖;只有运行时状态保留从旧 `.bin/` 布局迁移的行为。

## 验证

```bash
npx tsx <skill 目录>/scripts/wxpush.mts doctor   # 全绿即就绪
```

然后在装了该 skill 的 agent 对话里说「发布 xx.md 到公众号」。

## 自定义主题

在 skill 目录 `themes/<name>.yaml` 写深合并覆盖(文件名即主题名),`themes` 命令列出全部主题。选择优先级为显式 `build --theme <name>` > 全局配置 `theme` > `default`,同时选择正文样式和图表配色。

主题可以增加可选的 `pele` 映射,只写要改的颜色;值使用带引号的 `"#RGB"` 或 `"#RRGGBB"`。全部字段、严格校验、继承及逐项「图内显式 > 主题 > 默认」契约见 [WXPUSH.md](WXPUSH.md#themes)。无 `pele` 或空映射保持旧图表效果和产物,正文主色不会自动推导图表颜色。

独立示例 [`themes/example-midnight.yaml`](themes/example-midnight.yaml) 展示青绿色正文与深色图表(包括 PNG 画布)及八个系列色;不改变现有主题或默认选择:

```bash
node <skill 目录>/scripts/wxpush.mts build <note.md> --theme example-midnight
```

修改所选主题的正文样式、渲染选项或图表配色后必须重新 `build → upload → preview`,确认后再创建或更新草稿。预览、上传、创建及更新草稿均在启动预览或远端请求前拒绝过期构建,不会自动重建或悄悄复用;按完整有效配置而非 mtime 判断,无关主题不影响当前构建。删除/损坏所选主题或旧构建缺少新鲜度信息也要求重建,详见 [构建新鲜度](WXPUSH.md#构建新鲜度)。配色仍完全离线、自包含;手机宽度预览和用户人工确认不能省略,检查规则见 [DIAGRAMS.md](DIAGRAMS.md)。
