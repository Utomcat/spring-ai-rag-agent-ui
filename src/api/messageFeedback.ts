import request from '../utils/request.ts'
import {buildPageQuery} from "../data/page/PageParams.ts";
import {Result} from "../data/result/Result.ts";
import {MultiResult} from "../data/result/MultiResult.ts";

/**
 * 消息反馈数据结构
 */
export interface MessageFeedback {
  id: number;
  messageId: number;
  sessionId: number;
  userId: number;
  rating: number; // 1-差评 2-一般 3-好评
  tags: string;
  comment: string;
  createTime: string;
  updateTime: string;
}

/**
 * 获取消息反馈分页列表（管理员）
 *
 * @param params - 查询参数对象
 * @return Promise 对象，包含反馈分页列表数据
 */
export function fetchFeedbackPage(params: Record<string, any>): Promise<MultiResult> {
  const flatParams = buildPageQuery({
    page: params.page,
    size: params.size,
    condition: params.condition
  })
  return request.get('/api/message-feedback/list', { params: flatParams })
}

/**
 * 提交消息反馈（点赞/点踩）
 *
 * @param data - 反馈数据
 * @return Promise 对象
 */
export function submitFeedback(data: {
  messageId: number;
  rating: number;
  tags?: string;
  comment?: string;
}): Promise<Result<void>> {
  return request.post('/api/message-feedback', data)
}

/**
 * 获取当前用户对指定消息的反馈
 *
 * @param messageId - 消息ID
 * @return Promise 对象，包含反馈数据（无反馈时 data 为 null）
 */
export function fetchMyFeedback(messageId: number): Promise<Result<MessageFeedback | null>> {
  return request.get(`/api/message-feedback/message/${messageId}`)
}

/**
 * 取消当前用户对指定消息的反馈
 *
 * @param messageId - 消息ID
 * @return Promise 对象
 */
export function cancelFeedback(messageId: number): Promise<Result<void>> {
  return request.delete(`/api/message-feedback/message/${messageId}`)
}
