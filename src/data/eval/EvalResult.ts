/**
 * 评估结果接口
 */
export interface EvalResult {
    id?: number | null
    taskId?: number
    datasetId?: number
    question?: string
    rewrittenQuery?: string
    actualDocIds?: string
    hitTop5?: number
    firstCorrect?: number
    reciprocalRank?: number
    retrievalTimeMs?: number
    rerankApplied?: number
    answerSimilarity?: number
    errorMsg?: string
    createTime?: string

    [key: string]: any
}
