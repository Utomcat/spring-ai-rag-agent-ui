/**
 * Webhook 订阅配置接口
 */
export interface WebhookConfig {
    id?: number | null
    name?: string
    targetUrl?: string
    secret?: string
    eventTypes?: string
    headers?: string
    timeoutMs?: number
    maxRetry?: number
    status?: number
    lastTriggerTime?: string
    remark?: string
    createTime?: string

    [key: string]: any
}
