# frontend 设计文档

> 需求: cloud-sync | 角色: frontend

## 技术选型

同项目统一前端技术栈。

## 架构设计

### 网络状态检测

由于 MVP 不做离线缓存，需要在无网络时给出明确提示。

#### 实现方式

1. 监听浏览器 `online` / `offline` 事件
2. 应用启动时调用 `/api/v1/health` 检测后端可达性
3. API 请求失败（网络错误）时显示全局断网提示

#### 断网提示 UI

- 全局 Banner：页面顶部显示"网络连接已断开，请检查网络设置"
- 操作拦截：断网时禁用保存/编辑/删除等写操作按钮
- 自动恢复：网络恢复后自动隐藏 Banner，恢复操作

### 主题切换（浅色/深色）

#### useThemeStore (Zustand)

```typescript
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';  // 实际应用的主题

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  initTheme: () => void;
}
```

#### 实现方式

1. 通过 `<html class="dark">` 切换深色模式，Tailwind `dark:` 前缀自动生效
2. 支持三种模式：浅色、深色、跟随系统
3. 主题偏好存储在 localStorage，应用启动时恢复
4. 监听 `prefers-color-scheme` 媒体查询，"跟随系统"模式下自动切换

#### Tailwind CSS 深色模式配置

```typescript
// tailwind.config.ts -- 与 UI 设计系统对齐
export default {
  darkMode: 'class',
  // ...
}
```

通过 `<html class="dark">` 切换深色模式，组件中使用 `dark:` 前缀定义深色样式：
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50">
```

### "我的"页面（Tab 4）

#### ProfilePage

- 路由：`/me`（主 Tab 第四个页面）
- 功能：
  1. 用户信息展示（用户名）
  2. 分类管理入口
  3. 主题切换（浅色/深色/跟随系统）
  4. 退出登录按钮

### 多端适配

#### 响应式布局

三个断点（与 UI 设计系统对齐）：
- 移动端：< 768px -- 底部 Tab 导航（BottomNav），全宽布局
- 平板：768px - 1023px -- 底部 Tab 导航，内容区 max-w-lg 居中
- 桌面：>= 1024px -- 左侧侧边栏 (224px / w-56) + 内容区 max-w-md 居中

#### Tauri 集成

- 使用 Vite 构建的前端代码，Tauri 作为壳层
- API 请求地址通过环境变量配置：
  - 开发环境：`http://192.168.0.145:5723`
  - 生产环境：配置文件中的远程服务器地址

#### Capacitor 集成

- 同一套 Vite 构建产物
- API 地址同样通过环境变量配置
- 需要处理 iOS/Android 的安全区域（Safe Area Insets）

### 通用组件

| 组件 | 说明 |
|------|------|
| NetworkBanner | 网络状态提示 Banner |
| ThemeToggle | 主题切换组件（三态：浅色/深色/系统） |
| AppShell | 应用外壳，包含导航和布局 |
| BottomNav | 移动端底部 Tab 导航 |

### API 基础地址配置

```typescript
// src/api/config.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.145:5723';
```

环境变量：
- `.env.development`：`VITE_API_BASE_URL=http://192.168.0.145:5723`
- `.env.production`：`VITE_API_BASE_URL=https://api.your-domain.com`

## 关键决策

- 主题偏好存 localStorage，不需要同步到服务端（纯客户端设置）
- 使用 CSS 变量 + Tailwind dark: 前缀实现主题切换
- 断网检测使用 navigator.onLine + API 健康检查双重机制
- API 基础地址通过环境变量配置，支持不同端不同后端地址
- 响应式布局使用三断点体系，一套代码适配所有端
