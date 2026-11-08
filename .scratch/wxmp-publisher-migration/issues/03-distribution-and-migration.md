# Distribution and migration leftovers

## Question

Docker 镜像分发方式?源库运行时状态与遗留制品如何处理?

Status: resolved
Type: grilling

## Answer

- 镜像:GitHub Actions 构建,发布 GHCR(tag + latest),compose 直接拉镜像;文档保留服务器本地 build 作为 fallback。
- 遗留:运行时状态(image-cache.json、output/、config.json)不迁移;只迁代码、文档、契约。缓存键是图片哈希,损失仅首次重传。
- 源库(note 仓库)中 wxmp-publisher 相关制品迁移后删除。
