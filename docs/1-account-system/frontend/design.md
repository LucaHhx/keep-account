# frontend 设计文档

> 需求: account-system | 角色: frontend

## 技术选型

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | React 19 + TypeScript 5.9+ | |
| 构建 | Vite 7+ | |
| 样式 | Tailwind CSS 4+ | 原子化 CSS，支持深色模式 |
| 状态管理 | Zustand | authStore |
| HTTP | Axios | API 请求封装 |
| 路由 | React Router DOM 7+ | |
| 桌面 | Tauri 2.x | 全平台 |
| 移动端 | Capacitor 8+ | iOS / Android |

## 架构设计

### 页面组件

#### LoginPage（登录页）

- 路由：`/login`
- 包含：用户名输入框、密码输入框、登录按钮、"去注册"链接
- 登录成功后跳转首页（记账页）
- 错误提示：用户不存在 / 密码错误 等区分显示

#### RegisterPage（注册页）

- 路由：`/register`
- 包含：用户名输入框、密码输入框、确认密码输入框、注册按钮、"去登录"链接
- 前端校验：用户名 3-32 字符、密码 6-32 字符、两次密码一致
- 注册成功后自动登录并跳转首页

### 状态管理

#### useAuthStore (Zustand)

```typescript
interface AuthState {
  token: string | null;
  user: { id: number; username: string } | null;
  isAuthenticated: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  loadFromStorage: () => void;
}
```

- Token 持久化到 localStorage
- `isAuthenticated` 计算属性，基于 token 是否存在
- `loadFromStorage`：应用启动时从 localStorage 恢复认证状态

### 路由设计

| 路径 | 页面 | 鉴权 | 所属需求 |
|------|------|------|----------|
| /login | LoginPage | 无需鉴权（已登录则重定向首页） | account-system |
| /register | RegisterPage | 无需鉴权（已登录则重定向首页） | account-system |
| / | BookkeepingPage (Tab 1 记账) | 需要鉴权 | quick-bookkeeping |
| /transactions | TransactionListPage (Tab 2 流水) | 需要鉴权 | transaction-list |
| /reports | ReportPage (Tab 3 报表) | 需要鉴权 | data-reports |
| /me | ProfilePage (Tab 4 我的) | 需要鉴权 | cloud-sync |
| /categories | CategoryManagePage | 需要鉴权 | quick-bookkeeping |

### 路由守卫

- `AuthGuard` 组件：未认证时重定向到 `/login`
- `GuestGuard` 组件：已认证时重定向到 `/`

### Axios 封装

#### 请求架构：全环境直连后端

所有环境（浏览器 / Tauri 桌面 / Tauri iOS）统一使用绝对 URL 直连后端，不经过 Vite proxy。

**baseURL 策略:**

```typescript
// 优先级: 环境变量 > 默认直连
const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : 'http://localhost:5723/api/v1';
```

| 环境 | baseURL | 说明 |
|------|---------|------|
| 浏览器 dev | `http://localhost:5723/api/v1` | 直连后端，不经 Vite proxy |
| Tauri 桌面 dev | `http://localhost:5723/api/v1` | 同上 |
| Tauri iOS dev | `http://localhost:5723/api/v1` | 通过 tauriAdapter 原生 HTTP 发送 |
| 自定义部署 | `VITE_API_BASE_URL` 环境变量 | 可指向任意后端地址 |

**Vite proxy 不再用于 API 转发。** `vite.config.ts` 中移除 `/api` proxy 配置。

**Tauri 环境适配:**

Tauri iOS 上 WKWebView 存在 POST body 丢失的 Apple bug (参见 FIX-7)。解决方案是在 Tauri 环境下使用 `@tauri-apps/plugin-http` 原生网络栈（iOS: NSURLSession, Android: OkHttp），通过自定义 Axios `tauriAdapter` 实现。非 Tauri 环境使用 Axios 默认适配器。

#### 请求拦截器
- 自动添加 `Authorization: Bearer <token>` 头

#### 响应拦截器
- 检查响应头 `X-New-Token`，如有则调用 `authStore.setToken()` 更新 Token（滑动续期）
- 收到 401 状态码时，清除认证状态并跳转登录页（排除 `/auth/` 路径，避免登录失败时误触发跳转）

### 图标库

使用 Lucide React（与 UI 设计系统对齐）：`npm install lucide-react`

### 通用组件

| 组件 | 说明 |
|------|------|
| FormInput | 表单输入框，高度 44px，支持 label、错误提示（红色边框+文字）、密码类型 |
| Button | 按钮，高度 48px，支持 loading 状态，最小触控区域 44x44px |
| Toast | 全局提示（成功/错误），顶部居中，最大宽度 320px |

## 关键决策

- Token 存 localStorage，MVP 阶段不需要考虑 XSS 防护的极端场景
- 使用 Axios 拦截器统一处理 Token 续期和 401 跳转
- 登录/注册页为独立路由，不在 Tab 导航内
- 前端表单校验与后端校验规则一致（用户名 3-32 字符，密码 6-32 字符）
- **全环境直连后端**: 所有环境统一使用 `http://localhost:5723/api/v1` 绝对 URL，去掉 Vite proxy 中间层。理由: (1) 消除多端口混淆 (2) 浏览器/桌面/iOS 统一请求路径 (3) 避免 Vite proxy 与 WKWebView 的兼容性问题
- **保留 tauriAdapter**: iOS 上 WKWebView POST body 丢失是 Apple 底层 bug，必须通过原生 HTTP 插件绕过，与是否用 proxy 无关
