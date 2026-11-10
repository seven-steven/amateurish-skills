# 排版回归测试

这些测试防止排版链路曾发生的回归:字体名中的引号截断 HTML 样式属性、标题内外层被压平、CLI 丢弃后处理结果,以及 CSS 自定义属性导致微信草稿丢失样式。所有期望值来自主题 CSS、排版契约与真实草稿读回后最小化的故障样例,不是从运行时代码动态生成快照。

## 运行

要求 Node ≥22.20、Python 3 和开发主机已安装的 Google Chrome 稳定版。Playwright 仅为开发依赖,发布工具的运行时仍无需 `npm install`。

```bash
npm ci
npm test
```

Playwright 默认通过 `channel: "chrome"` 定位所在主机标准安装位置的 Google Chrome;不同 macOS/Linux 开发主机使用各自的安装,无需在仓库中写死浏览器路径或下载 Playwright Chromium。

也可分别运行:

```bash
npm run test:engine    # Node 单测 + 实际 CLI 输出的 HTML 解析测试,无需浏览器
npm run test:browser   # Playwright 计算样式和布局测试
```

Chrome 安装在非标准位置时,先在执行测试的主机上定位它,再用 `BROWSER_EXECUTABLE_PATH` 覆盖默认查找(替换为该主机的实际绝对路径):

```bash
BROWSER_EXECUTABLE_PATH="/absolute/path/to/google-chrome" npm test
```

若找不到 Chrome,先核对安装位置和路径覆盖;确认缺失后报告环境阻塞,等待用户提供可用的 Chrome。不要自动安装浏览器或回退到 Playwright Chromium。

## 覆盖边界

| 文件 | 检查内容 |
| --- | --- |
| `bundle.test.mjs` | 样式属性转义、主题真源与 bundle 一致、注册不污染 default、构建补丁遇到上游漂移时拒绝继续 |
| `test_rendering.py` | 真实 `wxpush build` 输出经 HTMLParser 解析后仍有完整样式;四个内置主题无 CSS 自定义属性或未解析的变量引用;自定义主题变量、局部覆盖、继承与嵌套回退;正文代码中的 `var(...)` 不被替换;双层标题;正文和引用间距;容器与参考链接;内联代码布局;YAML 主题继承和含引号/`&`/`<`/`>` 的字体名往返 |
| `test_upload.py` | 真实 `build → upload` 经本地 HTTP 图片服务后,含 `&` 的图片地址仍能正确重写为 CDN 地址,且主题样式不丢失 |
| `test_artifacts.py` | 构建归属与内容指纹、显式输出目录、重复上传、原样代码保留、模拟草稿消费同一 HTML,错误输入在网络请求前被拒绝 |
| `test_diagrams.py` | 真实 PNG 解码与像素、中文标签/连线、代表性多类型/多图、稳定重建、图表链接转脚注、错误/资源/公式/字形限制、安装目录无 npm 包的离线成图及资产损坏诊断 |
| `browser/diagrams.spec.mjs` | 375px/768px 下加载实际 PNG,检查解码、非空像素、页面宽度,保存中文多图预览截图供视觉核对 |
| `browser/rendering.spec.mjs` | Google Chrome 实际计算样式:黑底白字圆角标题及其加粗文字、通栏背景、灰底引用、正文间距、深灰代码文字/浅灰行号与内部横向滚动;375px/768px 两种宽度;全部四个内置主题 |

HTML 解析测试和浏览器测试共享 `fixtures/geek-black.md`。浏览器只载入真实 CLI 保存的 HTML,不附加站点 CSS,并禁用网络请求;构建产物必须不依赖 `<style>` 或外链样式表。临时笔记、自定义主题、配置、运行时状态与输出目录均隔离,不会改动用户最近构建或草稿记录。

浏览器测试主要断言计算样式及几何约束,不使用易受系统字体影响的像素快照。失败时保留截图和 trace 于 `test-results/`。GitHub Actions 在 macOS/Linux、Node 22 上使用 runner 预装的 Google Chrome 执行同一 `npm test` 全套测试;本地通过不代表远端矩阵已经执行通过。

## 主题选择与参考图验收

测试通过不等于实际发布时选中了参考主题。圆角黑色标题条、浅灰引用、无交通灯的带行号代码块属于 `geek-black`,不是 `default`。对齐这份参考时显式使用 `build <note.md> --theme geek-black`,并核对该 run 的 `meta.json` 中 `theme` 值;省略参数时用机器本地配置的选择,再回退到 `default`。不要为了让两个主题相似而修改内置 `default`。

比较截图时也要统一内容宽度。已有 preview 进程绑定启动时的 run,重建到新的 run 后需重启预览,并确认 HTTP 返回的正文与本次 `article.html` 一致,不能把旧页面当成最新产物。

代码颜色另有一处脱离站点样式后的缺项:geek-black 的代码正文继承了黑色,行号也未声明独立颜色。纯文本代码即可复现,与语法高亮器无关。主题显式设置深灰代码文字,构建补丁为行号内联浅灰色,浏览器测试在两种宽度下验证。

## 微信草稿丢失样式的回归

实际草稿通过 `draft/get` 读回后,标题的 `style` 只剩分号。逐项删除输入后,最小复现为:

```html
<h2 style="--md-primary-color: #000000; font-size: 1.2em">排版诊断</h2>
```

微信保存时丢弃了自定义属性之后的字号;仅去掉 `--md-primary-color` 声明即可保留字号。普通浏览器能正常显示原 HTML,所以只测浏览器计算样式抓不到这个问题。把自定义属性移到末尾能保留前面的样式,但仍会让 `var(...)` 丢失定义,不是完整修复。

`wechat-styles.mjs` 在保存产物前解析 HTML/CSS,按元素作用域把变量引用替换为具体值,再移除自定义属性。回归从真实 CLI 输出检查这两个条件,包括代码行号等引擎直接生成的样式,而不伪造一个微信净化器。兼容层只替换 `style` 属性的原文区间,不重新序列化其他 HTML,避免破坏后续图片 URL 的字面重写。修复时另用原文章完成真实 `build → upload → push → draft/get` 联调,核对标题/正文/列表样式并删除临时草稿。

自动测试不调用微信 API,因此不能代替微信后台对最终草稿的人工确认,也不声称能模拟微信所有 HTML 过滤规则。
