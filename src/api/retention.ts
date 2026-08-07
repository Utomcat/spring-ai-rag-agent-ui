import request from '../utils/request'
import {Result} from "../data/result/Result";
import {MultiResult} from "../data/result/MultiResult";
import {buildPageQuery} from "../data/page/PageParams";
import {DataRetentionPolicy} from "../data/retention/DataRetentionPolicy";

/**
 * 获取数据保留策略分页列表
 */
export function fetchRetentionPolicyPage(params: Record<string, any>): Promise<MultiResult> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/retention', {params: flatParams})
}

/**
 * 新增数据保留策略
 */
export function saveRetentionPolicy(data: DataRetentionPolicy): Promise<Result<void>> {
    return request.post('/api/retention', data)
}

/**
 * 删除数据保留策略
 */
export function deleteRetentionPolicy(id: number): Promise<Result<void>> {
    return request.delete(`/api/retention/${id}`)
}

/**
 * 手动触发清理
 */
export function triggerCleanup(id: number): Promise<Result<string>> {
    return request.post(`/api/retention/${id}/cleanup`)
}
