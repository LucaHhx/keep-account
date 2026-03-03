# Keep Account 统一设计系统

> 本文档定义整个项目的视觉规范，所有需求的 UI 设计均遵循此系统。

## 设计理念

- **极简路径**: 减少视觉噪音，让用户专注于核心操作（金额输入、分类选择）
- **温暖财务**: 不用冰冷的企业蓝，采用柔和的蓝绿色系，传达"轻松记账"的心智
- **数据可视**: 报表图表使用鲜明但和谐的配色，让数据一目了然
- **双模式**: 完整支持浅色和深色模式，在任何环境下都舒适阅读

## 调色板

### 主色系

| 角色 | 浅色模式 | 深色模式 | 用途 |
|------|----------|----------|------|
| Primary | `#2563EB` (blue-600) | `#3B82F6` (blue-500) | 主操作按钮、导航激活态、链接 |
| Primary Light | `#DBEAFE` (blue-100) | `#1E3A5F` | 选中背景、轻量高亮 |

### 语义色

| 角色 | 浅色模式 | 深色模式 | 用途 |
|------|----------|----------|------|
| Income (收入) | `#16A34A` (green-600) | `#22C55E` (green-500) | 收入金额、正向指标 |
| Expense (支出) | `#EF4444` (red-500) | `#F87171` (red-400) | 支出金额、负向指标 |
| Transfer (转账) | `#6B7280` (gray-500) | `#9CA3AF` (gray-400) | 转账金额 |
| Warning | `#F59E0B` (amber-500) | `#FBBF24` (amber-400) | 警告提示 |
| Success | `#16A34A` (green-600) | `#22C55E` (green-500) | 成功反馈 |
| Error | `#EF4444` (red-500) | `#F87171` (red-400) | 错误提示 |

### 中性色

| 角色 | 浅色模式 | 深色模式 | 用途 |
|------|----------|----------|------|
| Background | `#F9FAFB` (gray-50) | `#111827` (gray-900) | 页面背景 |
| Surface | `#FFFFFF` (white) | `#1F2937` (gray-800) | 卡片、模态框背景 |
| Surface Elevated | `#FFFFFF` (white) | `#374151` (gray-700) | 浮动元素、下拉菜单 |
| Border | `#E5E7EB` (gray-200) | `#374151` (gray-700) | 分割线、边框 |
| Text Primary | `#111827` (gray-900) | `#F9FAFB` (gray-50) | 主要文字 |
| Text Secondary | `#6B7280` (gray-500) | `#9CA3AF` (gray-400) | 次要文字、说明 |
| Text Muted | `#9CA3AF` (gray-400) | `#6B7280` (gray-500) | 占位符、禁用 |

### 图表配色（分类占比）

按使用顺序：`#2563EB`, `#F59E0B`, `#10B981`, `#8B5CF6`, `#EF4444`, `#EC4899`, `#06B6D4`, `#F97316`

## 字体方案

| 角色 | 字体 | 备选 |
|------|------|------|
| 英文/数字 | Inter | system-ui, -apple-system |
| 中文 | "PingFang SC", "Noto Sans SC" | "Microsoft YaHei", sans-serif |

### 字号层级

| 级别 | 大小 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| Display | 48px (3rem) | 1.1 | 600 | 金额输入显示 |
| H1 | 24px (1.5rem) | 1.3 | 600 | 页面标题 |
| H2 | 20px (1.25rem) | 1.4 | 600 | 区块标题 |
| H3 | 16px (1rem) | 1.5 | 600 | 小标题 |
| Body | 16px (1rem) | 1.5 | 400 | 正文 |
| Body Small | 14px (0.875rem) | 1.5 | 400 | 辅助文字 |
| Caption | 12px (0.75rem) | 1.5 | 400 | 标签、时间戳 |

## 间距系统

基础单位: 4px

| Token | 值 | 用途 |
|-------|-----|------|
| space-1 | 4px | 紧凑间距 |
| space-2 | 8px | 图标与文字间距 |
| space-3 | 12px | 列表项内间距 |
| space-4 | 16px | 卡片内间距、组件间距 |
| space-5 | 20px | 区块间距 |
| space-6 | 24px | 大区块间距 |
| space-8 | 32px | 页面上下边距 |

