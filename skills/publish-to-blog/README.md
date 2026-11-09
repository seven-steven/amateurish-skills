# publish-to-blog

把一篇笔记改编为 Hexo 博客文章:元数据自动决策、正文仅按需适配笔记引用,本地预览确认后发布并在原笔记写入回链。

流程见 [SKILL.md](SKILL.md)。

## 安装

```bash
npx skills add seven-steven/amateurish-skills --skill publish-to-blog
```

## 配置

```bash
# ~/.config/publish-to-blog/config.json
{
  "blog_repo_local_path": "~/path/to/your/blog",
  "blog_site_url": "https://your-blog.example.com"
}
```

- `blog_repo_local_path`:博客仓库本地路径(`~` 会展开),须为干净的 git 工作区。
- `blog_site_url`:站点地址,用于发布后回链。
- 文件不存在时,skill 会引导按 `config.example.json` 生成;配置在 skill 目录之外,重装/更新不覆盖。

## 使用

在装了该 skill 的 agent 对话里,按 SKILL.md 的参数调用:`<note_path> [intro="..."] [ai_assisted]`。
