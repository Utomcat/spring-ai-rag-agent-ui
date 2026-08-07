/**
 * 租户信息接口
 */
export interface Tenant {
    id?: number | null
    name?: string
    code?: string
    contactName?: string
    contactEmail?: string
    plan?: 'FREE' | 'STANDARD' | 'ENTERPRISE'
    maxUsers?: number
    maxStorageMb?: number
    maxDailyTokens?: number
    status?: number
    expireTime?: string
    remark?: string
    createTime?: string

    [key: string]: any
}
