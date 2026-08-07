/**
 * API 密钥接口
 */
export interface ApiKey {
    id?: number | null
    name?: string
    keyPrefix?: string
    keyHash?: string
    scopes?: string
    rateLimitQps?: number
    dailyQuota?: number
    lastUsedTime?: string
    expireTime?: string
    status?: number
    createTime?: string

    /** 创建时返回的明文密钥（仅一次可见） */
    plainKey?: string

    [key: string]: any
}
