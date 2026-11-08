# Engine attribution

`engine/engine.mjs` 是 [doocs/md](https://github.com/doocs/md)(Apache-2.0)`packages/core`(`@md/core`)及其 `packages/shared` 主题表的 esbuild 单文件打包产物,由 `engine/build.mjs` 生成。

捆绑的间接依赖(各自许可证见上游):marked、highlight.js、es-toolkit、fflate、front-matter、reading-time、csstype。

微信输出兼容层另捆绑 [parse5](https://github.com/inikulin/parse5)、[PostCSS](https://github.com/postcss/postcss)、[postcss-value-parser](https://github.com/TrySound/postcss-value-parser)(均为 MIT)及其间接依赖,各自许可证见上游。这些包只在构建时安装,发布的 CLI 不需要 npm 依赖。

改动:shim 了 `isomorphic-dompurify`(原依赖 jsdom,无法打包)——本工具的输入是用户自己书写的 markdown,属可信源,pass-through 净化可接受;若日后接受不可信输入,必须恢复真实 sanitizer。`mermaid` 保持 external(浏览器端动态加载,CLI 场景不用)。

本地扩展:`geek-black.theme.mjs` 注册内置主题;`local-patches.mjs` 在构建时校验并修补样式属性转义、可选的标题 `.content` 包装与微信所需的内联代码/标题样式。补丁不匹配时构建失败,不会覆盖已有 bundle。`wechat-styles.mjs` 在输出边界解析 HTML/CSS,展开内联 CSS 变量并移除自定义属性,避免微信草稿过滤其后的样式;不修改正文或代码中的变量文本。

升级引擎或修改主题/补丁:改 `build.mjs` 默认 ref(或传参),重跑 `node engine/build.mjs`,执行 `npm test` 和服务端全量测试(见 `server/deploy.md`),重新提交产物。不要只手改 bundle。
