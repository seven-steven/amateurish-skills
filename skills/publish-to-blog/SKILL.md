---
name: publish-to-blog
description: "Publish a note as a blog post. Params: <note_path> [intro=\"...\"] [ai_assisted]"
disable-model-invocation: true
---

# Publish a note to the blog

Take a note, adapt it into a Hexo post, preview, and publish after user confirmation.

## Inputs

- `note_path` (required): note file path.
- `intro` (optional): author's note, placed as a blockquote at the top of the post body.
- `ai_assisted` (optional, default `false`): set to `true` when the input is `true` or this flow rewrites body prose, including note-reference adaptation. URL-only replacements leave it unchanged.

All other decisions are autonomous; only the publish gate asks the user.

## Steps

### 1. Load config and check state

Read `blog_repo_local_path` and `blog_site_url` from `~/.config/skills/publish-to-blog/config.json` (expand `~` to the current user's home). This is the only configuration source, independent of `XDG_CONFIG_HOME`; leave legacy configuration files untouched, without reading or migrating them.

If the file is missing, create its parent directories and copy `config.example.json` next to this SKILL.md to that path without overwriting an existing file. Show it to the user and have them fill in the two values before proceeding. If reading, JSON parsing, or creation fails, stop and report the path and cause; preserve any existing file.

Read the note in full. Check `git -C <blog_repo> status --porcelain`; if uncommitted work exists, report and ask before proceeding.

Done when: config resolved, note read, blog repo state known.

### 2. Adapt the note — metadata and note references

Write the post to `source/_posts/<category>/<subcategory>/<slug>.md` in the blog repo. Transformations allowed, exhaustive:

- **Front-matter**: `title` (may be rephrased for a blog audience, zh-CN), `date` (today, `YYYY-MM-DD HH:MM:SS`), `categories`, `tags`, `toc: true`, plus `ai_assisted: true` per the input rule above.
- **Heading shift**: the note's H1 becomes the front-matter title; remaining headings promote one level (H2→H1). Strip manual numbering from headings (e.g. `一、`, `1.`) — the blog theme numbers them automatically.
- **Note references**: Adapt every reference to a note in the post copy, including external note URLs, wiki links, relative note paths, and wording such as “see this note”. Replace it with a confirmed published blog URL for the referenced content, or rewrite the surrounding passage in context so it stands alone without the note reference. When no such URL is known, rewrite.
- **Intro**: if given, insert as a blockquote right after the excerpt marker.
- **Excerpt marker**: one literal `<!-- more -->` line after the first or second section — at least one full section shown, at most two. The intro does not count as a section.

Everything else is copied verbatim.

Choose autonomously from the note's content: category, subcategory (create when none fits), slug (English kebab-case; the slug is the URL path), tags. Categories and tags use Chinese except for established technical terms (e.g. GTD, Hexo, PARA).

Done when: post file written and every note reference adapted.

### 3. Preview and confirm

```
cd <blog_repo> && npx hexo s --port 4099   # background
```

Open `http://localhost:4099/posts/<slug>.html` in the browser (`open` on macOS, `xdg-open` on Linux) and show the metadata summary (path, title, categories, tags, slug). Apply requested edits, re-preview when structural. After explicit confirmation, kill the server.

Done when: the user confirmed publish and the server is stopped.

### 4. Publish and backlink

1. Blog repo: `git add <post file>`, commit as `post: <title>`, `git push`. GitHub Actions deploys on push — leave it alone.
2. Source note: add (or merge into) YAML front-matter `blog: <blog_site_url>/posts/<slug>.html`. Body untouched. Leave the note uncommitted for the user.

Done when: push succeeded, backlink written. Report the post URL, commit hash, and backlink location.
