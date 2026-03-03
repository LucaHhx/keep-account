# 计划日志

> 计划: data-reports | 创建: 2026-02-28

<!--
类型: [决策] [变更] [修复] [新增] [测试] [备注] [完成]
格式: - [类型] 内容
按日期分组，最新在前
-->

## 2026-02-28

- [完成] [qa] 完成任务 #3: 编写前端 ReportPage 组件测试 (8个E2E测试全部通过，含截图证据)
- [变更] [qa] 开始任务 #3: 编写前端 ReportPage 组件测试
- [完成] [qa] 完成任务 #2: 编写报表聚合计算正确性测试 (已知数据集验证) (已知数据集验证聚合结果全部正确)
- [变更] [qa] 开始任务 #2: 编写报表聚合计算正确性测试 (已知数据集验证)
- [完成] [qa] 完成任务 #1: 编写三个报表 API 集成测试 (月度总览/分类占比/趋势) (17个API测试全部通过)
- [变更] [qa] 开始任务 #1: 编写三个报表 API 集成测试 (月度总览/分类占比/趋势)
- [测试] [qa] QA 验收测试完成 — 全部通过，详见下方测试报告

### QA 验收测试报告

#### 测试环境
- 后端: `go run ./cmd/server` (端口 8080)
- 前端: `npm run dev` (端口 5173，代理 /api -> 8080)
- 浏览器: agent-browser --headed 有头模式
- 测试用户: qa_report_test
- 测试数据: 2026-02 月份，7笔支出(46000分) + 2笔收入(1800000分)

#### API 测试结果

| # | 用例 | 接口 | 方法 | 参数 | 状态码/code | 结果 |
|---|------|------|------|------|-------------|------|
| TC-001 | 月度总览-有数据月份 | /api/v1/reports/monthly-summary | GET | month=2026-02 | 200/0 | 通过 |
| TC-002 | 月度总览-无数据月份 | /api/v1/reports/monthly-summary | GET | month=2025-01 | 200/0 | 通过 |
| TC-003 | 月度总览-缺少month | /api/v1/reports/monthly-summary | GET | (无) | 200/1001 | 通过 |
| TC-004 | 月度总览-无效month格式 | /api/v1/reports/monthly-summary | GET | month=2026-2 | 200/1001 | 通过 |
| TC-005 | 月度总览-未授权 | /api/v1/reports/monthly-summary | GET | (无token) | 200/1005 | 通过 |
| TC-006 | 分类占比-支出 | /api/v1/reports/category-breakdown | GET | month=2026-02&type=expense | 200/0 | 通过 |
| TC-007 | 分类占比-收入 | /api/v1/reports/category-breakdown | GET | month=2026-02&type=income | 200/0 | 通过 |
| TC-008 | 分类占比-无数据月份 | /api/v1/reports/category-breakdown | GET | month=2025-01&type=expense | 200/0 | 通过 |
| TC-009 | 分类占比-缺少type | /api/v1/reports/category-breakdown | GET | month=2026-02 | 200/1001 | 通过 |
| TC-010 | 分类占比-无效type | /api/v1/reports/category-breakdown | GET | month=2026-02&type=invalid | 200/1001 | 通过 |
| TC-011 | 分类占比-缺少month | /api/v1/reports/category-breakdown | GET | type=expense | 200/1001 | 通过 |
| TC-012 | 趋势-按天 | /api/v1/reports/trend | GET | start_date=2026-02-01&end_date=2026-02-28&granularity=day | 200/0 | 通过 |
| TC-013 | 趋势-按月 | /api/v1/reports/trend | GET | start_date=2026-01-01&end_date=2026-03-31&granularity=month | 200/0 | 通过 |
| TC-014 | 趋势-缺少start_date | /api/v1/reports/trend | GET | end_date=2026-02-28 | 200/1001 | 通过 |
| TC-015 | 趋势-缺少end_date | /api/v1/reports/trend | GET | start_date=2026-02-01 | 200/1001 | 通过 |
| TC-016 | 趋势-无效granularity | /api/v1/reports/trend | GET | start_date=...&granularity=week | 200/1001 | 通过 |
| TC-017 | 趋势-默认granularity | /api/v1/reports/trend | GET | start_date=2026-02-01&end_date=2026-02-03 | 200/0 | 通过 |

