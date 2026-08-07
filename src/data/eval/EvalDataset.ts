/**
 * 评估数据集接口
 */
export interface EvalDataset {
    id?: number | null
    tenantId?: number
    name?: string
    description?: string
    question?: string
    expectedAnswer?: string
    expectedDocIds?: string
    difficulty?: 'EASY' | 'NORMAL' | 'HARD'
    tags?: string
    status?: number
    createTime?: string

    [key: string]: any
}
