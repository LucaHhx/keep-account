# qa 设计文档

> 需求: transaction-list | 角色: qa

## 测试策略

### 后端测试

| 类型 | 范围 | 工具 |
|------|------|------|
| 单元测试 | 流水查询/编辑/删除 service 层 | Go testing + testify |
| 集成测试 | 流水 CRUD API 端到端 | Go testing + httptest |

### 前端测试

| 类型 | 范围 | 工具 |
|------|------|------|
| 组件测试 | TransactionListPage / TransactionDetailPage | Vitest + React Testing Library |
| Store 测试 | useTransactionStore 列表/筛选逻辑 | Vitest |

## 测试范围

### 流水列表

- 默认按 occurred_at 倒序，分页返回（默认 20 条）
- 类型筛选：expense / income / transfer / 不传（全部）
- 时间范围筛选：start_date + end_date
- 分类筛选：category_id（报表下钻场景）
- 分页：page=1, page_size=20，验证 total 和 items 数量
- page_size 超过 100 -> 限制为 100
- 无数据 -> 返回空列表 + total=0
- 数据隔离：用户只能查看自己的流水

### 流水明细

- 获取单条流水 -> 返回完整信息（含分类名和图标）
- 获取不存在的流水 -> 返回 code 3001
- 获取他人的流水 -> 返回 code 3002

### 编辑流水

- 修改金额 -> 更新成功
- 修改分类 -> 更新成功
- 修改备注/时间 -> 更新成功
- 修改 type -> 不允许
- amount <= 0 -> 返回 code 1001
- category_id 无效 -> 返回 code 2002
- 编辑他人流水 -> 返回 code 3002

### 删除流水

- 正常删除 -> 成功，硬删除
- 删除不存在的流水 -> 返回 code 3001
- 删除他人流水 -> 返回 code 3002

## 关键决策

- 数据隔离是安全关键，每个 CRUD 操作都需要验证 user_id 权限
- 分页边界条件需要覆盖
