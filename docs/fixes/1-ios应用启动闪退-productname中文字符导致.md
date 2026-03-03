# FIX-1: iOS应用启动闪退-productName中文字符导致

> 日期: 2026-03-02 | 状态: 已修复 | 严重程度: P0

## 现象

iOS App 编译安装后打开即闪退（真机和模拟器均复现），无法进入任何页面。

## 根因分析

通过崩溃日志 (`~/Library/Logs/DiagnosticReports/记账本-*.ips`) 分析调用栈：

```
CFRelease.cold.1 → CFRelease → CFBundleCopyFrameworkURLForExecutablePath
→ CFBundleGetBundleWithIdentifier → NSBundle::bundleWithIdentifier
→ wry::platform_webview_version → tauri_runtime_wry::Wry::init
→ tauri::app::Builder::run
```

`tauri.conf.json` 中 `productName` 设为 "记账本"（中文），导致可执行文件路径为 `记账本.app/记账本`。Tauri 初始化时 wry 调用 `NSBundle::bundleWithIdentifier` 查找 WebKit 版本，CoreFoundation 处理含非 ASCII 字符的路径时触发 `EXC_BREAKPOINT` 崩溃。

## 修复方案

将 `productName` 改为 ASCII 名称，通过 `CFBundleDisplayName` 保留中文用户可见名。

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `web/src-tauri/tauri.conf.json` | `productName`: "记账本" → "KeepAccount" |
| `web/src-tauri/gen/apple/project.yml` | `PRODUCT_NAME` → "KeepAccount"；新增 `CFBundleDisplayName: 记账本` |

## 验收标准

- [x] iOS 模拟器/真机启动不闪退
- [x] iOS 主屏幕显示名仍为"记账本"
- [x] macOS 桌面端不受影响
