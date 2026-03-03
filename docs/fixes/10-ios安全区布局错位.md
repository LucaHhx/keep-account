# FIX-10: iOS安全区布局错位

> 日期: 2026-03-02 | 状态: 已修复 | 严重程度: P1

## 现象

iOS 上页面顶部内容被状态栏/灵动岛遮挡，底部 TabBar 与内容区的高度计算不对，内容区被挤压/贴边。

## 根因分析

1. **AppLayout 根容器** `fixed inset-0` 铺满全屏，未添加 `env(safe-area-inset-top/bottom)` padding，导致内容延伸到状态栏和 Home Indicator 区域
2. **TabBar 底部 padding** 使用硬编码 `pb-8`（32px）模拟 safe-area，不同设备 Home Indicator 高度不同（0px~34px），导致不一致
3. **各页面顶部 padding** 使用硬编码 `pt-14`（56px）近似 safe-area-inset-top，不精确且在不同机型上偏差大

## 修复方案

**核心思路：在 AppLayout 统一处理 safe-area，子页面无需关心**

1. AppLayout 根 div 添加 `pt-[env(safe-area-inset-top)] lg:pt-0` — 移动端内容自动从安全区下方开始，桌面端不受影响
2. TabBar 底部改为 `pb-[calc(0.5rem+env(safe-area-inset-bottom))]` — 动态适配所有设备的 Home Indicator 高度
3. 移除页面中硬编码的 `pt-14`，改为正常内容间距 `pt-4`

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `web/src/components/AppLayout.tsx` | 根 div 添加 `pt-[env(safe-area-inset-top)] lg:pt-0`；TabBar `pb-8 md:pb-4` → `pb-[calc(0.5rem+env(safe-area-inset-bottom))]` |
| `web/src/pages/TransactionListPage.tsx` | 移动端标题 `pt-14` → `pt-4` |
| `web/src/pages/ReportPage.tsx` | 移动端标题 `pt-14` → `pt-4` |
| `web/src/pages/CategoryDrilldownPage.tsx` | 移动端标题 `pt-14` → `pt-4` |

## 验收标准

- [ ] iPhone 刘海机型（17 Pro 等）顶部内容不被状态栏/灵动岛遮挡
- [ ] 底部 TabBar 在安全区内，Home Indicator 区域不重叠
- [ ] 内容区高度 = 屏幕 - safe-area-top - TabBar - safe-area-bottom
- [ ] 滚动只发生在内容区，TabBar 固定不动
- [ ] 桌面端（macOS）布局不受影响
- [ ] 非刘海设备（老款 iPhone/iPad）不出现异常空白
