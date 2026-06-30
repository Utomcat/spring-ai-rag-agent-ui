import request from '../utils/request.ts'
import {AskRequest} from "../data/chat/AskRequest.ts";
import {AskResponse} from "../data/chat/AskResponse.ts";
import {SessionResponse} from "../data/chat/SessionResponse.ts";
import {MessagesResponse} from "../data/chat/MessagesResponse.ts";
import {MultiResult} from "../data/result/MultiResult.ts";

/** 问答/流式生成：向量检索 + Ollama 推理可能较慢（本地大模型常超过 2 分钟） */
const CHAT_ASK_TIMEOUT_MS = 600000

/**
 * 提问
 *
 * @param data - 提问请求参数
 * @return Promise 响应数据
 */
export function ask(data: AskRequest): Promise<AskResponse> {
  return request.post('/api/chat/ask', data, { timeout: CHAT_ASK_TIMEOUT_MS })
}

/**
 * 获取会话列表
 *
 * @return Promise 响应数据
 */
export function listSessions(): Promise<MultiResult<SessionResponse>> {
  return request.get('/api/chat/session')
}

/**
 * 获取会话消息列表
 *
 * @param sessionId - 会话 ID
 * @return Promise 响应数据
 */
export function listMessages(sessionId: number): Promise<MultiResult<MessagesResponse>> {
  return request.get(`/api/chat/session/${sessionId}/messages`)
}

/**
 * 删除会话
 *
 * @param sessionId - 会话 ID
 * @return Promise 响应数据
 */
export function deleteSession(sessionId: number): Promise<void> {
  return request.delete(`/api/chat/session/${sessionId}`)
}
