/**
 * 入库任务进度数据接口（对齐后端 IngestJobVO）
 */
export interface IngestJob {
    // 任务ID（批次聚合视图时为空）
    jobId?: number,
    // 批次ID（同一次上传/重灌共享）
    batchId?: string,
    // 文档ID（批次聚合视图时为空）
    documentId?: number,
    // 文档标题
    documentTitle?: string,
    // 任务类型：INGEST-首次入库向量化 / REINDEX-重新入库
    jobType?: string,
    // 切块策略：token / hierarchical
    chunkStrategy?: string,
    // 状态：PENDING / RUNNING / SUCCESS / FAIL
    status?: string,
    // 进度百分比：0~100
    progress?: number,
    // 本次生成的向量块数量
    vectorCount?: number,
    // 已重试次数
    retryCount?: number,
    // 失败原因
    errorMsg?: string,
    // 开始时间
    startTime?: string,
    // 结束时间
    endTime?: string,
    // 创建时间
    createTime?: string,
    // 批次内各文档任务明细（单任务视图时为空）
    details?: IngestJob[],
}
