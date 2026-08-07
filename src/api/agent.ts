import request from '../utils/request'
import {Result} from "../data/result/Result";
import {buildPageQuery} from "../data/page/PageParams";
import {AgentMemory} from "../data/agent/AgentMemory";

/**
 * 获取执行链路分页列表
 */
export function fetchExecutionPage(params: Record<string, any>): Promise<Result<any>> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/agent/execution', {params: flatParams})
}

/**
 * 按会话查询执行链路
 */
export function fetchExecutionsBySession(sessionId: number): Promise<Result<any[]>> {
    return request.get(`/api/agent/execution/session/${sessionId}`)
}

/**
 * 获取长期记忆分页列表
 */
export function fetchMemoryPage(params: Record<string, any>): Promise<Result<any>> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/agent/memory', {params: flatParams})
}

/**
 * 获取当前用户的长期记忆列表
 */
export function fetchMyMemories(memoryType?: string, limit?: number): Promise<Result<AgentMemory[]>> {
    return request.get('/api/agent/memory/mine', {params: {memoryType, limit}})
}

/**
 * 新增长期记忆
 */
export function saveMemory(data: AgentMemory): Promise<Result<void>> {
    return request.post('/api/agent/memory', data)
}

/**
 * 删除长期记忆
 */
export function deleteMemory(id: number): Promise<Result<void>> {
    return request.delete(`/api/agent/memory/${id}`)
}

/**
 * 搜索长期记忆
 */
export function searchMemories(userId: number, keyword?: string, limit?: number): Promise<Result<AgentMemory[]>> {
    return request.get('/api/agent/memory/search', {params: {userId, keyword, limit}})
}
