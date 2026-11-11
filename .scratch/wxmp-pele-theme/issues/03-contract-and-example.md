# 03：同步图表主题契约并交付独立示例

Status: resolved
Type: task
Blocked by: 01

## Context

- 需求源：[功能规格](../spec.md)，重点阅读全部配置契约、交付约束与范围外事项。
- 依赖：[01 图表配色](01-diagram-palette.md)。本票可与 [02 构建新鲜度](02-theme-freshness.md) 并行；新鲜度的最终用户契约由规格决定，不因并行时 02 尚未合入而删减。
- 文档落点：skill 的 `WXPUSH.md`、`DIAGRAMS.md`、`README.md`、必要的 `SKILL.md` 流程说明，根 `docs/spec.md` 和图表测试说明；独立示例放入 skill 的 themes 目录。

## Scope

更新配置、配色优先级、背景行为、错误处理和主题变更后的重建要求。增加新的独立示例主题，不修改现有内置主题或旧示例的效果。不修改实现代码，不与 02 重复实现新鲜度。

## Acceptance

- [x] 用户能从文档获知 `pele` 的全部允许字段、带引号的十六进制格式、部分覆盖和严格校验要求。
- [x] 文档正确表达图内显式 > 主题 > 默认的优先级、深色画布、无覆盖兼容及不开放的样式范围。
- [x] 明确修改主题后必须重新 build，预览、上传、创建与更新草稿不会悄悄复用旧构建。
- [x] 独立示例主题能够通过真实 CLI 被发现，并构建实际配色图表；使用已确认 CLI Seam，按 TDD 增加必要的示例可用性回归。
- [x] 保持安装后自包含、离线运行、手机预览和人工确认等现有流程约束。
- [x] 相关说明互相一致，源码路径与发行 bundle 的既有重建说明不退化；完整 `npm test` 通过。
- [x] 所有 shell 命令带显式超时，stdout/stderr 记录在 `/tmp`。

## Handoff

开始前确认 worktree 包含集成分支当前 tip，且 01 已 resolved；先将本票状态改为 `claimed`。先加载 writing-for-agents 和 tdd 技能。提交后合入集成分支最新 tip，再验证。报告提交 SHA、示例实际 CLI 构建和完整测试日志、修改过的契约文档。如受阻，报告准确原因并停止。由合并子代理在成功集成后将本票置为 `resolved` 并追加结果。

## Comments

- Started from integration SHA `62e81af8c10002f69b8ee8b49054fb571229fcba`; ancestry confirmed in `/tmp/wxmp-theme-03-setup.log`. Ticket 01 is resolved. Primary test seam remains the real `wxpush` CLI, as confirmed in [spec](../spec.md#testing-decisions).
- Synced the six documentation targets listed in Context, including the complete final freshness contract from [spec](../spec.md#构建新鲜度), without implementing ticket 02. Added independent `themes/example-midnight.yaml`; existing themes and implementation are unchanged.
- TDD example usability: `/tmp/wxmp-theme-03-example-red.log` (missing example fails discovery), `/tmp/wxmp-theme-03-example-green.log` (real installed CLI/SVG/decoded PNG/article assertions pass), `/tmp/wxmp-theme-03-example-green-full.log` (full `npm test`: typecheck, layout 7, Node engine 3, Python engine 40, server 9, Chrome browser 20 all pass).
- Offline standalone example CLI log: `/tmp/wxmp-theme-03-example-cli.log`; retained self-contained installation and actual `.mmd`/`.svg`/`.png` under `/tmp/wxmp-theme-03-demo-VlQzKK/`. Documentation/scope/hash inspection: `/tmp/wxmp-theme-03-doc-review.log`. No bundle rebuild needed: no implementation changed; diagram bundle SHA-256 remains `bcfe217c4ca28eaaf6340bfda8aa160b69b44a3814024432ea493b7702e82d13`, and independent old-CLI baseline remains unchanged.
- Status deliberately remained `claimed` in the implementation commit; merger owns resolution after integration/review.
- Integration: merged implementation `9a28dce323359927f7ae107ddeecfd4050b2741d` into clean `feat/wxmp-pele-theme` with `git merge --no-ff`; merge commit `44715d5810e6d1dfce8c721997087a67e2a8473f` preserves the ticket commit. Ticket 02 was already resolved in the starting tip, so its freshness implementation and this contract/example were validated together. No conflicts, implementation edits or release rebuild were needed. Full post-merge `npm test` passed; ticket resolved by merger. Independent feature reviewer gate remains separate.

## Answer

- Delivered the documentation and independent example Scope above; see [spec](../spec.md) for the contract rather than duplicating it. All seven acceptance boxes are supported by inspected committed changes, implementation TDD logs and passing combined integration tests.
- Implementation commit: `9a28dce323359927f7ae107ddeecfd4050b2741d`; integration merge: `44715d5810e6d1dfce8c721997087a67e2a8473f`. Clean starting checkout/runtime: `/tmp/wxmp-theme-03-merger-setup.log`; actual committed diff, ancestry, whitespace and bundle hashes: `/tmp/wxmp-theme-03-merger-inspect.log`; merge parents, scope and unchanged implementation/bundles: `/tmp/wxmp-theme-03-merger-operation.log`.
- Post-merge validation: `timeout 600s npm test`, complete stdout/stderr in `/tmp/wxmp-theme-03-merger-full-test.log`, exit 0. Typecheck passed; layout 7/7, Node engine 3/3, Python engine 49/49 (392.604s), server 9/9 and installed Google Chrome browser 20/20 (18.8s). The example discovery/build regression passed through real installed CLI, concrete SVG, decoded PNG/canvas, article styles and selected-theme metadata; all nine freshness regressions and independent old-CLI diagram baseline also passed.
- Updated contract documents: `docs/spec.md`, skill `WXPUSH.md`, `DIAGRAMS.md`, `README.md`, `SKILL.md` and `engine/tests/README.md`. Added `themes/example-midnight.yaml` and its regression in `engine/tests/test_diagram_palette.py` (skill-relative paths). Existing themes and implementation/bundles remain unchanged by this merge; no rebuild was required. SHA-256 remains `697e6658df90910e142b54369d1dc73f1bd199c7b31f04b2d49582e23ca6bec6` for `engine.mjs` and `bcfe217c4ca28eaaf6340bfda8aa160b69b44a3814024432ea493b7702e82d13` for `diagrams.bundle.mjs`.
- Integration report: `03-merge.md`, alongside `03-implementation.md` under this run's `subagent-artifacts/outputs/8470bb6b-b11e-4339-a45f-55de66655d51/reports/` directory. Remote macOS/Node 22 CI, real WeChat requests and human phone visual confirmation were not performed. Independent feature review remains pending; no PR, push or changes to other worktrees.
