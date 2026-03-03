# 应用图标资源说明

## 源文件

| 文件 | 说明 |
|------|------|
| icons/icon-source-1024.png | 1024x1024 主图标源文件（需人工设计或使用 merge.html 中的 SVG 导出） |

## 如何获取源文件

### 方案 A: 从 merge.html 中的 SVG 导出（推荐）

1. 在浏览器中打开 `docs/6-multi-platform/ui/merge.html`
2. 页面中包含一个 1024x1024 的 SVG 图标预览
3. 使用以下方法导出为 PNG:
   - 使用浏览器开发者工具右键 SVG 元素 > Copy > Copy SVG
   - 用 Figma / Inkscape 导入 SVG 并导出为 1024x1024 PNG
   - 或使用命令行工具: `npx svgexport icon.svg icon-source-1024.png 1024:1024`

### 方案 B: 使用设计工具重新设计

参考 design.md 中的配色和设计规范，使用 Figma / Sketch 等工具制作。

## 设计要素

- 背景色: `#2563EB`
- 图形色: `#FFFFFF`
- 图形: 钱包造型，线条简洁
- 安全区域: 四周 12.5%
- 无透明背景（iOS 要求）
