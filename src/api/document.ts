import request from '../utils/request.ts'
import {buildPageQuery} from "../data/page/PageParams.ts";
import {MultiResult} from "../data/result/MultiResult.ts";

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
 * 上传文档
 *
 * @param formData - 表单数据对象
 * @return Promise 对象，包含上传结果
 */
export function uploadDocument(formData: FormData) {
  return request.post('/api/document', formData)
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
