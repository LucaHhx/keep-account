# backend 设计文档

> 需求: data-reports | 角色: backend

## 技术选型

同项目统一后端技术栈。报表数据通过 SQL 聚合查询从 transactions 表生成，不额外建表。

## 架构设计

### API 接口设计

所有接口需要 JWT 鉴权，前缀：`/api/v1`

#### GET /api/v1/reports/monthly-summary

月度总览：当月收入、支出、结余。

查询参数：
| 参数 | 类型 | 说明 |
|------|------|------|
| month | string | 必填，格式 YYYY-MM，如 2026-02 |

成功响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "month": "2026-02",
    "income": 1000000,
    "expense": 650000,
    "balance": 350000
  }
}
```

说明：
- income / expense / balance 单位均为分
- balance = income - expense
- 聚合查询：`SELECT type, SUM(amount) FROM transactions WHERE user_id=? AND occurred_at BETWEEN ? AND ? GROUP BY type`

#### GET /api/v1/reports/category-breakdown

分类占比：按分类汇总支出或收入。

查询参数：
| 参数 | 类型 | 说明 |
|------|------|------|
| month | string | 必填，格式 YYYY-MM |
| type | string | 必填，expense 或 income |

成功响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "month": "2026-02",
    "type": "expense",
    "total": 650000,
    "items": [
      {
        "category_id": 1,
        "category_name": "餐饮",
        "category_icon": "food",
        "amount": 280000,
        "percentage": 43.08
      },
      {
        "category_id": 2,
        "category_name": "交通",
        "category_icon": "transport",
        "amount": 150000,
        "percentage": 23.08
      }
    ]
  }
}
```

说明：
- items 按 amount 降序排列
- percentage = (amount / total) * 100，保留两位小数
- 聚合查询：`SELECT category_id, SUM(amount) FROM transactions WHERE user_id=? AND type=? AND occurred_at BETWEEN ? AND ? GROUP BY category_id ORDER BY SUM(amount) DESC`

#### GET /api/v1/reports/trend

趋势图数据：按天或按月展示收支趋势。

查询参数：
| 参数 | 类型 | 说明 |
|------|------|------|
| start_date | string | 必填，开始日期 YYYY-MM-DD |
| end_date | string | 必填，结束日期 YYYY-MM-DD |
| granularity | string | 可选，day（默认）或 month |

成功响应（按天）：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "granularity": "day",
    "items": [
      {
        "date": "2026-02-01",
        "income": 0,
        "expense": 8500
      },
      {
        "date": "2026-02-02",
        "income": 1000000,
        "expense": 12300
      }
    ]
  }
}
```

说明：
- 按天时，date 格式为 YYYY-MM-DD
- 按月时，date 格式为 YYYY-MM
- 无数据的日期也要返回（income=0, expense=0），前端需要完整的时间轴
- 日期范围内的所有日期/月份都要包含在结果中

### 业务逻辑要点

1. 所有报表查询都基于 transactions 表的聚合查询，不需要额外的汇总表
2. 月度总览的时间范围为该月第一天 00:00:00 到最后一天 23:59:59
3. 趋势图需要补全无数据的日期（在后端补全，返回完整时间序列）
4. 分类占比需要 JOIN categories 表获取分类名称和图标
5. 所有金额返回单位为分，百分比由后端计算

## 关键决策

- 报表数据实时聚合查询，不做预计算/缓存（MVP 数据量小，SQLite 聚合性能足够）
- 趋势图无数据日期由后端补全零值，简化前端逻辑
- 分类占比百分比由后端计算，确保精度一致
- 趋势图默认粒度为天，支持按月切换
