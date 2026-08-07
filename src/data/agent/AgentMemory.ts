/**
 * Agent 长期记忆接口
 */
export interface AgentMemory {
    id?: number | null
    userId?: number
    memoryType?: 'PREFERENCE' | 'FACT' | 'SKILL'
    content?: string
    sourceSessionId?: number
    importance?: number
    accessCount?: number
    lastAccessTime?: string
    status?: number
    updateTime?: string
    createTime?: string

    [key: string]: any
}
