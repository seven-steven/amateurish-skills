# seven-steven/amateurish-skills

个人 agent skills 集合仓库。每个 skill 自带 README(配置与使用指引),本文件只做导航与安装。

## Skills

| Skill | 目录 | 简介 |
| --- | --- | --- |
| publish-to-wxmp | [skills/publish-to-wxmp/](skills/publish-to-wxmp/) | 把 Markdown 笔记排版发布到微信公众号草稿箱(本地渲染引擎 + 自定义主题 + 真实预览),群发由人工在后台完成 |
| publish-to-blog | [skills/publish-to-blog/](skills/publish-to-blog/) | 把笔记改编为 Hexo 博客文章:元数据自动决策、正文仅按需适配笔记引用,预览确认后发布并回链 |

## 安装

任一 skill(需要 Node ≥ 22.20):

```bash
npx skills add seven-steven/amateurish-skills --skill publish-to-wxmp
npx skills add seven-steven/amateurish-skills --skill publish-to-blog
```

不带 `--skill` 则交互式选择。安装后按各 skill README 配置:

- [publish-to-wxmp 配置](skills/publish-to-wxmp/README.md#配置)(需配套服务端)
- [publish-to-blog 配置](skills/publish-to-blog/README.md#配置)

## 配置约定

本仓库维护的 skills 将自身的持久化用户设置统一存放在 `~/.config/skills/<skill-name>/config.json`,其中 `<skill-name>` 取 `SKILL.md` frontmatter 的 `name`。

- `~` 为当前用户的 home;路径固定,不受 `XDG_CONFIG_HOME` 或其他配置路径环境变量影响,也不随项目或 agent 改变。
- 只支持新位置,旧配置不读取、不回退、不自动迁移,也不删除或修改。只存在旧配置时视为缺配置,初始化行为见各 skill 的说明。
- 各 skill 保留自己的字段、结构和默认值;没有配置需求的 skill 无需创建空文件。
- 配置与安装目录分离,重装或更新 skill 不覆盖用户设置。此约定不改变运行状态、缓存、日志、主题、专用凭证存储或目标项目配置的位置。

## 服务端

`publish-to-wxmp` 需要配套的 token 服务(持有 AppSecret、统一管理 access_token,Docker 部署):部署见 [wxmp-server/deploy.md](wxmp-server/deploy.md)。

## 仓库结构

| 目录 | 内容 |
| --- | --- |
| `skills/` | 各 skill(自包含:SKILL.md + scripts + 主题 + README) |
| `wxmp-server/` | publish-to-wxmp 的 token 服务(Flask + Docker + GHCR 镜像) |
| `docs/` | 设计 spec(`spec.md`)与安全设计(`security.md`) |

## 开发

```bash
npm test   # engine 单测 + Playwright 浏览器测试(排版回归)
```