**API 测试: 17/17 通过**

#### API 关键数据验证

**TC-001 月度总览**:
- 请求: `GET /api/v1/reports/monthly-summary?month=2026-02`
- 响应: `{"code":0,"data":{"month":"2026-02","income":1800000,"expense":46000,"balance":1754000}}`
- 验证: income=1800000(工资1500000+奖金300000), expense=46000(7笔支出之和), balance=income-expense=1754000 -- 正确

**TC-006 分类占比-支出**:
- 响应: total=46000, items=[购物20000(43.48%), 餐饮16500(35.87%), 娱乐6000(13.04%), 交通3500(7.61%)]
- 验证: 按amount降序 -- 正确; 百分比和=100.00 -- 正确; total=各项之和 -- 正确

**TC-007 分类占比-收入**:
- 响应: total=1800000, items=[工资1500000(83.33%), 奖金300000(16.67%)]
- 验证: 百分比和=100.00 -- 正确

**TC-012 趋势-按天**:
- 返回28条数据(2026-02有28天) -- 正确
- 02-01: expense=9000(早餐3500+午餐5000+地铁500) -- 正确
- 无数据日期补零 -- 正确

#### 浏览器 E2E 测试结果

| # | 场景 | 操作 | 预期 | 结果 | 截图 |
|---|------|------|------|------|------|
| E2E-01 | 报表页面展示 | 登录后导航到/reports | 展示月度总览+分类占比+趋势图 | 通过 | step-01-report-page.png |
| E2E-02 | 月度总览数据 | 查看2026年2月 | 收入18000/支出460/结余17540 | 通过 | step-01-report-page.png |
| E2E-03 | 分类占比图 | 查看环形图+分类列表 | 购物43.48%/餐饮35.87%/娱乐13.04%/交通7.61% | 通过 | step-02-report-scrolled.png |
| E2E-04 | 月份切换-空状态 | 切换到2026年1月 | 显示"本月暂无收支数据"+去记一笔 | 通过 | step-03-empty-state.png |
| E2E-05 | 分类下钻-购物 | 点击购物分类 | 显示购物分类的流水列表(1笔) | 通过 | step-04-category-drilldown.png |
| E2E-06 | 分类下钻-餐饮 | 点击餐饮分类 | 显示餐饮分类的流水列表(3笔) | 通过 | step-05-drilldown-food.png |
| E2E-07 | 返回报表 | 下钻页点击"返回报表" | 回到报表页，数据保持 | 通过 | - |
| E2E-08 | 空状态导航 | 点击"去记一笔" | 导航到记账页面 | 通过 | - |

**浏览器 E2E 测试: 8/8 通过**

#### 截图索引
- `screenshots/step-01-report-page.png` — 报表页面初始状态（月度总览+环形图+趋势图）
- `screenshots/step-02-report-scrolled.png` — 报表页面完整展示
- `screenshots/step-03-empty-state.png` — 无数据月份空状态
- `screenshots/step-04-category-drilldown.png` — 购物分类下钻页面
- `screenshots/step-05-drilldown-food.png` — 餐饮分类下钻页面

#### 验收清单核对

| 验收项 | 状态 | 说明 |
|--------|------|------|
| 报表页展示月度总览：收入总额、支出总额、结余 | 通过 | 三个 StatCard，金额从分转元正确 |
| 可以左右切换查看不同月份的报表 | 通过 | MonthPicker 左右箭头正常工作 |
| 分类占比图正确展示各分类的支出占比 | 通过 | DonutChart 环形图 + 分类列表，数据与 API 一致 |
| 趋势图正确展示最近30天收支趋势 | 通过 | BarChart 柱状图展示每日支出 |
| 点击分类可以下钻查看该分类的流水列表 | 通过 | 购物(1笔)和餐饮(3笔)下钻验证通过 |
| 图表风格统一、美观 | 通过 | 环形图和柱状图风格一致，配色协调 |
| 无数据月份展示空状态并引导用户去记账 | 通过 | 空状态提示+去记一笔按钮 |

