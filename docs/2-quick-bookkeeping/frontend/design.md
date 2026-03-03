# frontend 设计文档

> 需求: quick-bookkeeping | 角色: frontend

## 技术选型

同 account-system 前端技术栈。

## 架构设计

### 页面组件

#### BookkeepingPage（记账页 -- 首页/Tab 1）

- 路由：`/`（主 Tab 第一个页面）
- 核心交互流程：输入金额 -> 选分类 -> 保存
- 组件结构（与 UI 设计稿对齐）：
  1. **类型切换栏**：支出 / 收入 / 转账 Segmented Control 样式
  2. **金额输入区**：48px 大号数字 + 人民币符号，使用系统原生键盘（input type="number" inputmode="decimal"）
  3. **分类选择区**：5 列网格，圆形图标 + 文字标签，选中高亮
  4. **附加信息栏**：备注输入 + 日期选择，一行排列
  5. **保存按钮**：固定底部，全宽主色按钮

#### CategoryManagePage（分类管理页）

- 入口：从"我的"页面进入
- 功能：
  1. 展示所有分类（按支出/收入 Tab 切换）
  2. 系统预设分类不可删除（无删除按钮）
  3. 添加自定义分类：名称 + 类型 + 图标选择

### 状态管理

#### useCategoryStore (Zustand)

```typescript
interface CategoryState {
  categories: Category[];
  loading: boolean;

  fetchCategories: () => Promise<void>;
  addCategory: (data: CreateCategoryInput) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  getCategoriesByType: (type: 'expense' | 'income') => Category[];
}

interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  sort: number;
  is_default: boolean;
}
```

#### useTransactionStore (Zustand)

```typescript
interface TransactionState {
  // 记账表单状态
  draftType: 'expense' | 'income' | 'transfer';
  draftAmount: string;  // 输入中的金额字符串
  draftCategoryId: number | null;
  draftNote: string;
  draftDate: Date;

  // 操作
  setDraftType: (type: string) => void;
  setDraftAmount: (amount: string) => void;
  setDraftCategoryId: (id: number) => void;
  setDraftNote: (note: string) => void;
  setDraftDate: (date: Date) => void;
  resetDraft: () => void;
  submitTransaction: () => Promise<void>;
}
```

### 通用组件

| 组件 | 说明 |
|------|------|
| AmountInput | 金额输入组件，48px 大号数字显示，系统原生键盘（inputmode="decimal"） |
| CategoryGrid | 分类选择网格，支持选中状态高亮 |
| DatePicker | 日期选择器，默认今天 |
| TabSwitcher | Tab 切换组件（支出/收入/转账） |

### 交互细节

1. **金额输入**：使用系统原生键盘（`<input type="number" inputmode="decimal">`），最多两位小数，前端以字符串维护输入状态，提交时转换为分（乘以 100）
2. **分类选择**：网格布局（一行 4-5 个），图标 + 文字，选中高亮
3. **保存反馈**：保存成功后显示 Toast 提示，并重置表单
4. **转账类型**：隐藏分类选择区，仅显示金额和备注

## 关键决策

- 金额输入使用系统原生键盘（inputmode="decimal"），减少自定义组件复杂度，跨平台体验更一致
- 金额以字符串维护输入状态，避免浮点数精度问题，提交时乘以 100 转为分
- 记账页作为首页（Tab 1），用户打开应用即可快速记账
- 分类选择不做搜索，网格展示足以覆盖 MVP 的分类数量
- 记账成功后重置表单但保留类型选择，方便连续记账
