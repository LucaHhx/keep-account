# frontend 设计文档

> 需求: 6-multi-platform | 角色: frontend

## 技术选型

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 跨平台框架 | Tauri | 2.x | 桌面 + iOS + Android 统一方案 |
| Tauri 前端 API | @tauri-apps/api | ^2.10.1 | 前端调用 Tauri IPC 的 SDK |
| Tauri CLI | @tauri-apps/cli | ^2.10.0 | 开发调试与构建命令行工具 |
| 构建工具 | Vite | 7+ | 前端构建，需配合 Tauri 的 beforeDevCommand |
| 前端框架 | React 19 + TypeScript | 现有 | 一套代码适配多端 |

## 架构设计

### 整体方案

本需求为工程化/基础设施需求，不涉及业务功能代码变更。核心工作是在现有项目结构上补充 Tauri 多端的脚本配置、Tauri 配置、以及平台初始化。

```
web/                          # 前端代码（不变）
├── package.json              # 新增 Tauri 脚本 + 依赖
├── vite.config.ts            # 可能需要微调（移动端兼容）
└── src/                      # 业务代码（不变）

src-tauri/                    # Tauri 配置（需补充）
├── tauri.conf.json           # 补充 bundle、security、icons 配置
├── Cargo.toml                # 需修改 crate-type
├── capabilities/
│   └── default.json          # 新建，权限配置
├── icons/                    # 新建，各平台图标
├── src/
│   ├── lib.rs                # 已有，无需修改
│   └── main.rs               # 已有，无需修改
└── gen/                      # tauri ios init / android init 自动生成
    ├── android/
    └── apple/
```

### web/package.json 变更

#### 新增依赖

```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.10.1"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.10.0"
  }
}
```

- `@tauri-apps/api`: 运行时依赖，前端通过它调用 Tauri IPC（invoke 命令、事件监听、路径 API 等）
- `@tauri-apps/cli`: 开发依赖，提供 `tauri` CLI 命令（dev/build/ios/android）

