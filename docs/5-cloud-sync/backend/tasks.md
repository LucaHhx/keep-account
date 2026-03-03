# 任务清单

> 计划: cloud-sync/backend | 创建: 2026-02-28

| # | 任务 | 状态 | 开始日期 | 完成日期 | 备注 |
|---|------|------|----------|----------|------|
| 1 | 实现 GET /api/v1/health 健康检查接口 | 已完成 | 2026-02-28 | 2026-02-28 | 新增 handler/health.go，在 router.go 中注册 GET /api/v1/health（无需鉴权） |
| 2 | 配置 CORS 支持 Web/Tauri/Capacitor 多端 origin | 已完成 | 2026-02-28 | 2026-02-28 | 补充 http://localhost (Capacitor Android origin) 到 CORS 白名单 |
| 3 | 配置 SQLite WAL 模式和 busy_timeout | 已完成 | 2026-02-28 | 2026-02-28 | 在 SQLite DSN 中添加 _busy_timeout=5000，避免并发写锁立即报错 |