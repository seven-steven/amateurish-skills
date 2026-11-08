# 排版回归测试

这些测试防止 geek-black 曾发生的三个回归:字体名中的引号截断 HTML 样式属性、标题内外层被压平、CLI 丢弃后处理结果。所有期望值来自主题 CSS 和排版契约,不是从运行时代码动态生成快照。

## 运行

要求 Node ≥22.20、Python 3。Playwright 仅为开发依赖,发布工具的运行时仍无需 `npm install`。

```bash
npm ci
npx playwright install chromium
npm test
```

Linux CI 首次安装浏览器及系统依赖时使用 `npx playwright install --with-deps chromium`。

也可分别运行:

```bash
npm run test:engine    # Node 单测 + 实际 CLI 输出的 HTML 解析测试,无需浏览器
npm run test:browser   # Playwright 计算样式和布局测试
```

若本机已有 Chrome,可跳过 Chromium 下载:

```bash
BROWSER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test
```

## 覆盖边界

| 文件 | 检查内容 |
| --- | --- |
| `bundle.test.mjs` | 样式属性转义、主题真源与 bundle 一致、注册不污染 default、构建补丁遇到上游漂移时拒绝继续 |
| `test_rendering.py` | 真实 `wxpush build` 输出经 HTMLParser 解析后仍有完整样式;双层标题;正文和引用间距;容器与参考链接;内联代码布局;YAML 主题继承和含引号/`&`/`<`/`>` 的字体名往返 |
| `browser/rendering.spec.mjs` | Chromium 实际计算样式:黑底白字圆角标题及其加粗文字、通栏背景、灰底引用、正文间距、代码行号与内部横向滚动;375px/768px 两种宽度;全部四个内置主题 |

HTML 解析测试和浏览器测试共享 `fixtures/geek-black.md`。浏览器只载入真实 CLI 保存的 HTML,不附加站点 CSS,并禁用网络请求;构建产物必须不依赖 `<style>` 或外链样式表。临时笔记、自定义主题、输出目录均隔离,不会改动用户配置和草稿记录。

浏览器测试主要断言计算样式及几何约束,不使用易受系统字体影响的像素快照。失败时保留截图和 trace 于 `test-results/`。GitHub Actions 的 `rendering tests` 工作流在相关 push/PR 上运行 `npm test`,失败附件保留 7 天。

这些测试不调用微信 API,因此不能代替微信后台对最终草稿的人工确认,也不声称能模拟微信所有 HTML 过滤规则。
