# 计划日志

> 计划: quick-bookkeeping | 创建: 2026-02-28

<!--
类型: [决策] [变更] [修复] [新增] [测试] [备注] [完成]
格式: - [类型] 内容
按日期分组，最新在前
-->

## 2026-02-28

- [完成] [qa] 完成任务 #4: 编写删除自定义分类 API 测试 (成功删除/预设不可删/被引用不可删)
- [变更] [qa] 开始任务 #4: 编写删除自定义分类 API 测试 (成功删除/预设不可删/被引用不可删)
- [完成] [qa] 完成任务 #3: 编写前端 BookkeepingPage 组件测试
- [测试] [qa] 浏览器 E2E 测试 Phase B 完成，4 个用户场景全部通过，发现 2 个非阻塞问题
- [变更] [qa] 开始任务 #3: 编写前端 BookkeepingPage 组件测试
- [完成] [qa] 完成任务 #2: 编写记账 API 集成测试 (三种类型+参数校验)
- [变更] [qa] 开始任务 #2: 编写记账 API 集成测试 (三种类型+参数校验)
- [完成] [qa] 完成任务 #1: 编写分类管理 API 集成测试 (获取/添加/重复名称)
- [测试] [qa] API 测试 Phase A 完成，22 项测试用例，20 通过，2 项偏差（错误码与设计文档不一致但功能正确）

### API 测试结果

| # | 测试用例 | 方法 | 接口 | 预期 | 实际 | 结果 |
|---|----------|------|------|------|------|------|
| TC-001 | 获取全部分类列表 | GET | /api/v1/categories | code=0, 14项 | code=0, 14项(9支出+5收入) | 通过 |
| TC-002 | 按类型筛选(expense) | GET | /api/v1/categories?type=expense | 9项支出分类 | 9项 | 通过 |
| TC-003 | 按类型筛选(income) | GET | /api/v1/categories?type=income | 5项收入分类 | 5项 | 通过 |
| TC-004 | 添加自定义分类 | POST | /api/v1/categories | code=0, is_default=false | code=0, id=17, is_default=false, sort=100 | 通过 |
| TC-005 | 添加重复名称分类(同类型) | POST | /api/v1/categories | code=2001 | code=2001 "分类名称已存在" | 通过 |
| TC-006 | 同名不同类型分类 | POST | /api/v1/categories | code=0 | code=0, id=18 | 通过 |
| TC-007 | 删除系统预设分类 | DELETE | /api/v1/categories/1 | code=3001 | code=2003 "预设分类不可删除" | 偏差(功能正确,code不一致) |
| TC-008 | 删除自定义分类 | DELETE | /api/v1/categories/18 | code=0 | code=0 "删除成功" | 通过 |
| TC-009 | 删除被交易引用的分类 | DELETE | /api/v1/categories/17 | code=3002 | code=2004 "分类已被交易记录引用，不可删除" | 偏差(功能正确,code不一致) |
| TC-010 | 支出记账(正常) | POST | /api/v1/transactions | code=0 | code=0, amount=3850, category_name="餐饮" | 通过 |
| TC-011 | 收入记账(正常) | POST | /api/v1/transactions | code=0 | code=0, amount=500000, category_name="工资" | 通过 |
| TC-012 | 转账记账(无分类) | POST | /api/v1/transactions | code=0 | code=0, category_id=null | 通过 |
| TC-013 | 金额为0 | POST | /api/v1/transactions | code=1001 | code=1001 "参数校验失败" | 通过 |
| TC-014 | 金额为负数 | POST | /api/v1/transactions | code=1001 | code=1001 "参数校验失败" | 通过 |
| TC-015 | expense不传category_id | POST | /api/v1/transactions | code=1001 | code=1001 "支出/收入类型必须选择分类" | 通过 |
| TC-016 | income不传category_id | POST | /api/v1/transactions | code=1001 | code=1001 "支出/收入类型必须选择分类" | 通过 |
| TC-017 | 备注为空 | POST | /api/v1/transactions | code=0 | code=0, note="" | 通过 |
| TC-018 | occurred_at为空 | POST | /api/v1/transactions | code=0, 默认当前时间 | code=0, occurred_at=当前时间 | 通过 |
| TC-019 | 最小金额1分 | POST | /api/v1/transactions | code=0 | code=0, amount=1 | 通过 |
| TC-020 | 大金额(超int32) | POST | /api/v1/transactions | code=0 | code=0, amount=3000000000 | 通过 |
| TC-021 | 未授权访问(无token) | GET | /api/v1/categories | 拒绝 | code=1005 "未登录" | 通过 |
| TC-022 | 无效token | GET | /api/v1/categories | 拒绝 | code=1005 "Token 无效" | 通过 |

#### 偏差说明
- TC-007: 设计文档定义删除预设分类返回 code=3001，实际返回 code=2003。功能行为正确（拒绝删除），仅错误码编号不一致
- TC-009: 设计文档定义删除被引用分类返回 code=3002，实际返回 code=2004。功能行为正确（拒绝删除），仅错误码编号不一致

### 浏览器 E2E 测试结果

