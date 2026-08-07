import request from '../utils/request'
import {Result} from "../data/result/Result";
import {MultiResult} from "../data/result/MultiResult";
import {buildPageQuery} from "../data/page/PageParams";
import {AiModelConfig} from "../data/aiModelConfig/AiModelConfig";

/**
 * 获取模型配置分页列表
 */
export function fetchModelConfigPage(params: Record<string, any>): Promise<MultiResult> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/model-config', {params: flatParams})
}

/**
 * 新增模型配置
 */
export function saveModelConfig(data: AiModelConfig): Promise<Result<void>> {
    return request.post('/api/model-config', data)
}

/**
 * 删除模型配置
 */
export function deleteModelConfig(id: number): Promise<Result<void>> {
    return request.delete(`/api/model-config/${id}`)
}
