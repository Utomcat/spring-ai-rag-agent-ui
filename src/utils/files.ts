import {ref, watch, type Ref} from 'vue'
import request from './request.ts'

/**
 * 将后端返回的相对路径转为可访问的 URL（依赖 Vite 代理 /files）。
 */
export function fileUrl(relative: any) {
    if (relative == null || relative === '') return ''
    const path = String(relative).replace(/^\/+/, '')
    return `/files/${path}`
}

/**
 * Blob 对象 URL 缓存：key 为文件相对路径，value 为 URL.createObjectURL 生成的对象 URL
 * （/files/** 需认证访问，img 标签无法携带 Token，统一改为带鉴权下载后转 objectURL）
 */
const blobUrlCache = new Map<string, string>()

/**
 * 进行中的下载 Promise 缓存：避免同一文件并发重复下载
 */
const pendingDownloads = new Map<string, Promise<string>>()

/**
 * 带鉴权加载文件并返回可直接绑定到 img src 的对象 URL（同一路径仅下载一次）
 *
 * @param relative - 后端返回的文件相对路径
 * @return Promise 对象，包含对象 URL；加载失败时 reject
 */
export async function loadAuthFileUrl(relative: any): Promise<string> {
    const url = fileUrl(relative)
    if (!url) return ''
    const cached = blobUrlCache.get(url)
    if (cached) return cached
    const pending = pendingDownloads.get(url)
    if (pending) return pending
    const task = request.get(url, {responseType: 'blob'})
        .then((blob: Blob) => {
            const objectUrl = URL.createObjectURL(blob)
            blobUrlCache.set(url, objectUrl)
            return objectUrl
        })
        .finally(() => pendingDownloads.delete(url))
    pendingDownloads.set(url, task)
    return task
}

/**
 * 组合式 API：监听文件相对路径变化，自动带鉴权加载并返回对象 URL
 *
 * @param relative - 文件相对路径（支持 Ref 或取值函数）
 * @return 对象 URL 的 Ref，路径为空或加载失败时为空字符串
 */
export function useAuthFileUrl(relative: Ref<any> | (() => any)): Ref<string> {
    const objectUrl = ref('')
    watch(relative, async (value) => {
        if (value == null || value === '') {
            objectUrl.value = ''
            return
        }
        try {
            objectUrl.value = await loadAuthFileUrl(value)
        } catch {
            objectUrl.value = ''
        }
    }, {immediate: true})
    return objectUrl
}

/**
 * 清空文件缓存并释放全部对象 URL（退出登录时调用）
 */
export function clearAuthFileCache() {
    blobUrlCache.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
    blobUrlCache.clear()
}
