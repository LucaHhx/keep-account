# qa 设计文档

> 需求: 6-multi-platform | 角色: qa

## 技术选型

| 类别 | 技术 | 说明 |
|------|------|------|
| 桌面端测试 | 手动验证 | macOS 桌面窗口启动、交互、构建产物安装 |
| iOS 测试 | Xcode iOS Simulator | 模拟器中启动应用并验证 |
| Android 测试 | Android Emulator | 模拟器中启动应用并验证 |
| 命令行验证 | npm scripts | 验证各脚本命令可正确执行 |

## 架构设计

### 测试策略

本需求为工程化/基础设施需求，测试以手动验证为主，目标是确保各平台的开发调试流程和构建流程可正常运行。不涉及自动化测试框架搭建（已在范围排除中说明）。

### 测试分层

| 层级 | 内容 | 验证方式 |
|------|------|----------|
| L1 脚本配置 | package.json 脚本定义正确 | 运行 `npm run tauri -- info` 检查环境 |
| L2 开发调试 | 各平台 dev 命令可启动 | 执行脚本，观察应用窗口/模拟器 |
| L3 构建产物 | 各平台 build 命令可输出 | 执行脚本，检查产物文件是否生成 |
| L4 功能验证 | 应用启动后页面正常 | 在各平台中操作验证基本交互 |

### 各平台测试方案

#### 桌面端 (macOS)

**开发调试测试 (tauri:dev)**

1. 在 web/ 目录执行 `npm run tauri:dev`
2. 验证项：
   - Vite dev server 正常启动（终端输出 localhost:5173）
   - 桌面窗口自动打开，显示应用界面
   - 修改前端代码后，窗口内容自动热更新
   - 窗口标题显示"记账本"
   - 窗口尺寸符合配置（1024x768，最小 375x600）
   - 可正常进行页面交互（路由跳转、表单输入等）

**构建测试 (tauri:build)**

1. 在 web/ 目录执行 `npm run tauri:build`
2. 验证项：
   - 构建过程无报错
   - 在 `src-tauri/target/release/bundle/` 下生成 .dmg 文件 (macOS)
   - .dmg 文件可正常安装
   - 安装后的应用可正常启动并显示界面

#### iOS

**开发调试测试 (tauri:ios-dev)**

1. 前置条件：macOS + Xcode 16+ + iOS Simulator 已安装
2. 执行 `npm run tauri:ios-dev`
3. 验证项：
   - iOS 模拟器自动启动
   - 应用在模拟器中正常加载
   - 前端页面正常显示
   - 基本交互可用（点击、输入、路由切换）
   - 前端代码热更新在模拟器中生效

**构建测试 (tauri:ios-build)**

1. 执行 `npm run tauri:ios-build`
2. 验证项：
   - 构建过程无报错
   - 构建产物生成（.app 或 .ipa）

#### Android

**开发调试测试 (tauri:android-dev)**

1. 前置条件：Android Studio + SDK 34+ + NDK + 模拟器/真机
2. 执行 `npm run tauri:android-dev`
3. 验证项：
   - Android 模拟器启动或真机连接成功
   - 应用在设备中正常加载
   - 前端页面正常显示
   - 基本交互可用

**构建测试 (tauri:android-build)**

1. 执行 `npm run tauri:android-build`
2. 验证项：
   - 构建过程无报错
   - 在 `src-tauri/gen/android/app/build/outputs/apk/` 下生成 APK 文件
   - APK 文件大小合理（非空文件）
   - APK 可安装到模拟器/真机并正常启动

### 环境预检清单

在执行测试前，需确认以下环境条件：

```bash
# 基础环境检查
node --version        # >= 18
rustc --version       # >= 1.77.2
npm run tauri -- info # Tauri 环境信息总览

# iOS 环境检查 (macOS only)
xcode-select -p       # Xcode Command Line Tools 路径
xcrun simctl list devices  # 可用模拟器列表

# Android 环境检查
echo $ANDROID_HOME     # Android SDK 路径
adb devices            # 已连接设备列表
```

### 常见问题排查

| 问题 | 可能原因 | 排查方式 |
|------|----------|----------|
| tauri:dev 白屏 | Vite dev server 未启动 | 检查 beforeDevCommand 配置，确认 5173 端口可用 |
| iOS 构建签名失败 | developmentTeam 不匹配 | 检查 tauri.conf.json 中 bundle.iOS.developmentTeam |
| Android 构建找不到 NDK | NDK 未安装或路径未配置 | Android Studio > SDK Manager 安装 NDK |
| 移动端页面空白 | CSP 阻止资源加载 | 检查 tauri.conf.json 的 security.csp 配置 |
| Rust 编译失败 (iOS) | 缺少 target | `rustup target add aarch64-apple-ios aarch64-apple-ios-sim` |
| Rust 编译失败 (Android) | 缺少 target | `rustup target add aarch64-linux-android` 等 |

## 关键决策

- 测试以手动验证为主，因为本需求验证的是构建流程而非业务逻辑
- 不搭建自动化 E2E 测试框架（不在本需求范围内）
- 各平台测试可独立进行，不依赖其他平台的测试结果
- 环境预检清单确保测试前环境正确，减少因环境问题导致的误判
