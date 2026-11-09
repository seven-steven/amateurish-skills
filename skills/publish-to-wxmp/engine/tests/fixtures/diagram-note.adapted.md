# 笔记发布示例

发布流程：

```mermaid
flowchart TD
 A[输入笔记] --> B[校验内容]
 B --> C[预览确认]
 C --> D[推入草稿箱]
```

```mermaid
mindmap
 root((笔记工作))
  写作
   记录
   整理
  发布
   预览
   确认
```

发布前检查标题与摘要。
参考资料：[发布说明](https://example.com/publishing)

源码示例：

```javascript
const status = "ready";
console.log(status);
```

原样日志：

```text
INFO build complete
INFO awaiting human confirmation
```

![原有配图](cover.png)
