# Diagram distribution: notices and corresponding source

The shipped font and WASM are unmodified upstream files, verified against the adjacent asset manifest. Dependency versions and archive integrity are fixed by the diagram build lockfile. `npm-NOTICES.txt` preserves the npm dependencies' available license and copyright texts, including Pele's MIT and additional Lucide ISC notices. Build-only dependencies' notices are included as well.

## resvg-wasm 2.6.2 — MPL-2.0

The WASM binary and its JS glue originate from the unmodified [published npm archive](https://registry.npmjs.org/@resvg/resvg-wasm/-/resvg-wasm-2.6.2.tgz). JS glue is incorporated into the generated diagram bundle; bundling changes packaging, not the upstream glue source. The original glue source remains available in that archive. Local integration and build source are distributed alongside the bundle in this skill.

Corresponding upstream Rust/binding source is available at [resvg-js v2.6.2, commit 9ca058462ac529120c8cc84ddcd6fef644cc5406](https://github.com/yisibl/resvg-js/tree/9ca058462ac529120c8cc84ddcd6fef644cc5406), downloadable as a [source archive](https://github.com/yisibl/resvg-js/archive/9ca058462ac529120c8cc84ddcd6fef644cc5406.tar.gz). Recipients may obtain, use and modify MPL-covered source under the full terms in `resvg-MPL-2.0.txt`.

`resvg-Cargo.toml` preserves the release's Rust dependency and source declarations. Its resvg fork is pinned to [3495d870](https://github.com/zimond/resvg/tree/3495d870); other dependencies and their license notices are available from the referenced upstream repositories and [crates.io](https://crates.io/). The release does not publish a Cargo lockfile, so this project verifies/distributes the published WASM rather than claiming to reproduce its compiler output byte-for-byte. No locally modified Rust or WASM is shipped.

## Noto Sans CJK SC Regular — SIL OFL 1.1

Copyright notice embedded in the unmodified font: © 2014–2021 Adobe (http://www.adobe.com/).

Full terms are in `Noto-OFL.txt`. The font is bundled with software, not sold separately, renamed, subsetted or converted. Its source and release files are available at [Noto CJK commit f8d157532fbfaeda587e826d4cd5b21a49186f7c](https://github.com/notofonts/noto-cjk/tree/f8d157532fbfaeda587e826d4cd5b21a49186f7c). The manifest identifies the exact distributed file and checksum. Font licensing does not impose OFL on the resulting diagrams or articles.
