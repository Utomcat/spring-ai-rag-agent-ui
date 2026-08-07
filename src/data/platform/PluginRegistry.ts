/**
 * 插件注册接口
 */
export interface PluginRegistry {
    id?: number | null
    pluginCode?: string
    name?: string
    description?: string
    pluginType?: 'MCP' | 'TOOL' | 'SKILL'
    endpoint?: string
    version?: string
    config?: string
    permissions?: string
    status?: number
    remark?: string
    createTime?: string

    [key: string]: any
}
