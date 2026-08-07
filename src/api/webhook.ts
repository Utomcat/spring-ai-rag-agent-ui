import request from '../utils/request'
import {Result} from "../data/result/Result";
import {buildPageQuery} from "../data/page/PageParams";
import {WebhookConfig} from "../data/platform/WebhookConfig";

/**
 * 创建 Webhook 订阅配置
 */
export function saveWebhookConfig(data: WebhookConfig): Promise<Result<void>> {
    return request.post('/api/webhook/config', data)
}

/**
 * 分页获取 Webhook 订阅配置列表
 */
export function fetchWebhookConfigs(params: Record<string, any>): Promise<Result<any>> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: {}})
    return request.get('/api/webhook/config', {params: flatParams})
}

/**
 * 切换 Webhook 配置状态
 */
export function toggleWebhookStatus(id: number, status: number): Promise<Result<void>> {
    return request.put(`/api/webhook/config/${id}/status`, null, {params: {status}})
}

/**
 * 删除 Webhook 配置
 */
export function deleteWebhookConfig(id: number): Promise<Result<void>> {
    return request.delete(`/api/webhook/config/${id}`)
}

/**
 * 获取推送日志分页列表
 */
export function fetchWebhookLogPage(params: Record<string, any>): Promise<Result<any>> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/webhook/log', {params: flatParams})
}

/**
 * 手动触发事件发布
 */
export function manualPublish(data: Record<string, any>): Promise<Result<void>> {
    return request.post('/api/webhook/publish', data)
}
