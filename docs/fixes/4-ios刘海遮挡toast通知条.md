# FIX-4: iOS刘海遮挡Toast通知条

> 日期: 2026-03-02 | 状态: 已修复 | 严重程度: P1

## 现象

在 iPhone 刘海屏/灵动岛机型（如 iPhone 14 Pro、iPhone 15、iPhone 17 Pro 等）上，顶部通知提示条（Toast，如红色的"登录失败"提示）紧贴屏幕最上方显示，文字被刘海/灵动岛/状态栏遮挡，无法完整阅读。

## 根因分析

`web/src/components/Toast.tsx` 使用 Tailwind 的 `fixed top-4` 定位，即距屏幕顶部固定 16px（1rem）。在 iPhone 刘海/灵动岛机型上，`safe-area-inset-top` 约为 47-59px，16px 的偏移远不足以避开安全区，导致通知条被状态栏和刘海遮挡。

## 修复方案

将 Toast 组件的顶部定位从固定 `top-4`（16px）改为动态计算 `calc(1rem + env(safe-area-inset-top))`：

- 使用 Tailwind 任意值语法 `top-[calc(1rem+env(safe-area-inset-top))]` 替代原 `top-4`
- `env(safe-area-inset-top)` 在有安全区的设备上返回实际安全区高度，无安全区时为 0
- 加上 `1rem` 保持原有的视觉间距
- `index.html` 已配置 `viewport-fit=cover`，确保 `env()` 正常工作

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `web/src/components/Toast.tsx` | 将 `top-4` class 替换为 `top-[calc(1rem+env(safe-area-inset-top))]` |

## 验收标准

- [x] iPhone 刘海屏/灵动岛机型上，Toast 通知条完整显示在安全区内，不被刘海/状态栏遮挡
- [x] 桌面端/无安全区设备上，Toast 位置与修复前一致（距顶部 1rem）
- [x] 横竖屏切换时通知条位置正确
- [x] Toast 的出现/消失动画（translate-y + opacity）不受影响
- [x] TypeScript 编译通过，无新增错误
