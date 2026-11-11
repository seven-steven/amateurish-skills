# 02：主题有效配置变更后拒绝消费旧构建

Status: resolved
Type: task
Blocked by: 01

## Context

- 需求源：[功能规格](../spec.md)，重点阅读构建新鲜度、用户故事 25–31 和测试矩阵 9–11。
- 依赖：[01 图表配色](01-diagram-palette.md)。沿用其主题加载与严格校验能力，不再建立第二套主题解析逻辑。
- 现有位置：`skills/publish-to-wxmp/scripts/artifacts.mts` 的构建记录与统一加载检查；`wxpush.mts` 的 build 和消费命令；测试先例为 `test_artifacts.py` 与 `test_diagrams.py`。

## Scope

记录当次实际所选主题的完整有效配置指纹，在同一 CLI Seam 验证主题变化会阻止预览、上传、创建和更新草稿。保留输入归属、笔记内容、完成状态等现有防护。显式 `--theme` 的构建复核不得误用全局默认；按有效配置而不是 mtime 判断。

只修改新鲜度实现及其测试，不承担用户文档、示例主题或不相关的 CLI 重构。

## Acceptance

- [x] 按 TDD 逐个纵向切片覆盖正文主题变化、图表配色变化以及所选主题删除或无法解析。
- [x] `preview`、`upload`、创建和更新草稿均在任何远端副作用或启动新预览前拒绝过期构建，诊断要求重新 `build`，不自动重建。
- [x] 默认构建选择与显式输出目录均受检查；缺少新指纹的旧格式构建明确要求重建。
- [x] 本地模拟服务证明拒绝时无图片上传、封面上传和草稿请求；正常重建后完整流程恢复。
- [x] 仅 mtime 变化、有效配置未变、无关主题变化不误判；显式主题与全局默认不同的情形正确。
- [x] 原有输入归属、失败构建、上传前置条件等回归保持通过。
- [x] 新测试从 `npm test` 可达，完整 `npm test` 通过；所有 shell 命令带显式超时，stdout/stderr 记录在 `/tmp`。

## Handoff

开始前确认 worktree 包含集成分支当前 tip，且 01 已 resolved；先将本票状态改为 `claimed`。提交实现与测试后，合入集成分支最新 tip，再验证。报告提交 SHA、red/green 与完整测试日志、覆盖的消费命令和无副作用证据。如受阻，报告准确原因并停止。由合并子代理在成功集成后将本票置为 `resolved` 并追加结果。

## Comments

- Fresh implementation started from integration SHA `62e81af8c10002f69b8ee8b49054fb571229fcba`; ticket 01 is resolved. Test seam remains the real wxpush CLI as approved in the [spec](../spec.md#testing-decisions).
- Implementation: `scripts/artifacts.mts` records and centrally checks the actual selected theme's effective configuration; `scripts/wxpush.mts` reuses the existing theme loader/validator. New `engine/tests/test_theme_freshness.py` covers all four consumers, default/explicit output, body/base/inline/render options/palette, deleted/invalid themes, legacy metadata, no-op changes, side-effect guards and rebuild recovery (paths relative to `skills/publish-to-wxmp/`).
- Red/green evidence: `/tmp/wxmp-02-body-red.log` → `/tmp/wxmp-02-body-green-full.log`; `/tmp/wxmp-02-invalid-red.log` → `/tmp/wxmp-02-invalid-green-full.log`. Expanded matrix: `/tmp/wxmp-02-matrix-full.log`; preview recovery and final matrix: `/tmp/wxmp-02-preview-full.log` (48 Python engine tests, including 9 freshness tests; layout 7, Node engine 3, server 9 and installed Chrome browser 20 all pass).
- No renderer or bundle source changed: release bundles and the independent ticket 01 diagram baseline remain unchanged, and the complete test suite still checks that baseline. Hashes/diff evidence: `/tmp/wxmp-02-review.log`. Status intentionally remained `claimed` until merger review/resolution.
- Integration: merged implementation `f48885d756d565d4d0ee8821253f07b03eb6c594` into `feat/wxmp-pele-theme` with `git merge --no-ff`; merge commit `a72334a1f2312951de986bd755e42cff03af43c8` preserves the ticket commit. No conflicts, implementation edits or release rebuild were needed. Full post-merge `npm test` passed; ticket resolved by merger. Independent feature reviewer gate remains separate. Scope inspection noted one non-blocking pre-existing implementation whitespace warning (`test_theme_freshness.py:213`, blank line at EOF), preserved without widening merger scope.

## Answer

- Delivered the selected effective theme freshness contract through the existing CLI and common build-consumption guard; see [spec](../spec.md#构建新鲜度) and the Scope above rather than duplicating the contract. All seven acceptance boxes remain supported by the inspected implementation/TDD evidence and passing integration suite.
- Implementation commit: `f48885d756d565d4d0ee8821253f07b03eb6c594`; integration merge: `a72334a1f2312951de986bd755e42cff03af43c8`. Clean starting checkout and runtime: `/tmp/wxmp-02-fresh-merge-start.log`; actual committed diff and release hashes: `/tmp/wxmp-02-fresh-merge-inspect.log`; merge parents and clean post-merge status: `/tmp/wxmp-02-fresh-merge-operation.log`. Whitespace inspection warning: `/tmp/wxmp-02-fresh-merge-diff.log`.
- Post-merge validation: `timeout 600s npm test`, complete stdout/stderr in `/tmp/wxmp-02-fresh-merge-full-test.log`. Typecheck passed; layout 7/7, Node engine 3/3, Python engine 48/48 (including all nine freshness tests and the independent old-CLI diagram baseline), server 9/9 and installed Google Chrome browser tests 20/20. Python engine elapsed 402.958s; browser elapsed 20.5s. Preview/upload/draft rejection, no remote side effects, no-op configuration changes and rebuild recovery all passed.
- Standalone `.mts` scripts and tests were merged unchanged; no bundled renderer input changed. Release SHA-256 values remain `697e6658df90910e142b54369d1dc73f1bd199c7b31f04b2d49582e23ca6bec6` (`engine.mjs`) and `bcfe217c4ca28eaaf6340bfda8aa160b69b44a3814024432ea493b7702e82d13` (`diagrams.bundle.mjs`).
- Integration report: `02-merge.md`, alongside `02-implementation.md` under this run's `subagent-artifacts/outputs/8470bb6b-b11e-4339-a45f-55de66655d51/reports/` directory. Remote macOS/Node 22 CI and real WeChat/mobile visual confirmation were not run. No PR, push or changes to other worktrees.
