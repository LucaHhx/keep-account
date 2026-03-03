# HZ-Agents 使用指南

> 本文档以 Keep Account（记账本）项目为实例，详细记录如何使用 [HZ-Agents](https://github.com/LucaHhx/hz-agents) 多智能体框架从零搭建一个全栈应用。

---

## 目录

- [一、系统概述](#一系统概述)
  - [1.1 什么是 HZ-Agents](#11-什么是-hz-agents)
  - [1.2 核心架构](#12-核心架构)
  - [1.3 技术栈约束](#13-技术栈约束)
- [二、环境搭建](#二环境搭建)
  - [2.1 前置要求](#21-前置要求)
  - [2.2 安装 HZ-Agents 到项目](#22-安装-hz-agents-到项目)
  - [2.3 目录结构确认](#23-目录结构确认)
- [三、六大 Agent 角色详解](#三六大-agent-角色详解)
  - [3.1 PM（产品经理）](#31-pm产品经理)
  - [3.2 Tech Lead（技术负责人）](#32-tech-lead技术负责人)
  - [3.3 Frontend（前端开发）](#33-frontend前端开发)
  - [3.4 Backend（后端开发）](#34-backend后端开发)
  - [3.5 UI Designer（UI 设计师）](#35-ui-designerui-设计师)
  - [3.6 QA（测试工程师）](#36-qa测试工程师)
- [四、四大命令使用指南](#四四大命令使用指南)
  - [4.1 /doc-review — 文档协作评审](#41-doc-review--文档协作评审)
  - [4.2 /dev-team — 完整团队开发](#42-dev-team--完整团队开发)
  - [4.3 /qa-test — QA 验收测试](#43-qa-test--qa-验收测试)
  - [4.4 /fix — 智能 Bug 修复](#44-fix--智能-bug-修复)
- [五、Skills 能力模块详解](#五skills-能力模块详解)
  - [5.1 开发流程类](#51-开发流程类)
  - [5.2 项目脚手架类](#52-项目脚手架类)
  - [5.3 UI/设计类](#53-ui设计类)
  - [5.4 自动化测试类](#54-自动化测试类)
  - [5.5 框架扩展类](#55-框架扩展类)
- [六、实战：从零构建 Keep Account](#六实战从零构建-keep-account)
  - [6.1 第一步：准备 PRD](#61-第一步准备-prd)
  - [6.2 第二步：文档初始化与评审](#62-第二步文档初始化与评审)
  - [6.3 第三步：开发第一个需求](#63-第三步开发第一个需求)
  - [6.4 第四步：QA 验收](#64-第四步qa-验收)
  - [6.5 第五步：迭代后续需求](#65-第五步迭代后续需求)
  - [6.6 第六步：Bug 修复](#66-第六步bug-修复)
- [七、三层文档体系](#七三层文档体系)
  - [7.1 文档结构](#71-文档结构)
  - [7.2 docs.py CLI 工具](#72-docspy-cli-工具)
  - [7.3 角色权限矩阵](#73-角色权限矩阵)
- [八、质量门禁机制](#八质量门禁机制)
- [九、Keep Account 完整迭代记录](#九keep-account-完整迭代记录)

---

## 一、系统概述

### 1.1 什么是 HZ-Agents

HZ-Agents 是一个基于 Claude Code 的多智能体软件开发编排框架。它模拟了一个完整的软件开发团队：

```
         ┌─────────────────────────────────────────┐
         │            HZ-Agents 框架                │
         │                                         │
         │  ┌──────┐ ┌──────────┐ ┌──────────┐    │
         │  │  PM  │ │Tech Lead │ │    UI    │    │
         │  │ 需求  │ │ 架构设计  │ │  视觉设计 │    │
         │  └──┬───┘ └────┬─────┘ └────┬─────┘    │
         │     │          │            │           │
         │     ▼          ▼            ▼           │
         │  ┌──────────────────────────────┐       │
         │  │       Commands (命令编排)      │       │
         │  │  /doc-review  /dev-team      │       │
         │  │  /qa-test     /fix           │       │
         │  └──────────────────────────────┘       │
         │     │          │            │           │
         │     ▼          ▼            ▼           │
         │  ┌────────┐ ┌────────┐ ┌──────┐       │
         │  │Frontend│ │Backend │ │  QA  │       │
         │  │ 前端实现 │ │ 后端实现 │ │ 测试  │       │
         │  └────────┘ └────────┘ └──────┘       │
         │                                         │
         │  ┌──────────────────────────────┐       │
         │  │     Skills (18 个能力模块)      │       │
         │  └──────────────────────────────┘       │
         └─────────────────────────────────────────┘
```

**核心理念：** 每个 Agent 有明确的职责边界，通过 Command 编排协作，借助 Skill 获取专业能力。

### 1.2 核心架构

HZ-Agents 由三层组件构成：

| 组件 | 数量 | 作用 |
|------|------|------|
| **Agents** | 6 个 | 定义角色职责、权限范围、协作规则 |
| **Commands** | 4 个 | 编排多 Agent 协作流程（Slash Command） |
| **Skills** | 18 个 | 提供可复用的专业能力（文档管理、UI 设计、自动化测试等） |

### 1.3 技术栈约束

框架强制使用以下技术栈，所有 Agent 遵循同一套标准：

| 层级 | 技术 |
|------|------|
| 后端 | Go 1.25+, Gin, GORM, SQLite, JWT, Viper, Zap |
| 前端 | React 19, TypeScript 5.9+, Vite 7+, Tailwind CSS 4+, Zustand, Axios |
| 桌面端 | Tauri 2.x (Rust) |
| 移动端 | Capacitor 8+ (iOS/Android) |
| 开发端口 | 前端 5173, 后端 8080 |

> Keep Account 项目完全遵循此技术栈，后端端口调整为 5723。

---

## 二、环境搭建

### 2.1 前置要求

- [Claude Code](https://claude.com/claude-code) CLI 已安装
- Git
- Go 1.25+
- Node.js 20+
- Python 3.10+（docs.py CLI 需要）

### 2.2 安装 HZ-Agents 到项目

```bash
# 1. 创建项目目录
mkdir my-project && cd my-project

# 2. 克隆 hz-agents 框架
git clone https://github.com/LucaHhx/hz-agents.git /tmp/hz-agents

# 3. 复制组件到项目的 .claude/ 目录
mkdir -p .claude
cp -r /tmp/hz-agents/agents .claude/agents
cp -r /tmp/hz-agents/commands .claude/commands
cp -r /tmp/hz-agents/skills .claude/skills

# 4. 清理临时文件
rm -rf /tmp/hz-agents

# 5. 验证安装
ls .claude/agents/    # 应看到 6 个 .md 文件
ls .claude/commands/  # 应看到 4 个 .md 文件
ls .claude/skills/    # 应看到 18 个目录
```

### 2.3 目录结构确认

安装完成后，项目根目录应包含：

```
my-project/
└── .claude/
    ├── agents/
    │   ├── hz-pm.md
    │   ├── hz-tech-lead.md
    │   ├── hz-frontend.md
    │   ├── hz-backend.md
    │   ├── hz-ui.md
    │   └── hz-qa.md
    ├── commands/
    │   ├── dev-team.md
    │   ├── doc-review.md
    │   ├── fix.md
    │   └── qa-test.md
    └── skills/
        ├── create-docs/
        ├── create-web/
        ├── brainstorming/
        ├── ... (共 18 个)
        └── wda/
```

启动 Claude Code 后，在对话中输入 `/` 即可看到注册的命令列表。

---

## 三、六大 Agent 角色详解

### 3.1 PM（产品经理）

| 属性 | 值 |
|------|------|
| 文件 | `agents/hz-pm.md` |
| 颜色标识 | 🟦 Cyan |
| Skills | brainstorming, create-docs |

**职责：定义 WHAT — 做什么**

- 从 PRD 或用户描述中提取业务需求
- 初始化项目文档（L1 项目级）
- 创建需求目录和计划（L2 需求级）
- 拆分功能任务（用户视角，非技术视角）
- 定义验收标准

**权限范围：**
- 读写 L1：`docs/project.md`, `docs/tasks.md`, `docs/CHANGELOG.md`
- 读写 L2：`docs/<N>-<req>/plan.md`, `tasks.md`, `log.md`
- 不可操作 L3（技术层）

**示例交互：**

```
用户: 帮我根据 PRD 初始化项目文档
→ PM 分析 PRD，使用 brainstorming skill 与用户确认需求范围
→ 使用 docs.py init 创建文档结构
→ 创建各需求的 plan.md 和 tasks.md
```

### 3.2 Tech Lead（技术负责人）

| 属性 | 值 |
|------|------|
| 文件 | `agents/hz-tech-lead.md` |
| 颜色标识 | 🟨 Yellow |
| Skills | brainstorming, create-docs, create-web, subagent-driven-development, tauri-v2, pm-mcp-guide |

**职责：定义 HOW — 怎么做**

- 将业务需求转化为技术架构
- 创建角色目录（backend/, frontend/, qa/, ui/）
- 编写技术设计文档（design.md）
- 定义前后端 API 接口契约
- 拆分技术任务分配给各角色
- 代码审查（规格合规 + 代码质量）

**权限范围：**
- 只读 L1 + L2
- 读写 L3：`docs/<N>-<req>/<role>/design.md`, `tasks.md`
- 读写：`docs/<N>-<req>/log.md`

**关键能力：** Tech Lead 是团队的核心协调者，在 `/dev-team` 流程中负责文档检查、代码审查和团队协调。

### 3.3 Frontend（前端开发）

| 属性 | 值 |
|------|------|
| 文件 | `agents/hz-frontend.md` |
| 颜色标识 | 🟦 Blue |
| Skills | create-docs, create-web, tauri-v2, tailwindcss-advanced-components, ios-glass-ui-designer, ui-ux-pro-max |

**职责：实现用户界面**

- 阅读 UI 设计稿和技术方案
- 按 `frontend/tasks.md` 逐项实现页面、组件、交互
- 优先以 UI 设计稿（`ui/merge.html`）为视觉标准
- 对接后端 API
- 使用 `docs.py` 更新任务状态

**工作流程：**

```
1. 读取 plan.md → 理解业务需求和用户场景
2. 读取 ui/merge.html → 获取视觉参考（优先级最高）
3. 读取 frontend/design.md → 了解技术方案
4. 读取 frontend/tasks.md → 获取任务列表
5. 逐项实现 → 更新任务状态
```

### 3.4 Backend（后端开发）

| 属性 | 值 |
|------|------|
| 文件 | `agents/hz-backend.md` |
| 颜色标识 | 🟩 Green |
| Skills | create-docs, tauri-v2, pm-mcp-guide |

**职责：实现服务端逻辑**

- 阅读技术方案和 API 约定
- 按 `backend/tasks.md` 逐项实现 API、数据模型、业务逻辑
- 确保 API 接口与前端约定一致
- 使用 `docs.py` 更新任务状态

### 3.5 UI Designer（UI 设计师）

| 属性 | 值 |
|------|------|
| 文件 | `agents/hz-ui.md` |
| 颜色标识 | 🟥 Red |
| Skills | create-docs, ui-ux-pro-max, tailwindcss-advanced-components, agent-browser, pm-mcp-guide, tauri-v2, create-web, ios-glass-ui-designer, desktop-control |

**职责：视觉设计与审查**

**设计产出阶段（`/doc-review` 中执行）：**
- 使用 `ui-ux-pro-max` skill 生成设计系统（配色、字体、间距）
- 制作 `merge.html` — 用 Tailwind CDN 写的响应式效果图，浏览器直接预览
- 编写 `design.md` 设计系统文档
- 编写 `Introduction.md` 给前端的实现指导
- 产出 `Resources/` 资源（CSS 变量、Tailwind 配置、图标等）

**视觉审查阶段（`/dev-team` 代码审查中执行）：**
- 代码级审查：检查 Tailwind class、响应式断点、间距颜色
- 截图对比：启动服务 → 用 `agent-browser` 截图 → 与设计稿对比
- 输出审查报告（视觉一致性评分 + 问题清单）

### 3.6 QA（测试工程师）

| 属性 | 值 |
|------|------|
| 文件 | `agents/hz-qa.md` |
| 颜色标识 | 🟪 Magenta |
| Skills | create-docs, agent-browser, pm-mcp-guide, wda, desktop-control, tauri-v2 |

**职责：质量验收**

**两阶段测试：**

1. **API 测试** — 用 curl 逐个验证后端接口（正常流程 + 错误处理 + 边界条件）
2. **浏览器 E2E 测试** — 用 `agent-browser --headed` 有头模式模拟真实用户操作

**关键要求：**
- 每个测试必须有可验证的证据（API 请求/响应记录、浏览器截图）
- 截图保存到 `docs/<req>/qa/screenshots/`
- 所有结果写入 `log.md`

---

## 四、四大命令使用指南

命令是多 Agent 协作的编排入口，每个命令定义了一个完整的工作流。

### 4.1 /doc-review — 文档协作评审

> 启动 PM + Tech Lead + UI 设计师团队，协作完善文档和设计。

```bash
# 评审指定需求
/doc-review 1-account-system

# 全量评审（含初始化）
/doc-review
```

**流程（docs/ 不存在时 — 初始化模式）：**

```
Phase 1: PM 与用户协作
  │
  │  PM 使用 brainstorming skill 与用户交互:
  │  - 有 PRD → 读取内容，与用户确认功能优先级、MVP 范围
  │  - 无 PRD → 从零开始了解项目目标、用户、核心功能
  │
  │  用户确认后:
  │  - docs.py init → 创建 docs/ 基础结构
  │  - docs.py req <name> → 创建各需求目录
  │  - 填充 plan.md（目标、场景、验收标准）
  │
  ▼
Phase 2: Tech Lead 与用户协作
  │
  │  Tech Lead 使用 brainstorming skill 讨论技术决策:
  │  - 项目架构方案（提出 2-3 个方案，给出推荐）
  │  - 技术选型确认
  │  - 关键技术问题（数据同步策略、认证方案等）
  │
  │  用户确认后:
  │  - docs.py role <req> backend/frontend/qa/ui → 创建角色目录
  │  - 编写 design.md 技术方案
  │
  ▼
Phase 3: 三人团队并行评审
  │
  ├─ PM: 评审 L1 + L2 文档完整性
  ├─ Tech Lead: 评审 L3 技术文档完整性
  └─ UI Designer: 阅读 plan.md → 产出设计稿（merge.html + design.md + Introduction.md）
      │
      ▼
  交叉评审：确认需求、技术方案、UI 设计三方对齐
```

**流程（docs/ 已存在时 — 评审模式）：**

直接进入 Phase 3，三个 Agent 并行评审已有文档，发现问题直接修复。

**Keep Account 实际操作：**

```bash
# 项目初始化时，根目录已有 云同步多端记账软件_MVP_PRD.md
/doc-review

# PM 读取 PRD，与用户确认了 5 个核心需求（后扩展到 8 个）
# Tech Lead 确认 Go + React + Tauri 技术方案
# UI Designer 为每个需求产出了 merge.html 响应式设计稿
```

### 4.2 /dev-team — 完整团队开发

> 启动 5 人团队（Tech Lead + Frontend + Backend + UI + QA）协作开发一个需求。

```bash
# 开发指定需求
/dev-team 1-account-system

# 自动扫描待开发需求
/dev-team
```

**完整流程：**

```
Step 1: Tech Lead 文档检查（硬门槛）
  │
  │  检查项:
  │  ✓ plan.md 是否存在且完整
  │  ✓ frontend/design.md 和 backend/design.md 是否存在
  │  ✓ qa/design.md 是否存在
  │  ✓ 前后端 API 接口契约是否对齐
  │  ✓ 任务拆分是否合理可执行
  │
  │  不通过 → 停止，提示运行 /doc-review 完善文档
  │  通过 ↓
  │
Step 2: Frontend + Backend 并行开发
  │
  │  ┌─ Frontend: 读取 design.md + ui/ 设计稿 → 实现页面和组件
  │  └─ Backend:  读取 design.md → 实现 API 和数据层
  │  （两者互不阻塞，按各自 tasks.md 逐项实现）
  │
  │  开发完成 ↓
  │
Step 3: Tech Lead 代码审查 + UI 视觉审查（并行）
  │
  │  ┌─ Tech Lead: 检查代码质量、接口对齐、架构合规
  │  └─ UI Designer: 代码级审查 + 截图对比审查
  │
  │  不通过 → 创建修复任务 → 开发者修复 → 重新审查（上限 3 轮）
  │  通过 ↓
  │
Step 4: QA 验收测试
  │
  │  阶段 A: 后端 API 测试（curl 逐个验证接口）
  │  阶段 B: 浏览器 E2E 测试（agent-browser --headed 模拟用户操作）
  │
  │  完成 ↓
  │
Step 5: 汇总开发报告
  │
  │  输出: 文档检查结果 / 开发完成情况 / 审查轮次 / QA 测试通过率
```

**关键规则：**
- 文档检查是硬门槛，不通过不创建团队
- 代码审查不通过必须修复，不能跳过进 QA
- QA 必须使用 `--headed` 有头浏览器测试，仅 API 测试不够
- 每个 Agent 用 `docs.py` CLI 更新自己角色的 tasks.md 状态

### 4.3 /qa-test — QA 验收测试

> 以 QA 为主导的测试闭环，发现 Bug 自动组建修复团队。

```bash
# 测试指定需求
/qa-test 3-transaction-list

# 自动扫描可测试需求
/qa-test
```

**闭环流程：**

```
                 QA 执行验收测试
              (API 测试 + 浏览器 E2E)
                       │
                  全部通过？
                  /        \
               YES          NO
                │            │
          输出验收报告     QA 输出 Bug 报告
          清理团队完成     反馈给 PM + Tech Lead
                            │
                  ┌─────────┴──────────┐
                  │                    │
            PM 审查文档          Tech Lead 分析根因
            更新需求/记录         创建修复任务
                                 分配给 FE / BE
                                       │
                              ┌────────┴────────┐
                              │                 │
                        Backend 修复      Frontend 修复
                              │                 │
                              └────────┬────────┘
                                       │
                               QA 回归测试
                                       │
                              回到 "全部通过?"
                            （上限 3 轮回归）
```

**Bug 报告格式：**

```markdown
| Bug ID  | 严重程度 | 描述                 | 复现步骤    | 相关文件    | 建议修复角色   |
|---------|----------|---------------------|------------|------------|--------------|
| BUG-001 | P0       | 登录接口返回 500     | 1. 发送 POST /api/auth/login | handler/auth.go:45 | backend |
| BUG-002 | P1       | 注册页面表单不居中    | 1. 打开 /register        | RegisterPage.tsx:12 | frontend |
```

### 4.4 /fix — 智能 Bug 修复

> 根据问题复杂度自动选择直接修复或组建团队。

```bash
/fix 登录页在 iOS 上有额外滚动条
/fix 记账接口返回 500 错误
/fix 前端显示金额与后端不一致
```

**自动判断流程：**

```
用户描述问题
      │
      ▼
Explore Agent 定位问题
      │
  ┌───┴───────────────────────────┐
  │ 判断三个维度:                   │
  │ 1. 分类: 前端/后端/全栈/构建     │
  │ 2. 严重度: P0/P1/P2            │
  │ 3. 复杂度: 简单/复杂             │
  └───┬───────────────┬───────────┘
      │               │
   简单问题          复杂问题
  (≤3 文件)        (>3 文件/多端)
      │               │
  主 Agent         组建修复团队
  直接修复          │
      │          ┌──┴──────────────────┐
      │          │ 前端问题: TL + FE     │
      │          │ 后端问题: TL + BE     │
      │          │ 全栈问题: TL + FE + BE │
      │          │ P0 Bug: 强制加入 QA    │
      │          └─────────────────────┘
      │               │
      └───────┬───────┘
              │
      生成修复记录
  docs/fixes/<N>-<slug>.md
```

**Keep Account 实际修复记录：** 项目中积累了 13 个修复记录（`docs/fixes/`），涵盖 iOS 闪退、Safe Area 布局、CORS 跨域、Tauri HTTP 适配等问题。

---

## 五、Skills 能力模块详解

Skills 是 Agent 调用的专业能力包，安装在 `.claude/skills/` 目录下。

### 5.1 开发流程类

#### create-docs — 三层文档管理

整个框架的文档基础设施，提供 `docs.py` CLI 工具和三层文档架构规范。

```bash
# 初始化文档结构
python3 .claude/skills/create-docs/scripts/docs.py init

# 创建需求目录
python3 .claude/skills/create-docs/scripts/docs.py req account-system

# 创建角色目录
python3 .claude/skills/create-docs/scripts/docs.py role account-system backend
python3 .claude/skills/create-docs/scripts/docs.py role account-system frontend
python3 .claude/skills/create-docs/scripts/docs.py role account-system qa
python3 .claude/skills/create-docs/scripts/docs.py role account-system ui

# 添加任务
python3 .claude/skills/create-docs/scripts/docs.py task account-system "设计用户表 Schema" --role backend

# 更新任务状态
python3 .claude/skills/create-docs/scripts/docs.py start account-system 1 --role backend
python3 .claude/skills/create-docs/scripts/docs.py done account-system 1 --role backend

# 记录日志
python3 .claude/skills/create-docs/scripts/docs.py log account-system 决策 "选择 JWT 做鉴权"

# 查看状态
python3 .claude/skills/create-docs/scripts/docs.py status account-system

# 创建修复记录
python3 .claude/skills/create-docs/scripts/docs.py fix "iOS启动闪退" --severity P0
```

#### brainstorming — 需求探索

在实现前通过对话深入理解用户意图。PM 和 Tech Lead 用它来与用户确认需求范围、技术选型等关键决策。

#### subagent-driven-development — 子 Agent 驱动开发

将实现计划拆分为独立任务，分派子 Agent 执行，包含两阶段代码审查：
1. **规格合规检查** — 代码是否符合 design.md 中的设计
2. **代码质量检查** — 代码质量、安全性、可维护性

### 5.2 项目脚手架类

#### create-web — React 项目脚手架

内含 20+ 生产级组件模板：
- 数据展示：BarChart, DonutChart, StatCard
- 表单：AmountInput, DatePicker, FormInput, FormSelect, ToggleSwitch
- 布局：AppShell, BottomNav, Sidebar, TopBar, PageContainer
- UI 基础：Button, Card, Modal, Toast, EmptyState, Avatar

#### tauri-v2 — Tauri 桌面/移动端

Tauri 2 跨平台应用开发指南，涵盖：
- `tauri.conf.json` 配置管理
- Rust 命令实现和 IPC 模式（invoke / emit / channel）
- 权限与能力 (capabilities) 管理
- iOS / Android / Desktop 构建部署

### 5.3 UI/设计类

#### ui-ux-pro-max — 综合设计系统

UI 设计师的核心能力，提供：
- 50+ 设计风格（glassmorphism, minimalism, brutalism, dark mode 等）
- 21+ 配色方案
- 50+ 字体搭配
- 20+ 图表类型
- 支持 9 种技术栈的代码输出

使用示例：

```bash
# 搜索设计灵感
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "finance dark dashboard" --design-system --stack react
```

#### ios-glass-ui-designer — iOS 原生设计

遵循 Apple HIG，基于玻璃材质体系（半透明、模糊、景深）设计 iOS 原生界面。SF Pro 字体、安全区适配、系统组件行为。

#### tailwindcss-advanced-components — Tailwind 高级组件

使用 CVA (Class Variance Authority) 管理组件变体的生产级模式。

### 5.4 自动化测试类

#### agent-browser — 浏览器自动化

QA 测试的核心工具：

```bash
# 有头模式打开页面
agent-browser --headed open http://localhost:5173

# 获取页面元素快照（返回可交互的 @ref 引用）
agent-browser snapshot -i

# 交互操作
agent-browser fill @e1 "testuser"      # 填写输入框
agent-browser click @e3                  # 点击按钮
agent-browser wait --load networkidle    # 等待网络空闲

# 截图
agent-browser screenshot docs/1-account-system/qa/screenshots/step-01.png

# 切换视口（测试响应式）
agent-browser set viewport 375 812       # iPhone
agent-browser set viewport 768 1024      # iPad
agent-browser set viewport 1280 800      # Desktop

# 关闭
agent-browser close
```

#### pm-mcp-guide — 进程管理

管理开发/测试时的后台服务：

```
# 启动后端服务
mcp__pm-mcp__start_process(name="backend", command="go run ./cmd/server", cwd="server/")

# 启动前端服务
mcp__pm-mcp__start_process(name="frontend", command="npm run dev", cwd="web/")

# 查看日志
mcp__pm-mcp__get_logs(id, fromTop=true)

# 搜索错误
mcp__pm-mcp__grep_logs(id, pattern="error|panic|fatal")

# 终止所有服务
mcp__pm-mcp__terminate_all_processes
```

#### wda — iOS WebDriverAgent

通过纯 HTTP API 控制 iOS 设备/模拟器：

```
# 获取 DOM 树
GET http://localhost:8100/source

# 点击坐标
POST http://localhost:8100/session/{id}/wda/tap/0  {"x": 200, "y": 400}

# 输入文字
POST http://localhost:8100/session/{id}/wda/keys  {"value": ["h","e","l","l","o"]}

# 截图
GET http://localhost:8100/screenshot
```

#### desktop-control — 桌面自动化

基于 PyAutoGUI 的桌面控制，支持鼠标/键盘操作、截图分析、窗口管理。

### 5.5 框架扩展类

| Skill | 说明 |
|-------|------|
| **create-agent** | 创建新的 Agent 角色 |
| **create-command** | 创建新的 Slash Command |
| **create-skill** | 创建新的 Skill 能力包 |
| **find-skills** | 从开源生态搜索和安装 Skill |

---

## 六、实战：从零构建 Keep Account

以下是 Keep Account 项目的实际构建过程。

### 6.1 第一步：准备 PRD

在项目根目录放置产品需求文档：

```
keep-account/
└── 云同步多端记账软件_MVP_PRD.md    ← PRD 文件
```

PRD 中描述了产品定位（3 秒记账）、目标用户、核心功能、MVP 范围边界。

### 6.2 第二步：文档初始化与评审

```bash
/doc-review
```

**Phase 1 — PM 工作：**
- PM 读取 PRD，通过 brainstorming 与用户确认：
  - 核心功能优先级
  - MVP 范围边界（什么做、什么不做）
  - 验收标准
- 使用 `docs.py init` 初始化文档结构
- 创建 5 个需求目录（后扩展到 8 个）：
  1. `1-account-system` — 账号系统
  2. `2-quick-bookkeeping` — 3 秒记账
  3. `3-transaction-list` — 流水管理
  4. `4-data-reports` — 数据报表
  5. `5-cloud-sync` — 云同步

**Phase 2 — Tech Lead 工作：**
- 确认 Go + Gin + SQLite 后端方案
- 确认 React 19 + Tailwind + Zustand 前端方案
- 确认 Tauri 2 桌面/移动端方案
- 为每个需求创建角色目录，编写 design.md

**Phase 3 — UI Designer 工作：**
- 为每个需求产出 `merge.html` 响应式设计稿
- 编写 `design.md` 设计系统（配色、字体、间距）
- 编写 `Introduction.md` 给前端的实现指导
- 产出 `Resources/` 资源文件（tokens.css, tailwind.config.js）

产出结果：

```
docs/
├── project.md                     ← L1 项目概览
├── tasks.md                       ← L1 需求列表
├── CHANGELOG.md                   ← 变更日志
└── 1-account-system/              ← L2 + L3
    ├── plan.md                    ← 需求计划和验收标准
    ├── tasks.md                   ← 功能任务列表
    ├── log.md                     ← 变更记录
    ├── backend/
    │   ├── design.md              ← 后端技术方案（数据模型、API 设计）
    │   └── tasks.md               ← 后端任务列表
    ├── frontend/
    │   ├── design.md              ← 前端技术方案（组件结构、状态管理）
    │   └── tasks.md               ← 前端任务列表
    ├── ui/
    │   ├── merge.html             ← 响应式设计稿（浏览器直接预览）
    │   ├── design.md              ← 设计系统
    │   ├── Introduction.md        ← 给前端的设计说明
    │   └── Resources/             ← 资源文件
    └── qa/
        ├── design.md              ← 测试策略
        └── tasks.md               ← 测试任务列表
```

### 6.3 第三步：开发第一个需求

```bash
/dev-team 1-account-system
```

**实际执行过程：**

1. **Tech Lead 文档检查** — 确认 plan.md、各角色 design.md 完整，接口对齐 → 通过

2. **并行开发** —
   - Frontend 读取 `ui/merge.html` 和 `frontend/design.md`，实现登录页、注册页、路由守卫、JWT 鉴权
   - Backend 读取 `backend/design.md`，实现用户表、注册/登录 API、JWT 中间件

3. **代码审查** —
   - Tech Lead 检查前后端代码质量和接口对齐
   - UI Designer 启动服务 → 用 agent-browser 截图 → 与 merge.html 设计稿对比

4. **QA 测试** —
   - API 测试：curl 验证 /auth/register, /auth/login, /auth/logout
   - E2E 测试：agent-browser 模拟注册 → 登录 → 退出全流程
   - 截图保存到 `docs/1-account-system/qa/screenshots/`

### 6.4 第四步：QA 验收

```bash
/qa-test 1-account-system
```

QA 执行完整验收：
- API 测试覆盖正常流程 + 错误处理（用户不存在、密码错误、空参数）
- 浏览器测试覆盖多种分辨率（375px 手机 / 768px 平板 / 1280px 桌面 / 320px 小屏 / 横屏）
- 所有截图存入 `qa/screenshots/`（26 张截图）
- 测试结果写入 `log.md`

### 6.5 第五步：迭代后续需求

依次开发剩余需求：

```bash
/dev-team 2-quick-bookkeeping     # 记账功能（金额输入、分类选择、三种类型）
/dev-team 3-transaction-list      # 流水列表（筛选、编辑、删除）
/dev-team 4-data-reports          # 报表（月度总览、分类饼图、趋势图）
/dev-team 5-cloud-sync            # 云同步 + 主题切换
/dev-team 6-multi-platform        # Tauri 多端构建（桌面、iOS、Android）
/dev-team 7-deploy-process        # Docker 部署流程
/dev-team 8-server-info-display   # 服务信息展示
```

每个需求都经历完整的文档检查 → 并行开发 → 代码审查 → QA 测试流程。

### 6.6 第六步：Bug 修复

开发过程中遇到的问题通过 `/fix` 修复：

```bash
/fix iOS 应用启动闪退                    # → P0, 直接修复
/fix iOS 登录页异常滚动和底部空白          # → P1, 直接修复
/fix iOS 输入框聚焦时页面自动缩放          # → P1, 直接修复
/fix iOS 刘海遮挡 Toast 通知条            # → P1, 直接修复
/fix iOS dev 模式登录请求 body 丢失导致 EOF # → P0, 团队修复
/fix CORS 拦截所有非 5173 端口请求         # → P1, 直接修复
/fix 多端请求后端失败及网页跨域             # → P1, 团队修复
# ...共 13 个修复记录
```

所有修复自动记录到 `docs/fixes/` 目录。

---

## 七、三层文档体系

### 7.1 文档结构

```
docs/
├── L1 项目级
│   ├── project.md          # 项目概览（业务信息、核心价值、目标用户）
│   ├── tasks.md            # 需求列表（所有需求的总览）
│   └── CHANGELOG.md        # 变更日志
│
├── L2 需求级（每个需求一个目录）
│   └── <N>-<name>/
│       ├── plan.md         # 需求计划（目标、范围、场景、验收标准）
│       ├── tasks.md        # 功能任务（用户视角）
│       └── log.md          # 变更和决策记录
│
├── L3 角色级（每个角色一个子目录）
│   └── <N>-<name>/
│       ├── backend/
│       │   ├── design.md   # 后端技术方案（数据模型、API 设计）
│       │   └── tasks.md    # 后端技术任务
│       ├── frontend/
│       │   ├── design.md   # 前端技术方案（组件、状态管理）
│       │   └── tasks.md    # 前端技术任务
│       ├── ui/
│       │   ├── merge.html  # 响应式设计稿
│       │   ├── design.md   # 设计系统
│       │   ├── Introduction.md  # 实现指导
│       │   ├── Resources/  # 资源文件
│       │   └── tasks.md    # 设计任务
│       └── qa/
│           ├── design.md   # 测试策略
│           ├── tasks.md    # 测试任务
│           └── screenshots/ # 测试截图
│
└── fixes/                   # Bug 修复记录
    ├── log.md              # 修复索引
    └── <N>-<slug>.md       # 各修复详情
```

### 7.2 docs.py CLI 工具

`docs.py` 是文档管理的核心 CLI 工具，所有 Agent 通过它操作文档结构。

| 命令 | 作用 | 示例 |
|------|------|------|
| `init` | 初始化 docs/ 基础结构 | `docs.py init` |
| `req <name>` | 创建需求目录 | `docs.py req account-system` |
| `role <req> <role>` | 创建角色目录 | `docs.py role account-system backend` |
| `task <req> "<desc>"` | 添加任务 | `docs.py task account-system "设计用户表" --role backend` |
| `start <req> <id>` | 开始任务 | `docs.py start account-system 1 --role backend` |
| `done <req> <id>` | 完成任务 | `docs.py done account-system 1 --role backend` |
| `log <req> <type> "<msg>"` | 记录日志 | `docs.py log account-system 决策 "使用 JWT"` |
| `status <req>` | 查看状态 | `docs.py status account-system --role backend` |
| `fix "<title>"` | 创建修复记录 | `docs.py fix "iOS闪退" --severity P0` |

### 7.3 角色权限矩阵

| 文档层级 | PM | Tech Lead | Frontend | Backend | UI | QA |
|---------|:--:|:---------:|:--------:|:-------:|:--:|:--:|
| L1 project.md | 读写 | 只读 | 只读 | 只读 | 只读 | 只读 |
| L2 plan.md | 读写 | 只读 | 只读 | 只读 | 只读 | 只读 |
| L2 tasks.md | 读写 | 只读 | 只读 | 只读 | 只读 | 只读 |
| L3 backend/ | - | 读写 | - | 读写 | - | 只读 |
| L3 frontend/ | - | 读写 | 读写 | - | - | 只读 |
| L3 ui/ | - | 读写 | 只读 | - | 读写 | 只读 |
| L3 qa/ | - | 读写 | - | - | - | 读写 |
| log.md | 读写 | 读写 | 追加 | 追加 | 追加 | 追加 |

---

## 八、质量门禁机制

HZ-Agents 在开发流程中设置了四道质量门禁：

```
Gate 1: 文档完整性检查
│  ✓ plan.md 目标/范围/场景/验收标准完整
│  ✓ design.md 技术方案可执行
│  ✓ 前后端 API 接口对齐
│  ✓ 任务拆分合理
│
│  不通过 → 停止开发，先完善文档
│
Gate 2: 两阶段代码审查
│  阶段 1 — 规格合规: 代码是否符合 design.md 设计
│  阶段 2 — 代码质量: 错误处理、类型安全、安全性
│
│  不通过 → 创建修复任务，开发者修改后重审（上限 3 轮）
│
Gate 3: UI 视觉审查
│  ✓ Tailwind class 与设计稿一致
│  ✓ 响应式断点正确
│  ✓ 间距/颜色/字号与设计系统一致
│  ✓ 实际截图与 HTML 设计稿对比
│
│  不通过 → 合并到代码审查修复任务
│
Gate 4: QA 验收测试
│  ✓ API 测试: 正常流程 + 错误处理 + 边界条件
│  ✓ E2E 测试: 有头浏览器模拟完整用户操作
│  ✓ 每个测试有可验证证据（API 响应/浏览器截图）
│
│  不通过 → Bug 报告 → Tech Lead 分析 → 开发修复 → QA 回归
```

---

## 九、Keep Account 完整迭代记录

| # | 需求 | 开发内容 | QA 截图数 |
|---|------|---------|-----------|
| 1 | account-system | 注册/登录/JWT 鉴权/退出/路由守卫 | 26 |
| 2 | quick-bookkeeping | 金额输入/分类选择/三种记账类型/分类管理 | 18 |
| 3 | transaction-list | 流水列表/类型筛选/时间筛选/编辑/删除 | 15 |
| 4 | data-reports | 月度总览/分类占比饼图/趋势柱状图/分类下钻 | 5 |
| 5 | cloud-sync | 数据同步/网络状态/深色主题/个人中心 | 0 (设计阶段) |
| 6 | multi-platform | Tauri 桌面构建/iOS 构建/应用图标 | 2 |
| 7 | deploy-process | Docker 部署/Nginx 配置/多环境管理 | 10 |
| 8 | server-info-display | 登录页/个人中心服务器信息展示 | 6 |

**Bug 修复记录（docs/fixes/）：** 共 13 个修复，涵盖 iOS 平台适配（闪退、Safe Area、输入框缩放）、网络请求（CORS、Tauri HTTP body 丢失）、布局问题等。

---

> 本指南基于 Keep Account 项目的实际开发经验编写。
> 框架源码: [LucaHhx/hz-agents](https://github.com/LucaHhx/hz-agents)
> 项目源码: [LucaHhx/keep-account](https://github.com/LucaHhx/keep-account)
