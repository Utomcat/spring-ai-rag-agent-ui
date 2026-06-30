/**
 * 会话消息响应数据接口
 */
export interface MessagesResponse {
    // 会话消息 ID
    id: number,
    // 会话 ID
    sessionId: number,
    // 消息角色
    role: string,
    // 消息内容
    content: string,
    // 参考来源
    refs: string,
    // 创建时间
    createTime: string,
}