| 场景 | 步骤 | 截图 | 结果 |
|------|------|------|------|
| 用户注册 | 填写表单 -> 注册 -> 跳转首页 | step-02~05 | 通过 |
| 支出记账 | 输入金额 -> 选分类 -> 添备注 -> 保存 | step-06~08 | 通过 |
| 收入记账 | 切换收入Tab -> 输入金额 -> 选分类 -> 保存 | step-09~10 | 通过 |
| 转账记账 | 切换转账Tab -> 输入金额 -> 保存(无分类) | step-11~12 | 通过 |
| 分类管理 | 查看列表 -> 添加自定义 -> 删除自定义 | step-14~18 | 通过 |

#### 截图索引
- `step-01-login-page.png` — 登录页面初始状态
- `step-02-register-form.png` — 注册表单填写
- `step-03-register-result.png` — 注册提交（5174端口CORS问题导致失败）
- `step-04-register-submit.png` — 注册失败提示（端口不匹配导致）
- `step-05-bookkeeping-page.png` — 记账首页（注册成功后跳转，5173端口）
- `step-06-amount-input.png` — 输入支出金额 38.50
- `step-07-expense-ready.png` — 选择餐饮分类 + 填写备注"午饭"
- `step-08-expense-saved.png` — 支出记账成功 Toast + 最近记录更新
- `step-09-income-tab.png` — 切换到收入Tab，显示5个收入分类
- `step-10-income-saved.png` — 收入记账成功，工资 +5000.00
- `step-11-transfer-tab.png` — 转账Tab，分类区域已隐藏
- `step-12-transfer-saved.png` — 转账记账成功，transfer -100.00
- `step-14-category-manage-page.png` — 分类管理页面，预设分类列表
- `step-15-add-category-dialog.png` — 添加自定义分类弹窗（名称+类型+图标选择）
- `step-17-custom-category-added.png` — 自定义分类"宠物"已添加（带删除按钮）
- `step-18-category-deleted.png` — 删除自定义分类后恢复

#### 验收清单对照

| # | 验收标准 (plan.md) | 测试方式 | 结果 |
|---|-------------------|----------|------|
| 1 | 3步操作路径(输入金额→选分类→保存) | E2E step-07~08 | 通过 |
| 2 | 支持支出/收入/转账三种类型 | E2E step-05~12 + API TC-010~012 | 通过 |
| 3 | 默认时间为当前，可修改 | API TC-018 + E2E 日期默认"今天" | 通过 |
| 4 | 分类展示常用分类 | E2E step-05（分类网格） | 通过 |
| 5 | 备注可选 | API TC-017 | 通过 |
| 6 | 保存后成功反馈 | E2E step-08/10/12 Toast "记账成功" | 通过 |
| 7 | 可添加自定义分类 | E2E step-15~17 + API TC-004 | 通过 |
| 8 | 预设分类不可删除 | E2E step-14(无删除按钮) + API TC-007 | 通过 |
| 9 | 金额输入使用系统原生键盘 | E2E 使用 inputmode="decimal" | 通过 |

#### 发现的非阻塞问题

1. **转账记录显示 "transfer" 而非中文 "转账"**: 转账成功后右侧最近记录中，无分类的转账记录类型名显示为英文 "transfer"，建议前端做国际化映射。（严重程度: 低）

2. **页面刷新后 /categories 路由不可直接访问**: 因为 AuthGuard 在 useEffect(loadFromStorage) 完成前先执行了重定向到 /login。不影响应用内导航，但影响直接 URL 访问或浏览器刷新。（严重程度: 中）

