#!/bin/bash
set -euo pipefail

# KeepAccount iOS 构建 & 安装脚本
# 用法: ./deploy/Issue/mini1/ios.sh [选项]
# 选项:
#   --build-only    仅构建 IPA，不安装
#   --install-only  仅安装已有 IPA，不重新构建
#   --device UDID   指定设备 UDID（默认自动检测）

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
WEB_DIR="${PROJECT_ROOT}/web"
IPA_PATH="${WEB_DIR}/src-tauri/gen/apple/build/arm64/KeepAccount.ipa"

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

# ========== 参数解析 ==========
BUILD_ONLY=false
INSTALL_ONLY=false
DEVICE_UDID=""
API_BASE_URL="http://192.168.0.228:8080"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --build-only)   BUILD_ONLY=true; shift ;;
        --install-only) INSTALL_ONLY=true; shift ;;
        --device)       DEVICE_UDID="$2"; shift 2 ;;
        --api-url)      API_BASE_URL="$2"; shift 2 ;;
        *) error "未知参数: $1"; exit 1 ;;
    esac
done

# ========== 1. 环境检查 ==========
info "检查构建环境..."

if ! $INSTALL_ONLY; then
    if ! command -v npx &> /dev/null; then
        error "未找到 npx，请先安装 Node.js"
        exit 1
    fi
fi

if ! $BUILD_ONLY; then
    if ! command -v xcrun &> /dev/null; then
        error "未找到 xcrun，请安装 Xcode Command Line Tools"
        exit 1
    fi
fi

success "环境检查通过"

# ========== 2. 设备检测 ==========
if ! $BUILD_ONLY; then
    info "检测 iOS 设备..."

    if [ -z "$DEVICE_UDID" ]; then
        # 自动检测已连接的 iPhone/iPad
        DEVICE_INFO=$(xcrun xctrace list devices 2>/dev/null | grep -E "iPhone|iPad" | grep -v "Simulator" | head -1 || true)

        if [ -z "$DEVICE_INFO" ]; then
            error "未检测到已连接的 iOS 设备"
            error "请通过 USB 连接你的 iPhone/iPad 并信任此电脑"
            exit 1
        fi

        DEVICE_UDID=$(echo "$DEVICE_INFO" | grep -oE '\(([0-9A-Fa-f-]+)\)' | tail -1 | tr -d '()')
        DEVICE_NAME=$(echo "$DEVICE_INFO" | sed 's/ (.*//')
    else
        DEVICE_NAME="设备 ${DEVICE_UDID:0:8}..."
    fi

    success "目标设备: ${DEVICE_NAME} (${DEVICE_UDID})"
fi

# ========== 3. 构建 iOS IPA ==========
if ! $INSTALL_ONLY; then
    info "开始构建 iOS 应用..."
    info "  API 地址: ${API_BASE_URL}"

    cd "$WEB_DIR"

    # 检查 Xcode 是否在运行（可能持有文件锁）
    if pgrep -f "Xcode" > /dev/null 2>&1; then
        warn "检测到 Xcode 正在运行，可能导致文件锁冲突"
        warn "正在关闭 Xcode..."
        osascript -e 'quit app "Xcode"' 2>/dev/null || true
        sleep 2
    fi

    # 构建
    VITE_API_BASE_URL="$API_BASE_URL" npm run tauri:ios-build

    if [ ! -f "$IPA_PATH" ]; then
        error "构建失败：未找到 IPA 文件 ($IPA_PATH)"
        exit 1
    fi

    IPA_SIZE=$(du -h "$IPA_PATH" | cut -f1)
    success "构建完成: KeepAccount.ipa (${IPA_SIZE})"
fi

# ========== 4. 安装到设备 ==========
if ! $BUILD_ONLY; then
    if [ ! -f "$IPA_PATH" ]; then
        error "未找到 IPA 文件: $IPA_PATH"
        error "请先运行构建（去掉 --install-only）"
        exit 1
    fi

    info "正在安装到 ${DEVICE_NAME}..."

    xcrun devicectl device install app \
        --device "$DEVICE_UDID" \
        "$IPA_PATH"

    success "安装完成"
fi

# ========== 5. 输出结果 ==========
echo ""
echo -e "${GREEN}========================================${NC}"
if $BUILD_ONLY; then
    echo -e "${GREEN}  iOS 构建完成!${NC}"
elif $INSTALL_ONLY; then
    echo -e "${GREEN}  iOS 安装完成!${NC}"
else
    echo -e "${GREEN}  iOS 构建 & 安装完成!${NC}"
fi
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  应用:     KeepAccount (记账本)"
echo -e "  API 地址: ${BLUE}${API_BASE_URL}${NC}"
if ! $BUILD_ONLY; then
    echo -e "  设备:     ${DEVICE_NAME}"
fi
if ! $INSTALL_ONLY; then
    echo -e "  IPA 路径: ${IPA_PATH}"
fi
echo ""
