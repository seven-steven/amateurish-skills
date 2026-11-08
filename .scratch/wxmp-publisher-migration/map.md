# Wayfinder map: wxmp-publisher 迁移升级

Label: wayfinder:map

## Destination

一份沉淀在本仓库的完整 spec(docs/spec.md + docs/security.md),覆盖:从 note 仓库迁移全部设计/文档/工件(源库将删除)、skill 自包含化、服务端 Docker 化与安全加固、preview 与完整自定义主题升级。路线清晰到可直接施工。

## Notes

- 域:微信公众号发布工具(skill + CLI + 服务端 token 服务)
- 决策原则:可开源标准、中文文档、单用户单公众号多设备
- 相关 skill:writing-for-agents(写 SKILL.md/WXPUSH.md 时)
- 执行(施工)不在本图内:地图画完即 handoff

## Decisions so far

- [目的地与形态](issues/01-destination-and-scope.md): 目的地=spec 沉淀;skill 自包含;升级含 preview+自定义主题;单用户单公众号多设备;可开源;本仓库保留完整设计文档工件,源库将删除
- [引擎打包与主题与 preview](issues/02-engine-theme-preview.md): 引擎预构建产物入库+归属说明;主题=完整系统(YAML+深合并+目录发现);preview 保持 CLI 升级(真实预览+watch);服务端安全=HTTPS+Bearer token+body/MIME/限流限制;安装=git clone+安装脚本;仓库结构=skill/ server/ engine/ 顶层;文档中文
- [分发与遗留状态](issues/03-distribution-and-migration.md): 镜像发 GHCR;运行时状态(image-cache/output/config)不迁移,只迁代码文档契约

## Not yet specified

- skills.sh 安装指引的具体写法与安装脚本行为细节(待 spec 骨架成形后细化)
- GHCR 发布流程细节(workflow 触发、tag 策略、CI 验证范围)
- spec.md 的具体章节切分(骨架成形后自然确定)

## Out of scope

- 常驻本地 web UI(编辑+实时预览+一键 push 的完整产品形态)
- 多用户/多公众号支持
- mTLS / IP allowlist 额外安全层
- 发布到 skill 市场/注册表(视生态成熟度将来另起 effort)
