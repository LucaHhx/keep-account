# frontend 设计文档

> 需求: transaction-list | 角色: frontend

## 技术选型

同项目统一前端技术栈。

## 架构设计

### 页面组件

#### TransactionListPage（流水页 -- Tab 2）

- 路由：`/transactions`（主 Tab 第二个页面）
- 组件结构：
  1. **筛选栏**：类型筛选（全部/支出/收入/转账）+ 时间范围选择
  2. **流水列表**：按日分组展示，每组显示日期标题和当日收支小计
  3. **每条流水项**：类型图标 + 分类名 + 备注 + 金额（支出红色/收入绿色）
  4. **空状态**：无数据时展示引导去记账
  5. **加载更多**：滚动到底部自动加载下一页

#### TransactionDetailPage（流水明细页）

- 入口：点击流水列表中的某条记录
- 展示方式：底部弹出模态框（Bottom Sheet），与 UI 设计稿对齐
- 布局：拖拽指示条 + 标题栏("流水详情" + 编辑/删除按钮) + 金额居中大号显示 + 信息列表
- 功能：
  1. 展示完整信息（类型、金额、分类、备注、时间）
  2. 编辑按钮：进入编辑模式，可修改金额、分类、备注、时间
  3. 删除按钮：二次确认后删除（居中弹出确认对话框）

### 状态管理

扩展 useTransactionStore：

```typescript
interface TransactionListState {
  // 列表数据
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;

  // 筛选条件
  filterType: 'all' | 'expense' | 'income' | 'transfer';
  filterStartDate: string | null;
  filterEndDate: string | null;

  // 操作
  fetchTransactions: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  setFilterType: (type: string) => void;
  setFilterDateRange: (start: string, end: string) => void;
  clearFilters: () => void;
  updateTransaction: (id: number, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
}

interface Transaction {
  id: number;
  type: 'expense' | 'income' | 'transfer';
  amount: number;  // 单位：分
  category_id: number | null;
  category_name: string;
  category_icon: string;
  note: string;
  occurred_at: string;
  created_at: string;
  updated_at: string;
}
```

### 通用组件

| 组件 | 说明 |
|------|------|
| TransactionItem | 单条流水展示组件（图标+分类+金额+时间） |
| DayGroup | 按日分组容器，展示日期标题和当日收支小计 |
| FilterBar | 筛选栏组件（类型 Tab + 日期范围选择器） |
| ConfirmDialog | 确认删除对话框 |
| EmptyState | 空状态组件，引导用户去记账 |

### 交互细节

1. **按日分组**：前端根据 occurred_at 按日分组显示，日期格式为"今天"、"昨天"、"2月26日 周四"
2. **金额展示**：支出显示为 "-38.50"（红色），收入显示为 "+5000.00"（绿色），转账显示为 "38.50"（灰色）
3. **分页加载**：首次加载 20 条，滚动到底部自动加载下一页，直到 hasMore = false
4. **编辑保存**：编辑成功后更新列表中对应项，无需重新拉取整个列表
5. **删除确认**：删除前弹出确认对话框，确认后从列表中移除该项

## 关键决策

- 流水列表使用分页加载而非一次性加载，保证性能
- 按日分组在前端完成（API 返回扁平列表），简化后端逻辑
- 金额展示时除以 100 转为元，保留两位小数
- 编辑使用局部更新策略（乐观更新 + API 同步），减少网络请求
- 筛选条件变更时重置分页，重新从第 1 页加载
