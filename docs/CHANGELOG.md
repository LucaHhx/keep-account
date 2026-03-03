# 变更日志

格式参考 [Keep a Changelog](https://keepachangelog.com/)。

## [Unreleased]

### 变更

- 2026-03-02 简化网络请求架构：前端所有环境统一直连后端 API，移除 Vite proxy 中间层，消除多端口混淆；通过 .env 文件统一配置后端地址，不同环境只需修改 .env 即可切换

### 新增

- 2026-02-28 初始化项目文档
- 2026-02-28 创建项目概览 (project.md)，明确核心价值、目标用户、MVP 范围
- 2026-02-28 创建 5 个需求模块: account-system, quick-bookkeeping, transaction-list, data-reports, cloud-sync
- 2026-02-28 完成各需求 plan.md (目标/范围/场景/验收标准)
- 2026-02-28 完成各需求 tasks.md 功能任务拆解
- 2026-02-28 记录全部 MVP 范围决策
- 2026-03-02 新增需求模块: multi-platform (多端编译与测试)，覆盖桌面/iOS/Android 构建脚本与开发调试流程

