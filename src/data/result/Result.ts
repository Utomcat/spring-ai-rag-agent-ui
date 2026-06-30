import {MultiResult} from "./MultiResult.ts";

/**
 * 通用响应结果接口(非分页)
 *
 * @template T 数据类型
 */
export interface Result<T = any> {
    code: number
    success: boolean
    msg: string
    data: T
}

/**
 * 判断响应结果是否成功
 * @param result 响应结果对象
 * @returns 是否成功
 */
export function isSuccess(result: Result): boolean {
    return (result.code === 200 || Number(result.code) === 200 ) && result.success
}

/**
 * 判断是否为分页结果
 * @param result 响应结果对象
 * @returns 是否为分页结果
 */
export function isPageResult(result: any): result is MultiResult {
    return (
        'total' in result &&
        'page' in result &&
        'size' in result &&
        Array.isArray(result.data)
    )
}