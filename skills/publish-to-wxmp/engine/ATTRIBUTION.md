# Engine attribution

`engine/engine.mjs` 是 [doocs/md](https://github.com/doocs/md)(Apache-2.0)`packages/core`(`@md/core`)及其 `packages/shared` 主题表的 esbuild 单文件打包产物,由 `engine/build.mjs` 生成。

捆绑的间接依赖(各自许可证见上游):marked、highlight.js、es-toolkit、fflate、front-matter、reading-time、csstype。

微信输出兼容层另捆绑 [parse5](https://github.com/inikulin/parse5)、[PostCSS](https://github.com/postcss/postcss)、[postcss-value-parser](https://github.com/TrySound/postcss-value-parser)(均为 MIT)及其间接依赖,各自许可证见上游。这些包只在构建时安装,发布的 CLI 不需要 npm 依赖。

改动:shim 了 `isomorphic-dompurify`(原依赖 jsdom,无法打包)——本工具的输入是用户自己书写的 markdown,属可信源,pass-through 净化可接受;若日后接受不可信输入,必须恢复真实 sanitizer。原引擎的浏览器 `mermaid` 仍为 external;CLI 在进入排版引擎前由独立图表 bundle 将真实 Mermaid 图块转换为 PNG,因此不触发浏览器 Mermaid 分支。

本地扩展:`geek-black.theme.mjs` 注册内置主题;`local-patches.mjs` 在构建时校验并修补样式属性转义、可选的标题 `.content` 包装与微信所需的内联代码/标题样式。补丁不匹配时构建失败,不会覆盖已有 bundle。`wechat-styles.mjs` 在输出边界解析 HTML/CSS,展开内联 CSS 变量并移除自定义属性,避免微信草稿过滤其后的样式;不修改正文或代码中的变量文本。

升级引擎或修改主题/补丁:改 `build.mjs` 默认 ref(或传参),重跑 `node engine/build.mjs`,执行 `npm test`,重新提交产物。不要只手改 bundle。

## Offline diagram distribution

`diagrams.mjs` 是本地集成真源;`node skills/publish-to-wxmp/engine/build-diagrams.mjs` 用独立 lockfile 构建 `diagrams.bundle.mjs`,并校验随包 WASM 和完整 Noto 简体中文字体。仅构建时需要联网/npm;运行时不读取 node_modules、系统字体或在线渲染服务。JS、WASM、字体及许可共同构成可安装目录,不再声称图表引擎只有一个 JS 文件。

图表 bundle 包含 Pele 1.13.0(MIT,附 Lucide ISC notice)、resvg-wasm 2.6.2(MPL-2.0)的 JS glue、opentype.js(MIT)、Markdown 解析器及 HTML/CSS 解析工具。Pele 负责布局和 SVG;opentype 使用同一份随包字体度量并检查字形;resvg 的本地 WASM 负责 PNG。原始 Mermaid、具体化样式的 SVG 和 PNG 均保存在用户 run dir。

分发资产清单记录字节数、SHA-256 和固定来源;字体与 WASM 合计 18,915,970 字节,另有约 2 MB 的预构建 JS。完整许可、归属及 MPL 对应源码获取说明见 [diagram-assets/licenses/SOURCES.md](diagram-assets/licenses/SOURCES.md)。升级时更新 lockfile、资产清单与许可,重建后执行 `npm test`。
