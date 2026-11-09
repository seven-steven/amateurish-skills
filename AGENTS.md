# AGENTS.md

## Rules

- Follow TDD method
- Run `npm test` after any code change; it is the same suite CI runs. Every test suite in the repo must be reachable from `npm test`

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage` etc.), recorded as `Status:` lines. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
