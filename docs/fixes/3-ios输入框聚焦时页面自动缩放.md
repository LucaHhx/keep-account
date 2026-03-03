# FIX-3: iOS输入框聚焦时页面自动缩放

> 日期: 2026-03-02 | 状态: 已修复 | 严重程度: P1

## 现象

iOS App 登录页初始布局正常，但点击输入框（用户名/密码）时页面会自动放大，导致布局错乱，且放大后无法恢复。

## 根因分析

iOS Safari/WKWebView 的默认行为：当 `<input>` 元素的 `font-size < 16px` 时，聚焦该输入框会自动触发页面缩放（zoom），以便用户看清输入内容。

项目使用 Tailwind CSS 默认字号（14px），低于 iOS 的 16px 阈值，因此每次聚焦输入框都会触发缩放。

viewport meta 标签缺少 `maximum-scale=1.0` 和 `user-scalable=no` 限制。

## 修复方案

在 `index.html` 的 viewport meta 中禁用用户缩放：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

对于原生 App 体验，禁用页面缩放是标准做法（原生 iOS App 本身也不支持双指缩放）。

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `web/index.html` | viewport meta 增加 `maximum-scale=1.0, user-scalable=no` |

## 验收标准

- [x] 点击输入框不触发页面缩放
- [x] 输入内容时页面保持原始布局
- [x] 双指手势不会缩放页面
