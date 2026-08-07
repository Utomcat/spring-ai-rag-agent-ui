import request from '../utils/request'
import {Result} from "../data/result/Result";
import {MultiResult} from "../data/result/MultiResult";
import {buildPageQuery} from "../data/page/PageParams";
import {SystemConfig} from "../data/systemConfig/SystemConfig";

/**
 * 获取系统配置分页列表
 */
export function fetchSystemConfigPage(params: Record<string, any>): Promise<MultiResult> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/system-config', {params: flatParams})
}

/**
 * 读取配置值
 */
export function fetchConfigValue(configGroup: string, configKey: string): Promise<Result<string>> {
    return request.get('/api/system-config/value', {params: {configGroup, configKey}})
}

/**
 * 新增/更新系统配置
 */
export function saveSystemConfig(data: SystemConfig): Promise<Result<void>> {
    return request.post('/api/system-config', data)
}

/**
 * 删除系统配置
 */
export function deleteSystemConfig(id: number): Promise<Result<void>> {
    return request.delete(`/api/system-config/${id}`)
}
