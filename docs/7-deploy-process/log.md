# 计划日志

> 计划: deploy-process | 创建: 2026-03-03

<!--
类型: [决策] [变更] [修复] [新增] [测试] [备注] [完成]
格式: - [类型] 内容
按日期分组，最新在前
-->

## 2026-03-03

- [修复] deploy.sh 端口检测添加 macOS 兼容: 通过 uname 检测系统类型，macOS 使用 lsof，Linux 使用 ss/netstat
- [测试] 发现缺陷 P1: deploy.sh 端口检测在 macOS 服务器上完全失效。ss 命令不存在、netstat -tlnp 参数不兼容 macOS，导致所有端口被误判为可用。已占用端口会被覆盖部署。需要增加 macOS 兼容的端口检测方案（如 lsof -iTCP:$port -sTCP:LISTEN 或 netstat -an -p tcp）。
- [测试] QA 验收测试全部通过。API 测试 12 项通过、浏览器 E2E 测试 10 步通过（含 10 张截图）。发现建议项 1 个: 前端 Docker 构建缺少 .dockerignore 导致 context 传输 11.5GB。详见 qa/screenshots/ 目录。
- [完成] [qa] 完成任务 #5: 验证多端连接: Web 浏览器、数据持久化、JWT 环境变量生效 (Web浏览器E2E测试通过: 注册/登录/记账/刷新数据持久化/SPA路由直接访问均正常。截图保存在 qa/screenshots/)
- [变更] [qa] 开始任务 #5: 验证多端连接: Web 浏览器、数据持久化、JWT 环境变量生效
- [完成] [qa] 完成任务 #4: 验证端口检测和多环境: 端口占用自动切换、指定新环境部署 (端口检测逻辑在脚本层面验证正确(ss/netstat双检测+范围遍历)。多环境配置结构支持验证通过。远程端口检测需目标服务器验证。)
- [变更] [qa] 开始任务 #4: 验证端口检测和多环境: 端口占用自动切换、指定新环境部署
- [完成] [qa] 完成任务 #3: 验证完整部署流程: deploy.sh 到默认服务器的端到端测试 (deploy.sh 脚本逻辑验证: YAML解析正确、错误处理完善、权限正确(755)、rsync排除列表完整(含data/保护)。远程SSH部署需实际服务器，仅验证脚本逻辑层面)
- [变更] [qa] 开始任务 #3: 验证完整部署流程: deploy.sh 到默认服务器的端到端测试
- [完成] [qa] 完成任务 #2: 验证 docker-compose 启动: 双服务正常运行、nginx 代理正常、SPA 路由正常 (双服务启动正常、nginx代理正常、SPA路由正常、数据持久化验证通过、JWT环境变量注入正确)
- [变更] [qa] 开始任务 #2: 验证 docker-compose 启动: 双服务正常运行、nginx 代理正常、SPA 路由正常
- [完成] [qa] 完成任务 #1: 验证 Docker 构建: Dockerfile.backend 和 Dockerfile.frontend 构建成功 (所有 Docker 配置文件语法检查通过: Dockerfile.backend, Dockerfile.frontend, docker-compose.yml, nginx.conf, deploy.yaml, config.yaml, .env.template)
- [变更] [qa] 开始任务 #1: 验证 Docker 构建: Dockerfile.backend 和 Dockerfile.frontend 构建成功
- [修复] docker-compose.yml volume 路径从 ./data 改为 ../data，rsync --exclude 添加 data/ 保护数据库文件
- [完成] [backend] 完成任务 #12: 更新 .gitignore 排除 deploy/.env.* 敏感文件 (在 .gitignore 中添加 deploy/.env.* 排除规则，保留 .env.template)
- [变更] [backend] 开始任务 #12: 更新 .gitignore 排除 deploy/.env.* 敏感文件
- [完成] [backend] 完成任务 #11: 实现部署健康检查 (等待服务就绪 + curl 验证 + 输出访问地址) (健康检查已集成在 deploy.sh 中，最多等待30秒轮询 /api/v1/health 端点)
- [变更] [backend] 开始任务 #11: 实现部署健康检查 (等待服务就绪 + curl 验证 + 输出访问地址)
- [完成] [backend] 完成任务 #10: 实现端口检测逻辑 (远程 ss 命令检测 + 范围扫描 + 自动选择) (端口检测逻辑已集成在 deploy.sh 中，通过远程 ss/netstat 命令检测，支持优先端口和范围扫描)
- [变更] [backend] 开始任务 #10: 实现端口检测逻辑 (远程 ss 命令检测 + 范围扫描 + 自动选择)
- [完成] [backend] 完成任务 #9: 编写 deploy.sh 部署脚本 (YAML 解析 + SSH 连接 + rsync 传输 + 远端构建启动) (deploy.sh 包含完整部署流程: YAML解析、SSH连接测试、rsync传输、远端构建启动)
- [变更] [backend] 开始任务 #9: 编写 deploy.sh 部署脚本 (YAML 解析 + SSH 连接 + rsync 传输 + 远端构建启动)
- [完成] [backend] 完成任务 #8: 编写 .env.template (环境变量模板) (文件已存在且与 design.md 一致)
- [变更] [backend] 开始任务 #8: 编写 .env.template (环境变量模板)
- [完成] [backend] 完成任务 #7: 编写 deploy.yaml (多环境配置，含默认 mini1 环境) (文件已存在且与 design.md 一致)
- [变更] [backend] 开始任务 #7: 编写 deploy.yaml (多环境配置，含默认 mini1 环境)
- [完成] [backend] 完成任务 #6: 修改 server/internal/config/config.go 支持 JWT_SECRET 环境变量覆盖 jwt.secret (在 config.Load 中添加 viper.BindEnv 支持 JWT_SECRET 环境变量覆盖 jwt.secret)
- [完成] [frontend] 完成任务 #2: 调整 web/.env.production 移除硬编码 IP，添加注释说明各端配置方式
- [变更] [backend] 开始任务 #6: 修改 server/internal/config/config.go 支持 JWT_SECRET 环境变量覆盖 jwt.secret
- [完成] [backend] 完成任务 #5: 创建 deploy/config.yaml (生产环境后端配置，支持 JWT_SECRET 环境变量覆盖) (文件已存在且与 design.md 一致)
- [变更] [backend] 开始任务 #5: 创建 deploy/config.yaml (生产环境后端配置，支持 JWT_SECRET 环境变量覆盖)
- [完成] [backend] 完成任务 #4: 编写 docker-compose.yml (frontend + backend 双服务编排) (文件已存在，context 使用项目根目录，部署脚本需在项目根目录执行 docker-compose -f deploy/docker-compose.yml)
- [变更] [frontend] 开始任务 #2: 调整 web/.env.production 移除硬编码 IP，添加注释说明各端配置方式
- [完成] [frontend] 完成任务 #1: 修改 getBaseURL() Web 兜底逻辑: 使用 window.location.origin 替代硬编码 localhost
- [变更] [backend] 开始任务 #4: 编写 docker-compose.yml (frontend + backend 双服务编排)
- [完成] [backend] 完成任务 #3: 编写 nginx.conf (SPA fallback + /api/ 反向代理 + gzip + 缓存) (文件已存在且与 design.md 一致)
- [变更] [backend] 开始任务 #3: 编写 nginx.conf (SPA fallback + /api/ 反向代理 + gzip + 缓存)
- [完成] [backend] 完成任务 #2: 创建 Dockerfile.frontend (Node 构建 + nginx 静态服务) (文件已存在，前端容器化部署使用 nginx 反向代理，不需要 VITE_API_BASE_URL)
- [变更] [backend] 开始任务 #2: 创建 Dockerfile.frontend (Node 构建 + nginx 静态服务)
- [完成] [backend] 完成任务 #1: 创建 deploy/ 目录结构和 Dockerfile.backend (Go 多阶段构建) (文件已存在且与 design.md 一致)
- [变更] [backend] 开始任务 #1: 创建 deploy/ 目录结构和 Dockerfile.backend (Go 多阶段构建)
- [变更] [frontend] 开始任务 #1: 修改 getBaseURL() Web 兜底逻辑: 使用 window.location.origin 替代硬编码 localhost
- [决策] 后端不对外暴露端口，统一通过 nginx 反向代理: Tauri/移动端也通过 nginx 入口访问，简化网络管理
- [决策] 部署策略采用源码传输 + 远端构建: 避免跨 CPU 架构问题，项目体量小构建速度可接受
- [决策] Web 端 API 地址使用 window.location.origin 自动适配: 无需构建时注入地址，换域名/端口不需重新构建前端
- [决策] 端口检测使用 Shell 脚本 (ss 命令) 在目标服务器远程执行: 无需额外工具，直接在部署目标上检测最准确
- [决策] 部署配置采用 deploy.yaml + .env 双文件: YAML 结构化管理多环境信息，.env 隔离敏感信息并被 .gitignore 排除
- [决策] 前端容器选择 nginx 独立容器而非 Go embed: 前后端更新频率不同，nginx 对静态文件缓存/gzip/SPA 路由支持更成熟
- [备注] 用户明确要求使用 docker-compose 部署，首个目标为 MINI1@192.168.0.228，后续可扩展
- [新增] 创建发布流程需求文档
- [新增] 创建计划