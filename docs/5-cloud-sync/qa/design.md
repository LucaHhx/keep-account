# qa 设计文档

> 需求: cloud-sync | 角色: qa

## 测试策略

### 后端测试

| 类型 | 范围 | 工具 |
|------|------|------|
| 集成测试 | 健康检查接口 | Go testing + httptest |
| 集成测试 | CORS 配置验证 | Go testing + httptest |

### 前端测试

| 类型 | 范围 | 工具 |
|------|------|------|
| 组件测试 | NetworkBanner / ThemeToggle / ProfilePage | Vitest + React Testing Library |
| Store 测试 | useThemeStore 主题切换逻辑 | Vitest |

## 测试范围

### 健康检查

- GET /api/v1/health -> 返回 code 0 + version + time
- 无需鉴权即可访问

### CORS 配置

- Web origin (localhost:5173) -> 允许跨域
- Tauri origin (tauri://localhost) -> 允许跨域
- Capacitor origin (capacitor://localhost) -> 允许跨域
- 非法 origin -> 拒绝跨域
- X-New-Token 在 Access-Control-Expose-Headers 中

### 多端数据一致性

- 同一账号两端操作：一端新增，另一端刷新后可见
- 同一账号两端操作：一端编辑，另一端刷新后可见
- 同一账号两端操作：一端删除，另一端刷新后可见

### 主题切换

- 浅色模式 -> 应用浅色样式
- 深色模式 -> 应用深色样式
- 跟随系统 -> 根据系统偏好自动切换
- 主题偏好持久化到 localStorage
- 刷新页面后主题偏好恢复

### 断网处理

- 断网时显示 NetworkBanner 提示
- 断网时写操作按钮禁用
- 恢复网络后 Banner 消失，操作恢复

## 关键决策

- CORS 多端 origin 是部署关键，需要逐一验证
- 主题切换的持久化和恢复需要验证完整流程
