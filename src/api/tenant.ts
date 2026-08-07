import request from '../utils/request'
import {Result} from "../data/result/Result";
import {MultiResult} from "../data/result/MultiResult";
import {buildPageQuery} from "../data/page/PageParams";
import {Tenant} from "../data/tenant/Tenant";

/**
 * 获取租户分页列表
 */
export function fetchTenantPage(params: Record<string, any>): Promise<MultiResult> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/tenant', {params: flatParams})
}

/**
 * 创建租户
 */
export function saveTenant(data: Tenant): Promise<Result<void>> {
    return request.post('/api/tenant', data)
}

/**
 * 删除租户
 */
export function deleteTenant(id: number): Promise<Result<void>> {
    return request.delete(`/api/tenant/${id}`)
}
