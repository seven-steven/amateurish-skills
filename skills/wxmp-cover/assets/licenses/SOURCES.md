# Distributed assets and corresponding source

These are unmodified upstream files (some filenames shortened), shipped inside this skill so `npx skills add … --skill wxmp-cover` can install it independently. No runtime downloads or system font discovery. The project-owned `vendor/rasterize.mjs` beside these assets is copied from `tools/wxmp-graphics/rasterize.mjs`; that directory's lockfile selects the npm releases for both WeChat skills.

| Distributed asset | Upstream file / release | SHA-256 |
| --- | --- | --- |
| `assets/SourceHanSerifCN-Heavy.otf` | [Adobe Source Han Serif 2.003R, regional CN Heavy](https://github.com/adobe-fonts/source-han-serif/blob/2.003R/SubsetOTF/CN/SourceHanSerifCN-Heavy.otf) | `053e911fdb1a55d4d8512a1f11203f1fb9a7291e34bc260474b8c80358c69fa6` |
| `assets/SourceHanSansCN-Bold.otf` | [Adobe Source Han Sans 2.005R, regional CN Bold](https://github.com/adobe-fonts/source-han-sans/blob/2.005R/SubsetOTF/CN/SourceHanSansCN-Bold.otf); distributed file from Arch `adobe-source-han-sans-cn-fonts` 2.005-2 | `62383707c086a32f3afd5e293f34c7eff64c7fea31f579fdc6cbe34d920519a6` |
| `vendor/opentype.cjs` | `dist/opentype.min.js` in [opentype.js 1.3.4 archive](https://registry.npmjs.org/opentype.js/-/opentype.js-1.3.4.tgz) | `c0f9c7ca85e18075a8819e5fe2dee6e1d535f9a2269f5314f36cce94a183adba` |
| `vendor/resvg.mjs` | `index.mjs` in [@resvg/resvg-wasm 2.6.2 archive](https://registry.npmjs.org/@resvg/resvg-wasm/-/resvg-wasm-2.6.2.tgz) | `10170d02d816f02ec76f9bc095b01d9becf536e7b1e12e5aa616652c84b237a1` |
| `vendor/resvg.wasm` | `index_bg.wasm` in the same archive | `22bf6e9f9a100d972da0411a69c5ba504367fc1fa87b3b64e3f35e53926d2d70` |

- The fonts are licensed under SIL OFL 1.1 with their original copyright notices and reserved names. See `SourceHanSerif-OFL.txt` and `SourceHanSans-OFL.txt`. These licenses do not apply to covers made with the fonts.
- OpenType.js is MIT-licensed; the distributed bundle also incorporates tiny-inflate and the `string.prototype.codepointat` polyfill. See `opentype-MIT.txt`, `tiny-inflate-MIT.txt` and `codepointat-MIT.txt`.
- The resvg WASM and binding are MPL-2.0. Source for the binding is in the linked npm archive; corresponding Rust/binding source is available from [resvg-js commit 9ca0584](https://github.com/yisibl/resvg-js/tree/9ca058462ac529120c8cc84ddcd6fef644cc5406) (v2.6.2). `resvg-Cargo.toml` records the source dependencies, including the [resvg fork at 3495d870](https://github.com/zimond/resvg/tree/3495d870). See `resvg-MPL-2.0.txt` for terms and source availability rights. No modifications to the covered files.
