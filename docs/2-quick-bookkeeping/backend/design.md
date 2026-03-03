# backend 设计文档

> 需求: quick-bookkeeping | 角色: backend

## 技术选型

同 account-system 后端技术栈（Go + Gin + GORM + SQLite）。

## 架构设计

### 数据模型

#### categories 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uint | PK, auto increment | 分类 ID |
| user_id | uint | not null, index | 所属用户（0 表示系统预设） |
| name | varchar(32) | not null | 分类名称 |
| type | varchar(10) | not null | 分类类型：expense / income |
| icon | varchar(32) | | 图标标识符 |
| sort | int | default 0 | 排序权重，越小越靠前 |
| is_default | bool | default false | 是否为系统预设分类 |
| created_at | datetime | not null | 创建时间 |
| updated_at | datetime | not null | 更新时间 |

约束规则：
- user_id + name + type 联合唯一（同一用户下同类型分类名不重复）
- 系统预设分类 user_id = 0, is_default = true
- 用户自定义分类 user_id = 用户ID, is_default = false

系统预设分类（种子数据）：

> icon 字段存储标识符，前端通过映射表转为 Lucide React 图标组件名。

支出类：
| 名称 | 图标标识符 | Lucide 图标 |
|------|-----------|------------|
| 餐饮 | food | Coffee |
| 交通 | transport | Car |
| 购物 | shopping | ShoppingBag |
| 娱乐 | entertainment | Gamepad2 |
| 住房 | housing | Home |
| 通讯 | communication | Smartphone |
| 医疗 | medical | Heart |
| 教育 | education | GraduationCap |
| 其他 | other | MoreHorizontal |

收入类：
| 名称 | 图标标识符 | Lucide 图标 |
|------|-----------|------------|
| 工资 | salary | Briefcase |
| 奖金 | bonus | Gift |
| 兼职 | parttime | DollarSign |
| 理财 | investment | TrendingUp |
| 其他 | other | MoreHorizontal |

#### transactions 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uint | PK, auto increment | 交易 ID |
| user_id | uint | not null, index | 所属用户 |
| type | varchar(10) | not null | 交易类型：expense / income / transfer |
| amount | int64 | not null | 金额（单位：分，避免浮点精度问题） |
| category_id | uint | | 分类 ID（转账时可为空） |
| note | varchar(255) | | 备注 |
| occurred_at | datetime | not null | 发生时间 |
| created_at | datetime | not null | 创建时间 |
| updated_at | datetime | not null | 更新时间 |

约束规则：
- amount > 0
- expense / income 类型必须有 category_id
- transfer 类型 category_id 可为空
- occurred_at 默认为当前时间
- 金额以"分"为单位存储（int64），前端展示时除以 100

### API 接口设计

所有接口需要 JWT 鉴权，前缀：`/api/v1`

#### 分类管理

##### GET /api/v1/categories

获取当前用户的分类列表（系统预设 + 用户自定义）。

查询参数：
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 可选，筛选类型：expense / income |

成功响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "餐饮",
        "type": "expense",
        "icon": "food",
        "sort": 0,
        "is_default": true
      }
    ]
  }
}
```

##### POST /api/v1/categories

添加自定义分类。

请求体：
```json
{
  "name": "宠物",
  "type": "expense",
  "icon": "pet"
}
```

成功响应：
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 20,
    "name": "宠物",
    "type": "expense",
    "icon": "pet",
    "sort": 100,
    "is_default": false
  }
}
```

##### DELETE /api/v1/categories/:id

删除用户自定义分类。系统预设分类（is_default=true）不可删除。

路径参数：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | uint | 分类 ID |

校验规则：
- 分类必须存在且属于当前用户
- 系统预设分类（is_default=true）不可删除，返回 code 3001
- 已被交易记录引用的分类不可删除，返回 code 3002

成功响应：
```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

#### 记账

##### POST /api/v1/transactions

新增一笔交易记录。

请求体：
```json
{
  "type": "expense",
  "amount": 3850,
  "category_id": 1,
  "note": "午饭",
  "occurred_at": "2026-02-28T12:30:00Z"
}
```

校验规则：
- type: 必填，枚举值 expense / income / transfer
- amount: 必填，> 0（单位：分）
- category_id: expense / income 时必填，transfer 时可选
- occurred_at: 可选，默认当前时间

成功响应：
```json
{
  "code": 0,
  "message": "记账成功",
  "data": {
    "id": 1,
    "type": "expense",
    "amount": 3850,
    "category_id": 1,
    "category_name": "餐饮",
    "note": "午饭",
    "occurred_at": "2026-02-28T12:30:00Z",
    "created_at": "2026-02-28T12:31:00Z"
  }
}
```

### 业务逻辑要点

1. 新用户注册时自动初始化系统预设分类（复制到用户名下，或查询时合并系统预设）
   - 方案选择：查询时合并（减少数据冗余，系统预设分类 user_id=0 全局共享）
2. 金额以"分"为单位存储，避免浮点数精度问题。前端传入分，展示时除以 100
3. 自定义分类排序值默认为 100，排在预设分类之后
4. 预设分类（is_default=true）不可被用户删除或修改

## 关键决策

- 金额单位使用"分"（int64），不使用浮点数，避免精度问题
- 系统预设分类全局共享（user_id=0），不为每个用户复制一份
- 去掉 Account 实体，Transaction 不关联账户
- transfer 类型的 category_id 允许为空，简化转账记录
- 预设分类种子数据在应用启动时通过 GORM AutoMigrate + Seed 初始化
