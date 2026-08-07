import request from '../utils/request'
import {Result} from "../data/result/Result";
import {MultiResult} from "../data/result/MultiResult";
import {buildPageQuery} from "../data/page/PageParams";
import {KbPermission} from "../data/permission/KbPermission";

/**
 * 获取知识库权限分页列表
 */
export function fetchPermissionPage(params: Record<string, any>): Promise<MultiResult> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/kb-permission', {params: flatParams})
}

/**
 * 授权（新增权限）
 */
export function grantPermission(data: KbPermission): Promise<Result<void>> {
    return request.post('/api/kb-permission', data)
}

/**
 * 撤销权限
 */
export function revokePermission(id: number): Promise<Result<void>> {
    return request.delete(`/api/kb-permission/${id}`)
}
