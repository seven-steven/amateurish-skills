# 微信公众号草稿箱：多图文草稿能否给头条和次条分别设置不同的封面图？

> 说明：本文件位于 `docs/research/` 目录。所有结论均基于微信官方文档（developers.weixin.qq.com）逐条核对参数表得出，未依赖 CSDN、博客园等二手转述。官方页面提供 `.md` 源（将 URL 后缀 `.html` 换成 `.md`），本文引用的参数表均与 `.md` 源核对过。截至本文抓取时，`draft/add` 页面显示"最后一次编辑于 2026-11-02"。

## 结论摘要

**支持。** `draft/add` 的 `articles` 是**对象数组**，数组中**每一篇文章对象各自携带一个 `thumb_media_id`（封面图片素材 id）和一个 `cover_info`（裁剪信息）**，官方参数表对数组内元素一视同仁，没有任何"次条封面必须与头条一致"的限制。头条（index 0）与次条（index 1+）的封面分别取各自文章的 `thumb_media_id`。每张封面图需先通过"上传永久素材"接口（`POST /cgi-bin/material/add_material`）获得**永久 media_id**；文档明确封面"必须是永久MediaID"，临时素材不可用。

来源：
- 新增草稿 draft_add（官方文档）：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_add.html （订阅号版本同内容：https://developers.weixin.qq.com/doc/subscription/api/draftbox/draftmanage/api_draft_add.html ）
- 获取草稿详情 getDraft：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_getdraft.html
- 更新草稿 draft_update：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_update.html
- 上传永久素材 add_material：https://developers.weixin.qq.com/doc/service/api/material/permanent/api_addmaterial.html
- 发布能力 freepublish/submit：https://developers.weixin.qq.com/doc/service/api/public/api_freepublish_submit.html

## 1) `articles` 是数组吗？每篇文章是否各自有 thumb_media_id？

是数组，且每篇各自有封面字段。

`draft/add` 请求体只有一个参数：

| 参数名 | 类型 | 必填 | 说明（官方原文） |
| --- | --- | --- | --- |
| `articles` | objarray | 是 | 图文素材集合 |

数组元素 `Body.articles(Array)` 的关键字段：

| 参数名 | 类型 | 必填 | 说明（官方原文） |
| --- | --- | --- | --- |
| `article_type` | string | 否 | 文章类型：图文消息（news）/ 图片消息（newspic），不填默认 news |
| `title` | string | 是 | 标题，总长度不超过 32 个字 |
| `thumb_media_id` | string | 否 | **article_type 为图文消息（news）时必填，图文消息的封面图片素材id（必须是永久MediaID）** |
| `cover_info` | object | 否 | 封面信息，图文消息（news）和图片消息（newspic）均适用 |
| `image_info` | object | 是（仅 newspic） | 图片消息的图片列表，最多 20 张，**首张图片即为封面图** |
| … | | | title/content/digest/评论开关等 |

也就是说：`thumb_media_id` 挂在**数组元素（单篇文章）级别**，不是挂在请求体（整个草稿）级别。既然封面字段定义在每篇文章对象上，数组里有几篇文章就有几个独立的封面槽位。（此句为对官方参数表结构的解读：官方未用一句话明说"每篇可不同"，但字段层级即证据。）

来源：[新增草稿 - 请求参数 / Body.articles(Array)](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_add.html)

