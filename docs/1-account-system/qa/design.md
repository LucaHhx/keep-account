# qa 设计文档

> 需求: account-system | 角色: qa

## 测试策略

### 后端测试

| 类型 | 范围 | 工具 |
|------|------|------|
| 单元测试 | service 层业务逻辑 | Go testing + testify |
| 集成测试 | API 接口端到端 | Go testing + httptest |
| 数据库测试 | 使用内存 SQLite | 测试独立数据库实例 |

### 前端测试

| 类型 | 范围 | 工具 |
|------|------|------|
| 组件测试 | LoginPage / RegisterPage | Vitest + React Testing Library |
| Store 测试 | useAuthStore 状态逻辑 | Vitest |

## 测试范围

### 注册流程

- 正常注册（有效用户名+密码）-> 注册成功，返回 Token
- 用户名已存在 -> 返回 code 1002
- 用户名为空/过短/过长 -> 返回 code 1001
- 密码为空/过短/过长 -> 返回 code 1001
- 用户名含非法字符 -> 返回 code 1001

### 登录流程

- 正常登录 -> 登录成功，返回 Token
- 用户不存在 -> 返回 code 1003
- 密码错误 -> 返回 code 1004
- 参数为空 -> 返回 code 1001

### JWT 鉴权

- 有效 Token 访问受保护接口 -> 正常返回
- 无 Token 访问 -> 返回 401 + code 1005
- 无效/篡改 Token -> 返回 401 + code 1005
- 过期 Token -> 返回 401 + code 1006
- Token 剩余有效期 < 3.5 天 -> 响应头返回 X-New-Token

### 退出登录

- 前端清除 Token 后，访问受保护接口 -> 返回 401

## 关键决策

- 后端测试使用内存 SQLite，保证测试隔离和速度
- 重点测试边界条件和错误场景
- JWT 滑动续期是核心机制，需要专项测试
