# Ranyk RAG 企业知识库问答系统 - 前端

基于 Vue 3 + Vite + Element Plus 构建的 RAG（检索增强生成）企业知识库问答系统前端界面。

## 技术栈

- **框架**：Vue 3 + Vite
- **UI 组件库**：Element Plus（中文国际化）
- **状态管理**：Pinia
- **路由**：Vue Router 5
- **HTTP 客户端**：Axios
- **图表**：ECharts
- **Markdown 渲染**：marked

## 功能特性

### 双角色体系

- **管理员（ADMIN）**：
  - 数据概览仪表盘（用户数、文档数、向量数、问答统计图表）
  - 用户管理（增删改查、启用禁用）
  - 知识分类管理
  - 文档管理（上传、删除、分类筛选）
  - 聊天测试
- **普通用户（USER）**：
  - 知识库问答聊天
  - 多会话管理（新建、切换、删除）
  - 会话历史记录
  - 个人中心

### 核心功能

- **RAG 智能问答**：基于向量检索 + Ollama 大模型推理，答案引用来源文档
- **文档管理**：支持 txt / pdf / doc / docx / md 格式上传，自动解析并向量化
- **分类管理**：知识库文档分类组织
- **实时统计**：近 7 日问答趋势、用户注册趋势、分类文档占比等图表

## 项目结构

```
src/
├── api/                # API 接口层
│   ├── auth.ts         # 认证接口
│   ├── category.ts     # 分类接口
│   ├── chat.ts         # 聊天接口
│   ├── document.ts     # 文档接口
│   ├── stats.ts        # 统计接口
│   └── user.ts         # 用户接口
├── assets/             # 静态资源
├── components/         # 公共组件
│   ├── ChatMessage.vue # 聊天消息组件
│   └── StatCard.vue    # 统计卡片组件
├── data/               # TypeScript 类型定义
│   ├── category/       # 分类相关类型
│   ├── chat/           # 聊天相关类型
│   ├── document/       # 文档相关类型
│   ├── login/          # 登录相关类型
│   ├── page/           # 分页相关类型
│   ├── result/         # 响应结果类型
│   ├── stats/          # 统计相关类型
│   └── user/           # 用户相关类型
├── layouts/            # 布局组件
│   ├── AdminLayout.vue # 管理员布局
│   └── UserLayout.vue  # 用户布局
├── router/             # 路由配置
├── stores/             # Pinia 状态管理
├── utils/              # 工具函数
│   ├── avatarFallback.ts
│   ├── date.ts
│   ├── files.ts
│   └── request.ts      # Axios 封装
└── views/              # 页面视图
    ├── admin/          # 管理员端页面
    │   ├── Dashboard.vue
    │   ├── UserManage.vue
    │   ├── CategoryManage.vue
    │   ├── DocumentManage.vue
    │   └── ChatTest.vue
    ├── user/           # 用户端页面
    │   ├── ChatHome.vue
    │   ├── History.vue
    │   └── Profile.vue
    └── Login.vue
```

## 快速开始

### 环境要求

- Node.js >= 16
- 后端服务运行在 `http://localhost:8083`

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

开发服务器运行在 `http://localhost:5173`

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 后端对接

- 开发环境通过 Vite 代理转发 API 请求
- API 前缀：`/api` → `http://localhost:8083/api`
- 文件访问前缀：`/files` → `http://localhost:8083/files`
- 认证方式：Bearer Token（存储在 localStorage）

## 配置说明

可通过修改 `vite.config.js` 调整后端服务地址：

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': { target: 'http://localhost:8083', changeOrigin: true },
    '/files': { target: 'http://localhost:8083', changeOrigin: true },
  },
}
```
