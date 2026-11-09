# publish-to-wxmp

把 Markdown 笔记发布到微信公众号**草稿箱**的 agent skill:本地排版渲染 + 服务端 token 代理,最终群发永远由人工在公众号后台完成。

流程与工具契约见 [SKILL.md](SKILL.md) 与 [WXPUSH.md](WXPUSH.md)(CLI 命令的 source of truth)。

## 安装

```bash
npx skills add seven-steven/amateurish-skills --skill publish-to-wxmp
```

要求 Node ≥22.20,正式支持 macOS 与无桌面的 Linux。可直接用 `node <skill 目录>/scripts/wxpush.mts ...`,也可通过 `npx tsx` 运行。

Mermaid 图表由随包 Pele、resvg WASM 和完整简体中文字体离线渲染成 PNG,无需另装浏览器、图像工具、字体或 npm 依赖。字体/WASM 约 19 MB(未压缩),另有预构建 JS。ASCII/说明性文本先由 agent 改写为 Mermaid,详见 [DIAGRAMS.md](DIAGRAMS.md);真实代码保持原样。

需要配套部署服务端(持有 AppSecret、统一管理 access_token),见 [wxmp-server/deploy.md](../../wxmp-server/deploy.md)。

## 配置

```bash
# ~/.config/wxmp-publisher/config.json
{ "api_base": "https://wx.example.com", "author": "", "theme": "default", "cover_dir": "" }
export WXMP_API_TOKEN=<与服务端 WX_TOKEN 一致>
```

- `api_base` 必填(也可用 env `WXMP_API_BASE` 覆盖),其余可选;各字段说明见 [WXPUSH.md](WXPUSH.md)。
- 配置与运行时状态(image-cache、output、草稿登记)都在 skill 目录之外,重装/更新 skill 不会覆盖;首次运行自动从旧 `.bin/` 布局迁移。

## 验证

```bash
npx tsx <skill 目录>/scripts/wxpush.mts doctor   # 全绿即就绪
```

然后在装了该 skill 的 agent 对话里说「发布 xx.md 到公众号」。

## 自定义主题

在 skill 目录 `themes/<name>.yaml` 写深合并覆盖(文件名即主题名),语法见 [WXPUSH.md](WXPUSH.md);`themes` 命令列出全部主题。