旁证（同为官方文档）：旧版群发用的"上传图文消息素材"接口（`media/uploadnews`，`articles` 支持 1 到 8 条图文）中，`thumb_media_id` 同样是**每篇文章各自必填**的字段——微信图文的封面从来是按文章粒度设置的。来源：[上传图文消息素材](https://developers.weixin.qq.com/doc/service/api/notify/message/api_uploadnewsmsg.html)

## 2) 头条与次条的封面是否分别取各自的 thumb_media_id？有无"必须一致"的限制？

**分别取各自的，无一致性限制。** 依据：

1. `draft/add` 参数表中，`thumb_media_id` 的说明只含两个条件：`article_type` 为 news 时必填 + 必须是永久 MediaID。**全文没有任何按 index 区分的规则**，也没有"次条封面需与头条相同/可选继承头条"的表述。（官方未明说"分别生效"，此句为对官方参数表的解读：字段在每篇文章上独立存在且无交叉引用，即各自生效。）
2. `draft/update` 按 `index` 定位单篇文章更新，`articles`（单个对象）里同样带 `thumb_media_id`——可以只改第 2 篇的封面而不动第 1 篇。参数表：

   | 参数名 | 类型 | 必填 | 说明（官方原文） |
   | --- | --- | --- | --- |
   | `media_id` | string | 是 | 要修改的图文消息的 id |
   | `index` | number | 是 | 要更新的文章在图文消息中的位置（多图文消息时，此字段才有意义），第一篇为 0 |
   | `articles` | object | 是 | 图文信息（内含 `thumb_media_id`：图文消息的封面图片素材id（必须是永久MediaID）） |

3. `draft/get` 的返回体 `news_item` 是数组，**每个元素各自返回 `thumb_media_id` 与 `cover_info`**；`draft/batchget` 同样。读接口按文章粒度回显封面，与写接口对称，佐证封面是每篇文章的独立属性。

官方文档中唯一与"单/多图文"差异相关的字段是 `digest`："仅有单图文消息才有摘要，多图文此处为空"——可见官方在会区分单/多图文的地方都写明了，封面字段没有类似区分。

来源：[新增草稿](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_add.html) 、[更新草稿](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_update.html) 、[获取草稿详情](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_getdraft.html) 、[获取草稿列表](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_batchget.html)

## 3) 封面图需要先通过什么接口上传？临时素材能否用作封面？

- **封面必须用"上传永久素材"接口**：`POST https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=TYPE`，`type` 可为 `image`（图片：10M，bmp/png/jpeg/jpg/gif）或 `thumb`（缩略图：64KB，JPG）。返回**永久** `media_id`（图片还返回可在腾讯系域名内使用的 URL）。
- **临时素材不能用作封面**：`draft/add`、`draft/update`、`draft/get` 三处对 `thumb_media_id` 的说明完全一致——"图文消息的封面图片素材id（**必须是永久MediaID**）"。而临时素材接口（`media/upload`）的注意事项明说"媒体文件在微信后台保存时间为 3 天，即 3 天后 media_id 失效"，与永久要求矛盾。
  - 对比：旧版 `media/uploadnews`（群发用上传图文素材）的 `thumb_media_id` 写的是"可以在素材管理-**新增临时素材**中获得"——但那是旧群发链路；**草稿箱链路（draft 系列）明确要求永久 MediaID**，请勿混用。
- 正文中插图用的是另一个接口 `media/uploadimg`（上传图文消息内的图片获取 URL，返回 `url` 不返回 media_id），它**不能**当封面用；封面对应的是 `material/add_material`。

来源：[上传永久素材](https://developers.weixin.qq.com/doc/service/api/material/permanent/api_addmaterial.html) 、[上传临时素材](https://developers.weixin.qq.com/doc/service/api/material/temporary/api_uploadtempmedia.html) 、[上传发表内容中的图片 uploadimg](https://developers.weixin.qq.com/doc/service/api/material/permanent/api_uploadimage.html) 、[新增草稿](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_add.html)

## 4) cover_info（裁剪信息）是否按文章各自设置？头条与次条裁剪比例有无差异？

**按文章各自设置。** `cover_info` 与 `thumb_media_id` 同级，位于 `Body.articles(Array)` 之下，结构如下：

```
Body.articles(Array).cover_info
└── crop_percent_list (objarray)   封面裁剪信息，以图片左上角(0,0)、右下角(1,1)坐标系
    ├── ratio: 裁剪比例。图文消息（news）仅支持 "2.35_1" "1_1"；图片消息（newspic）支持 "1_1" "16_9" "2.35_1"
    └── x1 / y1 / x2 / y2: 裁剪区域坐标（string）
```

要点：

- **一篇文章的同一张封面图可以同时携带多个 ratio 的裁剪**：官方请求示例中，第一篇文章的 `cover_info.crop_percent_list` 同时给出 `2.35_1` 和 `1_1` 两组裁剪坐标。
- **头条与次条在比例上的差异（如前台展示头条 2.35:1、次条 1:1）未在官方接口文档中说明。** 接口文档只列出 news 类型支持的两个可选比例，没有说明哪个比例用于何种展示位。之所以每篇文章可同时提交两种比例的裁剪，合理推断是同一封面会在不同展示位以不同比例呈现（此句为对官方参数表与示例的解读，非官方原话）。
- `draft/get` 返回的每篇 `news_item` 也各自回显 `cover_info`，与写入对称。

来源：[新增草稿 - Body.articles(Array).cover_info 及代码示例](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_add.html) 、[获取草稿详情 - Res.news_item.cover_info](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_getdraft.html)

## 5) 发布/群发接口会不会覆盖或忽略各文章的封面设置？

**不会。发布接口不接收任何封面参数，草稿内容原样发布。**

- 新版发布 `POST /cgi-bin/freepublish/submit`（接口英文名 `freepublish_submit`）请求体只有一个参数：`media_id`（要发布的草稿的 media_id）。官方说明："开发者需要先将图文素材以草稿的形式保存，选择要发布的草稿 media_id 进行发布。"发布接口既无法指定也无法覆盖封面。
- 发布成功后用 `freepublish/getarticle` 通过 `article_id` 取已发布文章，返回的 `news_item` 数组中**每篇文章各自带 `thumb_media_id` 和 `thumb_url`（封面图片 URL）**——即草稿阶段设置的每篇封面被原样保留并发布。
- 官方 `draft/add` 注意事项："上传到草稿箱中的素材被群发或发布后，该素材将从草稿箱中移除"（只是移出草稿箱，不改变内容）。
- 群发链路（`sendall` / `send`，msgtype=mpnews）引用的也是已上传图文素材的 `media_id`，同样不含封面参数。来源：[根据标签群发消息](https://developers.weixin.qq.com/doc/service/api/notify/message/api_sendall.html)

（"原样保留"一句为基于参数表的解读：发布接口无封面入参、查询接口按篇回显封面，故封面设置在发布环节不被覆盖。）

来源：[发布能力 freepublish/submit](https://developers.weixin.qq.com/doc/service/api/public/api_freepublish_submit.html) 、[获取成功发布文章 freepublish/getarticle](https://developers.weixin.qq.com/doc/service/api/public/api_freepublishgetarticle.html)

## 6) 仓库内实现的旁证（仅旁证，结论以官方文档为准）

`wxmp-server/wxmp_server.py` 目前只发布**单图文**草稿：

- `publish()`（`wxmp_server.py:220`）调用 `draft/add` 时传 `{"articles": [article]}`——只放一篇文章；封面经 `_build_article()`（`wxmp_server.py:202`）先 `POST /cgi-bin/material/add_material` 上传永久素材，再把返回的 `media_id` 填入该文章的 `thumb_media_id`。这与官方"封面=每篇文章的永久素材 id"模型一致，但**尚未实现多图文（多篇数组）**，因此也没有"头条/次条不同封面"的现成代码路径。
- `publish_update()`（`wxmp_server.py:230`）调用 `draft/update`，固定 `index` 默认 0，同样按单篇文章更新封面。
- 测试 `wxmp-server/tests/test_publish.py:78、127` 断言了 `thumb_media_id == "test-cover-id"`（`add_material` 的返回值），与官方字段语义吻合；未覆盖 `cover_info`（当前实现不传裁剪信息，属可选字段）。

若要支持"头条封面 A + 次条封面 B"，只需把服务端载荷从单 article 扩为 article 数组、每篇各自上传封面拿永久 media_id 后填入各自的 `thumb_media_id`（必要时再加各自的 `cover_info`），无需特殊接口。

## 来源列表（均为微信官方文档）

1. 新增草稿 draft_add（服务号）：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_add.html
2. 新增草稿 draft_add（订阅号，同内容）：https://developers.weixin.qq.com/doc/subscription/api/draftbox/draftmanage/api_draft_add.html
3. 更新草稿 draft_update：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_update.html
4. 获取草稿详情 getDraft：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_getdraft.html
5. 获取草稿列表 draft/batchget：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_batchget.html
6. 草稿管理和商品卡片（接口总览）：https://developers.weixin.qq.com/doc/service/guide/product/draft.html
7. 上传永久素材 material/add_material：https://developers.weixin.qq.com/doc/service/api/material/permanent/api_addmaterial.html
8. 上传临时素材 media/upload：https://developers.weixin.qq.com/doc/service/api/material/temporary/api_uploadtempmedia.html
9. 上传发表内容中的图片 media/uploadimg：https://developers.weixin.qq.com/doc/service/api/material/permanent/api_uploadimage.html
10. 发布能力 freepublish/submit：https://developers.weixin.qq.com/doc/service/api/public/api_freepublish_submit.html
11. 获取成功发布文章 freepublish/getarticle：https://developers.weixin.qq.com/doc/service/api/public/api_freepublishgetarticle.html
12. 根据标签群发消息 sendall：https://developers.weixin.qq.com/doc/service/api/notify/message/api_sendall.html
13. 上传图文消息素材 media/uploadnews（旧版群发链路，对比用）：https://developers.weixin.qq.com/doc/service/api/notify/message/api_uploadnewsmsg.html

参考（仓库内，非官方）：`wxmp-server/wxmp_server.py`、`wxmp-server/tests/test_publish.py`（见第 6 节旁证）。
