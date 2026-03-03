# FIX-11: TabBar底部空白 — safe-area 布局重构

> 日期: 2026-03-02 | 状态: 已修复 | 严重程度: P1

## 现象

FIX-10 修复顶部安全区后，底部 TabBar 没有贴在屏幕最底部，TabBar 下方出现一整块空白区域。

## 根因分析

FIX-10 的实现有两个问题：

1. **顶部 safe-area 放在了根容器**: `pt-[env(safe-area-inset-top)]` 放在 `fixed inset-0` 的根 div 上，影响了 flex 子元素的高度分配
2. **底部 calc() 语法无效**: `pb-[calc(0.5rem+env(safe-area-inset-bottom))]` 中 `+` 两侧缺少空格，CSS calc() 规范要求运算符两侧必须有空格，浏览器忽略该属性

## 修复方案

重构 safe-area 布局策略：

1. **根容器**: 移除 safe-area padding，保持纯全屏 `fixed inset-0`
2. **内容区**: `pt-[env(safe-area-inset-top)] lg:pt-0` 放到可滚动内容 div
3. **TabBar 外层**: `pb-[env(safe-area-inset-bottom)]`，白色背景延伸覆盖 Home Indicator 区域
4. **TabBar 内层**: 恢复简单 `py-2`，不再使用 calc()

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `web/src/components/AppLayout.tsx` | 根 div 移除 safe-area padding；内容 div 添加顶部 safe-area；TabBar 外层添加底部 safe-area，内层恢复 py-2 |

## 验收标准

- [ ] TabBar 底边贴合屏幕底部
- [ ] TabBar 白色背景覆盖 Home Indicator 区域
- [ ] TabBar 下方无空白
- [ ] 顶部内容不被状态栏遮挡
- [ ] 桌面端布局不受影响
