/**
 * Agent 执行链路接口
 */
export interface AgentExecution {
    id?: number | null
    traceId?: string
    sessionId?: number
    messageId?: number
    agentName?: string
    parentExecutionId?: number
    executionType?: 'SINGLE' | 'MULTI_AGENT' | 'GRAPH'
    planSteps?: string
    toolCalls?: string
    iterationCount?: number
    inputSummary?: string
    outputSummary?: string
    totalTokens?: number
    durationMs?: number
    status?: 'SUCCESS' | 'FAIL' | 'TIMEOUT' | 'CANCELLED'
    errorMsg?: string
    createTime?: string

    [key: string]: any
}
