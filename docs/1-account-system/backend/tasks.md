# 任务清单

> 计划: account-system/backend | 创建: 2026-02-28

| # | 任务 | 状态 | 开始日期 | 完成日期 | 备注 |
|---|------|------|----------|----------|------|
| 1 | 初始化 Go 项目结构 (cmd/server, internal/, pkg/, config/) | 已完成 | 2026-02-28 | 2026-02-28 | Go 项目结构: cmd/server, internal/{config,middleware,handler,model,service,router}, pkg/response |
| 2 | 配置 GORM + SQLite (WAL 模式) 数据库连接 | 已完成 | 2026-02-28 | 2026-02-28 | GORM + SQLite WAL 模式，自动创建 data 目录 |
| 3 | 实现 users 表 GORM Model 和 AutoMigrate | 已完成 | 2026-02-28 | 2026-02-28 | User model 含 id/username/password_hash/created_at/updated_at，AutoMigrate |
| 4 | 实现统一响应格式 (code/message/data) 和错误码 | 已完成 | 2026-02-28 | 2026-02-28 | 统一 Response 结构体 + 全量错误码常量 (0-9999) |
| 5 | 实现 POST /api/v1/auth/register 注册接口 | 已完成 | 2026-02-28 | 2026-02-28 | 注册成功自动登录返回 Token + User |
| 6 | 实现 POST /api/v1/auth/login 登录接口 | 已完成 | 2026-02-28 | 2026-02-28 | 登录成功返回 Token + User，区分用户不存在/密码错误 |
| 7 | 实现 JWT 签发与验证工具 (单 Token + 滑动过期) | 已完成 | 2026-02-28 | 2026-02-28 | HS256 签名，7天有效期，3.5天续期阈值 |
| 8 | 实现 JWT 鉴权中间件 (Token 校验 + 滑动续期) | 已完成 | 2026-02-28 | 2026-02-28 | Bearer Token 校验 + 滑动续期 X-New-Token 头 |
| 9 | 实现 CORS 中间件 | 已完成 | 2026-02-28 | 2026-02-28 | AllowOriginFunc 支持 tauri:// 等非标协议 origin |
| 10 | 实现 GET /api/v1/user/profile 获取用户信息接口 | 已完成 | 2026-02-28 | 2026-02-28 | 需鉴权，返回 id/username/created_at |
| 11 | 实现 POST /api/v1/auth/logout 退出登录接口 | 已完成 | 2026-02-28 | 2026-02-28 | MVP 简化: 仅返回成功响应，Token 失效由前端处理 |
| 12 | 配置 Viper 加载 config.yaml (JWT secret, 端口等) | 已完成 | 2026-02-28 | 2026-02-28 | Viper 加载 config.yaml，支持 -config 命令行参数 |
| 13 | 配置 Zap 结构化日志 | 已完成 | 2026-02-28 | 2026-02-28 | Zap logger，支持 console/json 格式，可配置日志级别 |