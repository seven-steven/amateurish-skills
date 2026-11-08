# 服务端安全设计

> 前提:单用户、单公众号、多设备;服务部署在公网服务器,Docker 化,反代终止 TLS。

## 威胁模型

公网可达的 HTTP 服务,持有公众号 AppSecret。攻击面:

1. AppSecret / access_token 泄露(服务被攻破或配置外泄)
2. 未授权调用(裸奔接口被扫到,滥用图片上传/草稿创建,耗尽公众号接口配额)
3. 资源耗尽(超大 body、高频请求)
4. 中间人窃听 token / 内容

## 防线(按层)

### L1 网络与传输

- **HTTPS 强制**:compose 只绑 `127.0.0.1:8787`,由 Nginx/Caddy 反代终止 TLS 并强制 HTTP→HTTPS 跳转。
- 服务本身拒绝直接暴露:`0.0.0.0` 仅在容器网络内,宿主端口绑定 loopback。
- 建议但不强制:服务器防火墙仅放行反代端口(80/443)。

### L2 认证

- 所有业务端点要求 `Authorization: Bearer <WX_TOKEN>`;`/health` 免认证(不含敏感信息,仅返回 `{"ok": true}`)。
- token 为长随机串(≥32 字节熵),通过 `.env` 注入,不进 git、不进日志、不进错误消息。
- 校验用 `hmac.compare_digest` 恒时比较,防时序侧信道。
- 单一共享 token(决策:不做每设备密钥);泄露即换 token 重启,影响面 = 全设备一次重配,可接受。

### L3 输入限制

- `MAX_CONTENT_LENGTH = 12MB`:Flask 全局拒绝超限 body(413),在解析前生效。
- `/publish/img`:仅接受 `image/png|jpeg|gif`,单文件 ≤10MB(微信正文图片上限),否则 400/413。
- `/publish`:字段存在性校验(title/content/cover_base64),title ≤64、digest ≤120(客户端已校验,服务端兜底)。
- multipart 解析异常一律 400,不透传堆栈。

### L4 限流

- 进程内滑窗限流(按客户端):默认 30 req/min,超限 429。参数可由 `WX_RATE_LIMIT` 调整。
- 无持久化需求(单用户),重启清零可接受。

### L5 泄露控制

- 日志只记录事件与微信 errcode/errmsg,不记录 token、AppSecret、完整内容。
- 错误响应统一 `{"error": "..."}` 短消息;异常细节只进服务端日志。
- 容器以非 root 运行;镜像最小化(python-slim,仅 flask/requests/gunicorn)。

### L6 微信侧

- 服务器出口 IP 加入公众号 IP 白名单——AppSecret 即使泄露,非白名单 IP 也换不出 token(第二道保险)。
- access_token 仅存内存缓存,不落盘。

## 明确不做(决策票 02)

mTLS、IP allowlist(应用层)、每设备密钥、审计持久化。

## 部署检查单

1. `.env` 权限 600,内容仅 AppID/AppSecret/Token。
2. `docker compose up -d` 后 `curl 127.0.0.1:8787/health` 通过。
3. 反代 HTTPS 生效,HTTP 强跳。
4. 公众号后台 IP 白名单已含服务器出口 IP。
5. 从客户端 `wxpush doctor` 通过(含 401 路径:无 token 应被拒)。
