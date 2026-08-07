import request from '../utils/request'
import {Result} from "../data/result/Result";
import {buildPageQuery} from "../data/page/PageParams";
import {EvalDataset} from "../data/eval/EvalDataset";
import {EvalTask} from "../data/eval/EvalTask";

/**
 * 获取评估数据集分页列表
 */
export function fetchDatasetPage(params: Record<string, any>): Promise<Result<any>> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/eval/dataset', {params: flatParams})
}

/**
 * 新增评估数据集条目
 */
export function saveDataset(data: EvalDataset): Promise<Result<void>> {
    return request.post('/api/eval/dataset', data)
}

/**
 * 删除评估数据集条目
 */
export function deleteDataset(id: number): Promise<Result<void>> {
    return request.delete(`/api/eval/dataset/${id}`)
}

/**
 * 获取评估任务分页列表
 */
export function fetchTaskPage(params: Record<string, any>): Promise<Result<any>> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/eval/task', {params: flatParams})
}

/**
 * 创建评估任务
 */
export function createTask(data: EvalTask): Promise<Result<EvalTask>> {
    return request.post('/api/eval/task', data)
}

/**
 * 获取评估任务详情
 */
export function fetchTask(id: number): Promise<Result<EvalTask>> {
    return request.get(`/api/eval/task/${id}`)
}

/**
 * 删除评估任务
 */
export function deleteTask(id: number): Promise<Result<void>> {
    return request.delete(`/api/eval/task/${id}`)
}

/**
 * 获取评估结果分页列表
 */
export function fetchResultPage(params: Record<string, any>): Promise<Result<any>> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/eval/result', {params: flatParams})
}

/**
 * 获取评估任务汇总指标
 */
export function fetchMetrics(taskId: number): Promise<Result<Record<string, any>>> {
    return request.get(`/api/eval/result/metrics/${taskId}`)
}
