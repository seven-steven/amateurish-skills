# AGENTS.md

## Rules

- Follow TDD method
- Run `npm test` after any code change; it is the same suite CI runs. Every test suite in the repo must be reachable from `npm test`
- Playwright tests use the development host's installed Google Chrome. For browser setup, nonstandard paths, or a missing browser, follow [the test instructions](skills/publish-to-wxmp/engine/tests/README.md#运行).

## Skill configuration

When adding or changing a skill's user settings, follow the [configuration convention](README.md#配置约定).

## Publishing skills (`publish-to-*`)

Before adding or updating any `publish-to-*` skill, extract rules applicable to every `publish-to-*` skill into [the shared publish-to rules](docs/publish-to-rules.md) first, reference them from each `publish-to-*` skill's `SKILL.md`, and sync `docs/publish-to-rules.md` to every `skills/publish-to-*/PUBLISH-RULES.md` so standalone installs stay self-contained. Every `publish-to-*` skill sets `disable-model-invocation: true` in its `SKILL.md` frontmatter.

