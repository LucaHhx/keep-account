# frontend 设计文档

> 需求: data-reports | 角色: frontend

## 技术选型

同项目统一前端技术栈。

图表方案：使用 create-web skill 提供的内置图表组件（DonutChart + BarChart），无需引入第三方图表库。

## 架构设计

### 页面组件

#### ReportPage（报表页 -- Tab 3）

- 路由：`/reports`（主 Tab 第三个页面）
- 组件结构：
  1. **月份切换栏**：左箭头 + 当前月份（如"2026年2月"）+ 右箭头
  2. **月度总览卡片**：三个 StatCard 展示收入、支出、结余
  3. **分类占比图**：环形图（DonutChart），展示支出各分类占比
  4. **分类列表**：占比图下方的详细列表，每项显示分类名、金额、百分比
  5. **趋势图**：柱状图（BarChart），展示最近 30 天每日支出趋势
  6. **空状态**：该月无数据时展示引导去记账

#### CategoryDrilldownPage（分类下钻页）

- 入口：点击分类占比图或分类列表中的某个分类
- 展示：该分类在当月的所有流水列表
- 复用 TransactionItem 组件

### 状态管理

#### useReportStore (Zustand)

```typescript
interface ReportState {
  // 当前查看月份
  currentMonth: string;  // 格式 YYYY-MM

  // 月度总览
  summary: MonthlySummary | null;
  summaryLoading: boolean;

  // 分类占比
  breakdown: CategoryBreakdown | null;
  breakdownLoading: boolean;

  // 趋势数据
  trend: TrendData | null;
  trendLoading: boolean;

  // 操作
  setMonth: (month: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  fetchSummary: () => Promise<void>;
  fetchBreakdown: () => Promise<void>;
  fetchTrend: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

interface CategoryBreakdown {
  month: string;
  type: string;
  total: number;
  items: {
    category_id: number;
    category_name: string;
    category_icon: string;
    amount: number;
    percentage: number;
  }[];
}

interface TrendData {
  granularity: string;
  items: {
    date: string;
    income: number;
    expense: number;
  }[];
}
```

### 通用组件

| 组件 | 说明 |
|------|------|
| MonthPicker | 月份切换组件（左右箭头 + 当前月份文本） |
| StatCard | 统计卡片（标题 + 金额数字，支持不同颜色） |
| DonutChart | 环形图（复用 create-web skill 的 DonutChart） |
| BarChart | 柱状图（复用 create-web skill 的 BarChart） |
| CategoryBreakdownList | 分类占比详细列表 |

### 交互细节

1. **月份切换**：切换月份时重新拉取三个报表接口数据
2. **金额展示**：所有金额从分转为元展示，收入绿色、支出红色、结余根据正负变色
3. **分类占比图**：默认展示支出占比，后续可扩展收入占比切换
4. **趋势图**：默认展示当月每日支出趋势，x 轴为日期，y 轴为金额
5. **分类下钻**：点击分类后，使用流水列表接口筛选该分类+该月的数据

## 关键决策

- 使用内置图表组件（DonutChart / BarChart），不引入第三方图表库，减少包体积
- 分类占比默认只展示支出，MVP 不做收入/支出切换
- 趋势图默认按天展示当月数据，MVP 不做按月粒度切换
- 月份切换触发全部三个报表接口的重新请求
- 分类下钻复用流水列表组件和 API，添加 category_id 筛选参数
