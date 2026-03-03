# 计划日志

> 计划: cloud-sync | 创建: 2026-02-28

<!--
类型: [决策] [变更] [修复] [新增] [测试] [备注] [完成]
格式: - [类型] 内容
按日期分组，最新在前
-->

## 2026-03-02

- [变更] 网络架构简化：前端所有环境（Web / Tauri 桌面 / 移动端）统一直连后端 API（http://localhost:5723/api/v1），移除 Vite proxy 中间层。后端 dev 模式允许所有跨域请求。消除了 5173/5175 vs 5723 多端口混淆问题，解决了此前因 proxy 层导致的多个 P0/P1 缺陷（FIX-5、FIX-7、FIX-8）
- [决策] 前端不再依赖 Vite proxy 转发 API 请求，所有请求直接发往后端地址
- [决策] 后端地址通过 .env 文件统一配置，不同环境（开发/生产/移动端）只需修改 .env 即可切换，消除了此前 isTauri/isDev/TAURI_DEV_HOST 等多分支判断逻辑

## 2026-02-28

- [测试] QA 验收测试全部通过: 后端集成测试 8/8 (health check 2 + CORS 6), 前端组件测试 14/14 (theme store 7 + ThemeToggle 4 + NetworkBanner 3), 总计 22/22 通过
- [完成] [qa] 完成任务 #2: 编写前端主题切换和断网提示组件测试 (14项前端组件测试全部通过(theme store 7项+ThemeToggle 4项+NetworkBanner 3项))
- [变更] [qa] 开始任务 #2: 编写前端主题切换和断网提示组件测试
- [完成] [qa] 完成任务 #1: 编写健康检查 API 和 CORS 配置集成测试 (8项集成测试全部通过(健康检查2项+CORS 6项))
- [变更] [qa] 开始任务 #1: 编写健康检查 API 和 CORS 配置集成测试
- [完成] [frontend] 完成任务 #9: 配置 Capacitor 移动端壳层 (基础 Capacitor 配置，需安装 @capacitor/cli 和 @capacitor/core 后初始化 iOS/Android 平台)
- [变更] [frontend] 开始任务 #9: 配置 Capacitor 移动端壳层
- [完成] [frontend] 完成任务 #8: 配置 Tauri 2 桌面应用壳层 (基础 Tauri 2 框架配置，需安装 Rust 和 Tauri CLI 后才能构建)
- [变更] [frontend] 开始任务 #8: 配置 Tauri 2 桌面应用壳层
- [完成] [frontend] 完成任务 #7: 配置 API 基础地址环境变量 (dev/production)
- [变更] [frontend] 开始任务 #7: 配置 API 基础地址环境变量 (dev/production)
- [完成] [frontend] 完成任务 #5: 实现 BottomNav 移动端底部导航组件
- [完成] [frontend] 完成任务 #4: 实现 AppShell 应用外壳 (响应式布局+Tab导航)
- [变更] [frontend] 开始任务 #5: 实现 BottomNav 移动端底部导航组件
- [变更] [frontend] 开始任务 #4: 实现 AppShell 应用外壳 (响应式布局+Tab导航)
- [完成] [frontend] 完成任务 #3: 实现 ProfilePage 我的页面 (用户信息+分类管理入口+主题+退出)
- [变更] [frontend] 开始任务 #3: 实现 ProfilePage 我的页面 (用户信息+分类管理入口+主题+退出)
- [完成] [frontend] 完成任务 #6: 实现 ThemeToggle 主题切换组件
- [完成] [backend] 完成任务 #3: 配置 SQLite WAL 模式和 busy_timeout (在 SQLite DSN 中添加 _busy_timeout=5000，避免并发写锁立即报错)
- [变更] [frontend] 开始任务 #6: 实现 ThemeToggle 主题切换组件
- [完成] [frontend] 完成任务 #2: 实现网络状态检测和 NetworkBanner 断网提示组件
- [变更] [backend] 开始任务 #3: 配置 SQLite WAL 模式和 busy_timeout
- [完成] [backend] 完成任务 #2: 配置 CORS 支持 Web/Tauri/Capacitor 多端 origin (补充 http://localhost (Capacitor Android origin) 到 CORS 白名单)
- [变更] [frontend] 开始任务 #2: 实现网络状态检测和 NetworkBanner 断网提示组件
- [完成] [frontend] 完成任务 #1: 实现 useThemeStore (Zustand: 浅色/深色/系统主题切换)
- [变更] [frontend] 开始任务 #1: 实现 useThemeStore (Zustand: 浅色/深色/系统主题切换)
- [变更] [backend] 开始任务 #2: 配置 CORS 支持 Web/Tauri/Capacitor 多端 origin
- [完成] [backend] 完成任务 #1: 实现 GET /api/v1/health 健康检查接口 (新增 handler/health.go，在 router.go 中注册 GET /api/v1/health（无需鉴权）)
- [变更] [backend] 开始任务 #1: 实现 GET /api/v1/health 健康检查接口
- [变更] 文档清理: frontend/design.md 修正侧边栏宽度为 224px (w-56), 与 UI 设计系统对齐
- [变更] 交叉评审(深入): 修正主题切换实现方式描述, 移除 data-theme 引用, 统一为 html class 切换
- [变更] 交叉评审: 响应式断点对齐 UI 设计 (<768/768-1023/>=1024); 路由 /profile 改为 /me; darkMode 配置统一为 class 模式
- [新增] 补充 QA design.md (测试策略+测试范围) 和 tasks.md (2项测试任务)
- [决策] MVP 不做离线缓存，要求联网使用，数据通过 API 实时读写
- [决策] 不做离线同步队列和冲突处理机制
- [决策] 数据一致性由服务端单一数据源保证
- [决策] 必须支持浅色和深色两种主题
- [决策] 主题偏好不同步到服务端，仅存本地
- [备注] PRD 中包含离线缓存、同步队列、冲突处理等技术建议，供后续迭代参考
- [备注] PRD 中包含技术建议（状态管理、API 协议、数据库、多端框架、CORS 配置等），供开发团队参考
- [新增] 创建计划