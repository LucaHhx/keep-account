# FIX-2: iOS登录页异常滚动和底部空白

> 日期: 2026-03-02 | 状态: 已修复 | 严重程度: P1

## 现象

iOS App（真机/模拟器）登录页右侧出现细滚动条，页面可上下滑动一小段，底部露出空白区域并有回弹效果。实际内容未超出屏幕。

## 根因分析

两个问题叠加：

1. **`min-h-screen` (100vh) 在 iOS WKWebView 上不准确** — `100vh` 包含安全区域外的空间，容器高度 > 实际可视区域，导致溢出几个像素
2. **`overflow-y-auto` 启用了滚动** — 即使内容未溢出，iOS 的弹性回弹效果仍然生效
3. **body 层级无 overflow 限制** — iOS WKWebView 默认允许 body 弹性滚动

## 修复方案

三层防护：

1. **全局层**: `html, body` 设置 `overflow: hidden; overscroll-behavior: none`，`#root` 设置 `overflow: hidden`
2. **页面层**: 登录/注册页使用 `position: fixed; inset: 0` 替代任何基于百分比/vh 的高度，直接钉住视口
3. **安全区**: 通过 `pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]` 处理刘海/底部

同步将 AppLayout 的 `h-screen` 也改为 `fixed inset-0`。

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `web/src/index.css` | html/body/root 三层 `overflow: hidden` + `overscroll-behavior: none` |
| `web/src/pages/LoginPage.tsx` | 外层容器 `min-h-screen overflow-y-auto` → `fixed inset-0 overflow-hidden` + safe-area padding |
| `web/src/pages/RegisterPage.tsx` | 同 LoginPage |
| `web/src/components/AppLayout.tsx` | `h-screen` → `fixed inset-0` |

## 验收标准

- [x] 无滚动条显示
- [x] 手势上下滑动页面不滚动
- [x] 底部无空白条
- [x] safe-area 正常（刘海/底部指示条不遮挡内容）
