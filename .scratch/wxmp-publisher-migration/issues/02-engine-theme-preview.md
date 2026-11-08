# Engine, theme, preview, security baseline

## Question

引擎打包方式、自定义主题形态、preview 升级方向、服务端安全基线、skill 安装形态、仓库结构、文档语言?

Status: resolved
Type: grilling

## Answer

- 引擎:预构建 .engine.mjs 产物入库(A);构建移到 dev 脚本;附 doocs/md(Apache-2.0)归属说明。
- 主题:完整主题系统(C)——YAML 文件,base/block/inline 三段 CSS 属性映射,base_theme 继承 + 深合并覆盖;skill themes/ 目录自动发现,文件名即主题名。
- preview:保持 CLI(A),升级为已上传图片的真实预览(CDN URL 生效)+ watch 自动刷新。
- 安全基线:HTTPS 强制(反代终止,compose 绑 127.0.0.1)、单一 Bearer token(不做每设备密钥)、body 大小上限、图片 MIME/大小校验、基础限流、health 无敏感信息、无 secret 泄露日志。mTLS/IP allowlist 不做。
- 安装:git clone + 安装脚本落到目标位置;README 写 skills.sh 安装指引。
- 仓库结构:skill/ server/ engine/ 顶层;skill 目录自包含。
- 文档:中文。