#### 新增脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:ios-dev": "tauri ios dev",
    "tauri:ios-build": "tauri ios build",
    "tauri:android-dev": "tauri android dev",
    "tauri:android-build": "tauri android build --apk"
  }
}
```

脚本说明：

| 脚本 | 用途 | 备注 |
|------|------|------|
| `tauri` | Tauri CLI 基础命令入口 | 如 `npm run tauri -- info` |
| `tauri:dev` | 桌面端开发调试 | 自动启动 Vite dev server + 桌面窗口，支持热更新 |
| `tauri:build` | 桌面端构建 | 生成 macOS .dmg / Windows .msi / Linux .deb 等 |
| `tauri:ios-dev` | iOS 模拟器开发调试 | 需 macOS + Xcode，不指定模拟器型号由系统默认选择 |
| `tauri:ios-build` | iOS 构建 | 生成 iOS 应用包 |
| `tauri:android-dev` | Android 开发调试 | 需 Android Studio + SDK，自动选择可用模拟器/真机 |
| `tauri:android-build` | Android 构建 | `--apk` 参数直接输出 APK 文件 |

> 注意: `tauri:ios-dev` 不硬编码模拟器型号（如 `iPhone 17 Pro`），由开发者自行选择或使用系统默认，避免团队成员环境差异导致命令失败。

### src-tauri/tauri.conf.json 变更

需要在现有配置基础上补充以下内容：

```json
{
  "$schema": "../web/node_modules/@tauri-apps/cli/config.schema.json",
  "productName": "记账本",
  "version": "0.1.0",
  "identifier": "com.keepaccount.app",
  "build": {
    "frontendDist": "../web/dist",
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "cd ../web && npm run dev",
    "beforeBuildCommand": "cd ../web && npm run build"
  },
  "app": {
    "title": "记账本",
    "windows": [
      {
        "title": "记账本",
        "width": 1024,
        "height": 768,
        "minWidth": 375,
        "minHeight": 600,
        "center": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://192.168.0.145:5723; img-src 'self' data: blob:"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "iOS": {
      "developmentTeam": "67833P7KSK"
    }
  }
}
```

变更要点：

| 配置项 | 变更内容 | 说明 |
|--------|----------|------|
| `$schema` | 指向 `@tauri-apps/cli` 的 schema | 提供 IDE 自动补全和校验 |
| `app.security.csp` | 新增 CSP 安全策略 | 允许 self + 192.168.0.145:5723 后端连接 + inline style (Tailwind) |
| `bundle` | 新增完整 bundle 配置 | `active: true` 启用打包，`targets: "all"` 构建所有格式 |
| `bundle.icon` | 新增图标文件列表 | 桌面端需要 .icns (macOS)、.ico (Windows)、.png (Linux) |
| `bundle.iOS` | 新增 iOS 开发团队 ID | Apple Developer Team ID，用于 iOS 签名 |

### src-tauri/capabilities/default.json

新建权限配置文件：

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "记账本默认权限配置",
  "windows": ["main"],
  "permissions": [
    "core:default"
  ]
}
```

- Tauri v2 默认拒绝所有操作，必须通过 capabilities 显式授权
- `core:default` 包含基础 IPC 通信权限
- MVP 阶段仅需 core:default，后续按需添加插件权限（如 fs、dialog 等）
- `$schema` 指向 `../gen/schemas/desktop-schema.json`，该文件在首次运行 `tauri dev` 或 `tauri build` 时自动生成；创建文件时可先省略 `$schema` 字段，或在首次运行后自动获得 IDE 校验支持

### src-tauri/icons/ 目录

需要生成以下图标文件：

| 文件名 | 尺寸 | 用途 |
|--------|------|------|
| 32x32.png | 32x32 | Linux 桌面图标 |
| 128x128.png | 128x128 | Linux 桌面图标 |
| 128x128@2x.png | 256x256 | Linux HiDPI |
| icon.icns | 多尺寸 | macOS 应用图标 |
| icon.ico | 多尺寸 | Windows 应用图标 |
| icon.png | 512x512 | 通用/移动端图标 |

可使用 `tauri icon` 命令从一张 512x512 或更大的源图自动生成所有尺寸。MVP 阶段可先使用 Tauri 默认图标占位。

### src-tauri/Cargo.toml 变更

当前 `crate-type` 中的 `"lib"` 不是有效的 Cargo crate-type 值，需要改为 `"rlib"`：

```toml
[lib]
name = "keep_account_lib"
crate-type = ["staticlib", "cdylib", "rlib"]
```

- `staticlib`: iOS 需要静态链接库
- `cdylib`: Android 需要动态链接库
- `rlib`: Rust 默认库类型，桌面开发和测试需要

> 参考项目使用 `["staticlib", "cdylib", "rlib"]`，保持一致。

### Vite 配置调整

`web/vite.config.ts` 变更：移除 `/api` proxy 配置。

1. Tauri 的 `beforeDevCommand` 和 `beforeBuildCommand` 已配置为调用 `npm run dev` / `npm run build`
2. Vite dev server 端口 5173 与 `tauri.conf.json` 的 `devUrl` 一致
3. **API 转发不再通过 Vite proxy**，所有环境统一直连后端 `http://localhost:5723/api/v1`（详见 `1-account-system/frontend/design.md` 请求架构章节）

### 平台初始化步骤

#### iOS 初始化（一次性）

```bash
# 前置条件: macOS + Xcode 16+ + iOS Simulator
cd web
npm run tauri -- ios init
```

该命令会在 `src-tauri/gen/apple/` 下生成 Xcode 项目文件。生成后纳入版本控制。

#### Android 初始化（一次性）

```bash
# 前置条件: Android Studio + SDK 34+ + NDK
cd web
npm run tauri -- android init
```

该命令会在 `src-tauri/gen/android/` 下生成 Android 项目文件。生成后纳入版本控制。

### 各平台环境要求

| 平台 | 必须工具 | 最低版本 | 备注 |
|------|----------|----------|------|
| 通用 | Rust toolchain | 1.77.2+ | `rustup update` 保持最新 |
| 通用 | Node.js | 18+ | npm 包管理 |
| macOS 桌面 | Xcode Command Line Tools | - | `xcode-select --install` |
| iOS | Xcode | 16+ | 含 iOS Simulator |
| iOS | CocoaPods | - | `sudo gem install cocoapods`（如需要） |
| iOS | Rust iOS targets | - | `rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim` |
| Android | Android Studio | - | 含 SDK Manager |
| Android | Android SDK | API 34+ | 通过 SDK Manager 安装 |
| Android | Android NDK | r26+ | 通过 SDK Manager 安装 |
| Android | Rust Android targets | - | `rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android` |
| Windows | Visual Studio Build Tools | 2022+ | C++ 构建工具链 |
| Linux | 系统依赖 | - | libwebkit2gtk-4.1, libgtk-3-dev 等 |

### Rust Targets 安装命令汇总

```bash
# iOS targets (macOS only)
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim

# Android targets
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

## 关键决策

- **@tauri-apps/api 作为 dependencies 而非 devDependencies**: 前端运行时需要调用 Tauri IPC API（invoke、event 等），属于运行时依赖
- **@tauri-apps/cli 作为 devDependencies**: CLI 仅在开发和构建阶段使用，不打包进生产代码
- **iOS dev 脚本不硬编码模拟器型号**: 避免因团队成员 Xcode 版本不同导致模拟器名称不匹配的问题
- **CSP 策略允许 unsafe-inline style**: Tailwind CSS 需要内联样式支持；connect-src 允许 192.168.0.145:5723 用于后端 API 连接
- **bundle.targets 设为 "all"**: 让 Tauri 根据当前操作系统自动选择对应的打包格式
- **MVP 阶段使用占位图标**: 优先跑通构建流程，图标设计后续由 UI 角色提供
- **capabilities 仅配置 core:default**: 最小权限原则，当前应用不需要文件系统、shell 等额外权限
- **iOS developmentTeam 使用 "67833P7KSK"**: 与参考项目一致的 Apple Developer Team ID

## 实现补充

### Tauri v2 中 app.title 不合法
design.md 模板中的 `app.title` 字段不被 Tauri v2 schema 接受，已移除。窗口标题仅在 `app.windows[].title` 中配置。

### iOS/Android build script 需适配项目结构
由于 `@tauri-apps/cli` 安装在 `web/` 子目录而非项目根目录，Tauri 自动生成的 build script 无法正确找到 tauri CLI。已做如下修复：
- **iOS** (`src-tauri/gen/apple/project.yml`): preBuildScripts 改为 `cd "$SRCROOT/../../.." && ./web/node_modules/.bin/tauri ios xcode-script ...`
- **Android** (`src-tauri/gen/android/buildSrc/.../BuildTask.kt`): 直接调用 `web/node_modules/.bin/tauri` 二进制，工作目录改为项目根

### vite.config.ts 需要 vitest 类型引用
添加 `/// <reference types="vitest/config" />` 到文件顶部，否则 `tsc -b` 会因 `test` 属性报 TypeScript 错误，导致 `tauri build` 失败。

### iOS dev 会自动修改配置文件
连接实体 iOS 设备运行 `tauri ios dev` 时，CLI 会自动将 `tauri.conf.json` 的 CSP connect-src 替换为本机网络 IP。开发后需手动恢复。（注: Vite proxy 已移除，不再受此影响。）

### bundle identifier 警告
`com.keepaccount.app` 以 `.app` 结尾，macOS 构建时会产生警告（与 .app bundle 扩展名冲突）。建议后续考虑更换。
