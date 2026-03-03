# backend 设计文档

> 需求: account-system | 角色: backend

## 技术选型

| 类别 | 技术 | 说明 |
|------|------|------|
| 语言 | Go 1.25+ | |
| Web 框架 | Gin | HTTP 路由与中间件 |
| ORM | GORM + SQLite Driver (WAL) | 数据库操作与自动迁移 |
| 认证 | golang-jwt/jwt v5 | JWT 单 Token + 滑动过期 |
| 密码加密 | golang.org/x/crypto/bcrypt | bcrypt 哈希 |
| 校验 | go-playground/validator v10 | 请求参数校验 |
| 日志 | Zap | 结构化日志 |
| 配置 | Viper | YAML 配置管理 |

## 架构设计

### 数据模型

#### users 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uint | PK, auto increment | 用户 ID |
| username | varchar(32) | unique, not null | 用户名（登录账号） |
| password_hash | varchar(255) | not null | bcrypt 加密后的密码 |
| created_at | datetime | not null | 创建时间 |
| updated_at | datetime | not null | 更新时间 |

约束规则：
- username: 3-32 字符，仅允许字母、数字、下划线
- password: 6-32 字符（明文长度要求，存储为 bcrypt hash）
- username 全局唯一

### 认证方案：单 Token + 滑动过期

- 登录成功后签发 JWT Token，有效期 7 天
- 每次认证通过的请求，如果 Token 剩余有效期不足一半（< 3.5 天），自动在响应头中返回新 Token
- 前端收到新 Token 后替换本地存储的旧 Token
- 退出登录：前端清除本地 Token 即可（无需服务端失效，MVP 阶段简化处理）

JWT Payload:
```json
{
  "user_id": 1,
  "username": "zhangsan",
  "exp": 1709136000,
  "iat": 1708531200
}
```

滑动续期响应头：
```
X-New-Token: <new_jwt_token>
```

### API 接口设计

服务监听端口：`5723`（通过 config.yaml 配置）

所有接口前缀：`/api/v1`

统一响应格式：
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

错误码定义（全局统一，所有需求共用）：

| code | 说明 | 所属模块 |
|------|------|----------|
| 0 | 成功 | 通用 |
| 1001 | 参数校验失败 | 通用 |
| 1002 | 用户名已存在 | 账号系统 |
| 1003 | 用户不存在 | 账号系统 |
| 1004 | 密码错误 | 账号系统 |
| 1005 | 未登录/Token 无效 | 认证 |
| 1006 | Token 过期 | 认证 |
| 2001 | 分类名称已存在 | 分类管理 |
| 2002 | 分类不存在 | 分类管理 |
| 2003 | 不可修改或删除预设分类 | 分类管理 |
| 3001 | 交易记录不存在 | 流水管理 |
| 3002 | 无权操作此记录 | 流水管理 |
| 9999 | 服务器内部错误 | 通用 |

#### POST /api/v1/auth/register

注册新用户。

请求体：
```json
{
  "username": "zhangsan",
  "password": "123456"
}
```

成功响应（自动登录，返回 Token）：
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "zhangsan"
    }
  }
}
```

#### POST /api/v1/auth/login

用户登录。

请求体：
```json
{
  "username": "zhangsan",
  "password": "123456"
}
```

成功响应：
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "zhangsan"
    }
  }
}
```

#### POST /api/v1/auth/logout

退出登录（可选的服务端接口，MVP 阶段前端直接清除 Token 即可）。

请求头：`Authorization: Bearer <token>`

成功响应：
```json
{
  "code": 0,
  "message": "已退出登录",
  "data": null
}
```

#### GET /api/v1/user/profile

获取当前登录用户信息（需鉴权）。

请求头：`Authorization: Bearer <token>`

成功响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "created_at": "2026-02-28T10:00:00Z"
  }
}
```

### 中间件设计

#### JWT 鉴权中间件

- 从 `Authorization: Bearer <token>` 头提取 Token
- 验证签名和有效期
- 解析 user_id 写入 Gin Context
- Token 剩余有效期 < 3.5 天时，签发新 Token 写入 `X-New-Token` 响应头
- 未认证请求返回 401 + code 1005

#### CORS 中间件

前端全环境直连后端（不经 Vite proxy），CORS 配置需适配跨域请求。

**dev 模式 (IsDev=true):**
- 允许所有 `http://localhost:<任意端口>` origin（覆盖浏览器直连场景）
- 允许所有内网 IP origin（覆盖 iOS 真机通过局域网 IP 访问的场景）
- 允许 `tauri://localhost`、`https://tauri.localhost` (Tauri 桌面)
- 允许 `capacitor://localhost` (Capacitor 移动端)

**production 模式:**
- 白名单: `http://localhost:5173`, `http://localhost`, `tauri://localhost`, `https://tauri.localhost`, `capacitor://localhost`

**通用配置:**
- 允许的方法：GET, POST, PUT, DELETE, OPTIONS
- 允许的头：Authorization, Content-Type
- 暴露的头：X-New-Token（用于前端获取续期 Token）
- 允许携带凭证：AllowCredentials: true
- 预检缓存：12 小时

### 业务逻辑要点

1. 注册时先查 username 是否已存在，再 bcrypt 加密密码后存入数据库
2. 登录时先查用户是否存在，再用 bcrypt.CompareHashAndPassword 比对密码
3. bcrypt cost 使用默认值 10
4. JWT secret 通过配置文件 (config.yaml) 管理，不硬编码

## 关键决策

- 使用单 Token + 滑动过期而非双 Token 方案，降低复杂度
- Token 有效期 7 天，续期阈值 3.5 天
- 退出登录不做服务端 Token 黑名单，MVP 阶段前端清除即可
- users 表不存储邮箱/手机号，MVP 不做找回密码
- 密码加密使用 bcrypt（cost=10），行业标准方案
- 去掉 Account 实体，不需要 accounts 表
