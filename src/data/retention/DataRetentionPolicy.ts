/**
 * 数据保留策略接口
 */
export interface DataRetentionPolicy {
    id?: number | null
    tableName?: string
    retentionDays?: number
    archiveEnabled?: number
    lastCleanupTime?: string
    status?: number
    remark?: string
    createTime?: string

    [key: string]: any
}
