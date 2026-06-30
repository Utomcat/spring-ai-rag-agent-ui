import {Result} from "./Result.ts";

/**
 * 分页列表响应结果接口
 * @template T 列表项数据类型
 */
export interface MultiResult<T = any> extends Result<T[]> {
    total: number
    page: number
    size: number
}