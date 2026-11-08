# 部署

## 前置

- 公网服务器,Docker + docker compose
- 公众号后台「设置与开发 → 基本配置」:记下 AppID/AppSecret;把服务器**出口 IP** 加入 IP 白名单

## 步骤

1. 同步 `server/` 目录到服务器(或 clone 本仓库)。
2. `cp .env.example .env`,填入 AppID/AppSecret/Token(token 用 `openssl rand -hex 32` 生成),`chmod 600 .env`。
3. `docker compose up -d`(默认拉 GHCR 镜像;无镜像时改用 `build: .` 本地构建)。
4. `curl 127.0.0.1:8787/health` 应返回 `{"ok":true}`。
5. 反向代理终止 TLS,例(Caddy):

   ```
   wx.example.com {
       reverse_proxy 127.0.0.1:8787
   }
   ```

   Nginx 记得 80→443 强跳。compose 只绑 loopback,服务不直接暴露。
6. 验证安全基线:
   - `curl -X PUT https://wx.example.com/publish/img` → 401(无 token 被拒)
   - 带 token 上传一张超大文件 → 413
7. 客户端 `wxpush doctor` 通过即完成。

安全设计全貌见 `docs/security.md` 部署检查单。
