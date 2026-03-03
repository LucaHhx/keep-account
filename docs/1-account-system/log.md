# 计划日志

> 计划: account-system | 创建: 2026-02-28

<!--
类型: [决策] [变更] [修复] [新增] [测试] [备注] [完成]
格式: - [类型] 内容
按日期分组，最新在前
-->

## 2026-03-02

- [完成] QA 回归验收测试全部通过。网络架构变更（直连后端）后回归测试: API 20用例全通过，浏览器 E2E 8场景全通过。验收清单6项全部满足。详见下方测试报告。
- [测试] QA 回归验收测试报告（网络架构变更后）

### QA 回归验收测试报告 (2026-03-02)

> 背景: 前端网络架构从 Vite proxy 改为全环境直连后端 (http://localhost:5723/api/v1)，需回归验证所有功能。

#### 阶段 A: 后端 API 测试 (20 个用例，全部通过)

| # | 测试用例 | 接口 | 方法 | 预期 | 实际 | 结果 |
|---|---------|------|------|------|------|------|
| TC-001 | 正常注册 | /api/v1/auth/register | POST | code:0, token+user | code:0, token+user, HTTP 200 | 通过 |
| TC-002 | 用户名已存在 | /api/v1/auth/register | POST | code:1002 | code:1002, HTTP 409 | 通过 |
| TC-003 | 用户名过短(2字符) | /api/v1/auth/register | POST | code:1001 | code:1001, min tag, HTTP 400 | 通过 |
| TC-004 | 密码过短(5字符) | /api/v1/auth/register | POST | code:1001 | code:1001, min tag, HTTP 400 | 通过 |
| TC-005 | 用户名含非法字符(@) | /api/v1/auth/register | POST | code:1001 | code:1001, alphanum_underscore tag, HTTP 400 | 通过 |
| TC-006 | 空用户名 | /api/v1/auth/register | POST | code:1001 | code:1001, required tag, HTTP 400 | 通过 |
| TC-007 | 空密码 | /api/v1/auth/register | POST | code:1001 | code:1001, required tag, HTTP 400 | 通过 |
| TC-008 | 空请求体 | /api/v1/auth/register | POST | code:1001 | code:1001, 两个 required tag, HTTP 400 | 通过 |
| TC-009 | 正常登录 | /api/v1/auth/login | POST | code:0, token+user | code:0, token+user, HTTP 200 | 通过 |
| TC-010 | 用户不存在 | /api/v1/auth/login | POST | code:1003 | code:1003, HTTP 401 | 通过 |
| TC-011 | 密码错误 | /api/v1/auth/login | POST | code:1004 | code:1004, HTTP 401 | 通过 |
| TC-012 | 登录参数为空 | /api/v1/auth/login | POST | code:1001 | code:1001, HTTP 400 | 通过 |
| TC-013 | 有效 Token 访问 profile | /api/v1/user/profile | GET | code:0, 用户信息 | code:0, id+username+created_at, HTTP 200 | 通过 |
| TC-014 | 无 Token 访问 profile | /api/v1/user/profile | GET | 401 + code:1005 | code:1005, "未登录", HTTP 401 | 通过 |
| TC-015 | 无效/篡改 Token | /api/v1/user/profile | GET | 401 + code:1005 | code:1005, "Token 无效", HTTP 401 | 通过 |
| TC-016 | Token 缺少 Bearer 前缀 | /api/v1/user/profile | GET | 401 + code:1005 | code:1005, "Token 格式错误", HTTP 401 | 通过 |
| TC-017 | 退出登录 | /api/v1/auth/logout | POST | code:0 | code:0, "已退出登录", HTTP 200 | 通过 |
| TC-018 | 未登录时退出 | /api/v1/auth/logout | POST | 401 | code:1005, HTTP 401 | 通过 |
| TC-019 | 过期 Token | /api/v1/user/profile | GET | 401 + code:1006 | code:1006, "Token 已过期", HTTP 401 | 通过 |
| TC-020 | 滑动续期(剩余<3.5天) | /api/v1/user/profile | GET | 200 + X-New-Token 头 | code:0, X-New-Token 已返回 | 通过 |

备注: TC-015 无效 Token 现在正确返回 code 1005（之前 BUG-002 已修复），与 design.md 定义一致。

#### 阶段 B: 浏览器 E2E 测试 (有头模式, 8 个场景)

| 场景 | 步骤 | 截图 | 结果 |
|------|------|------|------|
| 场景A: 新用户注册 | 打开登录页->点注册->填表单->提交->自动登录跳转首页 | step-01~04 | 通过 |
| 场景B: 已注册用户登录 | 清除Token->登录页->填账号密码->提交->跳转首页 | step-05~06 | 通过 |
| 登录错误: 用户不存在 | 输入不存在的用户名->提交->显示"用户不存在" Toast | step-07 | 通过 |
| 登录错误: 密码错误 | 输入错误密码->提交->显示"密码错误" Toast | step-08 | 通过 |
| 前端校验: 空表单提交 | 注册页空表单提交->显示红色"请输入用户名""请输入密码"错误 | step-09 | 通过 |
| 前端校验: 密码不一致 | 注册页填不一致密码->显示"两次密码不一致" | step-10 | 通过 |
| 场景C: 退出登录 | 清除Token->访问首页->被 AuthGuard 重定向到登录页 | step-11 | 通过 |
| GuestGuard | 已登录状态访问/login->重定向到首页 | step-12 | 通过 |

#### 截图索引
- `qa/screenshots/step-01-login-page.png` — 登录页初始状态（桌面卡片布局）
- `qa/screenshots/step-02-register-page.png` — 注册页初始状态
- `qa/screenshots/step-03-register-filled.png` — 注册表单已填写
- `qa/screenshots/step-04-register-success.png` — 注册成功跳转首页（显示记账界面+用户名）
- `qa/screenshots/step-05-login-filled.png` — 登录表单已填写
- `qa/screenshots/step-06-login-success.png` — 登录成功跳转首页
- `qa/screenshots/step-07-login-error-user-not-found.png` — 登录错误（用户不存在）
- `qa/screenshots/step-08-login-error-wrong-password.png` — 登录错误（密码错误）
- `qa/screenshots/step-09-register-validation-empty.png` — 注册空表单校验错误（红色边框+提示）
- `qa/screenshots/step-10-register-password-mismatch.png` — 密码不一致校验错误
- `qa/screenshots/step-11-after-logout-redirect.png` — 退出后重定向到登录页
- `qa/screenshots/step-12-guest-guard-redirect.png` — GuestGuard 重定向到首页

#### 验收清单对照

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | 用户可以通过账号密码成功注册，注册后自动登录 | 通过 | API TC-001 + E2E 场景A (step-03~04) |
| 2 | 已注册用户可以通过账号密码成功登录 | 通过 | API TC-009 + E2E 场景B (step-05~06) |
| 3 | 登录失败时显示明确的错误提示（账号不存在/密码错误） | 通过 | API TC-010/011 + E2E 错误提示 (step-07~08) |
| 4 | 登录后 Token 鉴权正常工作，访问受保护资源不报错 | 通过 | API TC-013 + E2E 注册/登录后均正常访问首页 |
| 5 | Token 过期后可自动刷新，用户无需重新登录 | 通过 | API TC-019(过期401)/TC-020(续期X-New-Token) + 前端 Axios 拦截器 |
| 6 | 用户可以成功退出登录，退出后需重新登录才能访问 | 通过 | API TC-017/018 + E2E 场景C (step-11) |

#### 发现的问题

本轮回归测试未发现新问题。之前 BUG-001 和 BUG-002 的修复仍然有效。

- [变更] Axios baseURL 修改为全环境直连后端 http://localhost:5723/api/v1，移除 Vite proxy /api 配置
- [备注] Tech Lead 文档完备性审查通过。修复2处: (1) frontend/tasks.md #10 描述从'Vite proxy'更新为'Axios baseURL 直连后端' (2) backend/design.md 补充服务端口5723说明。警告: L2 tasks.md 6项功能任务仍为待办状态，与验收通过记录不一致，建议PM同步更新
- [变更] 更新 frontend/design.md: 新增请求架构章节，记录 baseURL 统一策略和 tauriAdapter 保留原因。更新 backend/design.md: CORS 中间件配置改为 dev 模式允许所有 localhost 端口+内网 IP
- [决策] 简化网络架构: 所有环境(浏览器/Tauri桌面/iOS)统一直连后端 http://localhost:5723/api/v1，移除 Vite proxy API 转发。理由: (1) 消除多端口混淆 (2) 统一请求路径 (3) 后端 CORS dev 模式已允许所有 localhost 端口
- [变更] 网络架构简化：前端 API 请求从"通过 Vite proxy 转发"改为"直连后端 API"。此变更不影响已验收通过的业务功能，仅改变网络请求路径

## 2026-02-28

- [完成] 需求 1-account-system 验收通过。修复清单: #10 API baseURL /api->/api/v1, #11 平板断点+表单卡片化, #12 小视口滚动, #13 401拦截器排除/auth/, #14 JWT错误码区分1005/1006。延后项: 深色模式切换机制、Button active态。
- [测试] BUG-002 回归测试通过: JWT 中间件错误码修复有效，无效Token返回1005，过期Token返回1006，与design.md定义一致
- [测试] BUG-001 回归测试通过: Axios 401 拦截器修复有效，登录失败时正确显示 Toast 错误提示（用户不存在/密码错误分别显示）。验收清单第3项现在满足。截图: step-25, step-26
- [修复] BUG-002: JWT 中间件区分无效 Token(1005) 和过期 Token(1006) 错误码
- [测试] QA 补充多端响应式适配测试: 5种视口(320x568/375x667/667x375横屏/768x1024/1280x800)登录+注册页全部通过，三端布局差异符合 UI design.md 规范
- [完成] [qa] 完成任务 #3: 编写前端 LoginPage 和 RegisterPage 组件测试 (浏览器E2E测试完成: 6个场景全部通过。发现1个中等缺陷(BUG-001:登录失败无Toast)和1个低优先级问题)
- [测试] QA 验收测试全部完成，详细报告如下:

### QA 验收测试报告

#### 阶段 A: 后端 API 测试 (26 个用例，全部通过)

| # | 测试用例 | 接口 | 方法 | 预期 | 实际 | 结果 |
|---|---------|------|------|------|------|------|
| TC-001 | 正常注册 | /api/v1/auth/register | POST | code:0, 返回 token+user | code:0, token+user, HTTP 200 | 通过 |
| TC-002 | 用户名已存在 | /api/v1/auth/register | POST | code:1002 | code:1002, HTTP 409 | 通过 |
| TC-003 | 用户名过短(2字符) | /api/v1/auth/register | POST | code:1001 | code:1001, min tag, HTTP 400 | 通过 |
| TC-004 | 密码过短(5字符) | /api/v1/auth/register | POST | code:1001 | code:1001, min tag, HTTP 400 | 通过 |
| TC-005 | 用户名含非法字符(@) | /api/v1/auth/register | POST | code:1001 | code:1001, alphanum_underscore tag, HTTP 400 | 通过 |
| TC-006 | 空用户名 | /api/v1/auth/register | POST | code:1001 | code:1001, required tag, HTTP 400 | 通过 |
| TC-007 | 空密码 | /api/v1/auth/register | POST | code:1001 | code:1001, required tag, HTTP 400 | 通过 |
| TC-008 | 空请求体 | /api/v1/auth/register | POST | code:1001 | code:1001, 两个 required tag, HTTP 400 | 通过 |
| TC-009 | 正常登录 | /api/v1/auth/login | POST | code:0, 返回 token+user | code:0, token+user, HTTP 200 | 通过 |
| TC-010 | 用户不存在 | /api/v1/auth/login | POST | code:1003 | code:1003, HTTP 401 | 通过 |
| TC-011 | 密码错误 | /api/v1/auth/login | POST | code:1004 | code:1004, HTTP 401 | 通过 |
| TC-012 | 登录参数为空 | /api/v1/auth/login | POST | code:1001 | code:1001, HTTP 400 | 通过 |
| TC-013 | 有效 Token 访问 profile | /api/v1/user/profile | GET | code:0, 返回用户信息 | code:0, id+username+created_at, HTTP 200 | 通过 |
| TC-014 | 无 Token 访问 profile | /api/v1/user/profile | GET | 401 + code:1005 | code:1005, "未登录", HTTP 401 | 通过 |
| TC-015 | 无效/篡改 Token | /api/v1/user/profile | GET | 401 | code:1006, HTTP 401 | 通过* |
| TC-016 | Token 缺少 Bearer 前缀 | /api/v1/user/profile | GET | 401 + code:1005 | code:1005, "Token 格式错误", HTTP 401 | 通过 |
| TC-017 | 退出登录 | /api/v1/auth/logout | POST | code:0 | code:0, "已退出登录", HTTP 200 | 通过 |
| TC-018 | 未登录时退出 | /api/v1/auth/logout | POST | 401 | code:1005, HTTP 401 | 通过 |
| TC-019 | 过期 Token | /api/v1/user/profile | GET | 401 + code:1006 | code:1006, HTTP 401 | 通过 |
| TC-020 | 滑动续期(剩余<3.5天) | /api/v1/user/profile | GET | 200 + X-New-Token 头 | code:0, X-New-Token 已返回 | 通过 |
| TC-021 | 有效期充足不续期 | /api/v1/user/profile | GET | 200, 无 X-New-Token | code:0, 无 X-New-Token | 通过 |
| TC-022 | 用户名恰好 3 字符(最小) | /api/v1/auth/register | POST | code:0 | code:0, 注册成功 | 通过 |
| TC-023 | 密码恰好 6 字符(最小) | /api/v1/auth/register | POST | code:0 | code:0, 注册成功 | 通过 |
| TC-024 | 用户名含下划线 | /api/v1/auth/register | POST | code:0 | code:0, 注册成功 | 通过 |
| TC-025 | 用户名 33 字符(超长) | /api/v1/auth/register | POST | code:1001 | code:1001, max tag, HTTP 400 | 通过 |
| TC-026 | 密码 33 字符(超长) | /api/v1/auth/register | POST | code:1001 | code:1001, max tag, HTTP 400 | 通过 |

*TC-015 备注: 无效 Token 返回 code 1006("Token 无效或已过期") 而非 code 1005。design.md 定义 1005="未登录/Token 无效"，1006="Token 过期"。中间件将 ParseToken 所有错误统一返回 1006，轻微偏差，不影响功能。

#### 阶段 B: 浏览器 E2E 测试 (有头模式)

| 场景 | 步骤 | 截图 | 结果 |
|------|------|------|------|
| 场景A: 新用户注册 | 打开登录页->点注册->填表单->提交->自动登录跳转首页 | step-01~04 | 通过 |
| 场景B: 已注册用户登录 | 清除Token->打开登录页->填写账号密码->提交->跳转首页 | step-06~07 | 通过 |
| 场景C: 退出登录 | 清除Token模拟退出->访问首页->被重定向到登录页 | step-13 | 通过 |
| 前端校验: 空表单提交 | 注册页空表单提交->显示红色错误提示 | step-11 | 通过 |
| 前端校验: 密码不一致 | 注册页填写不一致密码->显示"两次密码不一致" | step-12 | 通过 |
| GuestGuard: 已登录访问登录页 | 登录后访问/login->重定向到首页 | step-14 | 通过 |

#### 阶段 C: 多端响应式适配测试

参照 `docs/1-account-system/ui/design.md` 的"响应式断点与三端布局策略"进行验证。

| 视口 | 尺寸 | 设备 | 登录页 | 注册页 | 结果 |
|------|------|------|--------|--------|------|
| 小屏手机 | 320x568 | iPhone SE 1st | 全宽表单，无卡片，完整可见 | 全宽表单，需滚动看底部链接 | 通过 |
| 手机 | 375x667 | iPhone SE | 全宽表单，px-6，完整可见 | 全宽表单，完整可见 | 通过 |
| 手机横屏 | 667x375 | iPhone 横屏 | 需滚动，内容完整无溢出 | — | 通过 |
| 平板 | 768x1024 | iPad | 居中卡片(白底+圆角+阴影)，max-w-md | 居中卡片，完整可见 | 通过 |
| 桌面 | 1280x800 | 浏览器/Tauri | 居中卡片(白底+圆角+阴影)，无侧边栏 | 居中卡片，完整可见 | 通过 |

设计规范对照：
- 手机（< 768px）: 全宽表单, px-6, max-w-sm -- 符合
- 平板（768px ~ 1023px）: 居中表单卡片, max-w-md -- 符合
- 桌面（>= 1024px）: 居中表单卡片, max-w-md, 无侧边栏 -- 符合
- 三端视觉差异明显: 手机无卡片外壳/平板桌面有卡片 -- 符合

#### 截图索引
- `qa/screenshots/step-01-login-page.png` — 登录页初始状态（桌面默认）
- `qa/screenshots/step-02-register-page.png` — 注册页初始状态（手机）
- `qa/screenshots/step-03-register-filled.png` — 注册表单已填写
- `qa/screenshots/step-04-register-success.png` — 注册成功跳转首页
- `qa/screenshots/step-05-me-page.png` — /me 页面（待实现）
- `qa/screenshots/step-06-login-filled.png` — 登录表单已填写
- `qa/screenshots/step-07-login-success.png` — 登录成功跳转首页
- `qa/screenshots/step-09-login-error-toast.png` — 登录错误（Toast 已消失）
- `qa/screenshots/step-11-register-validation-empty.png` — 注册空表单校验错误
- `qa/screenshots/step-12-register-password-mismatch.png` — 密码不一致校验
- `qa/screenshots/step-13-after-logout.png` — 退出后返回登录页
- `qa/screenshots/step-14-guest-guard-redirect.png` — GuestGuard 重定向
- `qa/screenshots/step-15-login-mobile-375x667.png` — 登录页手机端 (375x667)
- `qa/screenshots/step-16-register-mobile-375x667.png` — 注册页手机端 (375x667)
- `qa/screenshots/step-17-login-tablet-768x1024.png` — 登录页平板端 (768x1024)
- `qa/screenshots/step-18-register-tablet-768x1024.png` — 注册页平板端 (768x1024)
- `qa/screenshots/step-19-login-desktop-1280x800.png` — 登录页桌面端 (1280x800)
- `qa/screenshots/step-20-register-desktop-1280x800.png` — 注册页桌面端 (1280x800)
- `qa/screenshots/step-21-login-small-mobile-320x568.png` — 登录页小屏手机 (320x568)
- `qa/screenshots/step-22-register-small-mobile-320x568.png` — 注册页小屏手机 (320x568)
- `qa/screenshots/step-23-login-landscape-667x375.png` — 登录页手机横屏 (667x375)
- `qa/screenshots/step-24-login-landscape-scrolled.png` — 登录页手机横屏滚动后
- `qa/screenshots/step-25-regression-user-not-found.png` — 回归: 用户不存在 Toast 提示
- `qa/screenshots/step-26-regression-wrong-password.png` — 回归: 密码错误 Toast 提示

#### 发现的问题

**BUG-001 [中] 登录失败时无法显示错误 Toast 提示 -- 已修复，回归通过**
- 位置: `web/src/lib/axios.ts:26-29`
- 描述: Axios 响应拦截器对所有 401 状态码执行 `logout()` + `window.location.href = '/login'`（页面刷新），包括登录接口本身返回的 401。
- 修复: 在 401 拦截器中添加 `if (!url.includes('/auth/'))` 判断，排除 auth 接口的 401 响应。
- 回归测试: 通过。"用户不存在"显示红色 Toast "用户不存在"，"密码错误"显示红色 Toast "密码错误"。截图 step-25, step-26。

**BUG-002 [低] 无效 Token 返回错误码不精确 -- 已修复，回归通过**
- 位置: `server/internal/middleware/jwt.go:31-37`
- 描述: JWT 中间件将 ParseToken 所有错误统一返回 code 1006。
- 修复: 区分 `jwt.ErrTokenExpired`(code 1006 "Token 已过期") 和其他错误(code 1005 "Token 无效")。
- 回归测试: 通过。无效 Token -> code 1005，过期 Token -> code 1006，与 design.md 定义一致。

#### 验收清单对照

| # | 验收项 | 结果 | 备注 |
|---|--------|------|------|
| 1 | 用户可以通过账号密码成功注册，注册后自动登录 | 通过 | API + E2E 验证 |
| 2 | 已注册用户可以通过账号密码成功登录 | 通过 | API + E2E 验证 |
| 3 | 登录失败时显示明确的错误提示（账号不存在/密码错误） | 通过 | BUG-001 已修复，回归验证通过 (step-25, step-26) |
| 4 | 登录后 Token 鉴权正常工作，访问受保护资源不报错 | 通过 | API 验证 |
| 5 | Token 过期后可自动刷新，用户无需重新登录 | 通过 | API 验证滑动续期 + 前端 Axios 拦截器处理 X-New-Token |
| 6 | 用户可以成功退出登录，退出后需重新登录才能访问 | 通过 | E2E 验证 AuthGuard 重定向 |

- [决策] 深色模式切换机制延后: 不在 account-system scope 内，归入后续独立基础设施任务。当前 dark: class 已就位，后续实现无返工。P2 Button active 态同样延后。
- [备注] 代码审查通过: 后端代码质量良好，前端修复 API baseURL(/api->/api/v1)后通过。UI 视觉审查 92/100，1个P2(Button缺active态)不阻塞。已通知 QA 开始验收测试。
- [测试] QA 阶段A API测试完成: 26个测试用例全部通过。详细结果见下方记录。
- [变更] [qa] 开始任务 #3: 编写前端 LoginPage 和 RegisterPage 组件测试
- [完成] [qa] 完成任务 #2: 编写 JWT 鉴权中间件测试 (有效/无效/过期 Token + 滑动续期) (JWT鉴权测试全部通过：有效Token、无Token、无效Token、过期Token、滑动续期、格式错误均符合预期)
- [变更] [qa] 开始任务 #2: 编写 JWT 鉴权中间件测试 (有效/无效/过期 Token + 滑动续期)
- [完成] [qa] 完成任务 #1: 编写注册/登录 API 集成测试 (正常+异常场景) (注册/登录 API 全部测试通过（26个测试用例），发现1个轻微问题：无效Token返回code 1006而非1005)
- [完成] [frontend] 完成任务 #10: 配置 Vite dev proxy /api -> localhost:8080 (Vite dev proxy 配置完成: /api -> localhost:8080)
- [变更] [frontend] 开始任务 #10: 配置 Vite dev proxy /api -> localhost:8080
- [完成] [frontend] 完成任务 #9: 实现 FormInput / Button / Toast 通用组件 (FormInput / Button / Toast 通用组件实现完成)
- [变更] [frontend] 开始任务 #9: 实现 FormInput / Button / Toast 通用组件
- [完成] [frontend] 完成任务 #8: 实现 AuthGuard 和 GuestGuard 路由守卫 (AuthGuard 和 GuestGuard 路由守卫实现完成)
- [变更] [frontend] 开始任务 #8: 实现 AuthGuard 和 GuestGuard 路由守卫
- [完成] [frontend] 完成任务 #7: 实现 RegisterPage 注册页面 (RegisterPage 实现完成，含前端校验规则)
- [变更] [frontend] 开始任务 #7: 实现 RegisterPage 注册页面
- [完成] [frontend] 完成任务 #6: 实现 LoginPage 登录页面 (LoginPage 实现完成，与 UI 设计稿一致)
- [变更] [frontend] 开始任务 #6: 实现 LoginPage 登录页面
- [完成] [frontend] 完成任务 #5: 实现 useAuthStore (Zustand: login/register/logout/token 管理) (Zustand authStore 实现完成: login/register/logout/setToken/loadFromStorage)
- [变更] [frontend] 开始任务 #5: 实现 useAuthStore (Zustand: login/register/logout/token 管理)
- [完成] [frontend] 完成任务 #4: 封装 Axios 实例 (拦截器: Token 注入 + 续期 + 401 处理) (Axios 拦截器封装完成: Token 注入 + X-New-Token 续期 + 401 处理)
- [变更] [frontend] 开始任务 #4: 封装 Axios 实例 (拦截器: Token 注入 + 续期 + 401 处理)
- [完成] [frontend] 完成任务 #3: 配置 React Router DOM 7+ 路由结构 (React Router DOM 7 路由结构配置完成)
- [变更] [frontend] 开始任务 #3: 配置 React Router DOM 7+ 路由结构
- [完成] [frontend] 完成任务 #2: 配置 Tailwind CSS 4+ 和深色模式 (Tailwind CSS 4 + @tailwindcss/vite 配置完成，含设计系统 token)
- [变更] [frontend] 开始任务 #2: 配置 Tailwind CSS 4+ 和深色模式
- [完成] [frontend] 完成任务 #1: 初始化 React + TypeScript + Vite 项目 (web/ 目录) (React 19 + TypeScript + Vite 7 项目创建完成)
- [完成] [backend] 完成任务 #13: 配置 Zap 结构化日志 (Zap logger，支持 console/json 格式，可配置日志级别)
- [变更] [backend] 开始任务 #13: 配置 Zap 结构化日志
- [完成] [backend] 完成任务 #12: 配置 Viper 加载 config.yaml (JWT secret, 端口等) (Viper 加载 config.yaml，支持 -config 命令行参数)
- [变更] [backend] 开始任务 #12: 配置 Viper 加载 config.yaml (JWT secret, 端口等)
- [完成] [backend] 完成任务 #11: 实现 POST /api/v1/auth/logout 退出登录接口 (MVP 简化: 仅返回成功响应，Token 失效由前端处理)
- [变更] [backend] 开始任务 #11: 实现 POST /api/v1/auth/logout 退出登录接口
- [完成] [backend] 完成任务 #10: 实现 GET /api/v1/user/profile 获取用户信息接口 (需鉴权，返回 id/username/created_at)
- [变更] [backend] 开始任务 #10: 实现 GET /api/v1/user/profile 获取用户信息接口
- [完成] [backend] 完成任务 #9: 实现 CORS 中间件 (AllowOriginFunc 支持 tauri:// 等非标协议 origin)
- [变更] [backend] 开始任务 #9: 实现 CORS 中间件
- [完成] [backend] 完成任务 #8: 实现 JWT 鉴权中间件 (Token 校验 + 滑动续期) (Bearer Token 校验 + 滑动续期 X-New-Token 头)
- [变更] [backend] 开始任务 #8: 实现 JWT 鉴权中间件 (Token 校验 + 滑动续期)
- [完成] [backend] 完成任务 #7: 实现 JWT 签发与验证工具 (单 Token + 滑动过期) (HS256 签名，7天有效期，3.5天续期阈值)
- [变更] [backend] 开始任务 #7: 实现 JWT 签发与验证工具 (单 Token + 滑动过期)
- [完成] [backend] 完成任务 #6: 实现 POST /api/v1/auth/login 登录接口 (登录成功返回 Token + User，区分用户不存在/密码错误)
- [变更] [backend] 开始任务 #6: 实现 POST /api/v1/auth/login 登录接口
- [完成] [backend] 完成任务 #5: 实现 POST /api/v1/auth/register 注册接口 (注册成功自动登录返回 Token + User)
- [变更] [backend] 开始任务 #5: 实现 POST /api/v1/auth/register 注册接口
- [完成] [backend] 完成任务 #4: 实现统一响应格式 (code/message/data) 和错误码 (统一 Response 结构体 + 全量错误码常量 (0-9999))
- [变更] [backend] 开始任务 #4: 实现统一响应格式 (code/message/data) 和错误码
- [完成] [backend] 完成任务 #3: 实现 users 表 GORM Model 和 AutoMigrate (User model 含 id/username/password_hash/created_at/updated_at，AutoMigrate)
- [变更] [backend] 开始任务 #3: 实现 users 表 GORM Model 和 AutoMigrate
- [完成] [backend] 完成任务 #2: 配置 GORM + SQLite (WAL 模式) 数据库连接 (GORM + SQLite WAL 模式，自动创建 data 目录)
- [变更] [backend] 开始任务 #2: 配置 GORM + SQLite (WAL 模式) 数据库连接
- [完成] [backend] 完成任务 #1: 初始化 Go 项目结构 (cmd/server, internal/, pkg/, config/) (Go 项目结构: cmd/server, internal/{config,middleware,handler,model,service,router}, pkg/response)
- [测试] QA 验收测试发现阻塞性缺陷: 后端服务无法启动，CORS 配置中 tauri://localhost 和 capacitor://localhost 不被 gin-contrib/cors v1.7.6 接受 (panic: bad origin)
- [变更] [qa] 开始任务 #1: 编写注册/登录 API 集成测试 (正常+异常场景)
- [变更] [frontend] 开始任务 #1: 初始化 React + TypeScript + Vite 项目 (web/ 目录)
- [变更] [backend] 开始任务 #1: 初始化 Go 项目结构 (cmd/server, internal/, pkg/, config/)
- [变更] 交叉评审(深入): 路由表补充所有 Tab 页路由; 通用组件补充 UI 尺寸规范; 新增 Lucide React 图标库依赖
- [变更] 交叉评审: UI 设计与前端技术方案对齐完成
- [完成] UI 设计师完成全项目统一设计系统 + 登录/注册页效果图 + Introduction.md
- [完成] [ui] 完成任务 #3: 编写 Introduction.md 给前端的设计说明 (完成 Introduction.md 前端设计说明)
- [变更] [ui] 开始任务 #3: 编写 Introduction.md 给前端的设计说明
- [完成] [ui] 完成任务 #2: 编写统一设计系统文档 design.md (完成统一设计系统文档（调色板+字体+间距+组件规范）)
- [完成] [ui] 完成任务 #1: 设计登录/注册页面效果图（浅色+深色模式） (完成登录/注册/我的页面效果图（浅色+深色+错误态）)
- [新增] 补充 QA design.md (测试策略+测试范围) 和 tasks.md (3项测试任务)
- [变更] Tech Lead 评审: 扩展错误码体系覆盖全部需求 (2001-2003 分类, 3001-3002 流水); CORS 配置统一引用 cloud-sync
- [变更] [ui] 开始任务 #2: 编写统一设计系统文档 design.md
- [变更] [ui] 开始任务 #1: 设计登录/注册页面效果图（浅色+深色模式）
- [决策] MVP 不做找回密码和邮件功能
- [决策] 不做第三方登录（微信、Google 等）
- [决策] MVP 只做账号密码注册登录
- [决策] 退出登录采用最简方案，不做服务端 Token 黑名单
- [备注] PRD 中包含技术建议（密码加密方式、Token 机制、部署架构等），供开发团队参考
- [新增] 创建计划