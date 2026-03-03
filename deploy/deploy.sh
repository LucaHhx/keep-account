#!/bin/bash
set -euo pipefail

# 用法: ./deploy/deploy.sh [服务器名]
# 示例: ./deploy/deploy.sh          # 只有一个配置时自动选择
#       ./deploy/deploy.sh mini1     # 指定服务器

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_DIR="${SCRIPT_DIR}/env"

# ========== 颜色输出 ==========
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ========== 1. 选择配置文件 ==========
ENV_NAME="${1:-}"

if [ -z "$ENV_NAME" ]; then
    # 自动发现配置（排除 _template.yaml）
    configs=()
    for f in "${ENV_DIR}"/*.yaml; do
        [ -f "$f" ] || continue
        base="$(basename "$f" .yaml)"
        [ "$base" = "_template" ] && continue
        configs+=("$base")
    done

    if [ ${#configs[@]} -eq 0 ]; then
        error "未找到服务器配置文件"
        error "请先创建: cp ${ENV_DIR}/_template.yaml ${ENV_DIR}/<name>.yaml"
        exit 1
    elif [ ${#configs[@]} -eq 1 ]; then
        ENV_NAME="${configs[0]}"
        info "自动选择唯一配置: ${ENV_NAME}"
    else
        error "存在多个配置，请指定服务器名:"
        for c in "${configs[@]}"; do
            echo "  ./deploy/deploy.sh $c"
        done
        exit 1
    fi
fi

CONFIG_FILE="${ENV_DIR}/${ENV_NAME}.yaml"

if [ ! -f "$CONFIG_FILE" ]; then
    error "配置文件不存在: ${CONFIG_FILE}"
    exit 1
fi

# ========== 2. 解析配置 ==========
info "解析配置: ${ENV_NAME}"

read_config() {
    python3 -c "
import yaml, sys
with open('${CONFIG_FILE}') as f:
    cfg = yaml.safe_load(f)
required = ['host', 'user', 'deploy_path', 'app_port', 'jwt_secret']
missing = [k for k in required if not cfg.get(k)]
if missing:
    print(f'ERROR: 缺少必填字段: {\", \".join(missing)}', file=sys.stderr)
    sys.exit(1)
print(f'ENV_DISPLAY_NAME=\"{cfg.get(\"name\", \"${ENV_NAME}\")}\"')
print(f'REMOTE_HOST=\"{cfg[\"host\"]}\"')
print(f'SSH_PORT=\"{cfg.get(\"port\", 22)}\"')
print(f'REMOTE_USER=\"{cfg[\"user\"]}\"')
print(f'SSH_KEY=\"{cfg.get(\"ssh_key\", \"~/.ssh/id_rsa\")}\"')
print(f'DEPLOY_PATH=\"{cfg[\"deploy_path\"]}\"')
print(f'APP_PORT=\"{cfg[\"app_port\"]}\"')
print(f'JWT_SECRET=\"{cfg[\"jwt_secret\"]}\"')
"
}

eval "$(read_config)"

SSH_KEY="${SSH_KEY/#\~/$HOME}"
SSH_CMD="ssh -i ${SSH_KEY} -p ${SSH_PORT} -o StrictHostKeyChecking=no -o ConnectTimeout=10"
SCP_CMD="scp -i ${SSH_KEY} -P ${SSH_PORT} -o StrictHostKeyChecking=no"

info "部署目标: ${ENV_DISPLAY_NAME}"
info "  地址: ${REMOTE_USER}@${REMOTE_HOST}:${SSH_PORT}"
info "  路径: ${DEPLOY_PATH}"
info "  端口: ${APP_PORT}"

# ========== 3. SSH 连接测试 ==========
info "测试 SSH 连接..."

if ! ${SSH_CMD} "${REMOTE_USER}@${REMOTE_HOST}" "echo ok" > /dev/null 2>&1; then
    error "SSH 连接失败: ${REMOTE_USER}@${REMOTE_HOST}:${SSH_PORT}"
    error "请检查: 1) 服务器是否在线 2) SSH 密钥是否正确 3) 用户名/端口是否正确"
    exit 1
fi

success "SSH 连接正常"

# 解析远程 ~ 路径
if [[ "$DEPLOY_PATH" == "~"* ]]; then
    REMOTE_HOME=$(${SSH_CMD} "${REMOTE_USER}@${REMOTE_HOST}" "echo \$HOME")
    DEPLOY_PATH="${DEPLOY_PATH/#\~/$REMOTE_HOME}"
    info "远程部署路径: ${DEPLOY_PATH}"
fi

# ========== 4. 传输文件 ==========
info "传输文件到目标服务器..."

${SSH_CMD} "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${DEPLOY_PATH}/data"

rsync -avz --delete \
    --exclude '.git/' \
    --exclude '.idea/' \
    --exclude '.vscode/' \
    --exclude '.claude/' \
    --exclude '.codex/' \
    --exclude 'node_modules/' \
    --exclude 'web/node_modules/' \
    --exclude 'web/dist/' \
    --exclude 'web/src-tauri/target/' \
    --exclude 'web/src-tauri/gen/' \
    --exclude 'server/server' \
    --exclude 'server/data/' \
    --exclude 'data/' \
    --exclude 'docs/' \
    --exclude '.DS_Store' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude 'deploy/env/' \
    -e "ssh -i ${SSH_KEY} -p ${SSH_PORT} -o StrictHostKeyChecking=no" \
    "${PROJECT_ROOT}/" \
    "${REMOTE_USER}@${REMOTE_HOST}:${DEPLOY_PATH}/"

# 直接写入远程 .env
${SSH_CMD} "${REMOTE_USER}@${REMOTE_HOST}" "cat > ${DEPLOY_PATH}/deploy/.env" <<EOF
APP_PORT=${APP_PORT}
JWT_SECRET=${JWT_SECRET}
EOF

success "文件传输完成"

# ========== 5. 远程构建和启动 ==========
info "在目标服务器上构建和启动服务..."

${SSH_CMD} "${REMOTE_USER}@${REMOTE_HOST}" bash -s <<REMOTE_BUILD
set -euo pipefail
export PATH="/usr/local/bin:/opt/homebrew/bin:\$PATH"
cd "${DEPLOY_PATH}"

echo "[远程] 构建 Docker 镜像..."
docker compose -f deploy/docker-compose.yml --env-file deploy/.env build

echo "[远程] 停止旧服务..."
docker compose -f deploy/docker-compose.yml --env-file deploy/.env down 2>/dev/null || true

echo "[远程] 启动服务..."
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d

echo "[远程] 服务已启动"
REMOTE_BUILD

success "远程构建和启动完成"

# ========== 6. 健康检查 ==========
info "等待服务就绪..."

MAX_RETRIES=30
RETRY_INTERVAL=1
HEALTH_URL="http://${REMOTE_HOST}:${APP_PORT}/api/v1/health"

for i in $(seq 1 $MAX_RETRIES); do
    if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
        success "健康检查通过"
        break
    fi
    if [ "$i" -eq "$MAX_RETRIES" ]; then
        warn "健康检查超时 (${MAX_RETRIES}秒)，服务可能仍在启动中"
        warn "请手动检查: curl ${HEALTH_URL}"
        break
    fi
    sleep $RETRY_INTERVAL
done

# ========== 7. 部署结果 ==========
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  环境:     ${ENV_DISPLAY_NAME}"
echo -e "  Web 访问: ${BLUE}http://${REMOTE_HOST}:${APP_PORT}${NC}"
echo -e "  API 地址: ${BLUE}http://${REMOTE_HOST}:${APP_PORT}/api/v1${NC}"
echo -e "  端口:     ${APP_PORT}"
echo ""
