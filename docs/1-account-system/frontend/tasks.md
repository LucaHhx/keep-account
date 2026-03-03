# 任务清单

> 计划: account-system/frontend | 创建: 2026-02-28

| # | 任务 | 状态 | 开始日期 | 完成日期 | 备注 |
|---|------|------|----------|----------|------|
| 1 | 初始化 React + TypeScript + Vite 项目 (web/ 目录) | 已完成 | 2026-02-28 | 2026-02-28 | React 19 + TypeScript + Vite 7 项目创建完成 |
| 2 | 配置 Tailwind CSS 4+ 和深色模式 | 已完成 | 2026-02-28 | 2026-02-28 | Tailwind CSS 4 + @tailwindcss/vite 配置完成，含设计系统 token |
| 3 | 配置 React Router DOM 7+ 路由结构 | 已完成 | 2026-02-28 | 2026-02-28 | React Router DOM 7 路由结构配置完成 |
| 4 | 封装 Axios 实例 (拦截器: Token 注入 + 续期 + 401 处理) | 已完成 | 2026-02-28 | 2026-02-28 | Axios 拦截器封装完成: Token 注入 + X-New-Token 续期 + 401 处理 |
| 5 | 实现 useAuthStore (Zustand: login/register/logout/token 管理) | 已完成 | 2026-02-28 | 2026-02-28 | Zustand authStore 实现完成: login/register/logout/setToken/loadFromStorage |
| 6 | 实现 LoginPage 登录页面 | 已完成 | 2026-02-28 | 2026-02-28 | LoginPage 实现完成，与 UI 设计稿一致 |
| 7 | 实现 RegisterPage 注册页面 | 已完成 | 2026-02-28 | 2026-02-28 | RegisterPage 实现完成，含前端校验规则 |
| 8 | 实现 AuthGuard 和 GuestGuard 路由守卫 | 已完成 | 2026-02-28 | 2026-02-28 | AuthGuard 和 GuestGuard 路由守卫实现完成 |
| 9 | 实现 FormInput / Button / Toast 通用组件 | 已完成 | 2026-02-28 | 2026-02-28 | FormInput / Button / Toast 通用组件实现完成 |
| 10 | 配置 Axios baseURL 直连后端 (http://localhost:5723/api/v1) | 已完成 | 2026-02-28 | 2026-02-28 | 全环境直连后端，移除 Vite proxy，详见 log.md 2026-03-02 决策 |