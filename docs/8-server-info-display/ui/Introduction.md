# 服务端点展示 -- 前端设计说明

> 给前端工程师的设计实现指导

## 设计概述

本次设计为两个页面添加服务端点信息展示：

1. **"我的"页面**: 在用户信息卡片中展示
2. **登录页面**: 在 Logo 区域下方展示

设计核心思路是"低调辅助" -- 端点信息使用最小字号和最浅文字颜色，作为页面的补充信息存在，不干扰用户的主要操作流程。

## 实现指导

### 1. "我的"页面 (ProfilePage.tsx)

**修改位置**: 用户信息卡片内，"已登录"文本下方

**当前结构** (约第 30-35 行):
```tsx
<div className="min-w-0">
  <div className="text-base font-medium text-gray-900 dark:text-gray-50 truncate">
    {user?.username || '用户'}
  </div>
  <div className="text-sm text-gray-500 dark:text-gray-400">已登录</div>
</div>
```

**添加内容**: 在"已登录"的 `<div>` 后添加端点文本
```tsx
<div className="text-xs text-gray-400 dark:text-gray-500 truncate">{serverEndpoint}</div>
```

**视觉效果**:
- 文字比"已登录"再小一级 (text-xs vs text-sm)
- 颜色比"已登录"再浅一级 (gray-400 vs gray-500)
- 形成清晰的三级信息层次: 用户名 > 状态 > 端点

### 2. 登录页面 (LoginPage.tsx)

**修改位置**: Logo 区域，"轻松记录每一笔"副标题下方

**当前结构** (约第 57-58 行):
```tsx
<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">记账本</h1>
<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">轻松记录每一笔</p>
```

**添加内容**: 在副标题 `<p>` 后添加端点文本
```tsx
<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{serverEndpoint}</p>
```

**视觉效果**:
- 与副标题相同的 mt-1 间距，保持节奏
- 更小更浅的文字，不抢 Logo 区域视觉焦点
- 自然地成为品牌区域的第三行信息

## 注意事项

1. **文本溢出**: "我的"页面使用 `truncate`，因为卡片宽度有限；登录页面通常居中且宽度足够，但如果 URL 极长也会自然换行
2. **深色模式**: 必须使用 `dark:text-gray-500`，遵循设计系统 Text Muted 层级
3. **不需要图标**: 端点信息纯文本展示，不需要加服务器图标或前缀标签
4. **不需要交互**: 端点信息仅供查看，不需要点击复制或其他交互功能

## 效果图参考

请查看 `merge.html` 在浏览器中预览完整效果：
- 直接打开文件即可预览
- 缩放浏览器窗口查看各断点响应式表现
- 点击右上角按钮切换深色模式
