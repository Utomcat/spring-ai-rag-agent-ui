/**
 * 提问响应数据接口
 */
export interface AskResponse {
    // 会话 ID
    sessionId?: number,
    // 问题回答内容
    answer: string,
    // 问题参考来源
    references?: Record<string, any>[]
}