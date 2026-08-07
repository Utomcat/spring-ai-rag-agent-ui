import request from '../utils/request.ts'
import {buildPageQuery} from "../data/page/PageParams.ts";
import {Result} from "../data/result/Result.ts";
import {MultiResult} from "../data/result/MultiResult.ts";
import {IngestJob} from "../data/document/IngestJob.ts";

/**
 * 获取文档分页列表
 *
 * @param params - 查询参数对象
 * @return Promise 对象，包含文档分页列表数据
 */
export function fetchDocumentPage(params:  Record<string, any>): Promise<MultiResult> {
  const flatParams = buildPageQuery({
    page: params.page,
    size: params.size,
    condition: params.condition
  })
  return request.get('/api/document/list', { params: flatParams })
}

/**
 * 上传文档（异步受理）- 后端白名单校验 + 落库后立即返回批次ID，
 * 解析/切块/向量化由后台异步执行，凭批次ID轮询 fetchIngestJob 获取进度
 *
 * @param formData - 表单数据对象
 * @return Promise 对象，data 为本次上传的批次ID
 */
export function uploadDocument(formData: FormData): Promise<Result<string>> {
  return request.post('/api/document', formData)
}

/**
 * 查询入库任务进度 - 支持任务ID(数字)或上传/重灌返回的批次ID，批次查询返回聚合进度与明细
 *
 * @param jobId - 任务ID或批次ID
 * @return Promise 对象，包含任务进度视图数据
 */
export function fetchIngestJob(jobId: number | string): Promise<Result<IngestJob>> {
  return request.get(`/api/document/job/${jobId}`)
}

/**
 * 删除文档
 *
 * @param id - 文档ID
 * @return Promise 对象，包含删除结果
 */
export function deleteDocument(id: number) {
  return request.delete(`/api/document/${id}`)
}

/**
 * 获取入库任务分页列表
 */
export function fetchIngestJobPage(params: Record<string, any>): Promise<MultiResult> {
  const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
  return request.get('/api/document/job', {params: flatParams})
}

/**
 * 手动重试失败的入库任务
 */
export function retryIngestJob(jobId: number): Promise<Result<void>> {
  return request.post(`/api/document/job/${jobId}/retry`)
}
