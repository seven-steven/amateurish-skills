# 01：通过现有主题配置交付 Pele 图表配色

Status: ready-for-agent
Type: task
Blocked by: none

## Context

- 需求源：[功能规格](../spec.md)，重点阅读主题 Interface、配置校验、图表编译与产物，以及测试矩阵 1–8、12。
- 测试 Seam 已获用户确认：真实 `wxpush` CLI，沿用图表测试与 CLI 环境夹具，不增加测试专用公开 Interface。
- 现有入口：主题加载位于 `skills/publish-to-wxmp/scripts/wxpush.mts`，离线图表编译位于 `skills/publish-to-wxmp/engine/diagrams.mjs`；CLI 使用发行 bundle，修改源码后必须通过既有流程重建。
- 测试先例：`test_diagrams.py`、`test_artifacts.py`、`test_rendering.py`；自定义主题测试须复制完整 skill，包括图表资产。

## Scope

完成可用的端到端配色能力：可选 `pele` 字段、严格且可定位的校验、全部约定颜色映射、逐项配色优先级、深色 PNG 画布、背景敏感的资产身份和有效的空图校验。保留无覆盖时的图表字节兼容及原有中文、布局、离线分发约束。

本票不处理主题变更后的构建新鲜度，也不更新用户文档或增加示例主题；这些由后续票据负责。

## Acceptance

- [ ] 先通过旧实现的真实 CLI 固定受控输入的资产名称、SVG、PNG 兼容基线，再进入配色实现。
- [ ] 按 TDD 逐个纵向切片实现规格中全部配色字段、部分覆盖、严格校验和诊断；空映射等价于无配置。
- [ ] 图内 `style`、`classDef`、frontmatter 与初始化指令中的显式颜色优先，未指定的系列槽位仍继承主题或默认色。
- [ ] 深色画布正确，只有背景改变时资产与缓存身份也正确；空深色画布不能冒充有效图表。
- [ ] 没有 `pele` 配置时资产名称、SVG、PNG 与旧基线一致；相同新配置的重建结果确定。
- [ ] 真实解码 PNG 并检查 SVG 具体样式；发行 bundle 与源码同步，独立安装副本可离线成图。
- [ ] 新测试从 `npm test` 可达，完整 `npm test` 通过；所有 shell 命令带显式超时，stdout/stderr 记录在 `/tmp`。

## Handoff

开始前确认 worktree 包含集成分支当前 tip；先将状态改为 `claimed`。提交实现与测试后，合入集成分支最新 tip，再验证。报告提交 SHA、red/green 与完整测试日志、兼容基线来源、发行 bundle 重建证据；如受阻，报告准确原因并停止。由合并子代理在成功集成后将本票置为 `resolved` 并追加结果。

## Comments
