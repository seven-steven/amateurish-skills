# Mermaid rendering

`build` automatically renders existing fenced `mermaid` blocks in the publishing copy with [Pele](https://pele.run/) and converts its SVG to PNG locally. Keep the source note body unchanged. Pele accepts Mermaid syntax; it is not a separate diagram language. All built-in types supported by the bundled version use this path; external Mermaid plugins are outside the supported scope.

- Supported resources are self-contained text and shapes. External images, custom icons and formula typesetting cause an error rather than disappearing silently.
- Adapt note links before rendering. Diagram web links become labelled references below the image and follow the article's normal endnote rules; Wechat article links remain clickable there.
- CLI rendering is deterministic; it does not call a model or reinterpret arbitrary text.

## Build and inspect

Run the normal `build` → `upload` → `preview` flow on the adapted Markdown. No separate renderer, PNG replacement step, system font or browser is needed for building. Keep existing image paths resolvable from the publishing copy when relocating it.

The run directory contains editable `.mmd`, concrete `.svg`, and `.png` assets plus the rendered article. Upload discovers generated images from that build, puts them on Wechat CDN and rewrites the same HTML used by preview and push. Keep the publishing copy's Mermaid blocks for user-requested revisions; edit those, then rebuild and upload again.

The packaged Chinese font is also used for layout measurement. Images retain their light background and high-contrast defaults unless the selected article theme explicitly supplies `pele` colors; see [Theme colors](#theme-colors). Dimensions, resource policy, glyph coverage and detectable clipping are validated before the build becomes publishable, including on dark canvases: a background alone cannot make an empty diagram valid. The source file's modification time is recorded as the reference time for time-dependent diagrams.

Errors identify the diagram and body line. On a rendering failure, preserve the Mermaid source, report the error and pause publishing for the user to resolve rather than automatically repairing or rewriting the diagram. An incomplete build cannot upload or push. `doctor` checks the diagram bundle and the WASM/font assets. Reinstall the skill if assets are missing or corrupt.

Changing the selected theme's effective article styles, render options or diagram colors makes the build stale. `preview`, `upload`, draft creation and draft update reject it before a new preview starts or any remote image/cover/draft request. Rebuild explicitly, upload and inspect again; there is no automatic rebuild. This applies to both latest and explicit output directories. A running preview watches build artifacts, not theme source files; restart it for a new run. The full effective-configuration and legacy-build rules are in [WXPUSH.md](WXPUSH.md#构建新鲜度).

Open the uploaded preview at phone width. Compare each diagram with its source: every meaningful label and connector must remain complete, Chinese glyphs must be readable, and images must load from CDN. Automated checks catch detectable failures, not every semantic or visual problem. If a faithful diagram cannot be produced, report the blocker and pause publishing.

Done when: all generated images have been inspected at phone width, match their source meaning, load in the uploaded preview, and the user confirms the rendered article.

## Theme colors

Use the normal article theme selection: explicit `build --theme` overrides global `theme`, then falls back to `default`. There is no separate diagram-theme option. The optional `pele` mapping, complete allowed-field table, quoted opaque `#RGB`/`#RRGGBB` format and strict validation rules live in [WXPUSH.md](WXPUSH.md#pele-配色契约). Invalid palettes fail even without diagrams and identify the theme file and field; preserve that diagnostic rather than silently dropping colors. [`themes/example-midnight.yaml`](themes/example-midnight.yaml) is an independent, usable example with coordinated article accents and a dark diagram canvas.

Colors apply per field: **explicit diagram colors > theme colors > Pele defaults**. Literal `style`/`classDef` colors and initialization/frontmatter `themeVariables` take precedence; unspecified series slots still inherit the theme or default, without renumbering. Variables are resolved to concrete SVG styles before saving; published articles embed only the PNG.

`background` colors both the diagram background and PNG raster canvas, including margins. Omitting it retains the white canvas. A background-only change still gets the correct new image and asset identity; equal inputs, effective theme and reference time remain deterministic. Themes without `pele` (or with `pele: {}`) retain the previous diagram filenames, SVG and PNG bytes. Existing built-in themes remain unchanged; article CSS colors do not implicitly recolor diagrams.

These are defaults for the bundled Pele variables, not a promise that each chart uses each field. Only colors are configurable: fonts, sizes, weights, corners, layout and resource limits remain fixed. Choose readable contrast yourself; no automatic contrast correction is performed. Offline rendering, packaged Chinese fonts and phone-width visual confirmation remain required.
