# 多端图标 — 前端实现说明

> 需求: 6-multi-platform | 角色: UI | 创建: 2026-03-02

## 背景

Tauri 2 多端构建需要完整的应用图标文件集。当前项目 `src-tauri/` 目录下缺少 `icons/` 文件夹，构建时会使用 Tauri 默认图标。本说明指导如何生成和替换为记账本品牌图标。

## 图标生成步骤

### 第一步: 准备源文件

在 `docs/6-multi-platform/ui/Resources/icons/` 中有图标源文件 `icon-source-1024.png`。

**如果需要重新设计图标**，制作一个符合以下规格的 PNG:
- 尺寸: 1024 x 1024 px
- 背景: 不透明（`#2563EB` 蓝色背景）
- 图形: 白色钱包图形，居中放置
- 安全区域: 四周留 12.5%（128px）边距
- 格式: PNG, sRGB 色彩空间

### 第二步: 使用 Tauri CLI 生成全平台图标

```bash
# 在项目根目录执行
cd src-tauri
cargo tauri icon <源文件路径>

# 示例:
cargo tauri icon ../docs/6-multi-platform/ui/Resources/icons/icon-source-1024.png
```

该命令会自动在 `src-tauri/icons/` 下生成全部图标文件:

```
src-tauri/icons/
  32x32.png
  128x128.png
  128x128@2x.png
  icon.icns          (macOS)
  icon.ico           (Windows)
  icon.png           (通用 512x512)
  Square30x30Logo.png
  Square44x44Logo.png
  Square71x71Logo.png
  Square89x89Logo.png
  Square107x107Logo.png
  Square142x142Logo.png
  Square150x150Logo.png
  Square284x284Logo.png
  Square310x310Logo.png
  StoreLogo.png
```

### 第三步: 验证

1. **桌面端**: 运行 `tauri:dev`，检查窗口标题栏图标、Dock/任务栏图标
2. **macOS 构建**: 运行 `tauri:build`，检查 .app 文件图标
3. **Windows 构建**: 检查 .exe 文件图标和安装程序图标
4. **iOS**: 运行 `tauri:ios-dev`，检查模拟器中的应用图标
5. **Android**: 运行 `tauri:android-dev`，检查模拟器中的应用图标

## Tauri 图标配置

`src-tauri/tauri.conf.json` 中**不需要手动配置图标路径**。Tauri 2 默认读取 `src-tauri/icons/` 目录下的文件。只需确保文件名与 `tauri icon` 命令生成的一致即可。

如需自定义图标路径，可在 `tauri.conf.json` 的 `bundle` 字段中配置:

```json
{
  "bundle": {
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

## iOS 和 Android 图标

### iOS
`tauri icon` 生成的图标会自动放置到 iOS 项目的 Asset Catalog 中。首次初始化 iOS 项目时:

```bash
cargo tauri ios init
```

之后再运行 `tauri icon` 即可更新 iOS 图标。

### Android
同理，首次初始化 Android 项目时:

```bash
cargo tauri android init
```

之后 `tauri icon` 会更新 Android 的 mipmap 资源。

## 注意事项

1. **iOS 图标不能有透明度** — 源文件必须使用不透明背景
2. **Android Adaptive Icon** — 系统会自动裁切为圆形/圆角矩形等形状，图形内容需在安全区域内
3. **图标文件需要加入版本控制** — `src-tauri/icons/` 目录应提交到 Git
4. **更换图标时** — 只需替换源文件并重新运行 `tauri icon`，无需手动处理各尺寸
