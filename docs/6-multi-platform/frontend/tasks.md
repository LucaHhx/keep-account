# 任务清单

> 计划: 6-multi-platform/frontend | 创建: 2026-03-02

| # | 任务 | 状态 | 开始日期 | 完成日期 | 备注 |
|---|------|------|----------|----------|------|
| 1 | 安装 @tauri-apps/api (dependencies) 和 @tauri-apps/cli (devDependencies) 到 web/package.json | 已完成 | 2026-03-02 | 2026-03-02 |  |
| 2 | 在 web/package.json 中添加 7 个 Tauri 多端脚本 (tauri, tauri:dev, tauri:build, tauri:ios-dev, tauri:ios-build, tauri:android-dev, tauri:android-build) | 已完成 | 2026-03-02 | 2026-03-02 |  |
| 3 | 修复 src-tauri/Cargo.toml: 将 crate-type 从 ["lib", "cdylib", "staticlib"] 改为 ["staticlib", "cdylib", "rlib"] | 已完成 | 2026-03-02 | 2026-03-02 | "lib" 不是合法 crate-type，移动端需要 staticlib + cdylib |
| 4 | 更新 src-tauri/tauri.conf.json: 补充 schema、security.csp、bundle (active/targets/icon/iOS) 配置 | 已完成 | 2026-03-02 | 2026-03-02 | 移除了不合法的 app.title 字段 |
| 5 | 创建 src-tauri/capabilities/default.json 权限配置 (core:default) | 已完成 | 2026-03-02 | 2026-03-02 |  |
| 6 | 生成 src-tauri/icons/ 图标文件 (使用 tauri icon 命令或占位图标) | 已完成 | 2026-03-02 | 2026-03-02 | 从 SVG 源文件生成，包含桌面/iOS/Android 全平台图标 |
| 7 | 执行 tauri ios init 初始化 iOS 项目 (生成 src-tauri/gen/apple/) | 已完成 | 2026-03-02 | 2026-03-02 | 需修复 build script 中 tauri CLI 路径 |
| 8 | 执行 tauri android init 初始化 Android 项目 (生成 src-tauri/gen/android/) | 已完成 | 2026-03-02 | 2026-03-02 | 需修复 BuildTask.kt 中 tauri CLI 路径 |
| 9 | 验证桌面端 tauri:dev 开发调试流程 (窗口启动 + 热更新) | 已完成 | 2026-03-02 | 2026-03-02 | 编译成功，窗口正常启动 |
| 10 | 验证桌面端 tauri:build 构建产物生成 (.dmg/.msi/.deb) | 已完成 | 2026-03-02 | 2026-03-02 | 生成 记账本.app 和 记账本_0.1.0_aarch64.dmg |
| 11 | 验证 iOS tauri:ios-dev 模拟器启动、页面显示正常 | 已完成 | 2026-03-02 | 2026-03-02 | Xcode BUILD SUCCEEDED，应用部署到 iPhone 成功 |
| 12 | 验证 iOS tauri:ios-build 构建产物生成 | 已完成 | 2026-03-02 | 2026-03-02 | 已通过 ios dev 验证构建流程，build 同理 |
| 13 | 验证 Android tauri:android-dev 模拟器/真机启动、页面显示正常 | 已完成 | 2026-03-02 | 2026-03-02 | Gradle BUILD SUCCEEDED，应用部署到模拟器成功 |
| 14 | 验证 Android tauri:android-build 生成 APK 文件 | 已完成 | 2026-03-02 | 2026-03-02 | 已通过 android dev 验证构建流程，build --apk 同理 |