**验收清单: 7/7 全部通过**

#### 发现的问题

| 问题 | 严重程度 | 描述 |
|------|----------|------|
| 下钻页面标题显示"快速记账" | 低 | CategoryDrilldownPage 路由未被 AppLayout navItems 匹配，标题 fallback 到第一项"快速记账"。功能不受影响。 |

---

- [完成] [frontend] 完成任务 #8: 实现 CategoryDrilldownPage 分类下钻页面
- [变更] [frontend] 开始任务 #8: 实现 CategoryDrilldownPage 分类下钻页面
- [完成] [frontend] 完成任务 #2: 实现 ReportPage 报表页面 (月份切换+总览+占比+趋势)
- [变更] [frontend] 开始任务 #2: 实现 ReportPage 报表页面 (月份切换+总览+占比+趋势)
- [完成] [frontend] 完成任务 #7: 集成 BarChart 趋势柱状图
- [变更] [frontend] 开始任务 #7: 集成 BarChart 趋势柱状图
- [完成] [frontend] 完成任务 #6: 实现 CategoryBreakdownList 分类占比详细列表
- [变更] [frontend] 开始任务 #6: 实现 CategoryBreakdownList 分类占比详细列表
- [完成] [frontend] 完成任务 #5: 集成 DonutChart 分类占比环形图
- [完成] [backend] 完成任务 #4: 实现趋势图无数据日期补全零值逻辑
- [变更] [backend] 开始任务 #4: 实现趋势图无数据日期补全零值逻辑
- [完成] [backend] 完成任务 #3: 实现 GET /api/v1/reports/trend 趋势图数据接口
- [变更] [backend] 开始任务 #3: 实现 GET /api/v1/reports/trend 趋势图数据接口
- [完成] [backend] 完成任务 #2: 实现 GET /api/v1/reports/category-breakdown 分类占比接口
- [变更] [frontend] 开始任务 #5: 集成 DonutChart 分类占比环形图
- [变更] [backend] 开始任务 #2: 实现 GET /api/v1/reports/category-breakdown 分类占比接口
- [完成] [backend] 完成任务 #1: 实现 GET /api/v1/reports/monthly-summary 月度总览接口
- [完成] [frontend] 完成任务 #4: 实现 StatCard 月度总览统计卡片组件
- [变更] [frontend] 开始任务 #4: 实现 StatCard 月度总览统计卡片组件
- [完成] [frontend] 完成任务 #3: 实现 MonthPicker 月份切换组件
- [变更] [frontend] 开始任务 #3: 实现 MonthPicker 月份切换组件
- [完成] [frontend] 完成任务 #1: 实现 useReportStore (Zustand: 月份切换/总览/占比/趋势)
- [变更] [frontend] 开始任务 #1: 实现 useReportStore (Zustand: 月份切换/总览/占比/趋势)
- [变更] [backend] 开始任务 #1: 实现 GET /api/v1/reports/monthly-summary 月度总览接口
- [变更] 文档清理: ui/design.md 效果图清单移除已删除的 mobile.html, 统一为 merge.html
- [完成] UI 设计师完成报表页效果图（月度总览+分类占比环形图+趋势柱状图+空状态）
- [完成] [ui] 完成任务 #1: 设计报表页面效果图（月度总览+分类占比+趋势图） (完成报表页效果图（月度总览+分类占比环形图+趋势柱状图+空状态）)
- [变更] [ui] 开始任务 #1: 设计报表页面效果图（月度总览+分类占比+趋势图）
- [新增] 补充 QA design.md (测试策略+测试范围) 和 tasks.md (3项测试任务)
- [决策] 分类占比默认只展示支出，MVP 不做收入/支出切换
- [决策] 不做年度报表、自定义时间范围和对比分析
- [决策] 需要做分类下钻到流水列表功能
- [决策] MVP 三种图表都做：月度总览、分类占比、趋势图
- [备注] PRD 中包含技术建议（图表组件选择、数据补全策略、聚合方式等），供开发团队参考
- [新增] 创建计划