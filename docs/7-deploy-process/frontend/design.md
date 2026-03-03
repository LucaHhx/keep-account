# frontend 技术方案 -- 发布流程

> 需求: deploy-process | 角色: frontend

## 技术选型

| 组件 | 选型 | 理由 |
|------|------|------|
| API 地址配置 | Vite 环境变量 (VITE_API_BASE_URL) | 现有方案已可用，构建时注入 |
| Web 端部署 | nginx 静态文件服务 | 通过 docker-compose 中的 nginx 容器提供 |
| 多端策略 | 统一 VITE_API_BASE_URL + Tauri 运行时检测 | 兼容 Web/Tauri/移动端 |

## 架构设计

### 现有 API 地址配置机制分析

当前 `web/src/lib/axios.ts` 中的 `getBaseURL()` 已实现了完整的多端地址解析逻辑：

```
优先级:
1. VITE_API_BASE_URL 环境变量 (构建时写入) -- 最高优先级
2. Tauri 开发模式: TAURI_DEV_HOST 或 localhost
3. Web 兜底: localhost:5723
```

**结论: 现有前端代码无需修改。** 部署时只需在前端 Docker 构建阶段通过 `--build-arg VITE_API_BASE_URL=...` 注入正确的后端地址即可。

### Web 端部署后的地址策略

Web 端部署后，用户通过 `http://<host>:<port>` 访问前端页面。由于 nginx 配置了 `/api/` 反向代理到后端，前端请求 API 时有两种路径：

**方案 A: 使用相对路径 (推荐)**

将 `VITE_API_BASE_URL` 设置为空字符串或不设置，让前端使用相对路径 `/api/v1`。nginx 会将 `/api/` 请求代理到后端容器。

- 优点: 无需知道实际 IP/端口，自动适配任何域名或 IP 访问
- 优点: 换域名或换端口不需要重新构建前端
- 缺点: 仅限 Web 端（Tauri/移动端不经过 nginx）

**方案 B: 使用绝对地址**

构建时将 `VITE_API_BASE_URL` 设为 `http://<host>:<port>`。

- 优点: 明确，调试方便
- 缺点: 地址变更需要重新构建

**推荐方案 A。** 修改 `getBaseURL()` 使其在检测到非 Tauri 环境且无 `VITE_API_BASE_URL` 时，使用 `window.location.origin` 作为 base URL，而非硬编码 `localhost:5723`。这样 Web 端部署后自动使用当前访问地址，无需构建时注入。

### getBaseURL 改进方案

```typescript
function getBaseURL(): string {
  // 1. 环境变量优先 (开发和部署均可配置)
  if (import.meta.env.VITE_API_BASE_URL) {
    return `${import.meta.env.VITE_API_BASE_URL}/api/v1`;
  }

  // 2. Tauri 环境: 使用开发主机地址或 localhost
  if (isTauri) {
    const devHost = typeof __TAURI_DEV_HOST__ !== 'undefined' && __TAURI_DEV_HOST__
      ? __TAURI_DEV_HOST__
      : 'localhost';
    return `http://${devHost}:5723/api/v1`;
  }

  // 3. Web 端: 使用当前页面的 origin (适配任何部署地址)
  return `${window.location.origin}/api/v1`;
}
```

**改动说明:**
- 只修改了第 3 步的 Web 兜底逻辑
- 将 `http://localhost:5723` 改为 `window.location.origin`
- 因为 Web 端部署后通过 nginx 访问，`/api/` 会被代理到后端，所以使用当前 origin 即可
- 开发模式下通过 `.env.development` 设置 `VITE_API_BASE_URL` 仍然走优先级 1

### 多端连接策略

| 端 | 访问方式 | API 地址 | 说明 |
|----|---------|----------|------|
| Web 浏览器 | http://\<host\>:\<port\> | 自动使用 `window.location.origin + /api/v1` | 通过 nginx 反向代理 |
| Tauri 桌面端 | 本地应用 | 需要配置 VITE_API_BASE_URL 指向服务器 | 构建时注入后端地址 |
| iOS/Android | 移动应用 | 需要配置 VITE_API_BASE_URL 指向服务器 | 构建时注入后端地址 |

**Tauri/移动端部署后的连接:**

Tauri 桌面端和移动端不通过 nginx，它们直接连接后端 API。因此需要：

1. 后端也需要暴露一个端口供 Tauri/移动端直连（或通过 nginx 的同一入口）
2. 构建 Tauri/移动端时，将 `VITE_API_BASE_URL` 设置为 `http://<server-ip>:<port>`

由于 nginx 已配置了 `/api/` 反向代理，Tauri/移动端也可以直接连接 nginx 端口：

```
VITE_API_BASE_URL=http://192.168.0.228:8080
```

这样所有端都通过 nginx 入口访问，统一管理。

### 前端构建时环境变量

在 `Dockerfile.frontend` 中通过 `ARG` 传入：

```dockerfile
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build
```

在 `docker-compose.yml` 中：

```yaml
frontend:
  build:
    args:
      VITE_API_BASE_URL: ""   # 留空，Web 端使用 window.location.origin
```

## .env 文件调整

### web/.env.development (开发用，不变)

```env
VITE_API_BASE_URL=http://192.168.0.145:5723
```

### web/.env.production (需要调整)

当前也配置了固定 IP，但部署后 Web 端不再需要这个环境变量（使用 `window.location.origin`）。只有 Tauri/移动端打包时需要。

```env
# Web 端部署: 留空（自动使用 window.location.origin）
# Tauri/移动端打包: 设置为实际服务器地址
# VITE_API_BASE_URL=http://192.168.0.228:8080
```

## 关键决策

### 构建时注入 vs 运行时配置

**推荐: 构建时注入 (Vite 环境变量)**

| 方案 | 优点 | 缺点 |
|------|------|------|
| 构建时 Vite 环境变量 (推荐) | 简单直接；现有机制已支持；零运行时开销 | 地址变更需重新构建 |
| 运行时 JS 配置文件 | 无需重新构建 | 增加复杂度；需要额外加载逻辑 |
| nginx 运行时替换 | 灵活 | 需要 entrypoint 脚本替换变量；增加部署复杂度 |

选择构建时注入。理由：项目处于 MVP 阶段，部署地址变更频率低。Web 端已通过 `window.location.origin` 自动适配，无需注入。Tauri/移动端打包本身就是构建过程，注入环境变量是自然的。

## 依赖与约束

- 前端无需新增任何依赖
- 仅需修改 `web/src/lib/axios.ts` 中 `getBaseURL()` 的 Web 兜底逻辑（约 1 行代码）
- Tauri/移动端的部署地址配置由开发者在打包前手动设置 `VITE_API_BASE_URL`
