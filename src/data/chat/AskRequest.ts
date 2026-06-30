/**
 * 提问请求参数接口
 */
export interface AskRequest {
    // 问题内容字符串
    question: string,
    // 会话ID
    sessionId?: number | null,
    // 知识库分类ID列表
    categoryIds?: number[] | null
}