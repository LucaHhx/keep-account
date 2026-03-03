# FIX-5: iOS-dev模式登录请求body丢失导致EOF

> 日期: 2026-03-02 | 状态: 已修复 | 严重程度: P1

## 现象

使用 `npm run tauri:ios-dev` 启动 iOS 开发模式后，登录请求返回"参数校验失败：EOF"，无法连接服务器完成登录。

## 根因分析

iOS WKWebView 中 POST 请求经 Vite proxy 转发时 request body 丢失。原因链：

1. `.env.development` 中 `VITE_API_BASE_URL` 为空
2. `axios.ts` 在 Tauri + dev 模式下（`isTauri && isDev`）baseURL 取值 `/api/v1`（相对路径），依赖 Vite proxy 转发到 `localhost:5723`
3. iOS WKWebView 的 POST body 在经过 Vite dev server proxy 转发后被丢弃
4. 后端 `gin.ShouldBindJSON` 读到空 body，`json.Decoder` 返回 `io.EOF`，拼接成 "参数校验失败: EOF"

## 修复方案

利用 Tauri 自动注入的 `TAURI_DEV_HOST` 环境变量（仅 `tauri ios dev` / `tauri android dev` 时设置为宿主机局域网 IP），让移动端 dev 模式绕过 Vite proxy 直连后端：

1. `vite.config.ts` 中通过 `define` 将 `TAURI_DEV_HOST` 注入为编译时常量 `__TAURI_DEV_HOST__`
2. `axios.ts` 新增分支：当 `isTauri && isDev && __TAURI_DEV_HOST__` 为真时，baseURL 使用 `http://<宿主机IP>:5723/api/v1` 直连后端

修复后请求链路：
- 桌面 dev：`/api/v1` → Vite proxy → localhost:5723（不变）
- iOS/Android dev：`http://<Mac_IP>:5723/api/v1` → 直连后端（修复）
- 生产 build：`http://localhost:5723/api/v1` → 直连（不变）

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `web/vite.config.ts` | 添加 define 注入 TAURI_DEV_HOST 为编译时常量 |
| `web/src/lib/axios.ts` | 新增移动端 dev 分支，检测 TAURI_DEV_HOST 时直连后端 |

## 验收标准

- [x] `npm run tauri:ios-dev` 启动后登录请求正常到达后端，不再返回 EOF
- [x] 桌面端 `tauri dev` 不受影响，仍通过 Vite proxy
- [x] 生产 build 行为不变
- [x] TypeScript 编译通过
