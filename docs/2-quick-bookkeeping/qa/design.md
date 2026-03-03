# qa 设计文档

> 需求: quick-bookkeeping | 角色: qa

## 测试策略

### 后端测试

| 类型 | 范围 | 工具 |
|------|------|------|
| 单元测试 | 交易/分类 service 层 | Go testing + testify |
| 集成测试 | 分类和记账 API 端到端 | Go testing + httptest |

### 前端测试

| 类型 | 范围 | 工具 |
|------|------|------|
| 组件测试 | BookkeepingPage / CategoryManagePage | Vitest + React Testing Library |
| Store 测试 | useCategoryStore / useTransactionStore | Vitest |

## 测试范围

### 分类管理

- 获取分类列表 -> 返回系统预设 + 用户自定义分类
- 按类型筛选分类（expense / income）-> 返回对应类型
- 添加自定义分类 -> 创建成功，is_default=false
- 添加重复名称分类（同类型）-> 返回 code 2001
- 系统预设分类不可删除
- 删除自定义分类 -> 删除成功
- 删除系统预设分类 -> 返回 code 3001
- 删除被交易引用的分类 -> 返回 code 3002

### 记账流程

- 支出记账：金额 + 分类 + 保存 -> 创建成功
- 收入记账：金额 + 分类 + 保存 -> 创建成功
- 转账记账：金额 + 保存（无需分类）-> 创建成功
- 金额为 0 或负数 -> 返回 code 1001
- expense/income 不传 category_id -> 返回 code 1001
- transfer 不传 category_id -> 创建成功
- 备注为空 -> 创建成功
- occurred_at 为空 -> 默认为当前时间
- 金额精度：前端传分（int），验证存储正确

### 金额边界

- 最小金额：1 分 (0.01 元)
- 大金额：超过 int32 范围的金额（int64 支持）

## 关键决策

- 重点测试三种记账类型（expense/income/transfer）的差异化校验逻辑
- 金额精度是核心，需要验证前端分<->元转换和后端存储的一致性