- [变更] [qa] 开始任务 #1: 编写分类管理 API 集成测试 (获取/添加/重复名称)
- [完成] [frontend] 完成任务 #9: 实现分类删除功能 (CategoryManagePage 中自定义分类的删除按钮 + API 调用) (已在 CategoryManagePage 中实现)
- [变更] [frontend] 开始任务 #9: 实现分类删除功能 (CategoryManagePage 中自定义分类的删除按钮 + API 调用)
- [完成] 后端全部8项任务已完成: Category/Transaction Model, 种子数据, 分类CRUD接口, 记账接口, 参数校验
- [完成] [frontend] 完成任务 #6: 实现 CategoryManagePage 分类管理页面
- [完成] [backend] 完成任务 #8: 实现 DELETE /api/v1/categories/:id 删除自定义分类接口 (预设不可删、被引用不可删) (DELETE /api/v1/categories/:id 预设不可删、被引用不可删 已测试通过)
- [完成] [backend] 完成任务 #7: 实现交易记录的参数校验逻辑 (类型/金额/分类约束) (类型/金额/分类约束校验已测试通过)
- [完成] [backend] 完成任务 #6: 实现 POST /api/v1/transactions 新增交易记录接口 (POST /api/v1/transactions 已测试通过)
- [完成] [backend] 完成任务 #5: 实现 POST /api/v1/categories 添加自定义分类接口 (POST /api/v1/categories 已测试通过)
- [完成] [backend] 完成任务 #4: 实现 GET /api/v1/categories 获取分类列表接口 (GET /api/v1/categories 已测试通过)
- [变更] [frontend] 开始任务 #6: 实现 CategoryManagePage 分类管理页面
- [完成] [frontend] 完成任务 #3: 实现 BookkeepingPage 记账页面 (类型切换+金额+分类+保存)
- [变更] [frontend] 开始任务 #3: 实现 BookkeepingPage 记账页面 (类型切换+金额+分类+保存)
- [完成] [frontend] 完成任务 #8: 实现 DatePicker 日期选择组件
- [完成] [frontend] 完成任务 #5: 实现 CategoryGrid 分类选择网格组件
- [完成] [frontend] 完成任务 #4: 实现 AmountInput 金额输入组件 (系统原生键盘 inputmode="decimal")
- [完成] [frontend] 完成任务 #7: 实现 TabSwitcher 组件 (支出/收入/转账切换)
- [变更] [backend] 开始任务 #8: 实现 DELETE /api/v1/categories/:id 删除自定义分类接口 (预设不可删、被引用不可删)
- [变更] [backend] 开始任务 #7: 实现交易记录的参数校验逻辑 (类型/金额/分类约束)
- [变更] [backend] 开始任务 #6: 实现 POST /api/v1/transactions 新增交易记录接口
- [变更] [backend] 开始任务 #5: 实现 POST /api/v1/categories 添加自定义分类接口
- [变更] [backend] 开始任务 #4: 实现 GET /api/v1/categories 获取分类列表接口
- [完成] [backend] 完成任务 #3: 实现 transactions 表 GORM Model 和 AutoMigrate (Transaction model + AutoMigrate)
- [完成] [backend] 完成任务 #2: 实现系统预设分类种子数据初始化 (种子数据 seedCategories)
- [变更] [frontend] 开始任务 #8: 实现 DatePicker 日期选择组件
- [变更] [frontend] 开始任务 #5: 实现 CategoryGrid 分类选择网格组件
- [变更] [frontend] 开始任务 #4: 实现 AmountInput 金额输入组件 (系统原生键盘 inputmode="decimal")
- [变更] [frontend] 开始任务 #7: 实现 TabSwitcher 组件 (支出/收入/转账切换)
- [完成] [frontend] 完成任务 #2: 实现 useTransactionStore (Zustand: 记账表单状态和提交)
- [变更] [backend] 开始任务 #3: 实现 transactions 表 GORM Model 和 AutoMigrate
- [变更] [backend] 开始任务 #2: 实现系统预设分类种子数据初始化
- [变更] [frontend] 开始任务 #2: 实现 useTransactionStore (Zustand: 记账表单状态和提交)
- [完成] [backend] 完成任务 #1: 实现 categories 表 GORM Model 和 AutoMigrate (Category model + AutoMigrate)
- [完成] [frontend] 完成任务 #1: 实现 useCategoryStore (Zustand: 分类列表获取和添加)
- [变更] [frontend] 开始任务 #1: 实现 useCategoryStore (Zustand: 分类列表获取和添加)
- [变更] [backend] 开始任务 #1: 实现 categories 表 GORM Model 和 AutoMigrate
- [变更] 技术评审修复: 补充 DELETE /api/v1/categories/:id 接口定义(backend)、deleteCategory store 方法(frontend)、删除分类测试用例(qa)，解决 UI 设计稿中删除按钮与后端 API 缺失的不一致
- [变更] 文档清理: ui/design.md 效果图清单移除已删除的 mobile.html, 统一为 merge.html
- [变更] 金额输入方案从自定义大号数字键盘改为系统原生键盘，降低开发复杂度并避免多端行为不一致，同步更新 plan.md 和 tasks.md
- [变更] 交叉评审(深入): BookkeepingPage 组件结构与 UI 设计稿对齐, 保存按钮改为集成在数字键盘右侧, 分类网格改为5列
- [变更] 交叉评审: 分类种子数据增加 Lucide 图标映射列 (icon 标识符 -> Lucide 组件名)
- [完成] UI 设计师完成记账页效果图（支出/收入模式+响应式+深色模式）
- [完成] [ui] 完成任务 #1: 设计记账页面效果图（大号数字键盘+分类选择+类型切换） (完成记账页效果图（支出/收入模式+响应式+深色模式）)
- [新增] 补充 QA design.md (测试策略+测试范围) 和 tasks.md (3项测试任务)
- [变更] [ui] 开始任务 #1: 设计记账页面效果图（大号数字键盘+分类选择+类型切换）
- [决策] 固定人民币, 不做币种选择
- [决策] 去掉 Account 实体, 简化 MVP 为单账户模式
- [决策] 分类方案：系统预设分类 + 用户可添加自定义分类，不可删除预设分类
- [决策] 不做多账户管理，每用户单账户
- [决策] 不做保存后撤销功能，用户可通过流水编辑修正
- [决策] MVP 包含支出、收入、转账三种记账类型
- [备注] PRD 中包含技术建议（金额存储方式、分类数据共享策略、transfer category_id 约束等），供开发团队参考
- [新增] 创建计划