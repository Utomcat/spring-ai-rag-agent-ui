import request from '../utils/request'
import {Result} from "../data/result/Result";
import {buildPageQuery} from "../data/page/PageParams";
import {PluginRegistry} from "../data/platform/PluginRegistry";

/**
 * 保存插件注册（新增/更新）
 */
export function savePlugin(data: PluginRegistry): Promise<Result<void>> {
    return request.post('/api/plugin', data)
}

/**
 * 分页查询插件注册表
 */
export function fetchPluginPage(params: Record<string, any>): Promise<Result<any>> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/plugin', {params: flatParams})
}

/**
 * 查询已启用插件列表
 */
export function fetchEnabledPlugins(pluginType?: string): Promise<Result<PluginRegistry[]>> {
    return request.get('/api/plugin/enabled', {params: {pluginType}})
}

/**
 * 切换插件状态
 */
export function togglePluginStatus(id: number, status: number): Promise<Result<void>> {
    return request.put(`/api/plugin/${id}/status`, null, {params: {status}})
}

/**
 * 删除插件注册
 */
export function deletePlugin(id: number): Promise<Result<void>> {
    return request.delete(`/api/plugin/${id}`)
}
