import request from '../utils/request'
import {Result} from "../data/result/Result";
import {buildPageQuery} from "../data/page/PageParams";
import {ApiKey} from "../data/platform/ApiKey";

/**
 * 创建 API 密钥（返回明文密钥，仅一次可见）
 */
export function createApiKey(data: Record<string, any>): Promise<Result<Record<string, any>>> {
    return request.post('/api/open-api/keys', data)
}

/**
 * 分页获取 API 密钥列表
 */
export function fetchApiKeys(params: Record<string, any>): Promise<Result<any>> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: {}})
    return request.get('/api/open-api/keys', {params: flatParams})
}

/**
 * 切换 API 密钥状态
 */
export function toggleApiKeyStatus(id: number, status: number): Promise<Result<void>> {
    return request.put(`/api/open-api/keys/${id}/status`, null, {params: {status}})
}

/**
 * 删除 API 密钥
 */
export function deleteApiKey(id: number): Promise<Result<void>> {
    return request.delete(`/api/open-api/keys/${id}`)
}
