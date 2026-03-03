# backend 技术方案 -- 发布流程

> 需求: deploy-process | 角色: backend

## 技术选型

| 组件 | 选型 | 理由 |
|------|------|------|
| 容器编排 | docker-compose v2 | 用户明确要求；适合单机多服务编排 |
| 前端容器 | nginx:alpine | 轻量高性能，天然适合静态文件服务 + 反向代理 |
| 后端构建 | Go 多阶段构建 | 编译产物无依赖，最终镜像极小 (< 30MB) |
| 部署配置 | deploy.yaml + .env | YAML 管理环境列表，.env 传递敏感信息到容器 |
| 部署脚本 | Bash (deploy.sh) | 无额外依赖，所有 macOS/Linux 原生支持 |
| 端口检测 | Shell (ss/netstat) | 在目标服务器直接检测，无需额外工具 |

### 关键决策: 前端容器独立 vs 嵌入后端

**推荐方案: nginx 独立容器**

| 方案 | 优点 | 缺点 |
|------|------|------|
| nginx 独立容器 (推荐) | 前后端独立更新；nginx 处理静态文件性能优于 Go；可配置缓存/gzip/路由规则 | 多一个容器 |
| Go embed 嵌入 | 单一二进制，部署简单 | 前端变更需重新编译后端；Go 静态文件性能不如 nginx；混合关注点 |

选择 nginx 独立容器，理由：前后端更新频率不同，独立容器允许只更新前端而不影响后端。nginx 对静态文件的缓存、gzip 压缩、SPA 路由 fallback 支持更成熟。

### 关键决策: 部署配置格式

**推荐方案: deploy.yaml (环境列表) + .env (敏感信息)**

| 方案 | 优点 | 缺点 |
|------|------|------|
| deploy.yaml + .env (推荐) | YAML 结构化管理多环境；.env 隔离敏感信息；docker-compose 原生支持 .env | 两个文件 |
| 纯 .env | 简单 | 不适合管理多个环境的结构化信息 |
| 纯 YAML | 一个文件 | 敏感信息（密钥路径等）混在版本控制中不安全 |

## 架构设计

### 整体架构

```
开发机 (macOS)                          目标服务器 (Linux)
┌─────────────────┐                    ┌──────────────────────────────┐
│ deploy.sh       │──── SSH/SCP ──────▶│ /opt/keep-account/           │
│                 │                    │ ├── docker-compose.yml       │
│ 1. 构建镜像     │                    │ ├── .env                     │
│    (本地或远端)  │                    │ ├── nginx.conf               │
│ 2. 传输文件     │                    │ ├── data/                    │
│ 3. 端口检测     │                    │ │   └── keep-account.db      │
│ 4. 启动服务     │                    │ └── docker-compose up -d     │
└─────────────────┘                    │                              │
                                       │ ┌─────────┐  ┌────────────┐ │
                                       │ │ nginx   │  │ go-server  │ │
                                       │ │ :PORT   │──│ :5723      │ │
                                       │ │ 静态文件 │  │ API        │ │
                                       │ └─────────┘  └────────────┘ │
                                       └──────────────────────────────┘
```

### 部署策略: 源码传输 + 远端构建

由于目标服务器是本地局域网内的 Mac Mini，且项目体量小，采用以下策略：

1. **本地不构建镜像**，避免跨架构问题 (开发机可能是 arm64，服务器也可能是 arm64 或 x86_64)
2. **通过 SCP 传输项目源码和配置文件** 到目标服务器
3. **在目标服务器上执行 `docker-compose build && docker-compose up -d`**
4. 这样构建出的镜像天然匹配目标服务器的 CPU 架构

### docker-compose.yml

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "${APP_PORT}:80"
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    expose:
      - "5723"
    volumes:
      - ./data:/app/data
    environment:
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
```

**要点:**
- 后端不对外暴露端口，只通过 nginx 反向代理访问
- `APP_PORT` 通过 .env 注入，由部署脚本动态检测可用端口后设置
- data 目录挂载到宿主机，确保 SQLite 数据持久化
- JWT_SECRET 通过环境变量注入，不硬编码在配置中

### Dockerfile.backend (多阶段构建)

```dockerfile
# --- 构建阶段 ---
FROM golang:1.25-alpine AS builder
RUN apk add --no-cache gcc musl-dev
WORKDIR /build
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ .
RUN CGO_ENABLED=1 go build -o server ./cmd/server/

