# Engine attribution

`engine/engine.mjs` 是 [doocs/md](https://github.com/doocs/md)(Apache-2.0)`packages/core`(`@md/core`)及其 `packages/shared` 主题表的 esbuild 单文件打包产物,由 `engine/build.mjs` 生成。

捆绑的间接依赖(各自许可证见上游):marked、highlight.js、es-toolkit、fflate、front-matter、reading-time、csstype。

改动:shim 了 `isomorphic-dompurify`(原依赖 jsdom,无法打包)——本工具的输入是用户自己书写的 markdown,属可信源,pass-through 净化可接受;若日后接受不可信输入,必须恢复真实 sanitizer。`mermaid` 保持 external(浏览器端动态加载,CLI 场景不用)。

升级引擎:改 `build.mjs` 默认 ref(或传参),重跑 `node engine/build.mjs`,重新提交产物。
