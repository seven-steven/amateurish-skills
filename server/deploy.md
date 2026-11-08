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

## 更新服务

等 GitHub Actions 构建并发布新镜像后,在 compose 文件所在目录执行:

```bash
docker compose pull
docker compose up -d --force-recreate
curl -fsS http://127.0.0.1:8787/health
```

使用 Podman 时,将 `docker compose` 替换为 `podman-compose`。仅执行 `up -d` 不保证拉取最新镜像。

镜像默认关闭 Gunicorn control socket(由 Compose 管理容器生命周期),避免非 root 用户因没有可写 home 目录而出现 `Control server error: Permission denied`。无需改为 root 或放宽目录权限。

## 本地回归测试

在仓库根目录执行(需安装 uv):

```bash
uv run --python 3.12 --with flask --with requests --with gunicorn python -m unittest discover -s server/tests -v
```

启动测试需要非 root 的 POSIX 用户,验证镜像启动命令在没有可写 home 目录时仍能提供 `/health`,且没有 control socket 权限错误。GitHub Actions 会在构建镜像前运行这些测试。
