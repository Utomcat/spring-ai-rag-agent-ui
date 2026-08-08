# 配置说明

## 后端服务代理

开发环境通过 Vite 代理转发 API 请求，配置位于 `vite.config.js`：

```
server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8083', changeOrigin: true }
      '/files': { target: 'http://localhost:8083', changeOrigin: true }
    }
}
```

如需修改后端服务地址，请调整上述配置。

## 认证机制

- **认证方式**：Bearer Token
- **Token 存储**：localStorage
- **请求拦截**：自动在请求头添加 `Authorization: Bearer <token>`
- **响应拦截**：401 / 403 自动清除登录态并跳转登录页
- **超时处理**：默认请求超时 120s；问答请求超时 1 小时（本地大模型推理耗时较长）

## 环境变量

可通过 `.env` 文件配置环境变量：

```env
# 开发环境
VITE_API_BASE_URL=http://localhost:8083/api
VITE_FILES_BASE_URL=http://localhost:8083/files
```
