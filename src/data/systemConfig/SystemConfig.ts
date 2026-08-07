/**
 * 系统配置接口
 */
export interface SystemConfig {
    id?: number | null
    configGroup?: string
    configKey?: string
    configValue?: string
    valueType?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON'
    description?: string
    remark?: string
    status?: number
    createTime?: string

    [key: string]: any
}
