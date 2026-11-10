---
name: publish-to-wxmp
description: "Publish a note to the Wechat Official Account (公众号) draft box. Params: <note_path>"
disable-model-invocation: true
---

# Publish a note to Wechat

Take a note, adapt it into a Wechat article, render Wechat-native HTML, push it to the 公众号 draft box, and stop — the human publishes from the Wechat admin (API-published articles get no distribution).

The tool layer is [`WXPUSH.md`](WXPUSH.md) — read it first; its command contract is the source of truth. Never call the Wechat API directly; the `access_token` lives only on the server.

## Steps

### 1. Preflight

Run `doctor`. If it fails, fix the environment (env vars, `~/.config/wxmp-publisher/config.json`, server reachability) before anything else.

Done when: `doctor` passes.

### 2. Adapt the note — content for Wechat reading

Decisions autonomous; body copy stays zh-CN and near-verbatim. Adjustments allowed, exhaustive:

- `title` ≤ 64 chars from front-matter or the H1 (rephrase for a Wechat audience if too plain).
- `digest` ≤ 120 chars: one sentence the reader gains.
- **Note references**: Adapt every reference to a note in the article copy, including external note URLs, wiki links, relative note paths, and wording such as “see this note”. Replace it with a confirmed published Wechat article URL for the referenced content, or rewrite the surrounding passage in context so it stands alone without the note reference. When no such URL is known, rewrite.
- **Web references**: Preserve non-note web references and their surrounding prose. Keep Markdown links; for bare non-Wechat URLs or links whose label is the URL, use a short contextual label instead (`[label](URL)`). `build` converts these links to numbered endnotes and deduplicates by URL; `mp.weixin.qq.com` article links remain clickable.
- **Diagrams**: Render only the note's existing fenced `mermaid` blocks following [`DIAGRAMS.md`](DIAGRAMS.md).
- **Code**: Preserve actual source code, commands, configuration, and verbatim logs/output.
- Front-matter and scaffolding are dropped (the tool handles front-matter reads).

Done when: an adapted Markdown publishing copy exists outside the installed skill directory, every note reference is adapted, and non-Wechat web references in prose have link labels distinct from their URLs. Keep this copy as the input to all subsequent CLI commands.

### 3. Build, upload, preview

`build` → `upload` → `preview` (upload 后 preview 即真实 CDN 图片预览;`--watch` 支持迭代)。Cover per WXPUSH conventions; ask the user only when no cover candidate exists. For diagrams, verify that the uploaded images load and remain legible at phone width, with complete labels and unclipped connectors. Open the preview for the user; apply requested edits, rebuild, re-preview when structural.

Done when: the user confirms the rendered article.

### 4. Push to draft box

`push` with title/digest/author/source-url. Wechat rejects the whole draft on oversize title/digest or a broken cover — the tool validates first; fix and re-push on failure.

If the user is unhappy with an already-pushed draft and wants the same draft updated in place (not a new one), run `push --update` after re-running `build` + `upload`; it reuses the recorded `media_id` (`~/.local/state/wxmp-publisher/drafts.json`, or `--media-id` explicitly). By default `push` always creates a new draft — only update when the user asks for it.

Done when: `push` prints a `media_id`.

### 5. Close

Tell the user: draft is in the 草稿箱, publish from the Wechat admin (手机或后台). Backlink the note front-matter: `wechat: {title: <title>, digest: <digest>, published: false}` (set `published: true` manually after 群发). Leave the note uncommitted.

Done when: backlink written and the user knows the next step is theirs.
