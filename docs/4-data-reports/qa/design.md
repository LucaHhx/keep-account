# qa 设计文档

> 需求: data-reports | 角色: qa

## 测试策略

### 后端测试

| 类型 | 范围 | 工具 |
|------|------|------|
| 单元测试 | 报表聚合计算逻辑 | Go testing + testify |
| 集成测试 | 三个报表 API 端到端 | Go testing + httptest |

### 前端测试

| 类型 | 范围 | 工具 |
|------|------|------|
| 组件测试 | ReportPage / MonthPicker / StatCard | Vitest + React Testing Library |
| Store 测试 | useReportStore 月份切换/数据加载 | Vitest |

## 测试范围

### 月度总览

- 有数据月份 -> 返回正确的 income/expense/balance
- balance = income - expense 计算正确
- 无数据月份 -> 返回 income=0, expense=0, balance=0
- 仅有支出无收入 -> balance 为负
- 金额单位为分，验证聚合精度

### 分类占比

- 有数据 -> 返回各分类 amount 和 percentage
- percentage 之和 = 100%（允许浮点误差）
- 按 amount 降序排列
- 无数据 -> 返回空 items + total=0
- 仅一个分类 -> percentage=100

### 趋势图

- 按天粒度 -> 每天一条数据
- 无数据日期 -> income=0, expense=0（后端补零）
- 日期范围内所有日期都包含在结果中
- 按月粒度 -> 每月一条数据

### 分类下钻

- 点击分类 -> 调用流水列表 API 带 category_id + month 筛选
- 验证返回的流水都属于该分类和月份

## 关键决策

- 报表数据的正确性是核心，需要用已知数据集验证聚合结果
- 百分比精度验证：各分类百分比之和应接近 100%
- 无数据日期的补零逻辑需要专项测试
