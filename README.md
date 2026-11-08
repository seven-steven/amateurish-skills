# wxmp-publisher

把 Markdown 笔记发布到微信公众号**草稿箱**的自动化工具链:agent skill + 本地 CLI + 服务端 token 服务。最终群发永远由人工在公众号后台完成。

```
┌─────────────┐  HTTPS + Bearer   ┌──────────────┐   ┌──────────────┐
│ 本地 CLI     │ ────────────────▶ │ token 服务    │──▶│ 微信 MP API  │
│ (skill 调用) │                   │ (Docker)     │   └──────────────┘
└─────────────┘                   └──────────────┘
```

- 排版完全本地离线(doocs/md 引擎预构建 bundle,零 npm 依赖)
- AppSecret 只在服务端;access_token 集中管理
- 图片上传微信 CDN(哈希缓存幂等)、封面素材、创建草稿

## 组成

| 目录 | 内容 |
| --- | --- |
| `skill/` | agent 技能(SKILL.md 流程 + WXPUSH.md CLI 契约 + scripts + themes) |
| `server/` | token 服务:Flask + Docker + GHCR 镜像,见 `server/deploy.md` |
| `engine/` | 排版引擎预构建 bundle 与构建脚本,见 `engine/ATTRIBUTION.md` |
| `docs/` | 设计 spec(`spec.md`)与安全设计(`security.md`) |

## 快速开始

### 1. 服务端(公网服务器)

见 [server/deploy.md](server/deploy.md):填 `.env`(AppID/AppSecret/Token)、公众号后台加 IP 白名单、`docker compose up -d`、反代 HTTPS。

### 2. 本地安装 skill

```bash
git clone https://github.com/seven-steven/wxmp-publisher.git
cd wxmp-publisher && skill/install.sh        # 软链到 ~/.agents/skills/publish-to-wxmp
```

skills.sh 用户(需 Node ≥ 22.20,多 skill 仓库用子目录形式):

```bash
npx skills add seven-steven/wxmp-publisher/skill --skill publish-to-wxmp
```

要求:Node ≥ 22(仅 `npx tsx` 运行时按需下载,无需 npm install)。

### 3. 配置

```bash
# ~/.agents/skills/publish-to-wxmp/.bin/config.json
{ "api_base": "https://wx.example.com", "theme": "default" }
export WXMP_API_TOKEN=<与服务端 WX_TOKEN 一致>
```

### 4. 验证与使用

```bash
npx tsx .agents/skills/publish-to-wxmp/scripts/wxpush.mts doctor     # 全绿即就绪
```

然后在任意装了该 skill 的 agent 对话里说「发布 xx.md 到公众号」,或直接走 CLI 契约 [skill/WXPUSH.md](skill/WXPUSH.md)。

## 文档

- 设计总览:[docs/spec.md](docs/spec.md)
- 服务端安全:[docs/security.md](docs/security.md)
- 部署:[server/deploy.md](server/deploy.md)

## License

Apache-2.0(排版引擎来自 [doocs/md](https://github.com/doocs/md),同为 Apache-2.0,见 [engine/ATTRIBUTION.md](engine/ATTRIBUTION.md))
