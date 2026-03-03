# FIX-12: tauriAdapter丢失query参数

> 日期: 2026-03-03 | 状态: 已修复 | 严重程度: P0

## 现象

macOS 和 iOS 端所有带 query 参数的 GET 请求均失败（400）。例如：
- `GET /api/v1/reports/category-breakdown` → `month 参数必填`
- `GET /api/v1/reports/monthly-summary` → 同上
- `GET /api/v1/reports/trend` → 缺少 start_date/end_date
- `GET /api/v1/transactions` → 分页/筛选参数丢失

Web 浏览器端正常，仅 Tauri 环境（桌面 + 移动端）受影响。

## 根因分析

自定义 `tauriAdapter` 使用 `@tauri-apps/plugin-http` 的原生 fetch 替代标准 Axios adapter，但在 URL 拼接时**完全遗漏了 `config.params` 的序列化**。标准 Axios adapter 会自动将 params 对象序列化为 query string 追加到 URL 上，但自定义 adapter 绕过了这一逻辑。

## 修复方案

在 `tauriAdapter` 的 URL 拼接完成后，增加 `config.params` → query string 的序列化逻辑，使用 `URLSearchParams` 将参数拼接到 URL。

## 变更文件

| 文件 | 修改说明 |
|------|----------|
| `web/src/lib/axios.ts` | tauriAdapter 中增加 config.params 序列化为 query string |

## 验收标准

- [ ] macOS/iOS 端报表页面正常加载（monthly-summary、category-breakdown、trend）
- [ ] macOS/iOS 端交易列表分页和筛选正常工作
- [ ] Web 端行为不受影响
