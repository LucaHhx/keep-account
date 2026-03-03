# frontend 技术方案 -- 服务端点展示

> 需求: server-info-display | 角色: frontend

## 概述

本需求为纯前端功能，无需后端改动。核心是从 `axios.ts` 中的 `baseURL` 派生出 `serverEndpoint`（去掉 `/api/v1` 后缀），供"我的"页面和登录页面展示当前连接的服务端点。

## 技术选型

| 类别 | 方案 | 理由 |
|------|------|------|
| 数据来源 | 从 `axios.ts` 导出 `serverEndpoint` 常量（baseURL 去掉 `/api/v1`） | baseURL 在模块加载时已计算完成，派生 serverEndpoint 后导出即可，无需额外状态管理 |
| 展示方式 | 内联文本 | 信息简单，无需独立组件，直接在页面中渲染 |

## 架构设计

### 数据流

```
axios.ts (getBaseURL() -> baseURL -> serverEndpoint)
    |
    |-- export { serverEndpoint }  // baseURL.replace(/\/api\/v1\/?$/, '')
    |
    +-- ProfilePage.tsx: import { serverEndpoint } --> 用户信息卡片中展示
    +-- LoginPage.tsx:   import { serverEndpoint } --> Logo 下方展示
```

### 改动范围

| 文件 | 改动内容 |
|------|----------|
| `web/src/lib/axios.ts` | 新增 `export const serverEndpoint`（去掉 /api/v1 的 baseURL） |
| `web/src/pages/ProfilePage.tsx` | 在用户信息卡片中添加端点展示 |
| `web/src/pages/LoginPage.tsx` | 在 Logo 区域下方添加端点展示 |

## 详细设计

### 1. 导出 serverEndpoint (`axios.ts`)

当前 `baseURL` 是模块级变量（第 26 行），仅作为 `axios.create()` 的参数使用。需要新增导出，去掉 `/api/v1` 路径后缀，只保留 host 部分：

```typescript
// 现有代码（第 26 行）
const baseURL = getBaseURL();

// 新增导出：去掉 /api/v1，只展示服务器地址
export const serverEndpoint = baseURL.replace(/\/api\/v1\/?$/, '');
```

导出的值示例：
- `http://192.168.1.100:5723`（Tauri dev 模式）
- `https://api.example.com`（生产环境）
- `http://localhost:5173`（Web dev 模式）

### 2. "我的"页面展示 (`ProfilePage.tsx`)

在用户信息卡片（第 25-37 行）的用户名和"已登录"文本下方，添加端点信息：

```tsx
import { serverEndpoint } from '../lib/axios';

// 在用户信息卡片中，"已登录" 文本下方添加：
<div className="text-xs text-gray-400 dark:text-gray-500 truncate">{serverEndpoint}</div>
```

设计要点：
- 使用 `text-xs` + `text-gray-400` 保持低调，不干扰主要信息
- 使用 `truncate` 防止长 URL 撑破布局
- 放在"已登录"下方，作为补充信息自然展示

### 3. 登录页面展示 (`LoginPage.tsx`)

在 Logo 区域的副标题"轻松记录每一笔"下方添加端点信息：

```tsx
import { serverEndpoint } from '../lib/axios';

// 在 "轻松记录每一笔" 的 <p> 标签后添加：
<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{serverEndpoint}</p>
```

设计要点：
- 与副标题间距 `mt-1`，视觉上作为第三行辅助文本
- 同样使用 `text-xs` + `text-gray-400` 保持低调

## 关键决策

1. **直接导出 serverEndpoint 而非创建新的 hook/store**：baseURL 是在模块加载时确定的静态值，运行期间不会变化，因此不需要响应式状态管理（Zustand store 或自定义 hook），直接导出派生常量即可。

2. **不创建独立的 ServerEndpoint 组件**：仅在两个页面使用，且展示逻辑极其简单（一行文本），无需抽象为独立组件。如果未来有更多页面需要展示，可以再提取。

3. **展示缩短的端点地址（不含 /api/v1 路径）**：用户反馈只需看到服务器地址（host:port 或域名），不需要 API 路径前缀。导出时去掉 `/api/v1` 后缀，展示更简洁。

4. **无需后端角色目录**：此需求完全在前端完成，不涉及任何后端改动。

## 依赖与约束

- 依赖 `web/src/lib/axios.ts` 中的 `getBaseURL()` 函数保持现有行为不变
- 需确保在 Web 端（Vite dev server）和 Tauri 桌面端都能正确获取和展示 baseURL
- UI 样式需等 UI 设计师确认最终视觉方案后可能微调
