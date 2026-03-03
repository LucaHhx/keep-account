# 多端应用图标设计规范

> 需求: 6-multi-platform | 角色: UI | 创建: 2026-03-02

## 概述

本文档定义记账本 (Keep Account) 应用图标的设计规范，覆盖 Tauri 2 多端构建所需的全部图标资源。

## 图标设计

### 设计概念

记账本的应用图标以**钱包**为核心元素，搭配简洁的线条风格，传达"轻松管理财务"的理念。

- **主体**: 圆角矩形背景 + 居中的钱包图形
- **配色**: 使用项目主色 `#2563EB` (blue-600) 作为背景，白色图形
- **风格**: 扁平化设计，无渐变，保证缩小到 16px 仍可辨识

### 配色方案

| 元素 | 颜色 | 说明 |
|------|------|------|
| 背景 | `#2563EB` (blue-600) | 项目主色，与应用内 Primary 色一致 |
| 图形 | `#FFFFFF` (white) | 钱包图形 |
| 背景圆角 | 约图标尺寸的 22% | 符合各平台图标圆角规范 |

### 图标网格

- 安全区域: 图标边缘留 12.5% 的内边距
- 图形区域: 占图标面积的 75%
- 对齐: 图形水平垂直居中

## 各平台图标尺寸清单

### 通用

| 文件名 | 尺寸 | 格式 | 用途 |
|--------|------|------|------|
| icon.png | 512x512 | PNG | 主图标源文件 |
| 32x32.png | 32x32 | PNG | 小尺寸图标 |
| 128x128.png | 128x128 | PNG | 标准图标 |
| 128x128@2x.png | 256x256 | PNG | Retina 标准图标 |

### macOS

| 文件名 | 尺寸 | 格式 | 用途 |
|--------|------|------|------|
| icon.icns | 多尺寸合集 | ICNS | macOS 应用图标（包含 16/32/64/128/256/512/1024px） |

ICNS 文件内含以下尺寸:
- 16x16, 16x16@2x (32x32)
- 32x32, 32x32@2x (64x64)
- 128x128, 128x128@2x (256x256)
- 256x256, 256x256@2x (512x512)
- 512x512, 512x512@2x (1024x1024)

### Windows

| 文件名 | 尺寸 | 格式 | 用途 |
|--------|------|------|------|
| icon.ico | 多尺寸合集 | ICO | Windows 应用图标（包含 16/24/32/48/64/128/256px） |

### Windows Store

| 文件名 | 尺寸 | 格式 | 用途 |
|--------|------|------|------|
| Square30x30Logo.png | 30x30 | PNG | 小磁贴 |
| Square44x44Logo.png | 44x44 | PNG | 应用列表 |
| Square71x71Logo.png | 71x71 | PNG | 中磁贴 |
| Square89x89Logo.png | 89x89 | PNG | 中磁贴 @1.25x |
| Square107x107Logo.png | 107x107 | PNG | 中磁贴 @1.5x |
| Square142x142Logo.png | 142x142 | PNG | 大磁贴 |
| Square150x150Logo.png | 150x150 | PNG | 大磁贴 @1x |
| Square284x284Logo.png | 284x284 | PNG | 大磁贴 @2x |
| Square310x310Logo.png | 310x310 | PNG | 超大磁贴 |
| StoreLogo.png | 50x50 | PNG | 商店列表图标 |

### iOS

iOS 图标通过 Xcode Asset Catalog 管理，Tauri 会自动处理。需要提供:

| 尺寸 | 用途 |
|------|------|
| 1024x1024 | App Store |
| 180x180 | iPhone @3x |
| 120x120 | iPhone @2x |
| 167x167 | iPad Pro @2x |
| 152x152 | iPad @2x |
| 76x76 | iPad @1x |
| 40x40 | Spotlight @1x |
| 80x80 | Spotlight @2x |
| 120x120 | Spotlight @3x |

注意: iOS 图标**不能有透明背景**，不能有圆角（系统自动裁切）。

### Android

Android 图标通过 Adaptive Icon 系统管理，Tauri 会自动处理。需要提供:

| 密度 | 尺寸 | 目录 |
|------|------|------|
| mdpi | 48x48 | mipmap-mdpi |
| hdpi | 72x72 | mipmap-hdpi |
| xhdpi | 96x96 | mipmap-xhdpi |
| xxhdpi | 144x144 | mipmap-xxhdpi |
| xxxhdpi | 192x192 | mipmap-xxxhdpi |

Android Adaptive Icon 额外需要:
- **前景层** (foreground): 108dp，图形居中在 72dp 安全区域内
- **背景层** (background): 纯色 `#2563EB` 或渐变

## 图标生成方案

### 推荐工具: `tauri icon`

Tauri CLI 内置图标生成命令，从一个 1024x1024 PNG 源文件自动生成所有平台所需的图标:

```bash
cd src-tauri
cargo tauri icon ../docs/6-multi-platform/ui/Resources/icons/icon-source-1024.png
```

该命令会在 `src-tauri/icons/` 目录下自动生成全部所需图标文件。

### 源文件要求

- 格式: PNG
- 尺寸: 1024x1024 像素
- 色彩空间: sRGB
- 背景: 不透明（iOS 要求）
- 内容: 居中，四周留 12.5% 安全边距

## 质量标准

- 所有图标清晰无锯齿
- 32px 及以下尺寸图形仍可辨识
- 各平台图标视觉风格统一
- 深色/浅色系统主题下均可辨识（蓝底白图，两种主题下都清晰）
