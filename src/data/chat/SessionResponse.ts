/**
 * 会话响应数据接口
 */
export interface SessionResponse {
    // 会话 ID
    id: number,
    // 问题回答内容
    userId: number,
    // 会话标题
    title: string,
    // 会话创建时间
    createTime: string,
    // 会话更新时间
    updateTime: string,
}