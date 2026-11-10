---
name: publish-to-wxmp
description: "Publish a note to the Wechat Official Account (公众号) draft box. Params: <note_path>"
disable-model-invocation: true
---

# Publish a note to Wechat

Take a note, adapt it into a Wechat article, render Wechat-native HTML, push it to the 公众号 draft box, and stop — the human publishes from the Wechat admin (API-published articles get no distribution).

The tool layer is [`WXPUSH.md`](WXPUSH.md) — read it first; its command contract is the source of truth. Never call the Wechat API directly; the `access_token` lives only on the server.

The original note, including its body and front-matter, is read-only throughout this workflow. Make all adaptations in the publishing copy and return push facts to the caller. Note-side rules own whether and how to update the original note and persist returned temporary assets; leave those actions to them. CLI artifacts, caches and the draft registry keep their existing behavior.

## Steps

### 1. Preflight

Run `doctor`. If it fails, fix the environment (env vars, `~/.config/skills/publish-to-wxmp/config.json`, server reachability) before anything else.

Done when: `doctor` passes.

### 2. Adapt the note — content for Wechat reading

Create a unique task workspace at `<system TMP>/.skills/publish-to-wxmp/<task-id>/`, resolving system TMP with Node's `os.tmpdir()`. Store the adapted Markdown publishing copy, generated covers, and other preparation intermediates in this workspace. CLI configuration and runtime state keep their existing locations per WXPUSH.

Resolve local image and cover references against the original note's directory; use absolute paths in the publishing copy or copy the assets into the workspace and adjust their references. Keep the original assets in place.

Decisions autonomous; body copy stays zh-CN and near-verbatim. Adjustments allowed, exhaustive:

- `title` ≤ 64 chars from front-matter or the H1 (rephrase for a Wechat audience if too plain).
- `digest` ≤ 120 chars: one sentence the reader gains.
- **Note references**: Adapt every reference to a note in the article copy, including external note URLs, wiki links, relative note paths, and wording such as “see this note”. Replace it with a confirmed published Wechat article URL for the referenced content, or rewrite the surrounding passage in context so it stands alone without the note reference. When no such URL is known, rewrite.
- **Web references**: Preserve non-note web references and their surrounding prose. Keep Markdown links; for bare non-Wechat URLs or links whose label is the URL, use a short contextual label instead (`[label](URL)`). `build` converts these links to numbered endnotes and deduplicates by URL; `mp.weixin.qq.com` article links remain clickable.
- **Diagrams**: Render only the note's existing fenced `mermaid` blocks following [`DIAGRAMS.md`](DIAGRAMS.md).
- **Code**: Preserve actual source code, commands, configuration, and verbatim logs/output.
- Front-matter and scaffolding are omitted from the rendered article (the tool handles front-matter reads).

Done when: the adapted Markdown publishing copy exists in the task workspace, its local image and cover references resolve, every note reference is adapted, and non-Wechat web references in prose have link labels distinct from their URLs. Reuse this workspace and copy for all subsequent CLI commands and revisions within the task.

### 3. Build, upload, preview

`build` → `upload` → `preview` (upload 后 preview 即真实 CDN 图片预览;`--watch` 支持迭代)。Cover per WXPUSH conventions; ask the user only when no cover candidate exists. For diagrams, verify that the uploaded images load and remain legible at phone width, with complete labels and unclipped connectors. Open the preview for the user; apply requested edits, rebuild, re-preview when structural.

Done when: the user confirms the rendered article.

### 4. Push to draft box

`push` with title/digest/author/source-url. Wechat rejects the whole draft on oversize title/digest or a broken cover — the tool validates first. Fix confirmed validation or rejection failures before retrying. If the remote outcome is uncertain, stop and return the receipt in step 5 instead of automatically pushing again.

If the user is unhappy with an already-pushed draft and wants the same draft updated in place (not a new one), run `push --update` after re-running `build` + `upload`; it reuses the recorded `media_id` (`~/.local/state/wxmp-publisher/drafts.json`, or `--media-id` explicitly). The registry is keyed by the publishing copy's absolute path: when updating from a new task workspace, pass the existing draft's `--media-id` explicitly. By default `push` always creates a new draft — only update when the user asks for it.

Done when: `push` prints a `media_id`.

### 5. Close

Return one concise zh-CN text receipt, including when an earlier step ends the workflow in failure. Use the resolved values actually used; mark unavailable required values as unknown rather than guessing. Keep the response to these facts and relevant warnings, without a process narrative or note-edit suggestions/patches. JSON is not required.

| Field | Content |
| --- | --- |
| 推送结果 | 成功: 已创建或已更新草稿,尚未发布,需在公众号后台或手机端手动发布。失败: state the failed stage and brief cause; if push never ran, say 未推送。结果未确认: the remote outcome cannot be established. |
| 标题 | The title actually submitted; if push never ran, label it as the prepared title. |
| 摘要 | Include only when actually set; distinguish a prepared value from one submitted. |
| 推文 URL | Return a verified article URL only when available. For a successful draft-only push, say 暂无(尚未发布); otherwise say 未取得. Local previews, image CDN URLs and the input `source_url` are not the pushed article's URL. The current push endpoints return no article URL; no extra URL lookup is required. |
| 草稿 ID | Return the `media_id` whenever confirmed, including a known remote success followed by a local error. |
| 封面 | The absolute local path actually selected, its source when known (generated, reused or first-body-image fallback), and whether the path is temporary. If selection was not reached, say 未确定. |
| 警告 | Include only facts affecting follow-up, such as fallback cover use, local registry failure, or the need to check the draft box before retrying. Omit this field when none apply. |

A CLI error alone does not prove that the remote draft failed. Preserve any confirmed remote success and ID, with local failures reported as warnings. If a timeout or missing response leaves the remote result unknown, report 结果未确认 and tell the caller to check the draft box before retrying.

Done when: the receipt reports the confirmed outcome or uncertainty and available metadata, and the original note remains unchanged.
