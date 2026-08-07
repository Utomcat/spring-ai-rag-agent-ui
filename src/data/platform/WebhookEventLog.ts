/**
 * Webhook 事件推送日志接口
 */
export interface WebhookEventLog {
    id?: number | null
    webhookId?: number
    eventType?: string
    bizId?: string
    payload?: string
    status?: 'PENDING' | 'SUCCESS' | 'FAIL' | 'RETRYING'
    httpStatus?: number
    responseBody?: string
    retryCount?: number
    errorMsg?: string
    pushTime?: string
    nextRetryTime?: string
    createTime?: string

    [key: string]: any
}