## 圆角

| 级别 | 值 | 用途 |
|------|-----|------|
| sm | 6px | 小按钮、标签 |
| md | 8px | 输入框、普通按钮 |
| lg | 12px | 卡片 |
| xl | 16px | 模态框 |
| full | 9999px | 圆形头像、药丸标签 |

## 阴影

| 级别 | 值 | 用途 |
|------|-----|------|
| sm | `0 1px 2px rgba(0,0,0,0.05)` | 卡片 |
| md | `0 4px 6px -1px rgba(0,0,0,0.1)` | 悬浮卡片 |
| lg | `0 10px 15px -3px rgba(0,0,0,0.1)` | 模态框 |

> 深色模式下阴影改用更微妙的值，或用边框代替

## 组件规范

### 按钮

| 类型 | 浅色 | 深色 | 用途 |
|------|------|------|------|
| Primary | bg-blue-600 text-white | bg-blue-500 text-white | 主操作（保存、登录） |
| Secondary | bg-gray-100 text-gray-700 | bg-gray-700 text-gray-200 | 次要操作（取消） |
| Danger | bg-red-500 text-white | bg-red-500 text-white | 危险操作（删除） |
| Ghost | text-blue-600 | text-blue-400 | 文字按钮 |

- 最小触控区域: 44x44px
- 圆角: 8px (rounded-lg)
- 内间距: px-4 py-3（移动端），px-6 py-2.5（桌面端）
- hover: opacity-90 或加深一级
- loading: 显示 spinner + 禁用点击
- 过渡: transition-colors duration-200

### 输入框

- 高度: 44px (min-h-[44px])
- 圆角: 8px
- 边框: 1px solid gray-200 (浅色) / gray-700 (深色)
- 聚焦: ring-2 ring-blue-500
- 错误: ring-2 ring-red-500 + 下方红色提示文字
- 占位符: text-gray-400

### 卡片

- 背景: white (浅色) / gray-800 (深色)
- 圆角: 12px (rounded-xl)
- 内间距: p-4
- 阴影: shadow-sm (浅色) / border border-gray-700 (深色)

### 底部 Tab 导航

- 高度: 56px + safe-area-inset-bottom
- 4个Tab: 记账、流水、报表、我的
- 激活态: text-blue-600 (浅色) / text-blue-400 (深色)
- 未激活: text-gray-400 (浅色) / text-gray-500 (深色)
- 图标大小: 24px
- 文字: 12px
- 背景: white (浅色) / gray-800 (深色)
- 上边框: 1px solid gray-200 (浅色) / gray-700 (深色)

### 金额输入框（记账页）

- 使用系统原生键盘（`<input type="number" inputmode="decimal">`）
- 移动端自动弹出数字键盘，桌面端使用普通输入
- 字号: 48px (text-5xl)，居中显示
- 左侧人民币符号: 24px，灰色
- 隐藏浏览器默认的 number input 上下箭头（`appearance: textfield`）
- 不做自定义数字键盘，避免多端行为不一致

### Toast 提示

- 位置: 顶部居中
- 圆角: 8px
- 最大宽度: 320px
- 动画: 从上方滑入 (200ms), 停留 2s, 滑出 (200ms)

## 图标方案

使用 Lucide Icons (SVG)，与 React 生态兼容良好。

核心图标列表:
- 导航: Home, List, PieChart, User
- 分类: Utensils (餐饮), ShoppingBag (购物), Bus (交通), Gamepad (娱乐), Heart (医疗), GraduationCap (教育), Coffee (日常), MoreHorizontal (其他)
- 收入分类: Briefcase (工资), Gift (红包), TrendingUp (投资), MoreHorizontal (其他)
- 操作: Plus, ChevronLeft, ChevronRight, Trash2, Edit, X, Check, Search, Filter

## 深色模式实现

Tailwind CSS 4+ 通过 `dark:` 前缀实现：

```html
<div class="bg-gray-50 dark:bg-gray-900">
  <div class="bg-white dark:bg-gray-800 shadow-sm dark:border dark:border-gray-700">
    <h1 class="text-gray-900 dark:text-gray-50">标题</h1>
    <p class="text-gray-500 dark:text-gray-400">描述</p>
  </div>
</div>
```

