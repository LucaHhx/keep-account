# backend 设计文档

> 需求: cloud-sync | 角色: backend

## 技术选型

同项目统一后端技术栈。云同步本质上由 RESTful API 的实时读写保证，不需要额外的同步中间件。

## 架构设计

### 数据同步策略

MVP 阶段采用最简方案：**无本地缓存，API 实时读写**。

```
[任意端] --HTTP--> [Go API Server] --GORM--> [SQLite DB]
```

- 所有数据操作（CRUD）直接通过 API 与服务端交互
- 多端数据一致性由服务端单一数据源保证
- 不需要版本号、冲突处理、同步队列等机制

### CORS 配置

```go
// 允许的源
AllowOrigins: ["http://localhost:5173", "tauri://localhost", "capacitor://localhost", "https://your-domain.com"]

// 允许的方法
AllowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]

// 允许的请求头
AllowHeaders: ["Authorization", "Content-Type"]

// 暴露的响应头（前端需要读取）
ExposeHeaders: ["X-New-Token"]

// 允许携带凭证
AllowCredentials: true
```

Tauri 和 Capacitor 的 origin 需要特殊处理：
- Tauri 2.x 使用 `tauri://localhost` 作为 origin
- Capacitor 使用 `capacitor://localhost`（iOS）或 `http://localhost`（Android）

### 服务端部署架构

```
                    ┌──────────────┐
                    │   Nginx      │
                    │  (可选反代)   │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  Go API      │
                    │  Server      │
                    │  :5723       │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  SQLite DB   │
                    │  (WAL mode)  │
                    └──────────────┘
```

- Go 服务器监听 5723 端口
- SQLite 使用 WAL 模式，支持并发读
- 可选在前面放 Nginx 做 HTTPS 和静态资源 serve
- 前端静态资源可由 Nginx serve 或独立 CDN

### SQLite WAL 模式配置

```go
// GORM 连接时开启 WAL 模式
db, err := gorm.Open(sqlite.Open("keep-account.db?_journal_mode=WAL&_busy_timeout=5000"), &gorm.Config{})
```

- `_journal_mode=WAL`：开启 WAL，允许并发读写
- `_busy_timeout=5000`：写锁等待超时 5 秒，避免立即报错

### 健康检查接口

#### GET /api/v1/health

无需鉴权，用于前端检测网络连通性。

成功响应：
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "version": "1.0.0",
    "time": "2026-02-28T10:00:00Z"
  }
}
```

### 业务逻辑要点

1. 数据一致性完全由服务端保证，客户端无需处理冲突
2. CORS 配置需要覆盖 Web、Tauri、Capacitor 三种 origin
3. SQLite WAL 模式确保多个 API 请求并发读不阻塞
4. 写操作仍然是串行的（SQLite 限制），但 MVP 阶段单用户写入量很小

## 关键决策

- 不做离线缓存和同步队列，所有操作依赖网络
- 数据一致性由服务端单一数据源保证，最简方案
- SQLite WAL 模式 + busy_timeout 应对并发
- CORS 需要支持 tauri:// 和 capacitor:// 协议
- 健康检查接口用于前端网络状态检测
