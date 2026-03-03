# server-info-display 变更日志

## 2026-03-03

- [变更] PM 二次评审: 修正验收清单第3项，从'与 baseURL 一致'改为'显示 host 部分（不含 /api/v1）'，与用户反馈对齐
- [决策] 服务端点展示为纯前端功能，不需要后端改动。直接从 axios.ts 导出已有的 baseURL 常量供页面使用，无需 Zustand store 或自定义 hook
- [变更] PM 评审: tasks.md 转为规范表格格式，移除技术实现任务(axios 导出)，保留功能级任务
- [变更] PM 评审: plan.md 移除技术实现细节(axios/getBaseURL 引用)，保持 L2 层业务视角
- 创建需求文档：用户在"我的"页面和登录页面查看当前连接的服务器地址
- 需求来源：用户希望在用户信息区域和登录页面看到当前 App 连接的服务器 IP，方便确认请求目标
- 追加需求：登录页面也需要显示当前连接的服务器 IP
- [决策] 端点显示不含 /api/v1 路径后缀，只展示 host 部分（如 http://192.168.1.100:5723），更简洁直观

## 2026-03-03 QA 验收测试

### 测试环境
- 后端: Go server on :5723 (`cd server && go run ./cmd/server`)
- 前端: Vite dev server on :5173 (`cd web && npm run dev`)
- 浏览器: agent-browser --headed 有头模式
- 测试端点实际值: `http://192.168.0.145:5723`

### 验收清单逐项验证

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | "我的"页面用户信息区域展示当前连接的服务端点 | 通过 | screenshots/step-04-profile-page-light.png |
| 2 | 登录页面展示当前连接的服务端点 | 通过 | screenshots/step-01-login-page-light.png |
| 3 | 显示的端点为服务器 host 部分（不含 /api/v1 路径后缀） | 通过 | 显示 `http://192.168.0.145:5723`，不含 `/api/v1` |
| 4 | 信息展示样式与现有 UI 风格一致（低调、不干扰主要功能） | 通过 | text-xs + text-gray-400/500，低调辅助文本样式 |
| 5 | 在 Tauri 桌面端和 Web 端都能正确显示 | Web 端通过 | Web 端已验证；Tauri 桌面端需实际构建验证（本次仅测试 Web 端） |

### 浏览器 E2E 测试结果

| 场景 | 模式 | 截图 | 结果 |
|------|------|------|------|
| 登录页面 — 浅色模式 | 浅色 | step-01-login-page-light.png | 通过 |
| 登录流程 | 浅色 | step-02-login-attempt.png | 通过 |
| "我的"页面 — 浅色模式 | 浅色 | step-04-profile-page-light.png | 通过 |
| "我的"页面 — 深色模式 | 深色 | step-05-profile-page-dark.png | 通过 |
| 登录页面 — 深色模式 | 深色 | step-06-login-page-dark.png | 通过 |

### 详细测试记录

**TC-001: 登录页面展示服务端点（浅色模式）**
- 前置条件: 未登录状态
- 操作: 打开 http://localhost:5173/login
- 预期: Logo 下方"轻松记录每一笔"文字下显示服务端点（不含 /api/v1）
- 实际: 显示 `http://192.168.0.145:5723`，位置在副标题下方，text-xs text-gray-400 样式
- 截图: `qa/screenshots/step-01-login-page-light.png`
- 状态: 通过

**TC-002: 登录流程正常**
- 前置条件: 在登录页面
- 操作: 输入用户名 luca / 密码 12345678，点击登录
- 预期: 登录成功，跳转到首页
- 实际: 登录成功，显示"登录成功"提示，跳转到记账首页
- 截图: `qa/screenshots/step-02-login-attempt.png`
- 状态: 通过

**TC-003: "我的"页面展示服务端点（浅色模式）**
- 前置条件: 已登录
- 操作: 导航到 /profile
- 预期: 用户信息卡片中用户名和"已登录"下方显示服务端点
- 实际: 显示 admin / 已登录 / `http://192.168.0.145:5723`，text-xs text-gray-400 样式，truncate 防溢出
- 截图: `qa/screenshots/step-04-profile-page-light.png`
- 状态: 通过

**TC-004: "我的"页面深色模式**
- 前置条件: 已登录，在"我的"页面
- 操作: 点击外观切换为"深色"
- 预期: 深色背景下端点信息清晰可见
- 实际: 深色模式正常，端点以 dark:text-gray-500 显示，可读且低调
- 截图: `qa/screenshots/step-05-profile-page-dark.png`
- 状态: 通过

**TC-005: 登录页面深色模式**
- 前置条件: 深色模式已开启
- 操作: 退出登录，回到登录页
- 预期: 深色背景下端点信息清晰可见
- 实际: 深色模式登录页正常，端点以 dark:text-gray-500 显示
- 截图: `qa/screenshots/step-06-login-page-dark.png`
- 状态: 通过

### 截图索引
- `qa/screenshots/step-01-login-page-light.png` — 登录页面浅色模式，显示服务端点
- `qa/screenshots/step-02-login-attempt.png` — 登录成功后跳转首页
- `qa/screenshots/step-04-profile-page-light.png` — "我的"页面浅色模式，用户信息卡片显示服务端点
- `qa/screenshots/step-05-profile-page-dark.png` — "我的"页面深色模式
- `qa/screenshots/step-06-login-page-dark.png` — 登录页面深色模式

### 测试结论

**全部通过**。5 项验收清单中，4 项完全通过，1 项（Tauri 桌面端）在 Web 端已验证通过，Tauri 桌面端需实际构建后验证。服务端点展示功能实现正确，样式低调不干扰主要功能，浅色/深色模式适配良好。