跟随系统设置：`<html class="dark">` 通过 JS 检测 `prefers-color-scheme`

## 响应式断点与三端布局策略

### 断点定义

| 断点 | Tailwind 前缀 | 宽度 | 目标设备 |
|------|---------------|------|----------|
| Mobile | 默认 (无前缀) | < 768px | 手机 (375px~) |
| Tablet | `md:` | 768px ~ 1023px | 平板 (iPad, Surface) |
| Desktop | `lg:` | >= 1024px | 桌面浏览器, Tauri 桌面应用 |

### 导航方案

| 端 | 导航类型 | 布局 |
|----|----------|------|
| 手机 | 底部 Tab 栏 | 4图标 + 文字标签, 底部安全区 (pb-8) |
| 平板 | 底部 Tab 栏 | 同手机, 但底部安全区缩小 (pb-4), Tab 居中 max-w-lg |
| 桌面 | 左侧侧边栏 | 宽度 224px (w-56), 带 Logo+应用名, 文字导航项, 底部用户信息 |

### 各页面三端布局差异

#### 记账页 (/)
| 端 | 布局描述 |
|----|----------|
| 手机 | 全宽单列: 类型Tab -> 金额输入 -> 分类5列 -> 备注+日期 -> 保存按钮 |
| 平板 | 居中单列: 内容区加宽, 分类6列, 图标尺寸放大 (w-12 h-12), 金额字号加大 |
| 桌面 | **双栏布局**: 左栏为记账表单(卡片样式, 圆角+阴影+边框), 右栏为"最近记录"面板(w-80~w-96), 顶部有标题栏 |

#### 流水列表 (/transactions)
| 端 | 布局描述 |
|----|----------|
| 手机 | 全宽列表, 点击项目弹出 Bottom Sheet 详情 |
| 平板 | 宽列表 (px-8), 同手机弹窗交互 |
| 桌面 | **主从双栏**: 左栏流水列表(max-w-2xl), 右栏详情面板(w-80~w-96, sticky), 选中项左侧蓝色边框高亮 |

#### 报表页 (/reports)
| 端 | 布局描述 |
|----|----------|
| 手机 | 单列堆叠: 总览卡片(3列) -> 环形图 -> 分类列表 -> 柱状图 |
| 平板 | 单列加宽: 卡片和图表内边距加大 (p-6), 金额字号加大 |
| 桌面 | **图表并排**: 总览卡片一行(3列宽敞), 下方环形图和趋势图**双列并排** (lg:grid-cols-2), 图表尺寸增大 |

#### 登录/注册 (/login, /register)
| 端 | 布局描述 |
|----|----------|
| 手机 | 全宽表单, px-6, max-w-sm |
| 平板 | 居中表单卡片, max-w-md |
| 桌面 | 居中表单卡片, max-w-md, 无侧边栏(未登录状态) |

#### 我的页面 (/me)
| 端 | 布局描述 |
|----|----------|
| 手机 | 全宽, 用户信息卡片 + 功能菜单列表 + 退出登录 |
| 平板 | 居中, max-w-lg |
| 桌面 | 侧边栏导航 + 居中内容区 (w-[420px]) |

### 设计原则

- **三端有明显差异**: 不是简单地把手机端放大，而是根据各平台的交互习惯调整布局
- **桌面端充分利用宽屏**: 使用双栏布局、信息面板、并排图表等桌面端模式
- **平板端作为中间态**: 保持底部 Tab 但增大触控区域和内容间距
- **统一的设计语言**: 三端共享相同的配色、字体、圆角、阴影系统

## 动画规范

| 类型 | 时长 | 缓动 | 用途 |
|------|------|------|------|
| 微交互 | 150ms | ease-out | 按钮hover、颜色切换 |
| 过渡 | 200ms | ease-in-out | 页面切换、模态框 |
| 加载 | 300ms | ease-out | 骨架屏、数据加载 |

遵守 `prefers-reduced-motion` 媒体查询，关闭动画时直接切换无过渡。
