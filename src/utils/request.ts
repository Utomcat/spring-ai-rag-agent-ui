import axios from 'axios'
import router from '../router'
import {ElMessage} from 'element-plus'
import {useUserStore} from '../stores/user'
import {Result, isSuccess} from "../data/result/Result";
import {MultiResult} from "../data/result/MultiResult";

/**
 * Axios 实例：开发环境通过 Vite 代理访问后端。
 */
const request = axios.create({
    baseURL: '',
    timeout: 120000,
})

/**
 * 请求拦截器：添加 token
 */
request.interceptors.request.use(
    (config) => {
        const store = useUserStore()
        if (store.token) {
            config.headers.Authorization = `Bearer ${store.token}`
        }
        return config
    }
)

/**
 * 响应拦截器：处理结果, 并返回给调用方
 */
request.interceptors.response.use(
    (res) => {
        const result: Result | MultiResult = res.data
        if (isSuccess(result)) {
            return res.data
        }
        const errorMsg = result.msg || '请求失败'
        ElMessage.error(errorMsg)
        return Promise.reject(new Error(errorMsg))
    },
    (err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
            useUserStore().logout()
            router.push('/login')
        }
        const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout')
        if (isTimeout) {
            ElMessage.error('请求超时：模型或知识库检索耗时过长，请稍后再试或缩短问题 / 检查 Ollama 是否正常运行')
        } else {
            ElMessage.error(err.response?.data?.message || err.message || '网络错误')
        }
        return Promise.reject(err)
    }
)

export default request
