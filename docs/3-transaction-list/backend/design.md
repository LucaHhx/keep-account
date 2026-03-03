# backend 设计文档

> 需求: transaction-list | 角色: backend

## 技术选型

同项目统一后端技术栈。数据模型复用 quick-bookkeeping 中定义的 transactions 表。

## 架构设计

### API 接口设计

所有接口需要 JWT 鉴权，前缀：`/api/v1`

#### GET /api/v1/transactions

获取流水列表（分页，按时间倒序）。

查询参数：
| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码，默认 1 |
| page_size | int | 每页条数，默认 20，最大 100 |
| type | string | 可选，筛选类型：expense / income / transfer |
| category_id | int | 可选，按分类筛选（用于报表分类下钻） |
| start_date | string | 可选，开始日期 YYYY-MM-DD |
| end_date | string | 可选，结束日期 YYYY-MM-DD |

成功响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "type": "expense",
        "amount": 3850,
        "category_id": 1,
        "category_name": "餐饮",
        "category_icon": "food",
        "note": "午饭",
        "occurred_at": "2026-02-28T12:30:00Z",
        "created_at": "2026-02-28T12:31:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "page_size": 20
  }
}
```

查询逻辑：
- 仅返回当前用户（user_id）的数据
- 按 occurred_at 倒序排列
- start_date 和 end_date 为 occurred_at 的范围筛选（包含边界）
- type 筛选为精确匹配
- 返回关联的分类名称和图标（LEFT JOIN categories 表）

#### GET /api/v1/transactions/:id

获取单条流水明细。

成功响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "type": "expense",
    "amount": 3850,
    "category_id": 1,
    "category_name": "餐饮",
    "category_icon": "food",
    "note": "午饭",
    "occurred_at": "2026-02-28T12:30:00Z",
    "created_at": "2026-02-28T12:31:00Z",
    "updated_at": "2026-02-28T12:31:00Z"
  }
}
```

#### PUT /api/v1/transactions/:id

编辑流水。

请求体（部分更新，仅传需要修改的字段）：
```json
{
  "amount": 4200,
  "category_id": 2,
  "note": "晚饭",
  "occurred_at": "2026-02-28T18:30:00Z"
}
```

校验规则：
- 只能编辑自己的流水（user_id 匹配）
- amount 如传入则 > 0
- category_id 如传入则必须是有效分类
- type 不可修改（如需修改类型，应删除后重新创建）

成功响应：
```json
{
  "code": 0,
  "message": "更新成功",
  "data": { /* 更新后的完整流水对象 */ }
}
```

#### DELETE /api/v1/transactions/:id

删除流水。

校验：只能删除自己的流水。

成功响应：
```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

### 业务逻辑要点

1. 所有查询和操作都通过 JWT 中的 user_id 做数据隔离
2. 分页查询使用 GORM 的 `Offset` + `Limit`，同时查询总条数
3. 流水列表接口通过 Preload 或 JOIN 返回分类信息，避免 N+1 查询
4. 删除为硬删除（MVP 阶段不做软删除）

## 关键决策

- 分页默认 20 条，最大 100 条，防止大量数据传输
- 流水类型 type 不可编辑，需修改类型时删除重建
- 删除为硬删除，MVP 不需要回收站功能
- 日期筛选使用 occurred_at 字段，不使用 created_at
