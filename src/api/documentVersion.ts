import request from '../utils/request.ts'
import {Result} from "../data/result/Result.ts";

/**
 * 文档版本数据结构
 */
export interface DocumentVersion {
  id: number;
  documentId: number;
  version: number;
  fileName: string;
  fileSize: number;
  vectorCount: number;
  jobType: string;
  changeDesc: string;
  operatorId: number;
  createTime: string;
}

/**
 * 获取文档版本历史列表
 *
 * @param documentId - 文档ID
 * @return Promise 对象，包含版本列表
 */
export function fetchDocumentVersions(documentId: number): Promise<Result<DocumentVersion[]>> {
  return request.get(`/api/document/${documentId}/versions`)
}

/**
 * 文档重新上传（版本递增）
 *
 * @param documentId - 文档ID
 * @param file - 替换的新文件
 * @return Promise 对象，data 为批次ID
 */
export function reuploadDocument(documentId: number, file: File): Promise<Result<string>> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`/api/document/${documentId}/reupload`, formData)
}

/**
 * 触发文档向量重灌（刷新元数据，含标签）
 *
 * @param docId - 文档ID（不传则全量重灌）
 * @return Promise 对象，data 为批次ID
 */
export function reindexDocument(docId?: number): Promise<Result<string>> {
  return request.post('/api/document/reindex', null, { params: docId ? { docId } : {} })
}
