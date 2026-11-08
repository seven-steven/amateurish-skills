# Destination and scope

## Question

这次 wayfinding 的目的地是什么?skill 分发形态、升级边界、用户模型、仓库定位各是什么?

Status: resolved
Type: grilling

## Answer

- 目的地 = 可执行的迁移+升级 spec,沉淀在本仓库(docs/ 下),路线清晰后直接施工;施工不在地图内。
- skill 自包含:skill 目录自带 scripts(含预构建引擎),安装 skill 即可用,消灭现场 npm+esbuild 打包。
- 升级边界:preview 升级 + 完整自定义主题系统;功能面其余保持现状。
- 用户模型:单用户、单公众号、多设备。
- 仓库定位:可开源项目标准(README、无个人路径硬编码)。
- 本仓库保留完整设计、文档、工件;后续删除源库(note 仓库)。