# --- 运行阶段 ---
FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /build/server .
COPY deploy/config.yaml ./config.yaml
RUN mkdir -p /app/data
EXPOSE 5723
CMD ["./server", "-config", "config.yaml"]
```

**说明:**
- 使用 `CGO_ENABLED=1` 因为 SQLite 驱动 (mattn/go-sqlite3) 依赖 CGI
- alpine 基础镜像，最终镜像约 25-30MB
- 构建时的 config.yaml 使用生产配置模板，JWT secret 通过环境变量覆盖

### Dockerfile.frontend

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /build
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginx:alpine
COPY --from=builder /build/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://backend:5723;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1024;
}
```

**关键点:**
- `location /api/` 反向代理到 backend 容器，利用 docker-compose 的内部 DNS 解析
- SPA 路由 fallback 确保前端路由正常工作
- 静态资源 30 天强缓存 (Vite 构建会在文件名中加 hash)

## 部署配置管理

### deploy/deploy.yaml (版本控制)

```yaml
# 部署环境配置
# 每个环境定义连接信息和部署参数

default_env: mini1

environments:
  mini1:
    name: "Mac Mini 1 (局域网)"
    host: 192.168.0.228
    port: 22
    user: MINI1
    ssh_key: ~/.ssh/key
    deploy_path: /opt/keep-account
    preferred_port: 8080        # 优先尝试的端口，被占用则自动寻找
    port_range: [8080, 8099]    # 端口搜索范围

  # 示例: 添加新环境
  # prod:
  #   name: "生产服务器"
  #   host: example.com
  #   port: 22
  #   user: deploy
  #   ssh_key: ~/.ssh/prod_key
  #   deploy_path: /opt/keep-account
  #   preferred_port: 80
  #   port_range: [80, 80]
```

### deploy/.env.template (版本控制，模板)

```env
# 部署环境变量模板
# 复制为 deploy/.env.<env-name> 并填写实际值

# 应用端口 (由 deploy.sh 自动检测填写)
APP_PORT=8080

# JWT 密钥 (生产环境必须修改!)
JWT_SECRET=your-secure-random-string-here
```

### deploy/config.yaml (容器内后端配置)

```yaml
server:
  port: 5723
  env: production

database:
  path: "./data/keep-account.db"

jwt:
  secret: "${JWT_SECRET}"     # 通过环境变量注入
  expire_days: 7
  renew_before_days: 3.5

log:
  level: "info"
  format: "json"
```

**说明:** 后端 config.go 需要增加环境变量覆盖支持，使 `JWT_SECRET` 环境变量能覆盖配置文件中的 `jwt.secret`。Viper 本身已支持环境变量绑定，只需调用 `viper.AutomaticEnv()` 或手动绑定。

## 部署脚本设计

### deploy/deploy.sh

```bash
#!/bin/bash
set -euo pipefail

# 用法: ./deploy/deploy.sh [环境名]
# 示例: ./deploy/deploy.sh          # 使用默认环境 (mini1)
#       ./deploy/deploy.sh mini1     # 指定环境
#       ./deploy/deploy.sh prod      # 指定环境

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
```

**脚本执行流程:**

