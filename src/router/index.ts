import {unref} from 'vue'
import {createRouter, createWebHistory, type RouteLocationNormalizedGeneric} from 'vue-router'
import {useUserStore} from '../stores/user'

declare module 'vue-router' {
    interface RouteMeta {
        public?: boolean
        requiresAuth?: boolean
        role?: 'ADMIN' | 'USER'
        title?: string
    }
}

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: {
            public: true
        },
    },
    {
        path: '/admin',
        component: () => import('../layouts/AdminLayout.vue'),
        meta: {
            requiresAuth: true,
            role: 'ADMIN'
        } as const,
        children: [
            {
                path: '',
                redirect: '/admin/dashboard'
            },
            {
                path: 'dashboard',
                name: 'AdminDashboard',
                component: () => import('../views/admin/Dashboard.vue')
            },
            {
                path: 'users',
                name: 'AdminUsers',
                component: () => import('../views/admin/UserManage.vue')
            },
            {
                path: 'categories',
                name: 'AdminCategories',
                component: () => import('../views/admin/CategoryManage.vue')
            },
            {
                path: 'documents',
                name: 'AdminDocuments',
                component: () => import('../views/admin/DocumentManage.vue')
            },
            {
                path: 'tags',
                name: 'AdminTags',
                component: () => import('../views/admin/TagManage.vue')
            },
            {
                path: 'chat-test',
                name: 'AdminChatTest',
                component: () => import('../views/admin/ChatTest.vue')
            },
            {
                path: 'ingest-jobs',
                name: 'AdminIngestJobs',
                component: () => import('../views/admin/IngestJobManage.vue'),
                meta: {title: '入库任务'},
            },
            {
                path: 'tenants',
                name: 'AdminTenants',
                component: () => import('../views/admin/TenantManage.vue'),
                meta: {title: '租户管理'},
            },
            {
                path: 'permissions',
                name: 'AdminPermissions',
                component: () => import('../views/admin/PermissionManage.vue'),
                meta: {title: '知识库权限'},
            },
            {
                path: 'model-configs',
                name: 'AdminModelConfigs',
                component: () => import('../views/admin/ModelConfigManage.vue'),
                meta: {title: '模型配置'},
            },
            {
                path: 'system-configs',
                name: 'AdminSystemConfigs',
                component: () => import('../views/admin/SystemConfigManage.vue'),
                meta: {title: '系统配置'},
            },
            {
                path: 'announcements',
                name: 'AdminAnnouncements',
                component: () => import('../views/admin/AnnouncementManage.vue'),
                meta: {title: '系统公告'},
            },
            {
                path: 'eval',
                name: 'AdminEval',
                component: () => import('../views/admin/EvalManage.vue'),
                meta: {title: '评估体系'},
            },
            {
                path: 'agents',
                name: 'AdminAgents',
                component: () => import('../views/admin/AgentManage.vue'),
                meta: {title: 'Agent 管理'},
            },
            {
                path: 'retentions',
                name: 'AdminRetentions',
                component: () => import('../views/admin/RetentionManage.vue'),
                meta: {title: '数据保留'},
            },
            {
                path: 'feedbacks',
                name: 'AdminFeedbacks',
                component: () => import('../views/admin/FeedbackManage.vue'),
                meta: {title: '消息反馈'},
            },
            {
                path: 'api-keys',
                name: 'AdminApiKeys',
                component: () => import('../views/admin/ApiKeyManage.vue'),
                meta: {title: 'API 密钥'},
            },
            {
                path: 'webhooks',
                name: 'AdminWebhooks',
                component: () => import('../views/admin/WebhookManage.vue'),
                meta: {title: 'Webhook'},
            },
            {
                path: 'plugins',
                name: 'AdminPlugins',
                component: () => import('../views/admin/PluginManage.vue'),
                meta: {title: '插件管理'},
            },
            {
                path: 'profile',
                name: 'AdminProfile',
                component: () => import('../views/user/Profile.vue'),
                meta: {title: '个人中心'},
            },
        ],
    },
    {
        path: '/user',
        component: () => import('../layouts/UserLayout.vue'),
        meta: {
            requiresAuth: true,
            role: 'USER'
        } as const,
        children: [
            {
                path: '',
                redirect: '/user/chat'
            },
            {
                path: 'chat',
                name: 'UserChat',
                component: () => import('../views/user/ChatHome.vue')
            },
            {
                path: 'history',
                name: 'UserHistory',
                component: () => import('../views/user/History.vue')
            },
            {
                path: 'profile',
                name: 'UserProfile',
                component: () => import('../views/user/Profile.vue')
            },
        ],
    },
    {
        path: '/',
        redirect: '/login'
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to: RouteLocationNormalizedGeneric, _from: RouteLocationNormalizedGeneric, next) => {
    const store = useUserStore()
    let token = String(unref(store.token) || '').trim()
    let user = unref(store.user)
    let role = user?.role as 'ADMIN' | 'USER' | undefined

    /** 有 token 却无 role（本地数据损坏或旧版本缓存），清掉以免 /login ↔ /user 死循环 */
    if (token && !role) {
        store.logout()
        token = ''
        user = null
        role = undefined
    }

    if (to.meta.public) {
        if (token && to.path === '/login' && role) {
            const home = role === 'ADMIN' ? '/admin/dashboard' : '/user/chat'
            return next({path: home, replace: true})
        }
        return next()
    }

    if (to.meta.requiresAuth && !token) {
        return next('/login')
    }

    /** 路由要求 ADMIN/USER 与当前身份不一致时，只跳到「另一套」布局的根，且避免重复 next 到当前前缀下 */
    if (to.meta.role && role && role !== to.meta.role) {
        if (role === 'ADMIN') {
            if (to.path.startsWith('/admin')) {
                return next()
            }
            return next({path: '/admin/dashboard', replace: true})
        }
        if (role === 'USER') {
            if (to.path.startsWith('/user')) {
                return next()
            }
            return next({path: '/user/chat', replace: true})
        }
        store.logout()
        return next('/login')
    }

    next()
})

export default router