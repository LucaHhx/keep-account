# FIX-6: 添加Gin请求日志中间件

> 日期: 2026-03-02 | 状态: 已修复 | 严重程度: P2

## 现象

后端使用 `gin.New()` 初始化引擎，终端没有任何请求日志输出，无法判断是否有请求进入。

## 根因分析

`gin.New()` 不同于 `gin.Default()`，不会自动注册 Logger 中间件。项目虽然配置了 Zap 日志库，但未在 Gin 中间件层面注册任何请求日志记录。

## 修复方案

新建 `middleware/logger.go`，实现 `RequestLogger()` 中间件：
- 捕获并记录请求体（读取后恢复 body 供 handler 使用）
- 通过包装 `ResponseWriter` 捕获并记录响应体
- 记录 HTTP 方法、路径、状态码、耗时、客户端 IP
- 使用 ANSI 彩色输出，不同状态码/方法/耗时有不同颜色
- 请求体和响应体超过 2KB 自动截断

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `server/internal/middleware/logger.go` | 新建请求日志中间件 |
| `server/internal/router/router.go` | 注册 `RequestLogger()` 中间件 |

## 验收标准

- [x] 编译通过
- [ ] 启动后端，发送请求可在终端看到彩色日志
- [ ] 日志包含：方法、路径、状态码、耗时、客户端 IP
- [ ] 日志包含：请求体内容和响应体内容
