# FIX-7: iOS 登录 POST body 丢失

> 日期: 2026-03-02 | 状态: 已修复 | 严重程度: P0

## 现象

iOS 应用启动后无法登录。后端 API 日志显示：
```
POST /api/v1/auth/login 400
Response: {"code":1001,"message":"参数校验失败: EOF","data":null}
```
请求体为空（EOF），后端无法解析登录参数。

## 根因分析

Tauri v2 在 iOS 上使用 WKWebView，其 `WKURLSchemeHandler` 存在已知 Apple WebKit bug：
通过自定义 URL scheme（`tauri://`）发出的 POST 请求，请求体会被 WKWebView 丢弃。

前端使用 Axios（底层用 XMLHttpRequest）发送 POST 请求时，请求经过 WKWebView 网络层，
body 被丢弃，后端收到空 body 报 EOF 错误。

## 修复方案

引入 Tauri 官方 `@tauri-apps/plugin-http` 插件，在 Tauri 环境下通过原生网络栈
（iOS: NSURLSession, Android: OkHttp）发送 HTTP 请求，完全绕过 WKWebView 网络层。

为 Axios 编写自定义 `tauriAdapter`，在 Tauri 环境下自动使用原生 HTTP，
非 Tauri 环境（浏览器）继续使用默认 XMLHttpRequest/Vite proxy。

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `web/src-tauri/Cargo.toml` | 添加 `tauri-plugin-http` 依赖 |
| `web/src-tauri/src/lib.rs` | 注册 HTTP 插件 |
| `web/src-tauri/capabilities/default.json` | 添加 HTTP 请求权限（允许连接后端端口） |
| `web/package.json` | 添加 `@tauri-apps/plugin-http` JS 依赖 |
| `web/src/lib/axios.ts` | 实现 `tauriAdapter`，Tauri 环境用原生 HTTP |

## 验收标准

- [x] TypeScript 编译通过
- [ ] iOS 模拟器/真机上可正常登录
- [ ] 后端 API 日志显示请求体不为空
- [ ] 桌面端登录功能不受影响
