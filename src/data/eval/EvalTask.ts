/**
 * 评估任务接口
 */
export interface EvalTask {
    id?: number | null
    datasetId?: number
    taskName?: string
    config?: string
    status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
    totalCount?: number
    completedCount?: number
    metrics?: string
    reportUrl?: string
    startTime?: string
    endTime?: string
    createBy?: number
    createTime?: string

    [key: string]: any
}
