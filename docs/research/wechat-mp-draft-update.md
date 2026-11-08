# 微信公众号草稿箱：能否"更新原草稿"而非新建草稿？

> 说明：本文件位于 `docs/research/` 目录，该目录为本次研究新建（仓库此前没有专门的 research 目录）。所有结论均基于微信官方文档（developers.weixin.qq.com），未依赖二手博客。

## 结论摘要

**可以。** 微信官方提供 `POST /cgi-bin/draft/update`（接口英文名 `draft_update`）接口，用于"修改图文或图片消息草稿"。调用时传入原草稿的 `media_id`、要更新的文章位置 `index`（从 0 开始）和完整的 `articles` 对象，即可在**原地更新草稿**，不会新建一篇草稿。更新接口不返回新的 media_id，即原 media_id 保持不变（建议实现时更新后再调 `draft/get` 复核，见下文"注意事项"）。

来源：
- 更新草稿（官方文档）：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_update.html （订阅号版本同内容：https://developers.weixin.qq.com/doc/subscription/api/draftbox/draftmanage/api_draft_update.html ）
- 草稿接口总览：https://developers.weixin.qq.com/doc/service/guide/product/draft.html

## 1) 是否存在"更新草稿"接口

存在。

- 请求方式：`POST https://api.weixin.qq.com/cgi-bin/draft/update?access_token=ACCESS_TOKEN`
- 接口英文名：`draft_update`，"本接口用于修改图文或图片消息草稿"
- 不支持云调用；支持第三方平台代商家调用（权限集 id：11、100）
- 适用范围：公众号、服务号均可调用

来源：[更新草稿 - 微信开放文档](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_update.html)

## 2) 参数与能否只更新部分字段

请求体参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `media_id` | string | 是 | 要修改的图文消息的 id |
| `index` | number | 是 | 要更新的文章在图文消息中的位置（多图文时才有意义），第一篇为 0 |
| `articles` | object | 是 | 图文信息（单个对象，非数组） |

`articles` 内主要字段（图文消息 news）：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 标题 |
| `author` | 否 | 作者 |
| `digest` | 否 | 摘要（仅单图文）；不填默认抓取正文前 54 字 |
| `content` | 是 | 正文 HTML，须少于 2 万字符、小于 1M；会去除 JS；图片 URL 必须来自"上传图文消息内的图片获取URL"接口，外部图 URL 会被过滤 |
| `content_source_url` | 否 | "阅读原文"链接 |
| `thumb_media_id` | 否（文档标注） | 封面图片素材 id（必须是永久 MediaID） |
| `need_open_comment` / `only_fans_can_comment` | 否 | 评论开关 |
| `cover_info` | 否 | 封面裁剪信息（ratio 仅支持 2.35_1 / 1_1） |
| `image_info` | 图片消息 newspic 必填 | 图片消息的图片列表，最多 20 张，首张即封面 |
| `product_info` | 否 | 文末商品信息 |

**关键点（字段级更新的边界）：**
- 更新的粒度是**单篇文章（按 index 定位）**，不是整个草稿一次性全量提交——多图文草稿中可只更新第 index 篇。
- 但对被更新的那一篇而言，`articles` 是**整体替换语义**：`title` 和 `content` 是必填项，不能只提交 title 而不带 content。也就是说无法"只改标题"这种单字段 PATCH 式更新；需要先 `draft/get` 拉取原文，再合并修改后整篇提交。（此句为对官方参数表的解读：官方未提供字段级 PATCH 语义，且 title/content 标为必填。）

请求示例（官方文档 5.1 节）：

```json
{
  "media_id": "MEDIA_ID",
  "index": 0,
  "articles": {
    "title": "TITLE",
    "content": "CONTENT",
    "thumb_media_id": "THUMB_MEDIA_ID",
    "...": "..."
  }
}
```

来源：[更新草稿 - 微信开放文档](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_update.html)（请求参数表与 5.1/5.2 代码示例）

## 3) 更新后 media_id 是否保持不变

保持不变。依据：
- `draft/update` 的请求参数以 `media_id` 定位草稿，**返回体只有 `errcode`/`errmsg`，不返回新的 media_id**（官方文档第 3 节"返回参数"）。
- 相比之下 `draft/add` 会返回新的 `media_id`。因此更新操作在原草稿上生效，media_id 不变。

来源：[更新草稿 - 返回参数](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_update.html)

（注：官方文档未用一句话明说"media_id 不变"，以上为基于返回体结构的直接推断，置信度高；实现时建议更新后调用 `draft/get` 验证。）

## 4) 限制与注意事项

来自官方 `draft/update` 文档：
- **正文限制**：`content` 少于 2 万字符、小于 1M；去除 JS；图片 URL 必须来自"上传图文消息内的图片获取URL"接口，外部图片 URL 被过滤。
- **封面**：`thumb_media_id` 文档标注为"否"（非必填），但社区有多起反馈缺省封面时报 `40007 invalid media_id`——实践中建议总是带上封面（社区链接：https://developers.weixin.qq.com/community/develop/doc/000848ce3100a00a3ed3204f066000 ，二手经验，仅作参考）。
- **错误码**（官方）：40114 invalid index value；41039 invalid content_source_url；45166 invalid content；88000 without comment privilege；53404-53406 商品相关。
- **文档"注意事项"一节写明"本接口无特殊注意事项"。**

调用频率（通用限制，非该接口专属）：
- 公众号接口有每日调用额度，超限返回 `{"errcode":45009,"errmsg":"api freq out of limit"}`；具体各接口日上限可在公众平台后台"开发者中心-接口权限"查看，认证账号每月有 10 次清零机会；粉丝数超 10W/100W/1000W 时部分接口上限提升。也可通过 `POST /cgi-bin/openapi/quota/get` 查询实时额度。
- 来源：[接口调用额度说明](https://developers.weixin.qq.com/doc/subscription/guide/dev/api/limit) 、[查询API调用额度](https://developers.weixin.qq.com/doc/subscription/api/apimanage/api_getapiquota.html)
- 官方文档未单独公布 draft 系列接口的精确每日次数，需以账号后台实际显示为准（缺失信息）。

## 来源列表（均为微信官方文档）

1. 更新草稿（draft_update，服务号）：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_update.html
2. 更新草稿（订阅号，同内容）：https://developers.weixin.qq.com/doc/subscription/api/draftbox/draftmanage/api_draft_update.html
3. 草稿管理和商品卡片（接口总览）：https://developers.weixin.qq.com/doc/service/guide/product/draft.html
4. 接口调用额度说明：https://developers.weixin.qq.com/doc/subscription/guide/dev/api/limit
5. 查询API调用额度（quota/get）：https://developers.weixin.qq.com/doc/subscription/api/apimanage/api_getapiquota.html

参考（非官方，仅辅助）：微信开放社区关于 40007 的讨论 ×2（见上文链接）。
