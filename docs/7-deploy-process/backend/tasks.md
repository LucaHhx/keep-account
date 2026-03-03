# 任务清单

> 计划: deploy-process/backend | 创建: 2026-03-03

| # | 任务 | 状态 | 开始日期 | 完成日期 | 备注 |
|---|------|------|----------|----------|------|
| 1 | 创建 deploy/ 目录结构和 Dockerfile.backend (Go 多阶段构建) | 已完成 | 2026-03-03 | 2026-03-03 | 文件已存在且与 design.md 一致 |
| 2 | 创建 Dockerfile.frontend (Node 构建 + nginx 静态服务) | 已完成 | 2026-03-03 | 2026-03-03 | 文件已存在，前端容器化部署使用 nginx 反向代理，不需要 VITE_API_BASE_URL |
| 3 | 编写 nginx.conf (SPA fallback + /api/ 反向代理 + gzip + 缓存) | 已完成 | 2026-03-03 | 2026-03-03 | 文件已存在且与 design.md 一致 |
| 4 | 编写 docker-compose.yml (frontend + backend 双服务编排) | 已完成 | 2026-03-03 | 2026-03-03 | 文件已存在，context 使用项目根目录，部署脚本需在项目根目录执行 docker-compose -f deploy/docker-compose.yml |
| 5 | 创建 deploy/config.yaml (生产环境后端配置，支持 JWT_SECRET 环境变量覆盖) | 已完成 | 2026-03-03 | 2026-03-03 | 文件已存在且与 design.md 一致 |
| 6 | 修改 server/internal/config/config.go 支持 JWT_SECRET 环境变量覆盖 jwt.secret | 已完成 | 2026-03-03 | 2026-03-03 | 在 config.Load 中添加 viper.BindEnv 支持 JWT_SECRET 环境变量覆盖 jwt.secret |
| 7 | 编写 deploy.yaml (多环境配置，含默认 mini1 环境) | 已完成 | 2026-03-03 | 2026-03-03 | 文件已存在且与 design.md 一致 |
| 8 | 编写 .env.template (环境变量模板) | 已完成 | 2026-03-03 | 2026-03-03 | 文件已存在且与 design.md 一致 |
| 9 | 编写 deploy.sh 部署脚本 (YAML 解析 + SSH 连接 + rsync 传输 + 远端构建启动) | 已完成 | 2026-03-03 | 2026-03-03 | deploy.sh 包含完整部署流程: YAML解析、SSH连接测试、rsync传输、远端构建启动 |
| 10 | 实现端口检测逻辑 (远程 ss 命令检测 + 范围扫描 + 自动选择) | 已完成 | 2026-03-03 | 2026-03-03 | 端口检测逻辑已集成在 deploy.sh 中，通过远程 ss/netstat 命令检测，支持优先端口和范围扫描 |
| 11 | 实现部署健康检查 (等待服务就绪 + curl 验证 + 输出访问地址) | 已完成 | 2026-03-03 | 2026-03-03 | 健康检查已集成在 deploy.sh 中，最多等待30秒轮询 /api/v1/health 端点 |
| 12 | 更新 .gitignore 排除 deploy/.env.* 敏感文件 | 已完成 | 2026-03-03 | 2026-03-03 | 在 .gitignore 中添加 deploy/.env.* 排除规则，保留 .env.template |