```
1. 解析 deploy.yaml，读取目标环境配置
   ├── 环境名从参数获取，默认使用 default_env
   └── 提取 host, port, user, ssh_key, deploy_path 等

2. SSH 连接测试
   └── ssh -i <key> -p <port> <user>@<host> "echo ok"

3. 端口检测 (远程执行)
   ├── ssh ... "ss -tlnp | grep <preferred_port>"
   ├── 如果 preferred_port 可用，使用它
   └── 否则遍历 port_range 找第一个可用端口

4. 准备部署文件
   ├── 创建临时目录
   ├── 复制 server/ (Go 源码)
   ├── 复制 web/ (前端源码，排除 node_modules)
   ├── 复制 docker-compose.yml, Dockerfile.*, nginx.conf
   └── 生成 .env 文件 (含检测到的端口)

5. 传输到目标服务器
   └── rsync -avz --exclude=... <tmp>/ <user>@<host>:<deploy_path>/

6. 远程构建和启动
   ├── ssh ... "cd <deploy_path> && docker-compose build"
   └── ssh ... "cd <deploy_path> && docker-compose up -d"

7. 健康检查
   ├── 等待服务启动 (最多 30 秒)
   └── curl http://<host>:<port>/api/v1/health

8. 输出部署结果
   ├── Web 访问地址: http://<host>:<port>
   └── API 地址: http://<host>:<port>/api/v1
```

### 端口检测逻辑 (远程执行)

```bash
# 在目标服务器上执行
find_available_port() {
    local preferred=$1
    local range_start=$2
    local range_end=$3

    # 先检查 preferred port
    if ! ss -tlnp | grep -q ":${preferred} "; then
        echo "$preferred"
        return
    fi

    # 遍历范围寻找可用端口
    for port in $(seq "$range_start" "$range_end"); do
        if ! ss -tlnp | grep -q ":${port} "; then
            echo "$port"
            return
        fi
    done

    echo "ERROR: 在范围 ${range_start}-${range_end} 内未找到可用端口" >&2
    exit 1
}
```

### deploy.yaml 解析

脚本使用 `python3 -c "import yaml; ..."` 解析 YAML（macOS 和大多数 Linux 自带 Python3）。如果目标环境没有 Python3，也可回退到 `grep/sed` 简单解析。

## 后端配置增强

为支持环境变量注入，需要修改 `server/internal/config/config.go`:

```go
func Load(configPath string) error {
    viper.SetConfigFile(configPath)
    if err := viper.ReadInConfig(); err != nil {
        return err
    }

    // 支持环境变量覆盖: JWT_SECRET -> jwt.secret
    viper.SetEnvPrefix("")
    viper.BindEnv("jwt.secret", "JWT_SECRET")

    return viper.Unmarshal(&C)
}
```

这样在 docker-compose.yml 中通过 `environment: JWT_SECRET=xxx` 就能覆盖配置文件中的默认值。

## 安全注意事项

| 项目 | 措施 |
|------|------|
| JWT Secret | 生产环境通过环境变量注入，不提交到版本控制 |
| SSH Key | 路径配置在 deploy.yaml 中，key 文件不纳入版本控制 |
| .env 文件 | deploy/.env.* 加入 .gitignore，只保留 .env.template |
| 数据库 | data/ 目录挂载到宿主机，数据持久化 |
| 容器安全 | 使用 alpine 最小镜像，减少攻击面 |
| 网络隔离 | 后端不对外暴露端口，仅通过 nginx 代理访问 |

### .gitignore 补充

```
# 部署敏感文件
deploy/.env.*
!deploy/.env.template
```

## 目录结构

部署相关文件组织在项目根目录的 `deploy/` 文件夹中：

```
deploy/
├── deploy.sh               # 部署脚本（入口）
├── deploy.yaml             # 环境配置（多环境管理）
├── .env.template           # 环境变量模板
├── docker-compose.yml      # 容器编排
├── Dockerfile.backend      # 后端构建
├── Dockerfile.frontend     # 前端构建
├── nginx.conf              # nginx 配置
└── config.yaml             # 容器内后端配置（生产用）
```

## 依赖与约束

- 目标服务器需要安装 Docker 和 docker-compose
- 目标服务器需要有足够的磁盘空间用于构建镜像（约 2GB）
- 开发机需要有 SSH 访问目标服务器的权限
- 开发机需要 rsync（macOS 自带）
- Go 后端使用 CGO（SQLite 驱动），Docker 构建时需要 gcc
- 前端构建需要 Node.js 22+（在 Docker 内完成）
