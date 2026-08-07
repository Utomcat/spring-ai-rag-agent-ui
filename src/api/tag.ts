import request from '../utils/request.ts'
import {buildPageQuery} from "../data/page/PageParams.ts";
import {Result} from "../data/result/Result.ts";
import {MultiResult} from "../data/result/MultiResult.ts";

/**
 * 标签数据结构
 */
export interface Tag {
  id: number;
  name: string;
  color: string;
  createBy?: number;
  createTime?: string;
}

/**
 * 获取标签分页列表
 *
 * @param params - 查询参数对象
 * @return Promise 对象，包含标签分页列表数据
 */
export function fetchTagPage(params: Record<string, any>): Promise<MultiResult> {
  const flatParams = buildPageQuery({
    page: params.page,
    size: params.size,
    condition: params.condition
  })
  return request.get('/api/tag', { params: flatParams })
}

/**
 * 新增标签
 *
 * @param data - 标签数据
 * @return Promise 对象
 */
export function createTag(data: { name: string; color: string }): Promise<Result<void>> {
  return request.post('/api/tag', data)
}

/**
 * 删除标签
 *
 * @param id - 标签ID
 * @return Promise 对象
 */
export function deleteTag(id: number): Promise<Result<void>> {
  return request.delete(`/api/tag/${id}`)
}

/**
 * 获取文档已绑定的标签列表
 *
 * @param documentId - 文档ID
 * @return Promise 对象，包含标签列表
 */
export function fetchDocumentTags(documentId: number): Promise<MultiResult> {
  return request.get(`/api/tag/document/${documentId}`)
}

/**
 * 文档打标（批量绑定标签）
 *
 * @param documentId - 文档ID
 * @param tagIds - 标签ID列表
 * @return Promise 对象
 */
export function bindDocumentTags(documentId: number, tagIds: number[]): Promise<Result<void>> {
  return request.post(`/api/tag/document/${documentId}`, { tagIds })
}

/**
 * 文档取消打标
 *
 * @param documentId - 文档ID
 * @param tagId - 标签ID
 * @return Promise 对象
 */
export function unbindDocumentTag(documentId: number, tagId: number): Promise<Result<void>> {
  return request.delete(`/api/tag/document/${documentId}/${tagId}`)
}
