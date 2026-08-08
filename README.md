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

- **双角色体系**：管理员（知识管理、系统运维、数据统计）+ 普通用户（智能问答、会话管理）
- **RAG 智能问答**：流式 SSE 实时输出，答案可追溯来源文档
- **知识库管理**：多格式文档上传、自动解析向量化、分类标签管理
- **多租户架构**：租户隔离、配额管控、独立知识库
- **评估体系**：评估数据集 + 评估任务 + 结果明细，量化 RAG 效果
- **平台化运营**：API 密钥、Webhook 订阅、插件注册
- **实时统计**：多维度数据可视化仪表盘

> 📖 详细功能说明请查看 [功能特性文档](docs/features.md)

## 📁 项目结构

```
spring-ai-rag-ui/
├── src/
│   ├── api/          # API 接口层（20 个）
│   ├── components/   # 公共组件
│   ├── data/         # TypeScript 类型定义（18 个模块）
│   ├── layouts/      # 布局组件
│   ├── router/       # 路由配置（27 条路由）
│   ├── stores/       # Pinia 状态管理
│   ├── utils/        # 工具函数
│   └── views/        # 页面视图
├── public/           # 静态资源
├── docs/             # 详细文档
└── 配置文件
```

> 📖 完整目录结构请查看 [项目结构文档](docs/project-structure.md)

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
- **代码分包**：按依赖拆分为 `vue-vendor`、`element-plus`、`utils`、`charts`、`vueuse` 等独立 chunk
- **依赖预构建**：Vue、Vue Router、Pinia、Element Plus、Axios、ECharts 已配置 `optimizeDeps`

### 预览构建结果

```bash
npm run preview
```

在本地预览生产构建结果。

## 📚 更多文档

- [功能特性详细说明](docs/features.md)
- [项目结构目录详解](docs/project-structure.md)
- [配置说明](docs/configuration.md)
- [部署指南](docs/deployment.md)
- [开发规范](docs/development-guide.md)

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