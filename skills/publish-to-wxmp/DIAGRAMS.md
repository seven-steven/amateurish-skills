# Diagram adaptation

For ASCII/Unicode diagrams, prose-only code blocks, or existing diagram-source blocks, produce diagrams in the publishing copy. Keep the source note body unchanged.

## 1. Rewrite as Mermaid

Choose a diagram that expresses the original structure: flowchart for a process, sequence diagram for interactions, mind map for a hierarchy, or labelled groups for comparisons and independent statements. Preserve every meaningful label, relationship, arrow direction, condition, ordering, value, and unit; connect items only where the source establishes a relationship.

Use a fenced `mermaid` block. `build` automatically renders it with [Pele](https://pele.run/) and converts its SVG to PNG locally. Pele accepts Mermaid syntax; it is not a separate diagram language. All built-in types supported by the bundled version use this path; external Mermaid plugins are outside the supported scope.

- Use self-contained text and shapes. Rewrite external images, custom icons and formula typesetting into faithful text/shape descriptions before building; unsupported resources cause an error rather than disappearing silently.
- Adapt note links before rendering. Diagram web links become labelled references below the image and follow the article's normal endnote rules; Wechat article links remain clickable there.
- Prefer short labels and vertical layouts. Split a dense diagram into several blocks rather than shrinking its labels beyond phone legibility. Preserve the original relationships when splitting.
- Keep actual source code, commands, configuration and verbatim logs/output as code. Classify by meaning, not by a `text` tag or missing language tag. CLI rendering is deterministic; it does not call a model or reinterpret arbitrary text.

Done when: every converted block has Mermaid expressing all of its meaningful content, and every retained code block is genuinely verbatim material.

## 2. Build and inspect

Run the normal `build` → `upload` → `preview` flow on the adapted Markdown. No separate renderer, PNG replacement step, system font or browser is needed for building. Keep existing image paths resolvable from the publishing copy when relocating it.

The run directory contains editable `.mmd`, concrete `.svg`, and `.png` assets plus the rendered article. Upload discovers generated images from that build, puts them on Wechat CDN and rewrites the same HTML used by preview and push. Keep the publishing copy's Mermaid blocks for revisions; edit those, then rebuild and upload again.

The packaged Chinese font is also used for layout measurement. Images have a light background and high-contrast defaults; dimensions, resource policy, glyph coverage and detectable clipping are validated before the build becomes publishable. The source file's modification time is recorded as the reference time for time-dependent diagrams.

Errors identify the diagram and body line. Fix the source and retry; an incomplete build cannot upload or push. `doctor` checks the diagram bundle and the WASM/font assets. Reinstall the skill if assets are missing or corrupt.

Open the uploaded preview at phone width. Compare each diagram with its source: every meaningful label and connector must remain complete, Chinese glyphs must be readable, and images must load from CDN. Automated checks catch detectable failures, not every semantic or visual problem. If a faithful diagram cannot be produced, report the blocker and pause publishing.

Done when: all generated images have been inspected at phone width, match their source meaning, load in the uploaded preview, and the user confirms the rendered article.
