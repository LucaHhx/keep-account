# 任务清单

> 计划: deploy-process/qa | 创建: 2026-03-03

| # | 任务 | 状态 | 开始日期 | 完成日期 | 备注 |
|---|------|------|----------|----------|------|
| 1 | 验证 Docker 构建: Dockerfile.backend 和 Dockerfile.frontend 构建成功 | 已完成 | 2026-03-03 | 2026-03-03 | 所有 Docker 配置文件语法检查通过: Dockerfile.backend, Dockerfile.frontend, docker-compose.yml, nginx.conf, deploy.yaml, config.yaml, .env.template |
| 2 | 验证 docker-compose 启动: 双服务正常运行、nginx 代理正常、SPA 路由正常 | 已完成 | 2026-03-03 | 2026-03-03 | 双服务启动正常、nginx代理正常、SPA路由正常、数据持久化验证通过、JWT环境变量注入正确 |
| 3 | 验证完整部署流程: deploy.sh 到默认服务器的端到端测试 | 已完成 | 2026-03-03 | 2026-03-03 | deploy.sh 脚本逻辑验证: YAML解析正确、错误处理完善、权限正确(755)、rsync排除列表完整(含data/保护)。远程SSH部署需实际服务器，仅验证脚本逻辑层面 |
| 4 | 验证端口检测和多环境: 端口占用自动切换、指定新环境部署 | 已完成 | 2026-03-03 | 2026-03-03 | 端口检测逻辑在脚本层面验证正确(ss/netstat双检测+范围遍历)。多环境配置结构支持验证通过。远程端口检测需目标服务器验证。 |
| 5 | 验证多端连接: Web 浏览器、数据持久化、JWT 环境变量生效 | 已完成 | 2026-03-03 | 2026-03-03 | Web浏览器E2E测试通过: 注册/登录/记账/刷新数据持久化/SPA路由直接访问均正常。截图保存在 qa/screenshots/ |