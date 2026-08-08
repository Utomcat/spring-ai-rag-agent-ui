# 项目结构

```
spring-ai-rag-ui/
├── public/                     # 静态资源
│   ├── favicon.svg             # 网站图标
│   └── icons.svg               # SVG 图标
├── src/
│   ├── api/                    # API 接口层（20 个）
│   │   ├── agent.ts            # Agent 管理接口
│   │   ├── announcement.ts     # 系统公告接口
│   │   ├── apiKey.ts           # API 密钥接口
│   │   ├── auth.ts             # 认证接口（登录）
│   │   ├── category.ts         # 分类接口
│   │   ├── chat.ts             # 聊天接口
│   │   ├── document.ts         # 文档接口
│   │   ├── documentVersion.ts  # 文档版本接口
│   │   ├── eval.ts             # 评估体系接口
│   │   ├── kbPermission.ts     # 知识库权限接口
│   │   ├── messageFeedback.ts  # 消息反馈接口
│   │   ├── modelConfig.ts      # 模型配置接口
│   │   ├── plugin.ts           # 插件接口
│   │   ├── retention.ts        # 数据保留接口
│   │   ├── stats.ts            # 统计接口
│   │   ├── systemConfig.ts     # 系统配置接口
│   │   ├── tag.ts              # 文档标签接口
│   │   ├── tenant.ts           # 租户接口
│   │   ├── user.ts             # 用户接口
│   │   └── webhook.ts          # Webhook 接口
│   ├── assets/                 # 静态资源
│   │   ├── hero.png            # 首页背景图
│   │   ├── vite.svg            # Vite 图标
│   │   └── vue.svg             # Vue 图标
│   ├── components/             # 公共组件
│   │   ├── ChatMessage.vue     # 聊天消息组件（支持 Markdown）
│   │   └── StatCard.vue        # 统计卡片组件
│   ├── data/                   # TypeScript 类型定义（18 个模块）
│   │   ├── agent/              # Agent 执行/记忆类型
│   │   ├── aiModelConfig/      # AI 模型配置类型
│   │   ├── announcement/       # 公告类型
│   │   ├── category/           # 分类相关类型
│   │   ├── chat/               # 聊天相关类型
│   │   ├── document/           # 文档相关类型
│   │   ├── eval/               # 评估相关类型
│   │   ├── login/              # 登录相关类型
│   │   ├── page/               # 分页相关类型
│   │   ├── permission/         # 知识库权限类型
│   │   ├── platform/           # 平台化类型（API密钥/Webhook/插件）
│   │   ├── ref/                # 引用来源类型
│   │   ├── result/             # 统一响应结果类型
│   │   ├── retention/          # 数据保留类型
│   │   ├── stats/              # 统计相关类型
│   │   ├── systemConfig/       # 系统配置类型
│   │   ├── tenant/             # 租户类型
│   │   └── user/               # 用户相关类型
│   ├── layouts/                # 布局组件
│   │   ├── AdminLayout.vue     # 管理员布局（侧边栏 + 顶栏）
│   │   └── UserLayout.vue      # 用户布局
│   ├── router/                 # 路由配置
│   │   └── index.ts            # 路由定义与守卫（27 条路由）
│   ├── stores/                 # Pinia 状态管理
│   │   └── user.ts             # 用户状态（角色、Token 等）
│   ├── utils/                  # 工具函数
│   │   ├── avatarFallback.ts   # 头像回退处理
│   │   ├── date.ts             # 日期格式化
│   │   ├── files.ts            # 文件处理工具
│   │   └── request.ts          # Axios 封装（拦截器、Token 注入）
│   ├── views/                  # 页面视图
│   │   ├── admin/              # 管理员端页面（19 个）
│   │   │   ├── Dashboard.vue           # 数据仪表盘
│   │   │   ├── UserManage.vue          # 用户管理
│   │   │   ├── CategoryManage.vue      # 分类管理
│   │   │   ├── DocumentManage.vue      # 文档管理
│   │   │   ├── TagManage.vue           # 文档标签管理
│   │   │   ├── IngestJobManage.vue     # 入库任务管理
│   │   │   ├── TenantManage.vue        # 租户管理
│   │   │   ├── PermissionManage.vue    # 知识库权限管理
│   │   │   ├── ModelConfigManage.vue   # AI 模型配置
│   │   │   ├── EvalManage.vue          # 评估体系（多 tab）
│   │   │   ├── AgentManage.vue         # Agent 管理（多 tab）
│   │   │   ├── ApiKeyManage.vue        # API 密钥管理
│   │   │   ├── WebhookManage.vue       # Webhook 管理（多 tab）
│   │   │   ├── PluginManage.vue        # 插件管理
│   │   │   ├── SystemConfigManage.vue  # 系统配置
│   │   │   ├── AnnouncementManage.vue  # 公告管理
│   │   │   ├── RetentionManage.vue     # 数据保留策略
│   │   │   ├── FeedbackManage.vue      # 消息反馈
│   │   │   └── ChatTest.vue            # 聊天测试
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
