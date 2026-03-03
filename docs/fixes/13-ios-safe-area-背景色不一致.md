# FIX-13: iOS Safe Area 背景色不一致

> 日期: 2026-03-03 | 状态: 已修复 | 严重程度: P1

## 现象

在 iPhone（带刘海/灵动岛）上，页面顶部状态栏区域和底部 Home Indicator 区域出现与页面背景不一致的空白条：
1. 顶部：状态栏下方到内容之间有白色/浅色空白
2. 底部：TabBar 下方到屏幕底部有颜色不一致的条带

## 根因分析

1. **`html` 元素无背景色**：浏览器默认白色背景，iOS safe area 区域（状态栏、Home Indicator 后方）透出白底
2. **底部 safe area padding 位置错误**：`pb-[var(--safe-bottom)]` 放在根容器上（背景 `gray-50`/`gray-900`），而 TabBar 背景是 `white`/`gray-800`，导致 TabBar 下方的 padding 区域颜色与 TabBar 不一致

## 修复方案

1. 给 `html` 元素设置与 app 一致的背景色（light: `gray-50`, dark: `gray-900`），消除白色底色
2. 将底部 `pb-[var(--safe-bottom)]` 从根容器移至 TabBar，让 TabBar 背景色自然延伸到屏幕底部

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `web/src/index.css` | 给 `html` 和 `html:where(.dark)` 添加背景色 |
| `web/src/components/AppLayout.tsx` | 根容器移除 `pb-[var(--safe-bottom)]`，TabBar 添加 `pb-[var(--safe-bottom)]` |

## 验收标准

- [ ] iOS 顶部状态栏/灵动岛区域背景色与页面一致，无白色空白
- [ ] iOS 底部 Home Indicator 区域背景色与 TabBar 一致，无色差
- [ ] 深色模式下同样无色差
- [ ] 桌面端布局不受影响
