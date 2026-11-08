# Domain docs

This repo is **single-context**: one `GLOSSARY.md` and one `docs/adr/` at the repo root.

## Consumer rules

- When a session touches domain language, read `GLOSSARY.md` first and use its canonical terms.
- When a decision in an ADR might affect the work, read that ADR before proceeding.
- Create `GLOSSARY.md` lazily (when the first term is resolved); likewise `docs/adr/NNNN-*.md` when the first ADR is warranted.
