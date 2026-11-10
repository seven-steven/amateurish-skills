# Mermaid rendering

`build` automatically renders existing fenced `mermaid` blocks in the publishing copy with [Pele](https://pele.run/) and converts its SVG to PNG locally. Keep the source note body unchanged. Pele accepts Mermaid syntax; it is not a separate diagram language. All built-in types supported by the bundled version use this path; external Mermaid plugins are outside the supported scope.

- Supported resources are self-contained text and shapes. External images, custom icons and formula typesetting cause an error rather than disappearing silently.
- Adapt note links before rendering. Diagram web links become labelled references below the image and follow the article's normal endnote rules; Wechat article links remain clickable there.
- CLI rendering is deterministic; it does not call a model or reinterpret arbitrary text.

## Build and inspect

Run the normal `build` → `upload` → `preview` flow on the adapted Markdown. No separate renderer, PNG replacement step, system font or browser is needed for building. Keep existing image paths resolvable from the publishing copy when relocating it.

The run directory contains editable `.mmd`, concrete `.svg`, and `.png` assets plus the rendered article. Upload discovers generated images from that build, puts them on Wechat CDN and rewrites the same HTML used by preview and push. Keep the publishing copy's Mermaid blocks for user-requested revisions; edit those, then rebuild and upload again.

The packaged Chinese font is also used for layout measurement. Images have a light background and high-contrast defaults; dimensions, resource policy, glyph coverage and detectable clipping are validated before the build becomes publishable. The source file's modification time is recorded as the reference time for time-dependent diagrams.

Errors identify the diagram and body line. On a rendering failure, preserve the Mermaid source, report the error and pause publishing for the user to resolve rather than automatically repairing or rewriting the diagram. An incomplete build cannot upload or push. `doctor` checks the diagram bundle and the WASM/font assets. Reinstall the skill if assets are missing or corrupt.

Open the uploaded preview at phone width. Compare each diagram with its source: every meaningful label and connector must remain complete, Chinese glyphs must be readable, and images must load from CDN. Automated checks catch detectable failures, not every semantic or visual problem. If a faithful diagram cannot be produced, report the blocker and pause publishing.

Done when: all generated images have been inspected at phone width, match their source meaning, load in the uploaded preview, and the user confirms the rendered article.
