# Ranyk RAG 企业知识库问答系统 - 前端

<p style="text-align: center;">
  <img src="https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white" alt="Vue Version" />
  <img src="https://img.shields.io/badge/Vite-8.0-646cff?logo=vite&logoColor=white" alt="Vite Version" />
  <img src="https://img.shields.io/badge/Element Plus-2.14-409eff?logo=element&logoColor=white" alt="Element Plus" />
  <img src="https://img.shields.io/badge/License-Apache--2.0-green" alt="License" />
</p>

基于 Vue 3 + Vite + Element Plus 构建的 **RAG（检索增强生成）企业知识库问答系统**
前端界面。系统采用前后端分离架构，支持管理员和普通用户双角色，提供完整的知识库管理、智能问答、数据统计等功能。

## ✨ 技术栈

| 类别              | 技术                                                                            |
|-----------------|-------------------------------------------------------------------------------|
| **核心框架**        | [Vue 3.5](https://vuejs.org/) + [Vite 8.0](https://vitejs.dev/)               |
| **UI 组件库**      | [Element Plus 2.14](https://element-plus.org/)（中文国际化）                         |
| **状态管理**        | [Pinia 3.0](https://pinia.vuejs.org/)                                         |
| **路由管理**        | [Vue Router 5.0](https://router.vuejs.org/)                                   |
| **HTTP 客户端**    | [Axios 1.16](https://axios-http.com/)                                         |
| **数据可视化**       | [ECharts 6.0](https://echarts.apache.org/)                                    |
| **Markdown 渲染** | [marked 18.0](https://marked.js.org/)                                         |
| **图标库**         | [@element-plus/icons-vue](https://element-plus.org/zh-CN/component/icon.html) |
| **构建优化**        | [vite-plugin-compression](https://github.com/vbenjs/vite-plugin-compression)  |

## 🎯 功能特性

### 👥 双角色体系

#### 管理员（ADMIN）

- **📊 数据概览仪表盘**
    - 核心指标卡片（用户总数、文档总数、向量总数、问答统计）
    - 近 7 日问答趋势折线图
    - 用户注册趋势图表
    - 知识分类文档占比饼图

- **👤 用户管理**
    - 用户列表查询与分页
    - 新增/编辑/删除用户
    - 启用/禁用用户账号
    - 用户角色分配

- **📁 知识分类管理**
    - 分类增删改查
    - 分类层级展示

- **📄 文档管理**
    - 多格式文档上传（txt / pdf / doc / docx / md）
    - 文档自动解析与向量化
    - 按分类筛选文档
    - 删除文档（同步清除向量数据）

- **💬 聊天测试**
    - 管理员专用测试聊天界面
    - 验证 RAG 问答效果

#### 普通用户（USER）

- **🤖 知识库问答**
    - 智能对话界面，异步问答（带检索中状态提示）
    - Markdown 格式渲染答案
    - 显示引用来源文档
    - 按分类限定问答范围（可选）

- **📋 多会话管理**
    - 新建聊天会话
    - 会话快速切换
    - 删除历史会话

- **📜 历史记录**
    - 查看历史对话记录
    - 按会话浏览聊天内容

- **👤 个人中心**
    - 查看/编辑个人资料
    - 修改密码

> 💡 管理员同样可访问个人中心页面（`/admin/profile`）。

### 🔧 核心功能

- **RAG 智能问答**：基于向量检索 + Ollama 大模型推理，答案可追溯来源文档
- **文档向量化**：支持多种文档格式，自动解析、分块、向量化存储
- **实时统计**：多维度数据可视化，直观展示系统运行状态
- **权限控制**：基于角色的路由守卫，精准控制页面访问权限
- **响应式布局**：适配不同屏幕尺寸，提供良好用户体验

## 📁 项目结构

```
spring-ai-rag-ui/
├── public/                     # 静态资源
│   ├── favicon.svg             # 网站图标
│   └── icons.svg               # SVG 图标
├── src/
│   ├── api/                    # API 接口层
│   │   ├── auth.ts             # 认证接口（登录）
│   │   ├── category.ts         # 分类接口
│   │   ├── chat.ts             # 聊天接口
│   │   ├── document.ts         # 文档接口
│   │   ├── stats.ts            # 统计接口
│   │   └── user.ts             # 用户接口
│   ├── assets/                 # 静态资源
│   │   ├── hero.png            # 首页背景图
│   │   ├── vite.svg            # Vite 图标
│   │   └── vue.svg             # Vue 图标
│   ├── components/             # 公共组件
│   │   ├── ChatMessage.vue     # 聊天消息组件（支持 Markdown）
│   │   └── StatCard.vue        # 统计卡片组件
│   ├── data/                   # TypeScript 类型定义
│   │   ├── category/           # 分类相关类型
│   │   ├── chat/               # 聊天相关类型
│   │   ├── document/           # 文档相关类型
│   │   ├── login/              # 登录相关类型
│   │   ├── page/               # 分页相关类型
│   │   ├── ref/                # 引用来源类型
│   │   ├── result/             # 统一响应结果类型
│   │   ├── stats/              # 统计相关类型
│   │   └── user/               # 用户相关类型
│   ├── layouts/                # 布局组件
│   │   ├── AdminLayout.vue     # 管理员布局（侧边栏 + 顶栏）
│   │   └── UserLayout.vue      # 用户布局
│   ├── router/                 # 路由配置
│   │   └── index.ts            # 路由定义与守卫
│   ├── stores/                 # Pinia 状态管理
│   │   └── user.ts             # 用户状态（角色、Token 等）
│   ├── utils/                  # 工具函数
│   │   ├── avatarFallback.ts   # 头像回退处理
│   │   ├── date.ts             # 日期格式化
│   │   ├── files.ts            # 文件处理工具
│   │   └── request.ts          # Axios 封装（拦截器、Token 注入）
│   ├── views/                  # 页面视图
│   │   ├── admin/              # 管理员端页面
│   │   │   ├── Dashboard.vue   # 数据仪表盘
│   │   │   ├── UserManage.vue  # 用户管理
│   │   │   ├── CategoryManage.vue  # 分类管理
│   │   │   ├── DocumentManage.vue  # 文档管理
│   │   │   └── ChatTest.vue    # 聊天测试
│   │   ├── user/               # 用户端页面
│   │   │   ├── ChatHome.vue    # 智能问答首页
│   │   │   ├── History.vue     # 历史记录
│   │   │   └── Profile.vue     # 个人中心（管理员/用户共用）
│   │   └── Login.vue           # 登录页
│   ├── App.vue                 # 根组件
│   ├── main.js                 # 应用入口
│   ├── style.css               # 全局样式
│   └── vite-env.d.ts           # Vite 类型声明
├── .gitignore                  # Git 忽略配置
├── .npmrc                      # npm 配置
├── index.html                  # HTML 入口
├── package.json                # 项目依赖
├── tsconfig.json               # TypeScript 配置
├── tsconfig.node.json          # TypeScript Node 配置
└── vite.config.js              # Vite 配置
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.0
- **npm** >= 8.0 或 **pnpm** >= 7.0
- 后端服务运行在 `http://localhost:8083`

### 安装依赖

```bash
npm install
```

或使用 pnpm：

```bash
pnpm install
```

### 开发模式

```bash
npm run dev
```

开发服务器将启动在 `http://localhost:5173`，支持热更新（HMR）。

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录，包含以下优化：

- **Gzip 压缩**：大于 10KB 的资源自动生成 `.gz` 文件
- **代码分包**：按依赖拆分为 `vue-vendor`、`element-plus`、`utils`、`charts` 等独立 chunk
- **依赖预构建**：Vue、Vue Router、Pinia、Element Plus、Axios、ECharts 已配置 `optimizeDeps`

### 预览构建结果

```bash
npm run preview
```

在本地预览生产构建结果。

## ⚙️ 配置说明

### 后端服务代理

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

### 认证机制

- **认证方式**：Bearer Token
- **Token 存储**：localStorage
- **请求拦截**：自动在请求头添加 `Authorization: Bearer <token>`
- **响应拦截**：401 / 403 自动清除登录态并跳转登录页
- **超时处理**：默认请求超时 120s；问答请求超时 1 小时（本地大模型推理耗时较长）

### 环境变量

可通过 `.env` 文件配置环境变量：

```env
# 开发环境
VITE_API_BASE_URL=http://localhost:8083/api
VITE_FILES_BASE_URL=http://localhost:8083/files
```

## 🌐 后端对接

本项目为前端工程，需配合后端服务使用：

- **后端技术栈**：Spring AI + Spring Boot
- **向量数据库**：支持多种向量存储（如 Milvus、PgVector 等）
- **大模型**：Ollama 本地部署
- **API 文档**：请参考后端项目 Swagger 文档

## 📦 部署指南

### Nginx 部署

1. 执行生产构建：`npm run build`
2. 将 `dist/` 目录内容复制到 Nginx 静态资源目录
3. 配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 文件访问代理
    location /files/ {
        proxy_pass http://localhost:8083;
    }
}
```

### Docker 部署

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🛠️ 开发规范

### 代码风格

- 使用 ES Module 模块化
- 组件采用 `<script setup>` 语法
- TypeScript 类型定义位于 `src/data/` 目录
- API 接口统一封装在 `src/api/` 目录

### 提交规范

建议使用 Conventional Commits 规范：

```
feat: 新增用户管理功能
fix: 修复聊天会话切换问题
docs: 更新项目文档
style: 调整仪表盘样式
refactor: 重构请求拦截器
```

## 📸 系统截图

> 待添加系统界面截图

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 [Apache License 2.0](LICENSE) 协议开源。

## 📮 联系方式

如有问题或建议，欢迎提交 Issue 或联系项目维护者。

---

**注意**：本项目为前端工程，需配合对应的 Spring AI RAG 后端服务使用。