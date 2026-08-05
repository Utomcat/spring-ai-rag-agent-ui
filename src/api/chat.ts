import request from '../utils/request'
import {Result} from "../data/result/Result";
import {AskRequest} from "../data/chat/AskRequest";
import {AskResponse} from "../data/chat/AskResponse";
import {buildPageQuery} from "../data/page/PageParams";
import {MultiResult} from "../data/result/MultiResult";
import {SessionResponse} from "../data/chat/SessionResponse";
import {MessagesResponse} from "../data/chat/MessagesResponse";
import {useUserStore} from "../stores/user";

/** 问答/流式生成：向量检索 + Ollama 推理可能较慢（本地大模型常超过 2 分钟） */
const CHAT_ASK_TIMEOUT_MS = 3600000

/**
 * 流式事件回调接口
 */
export interface StreamCallbacks {
  /** 状态事件（thinking / tool_calling） */
  onStatus?: (type: string, message: string) => void
  /** 逐 Token 事件 */
  onToken?: (content: string) => void
  /** 引用文档事件 */
  onReferences?: (refs: any[]) => void
  /** 流完成事件 */
  onDone?: (sessionId: number) => void
  /** 错误事件 */
  onError?: (message: string) => void
}

/**
 * 提问（同步阻塞式）
 *
 * @param data - 提问请求参数
 * @return Promise 响应数据
 */
export function ask(data: AskRequest): Promise<Result<AskResponse>> {
  return request.post('/api/chat/ask', data, { timeout: CHAT_ASK_TIMEOUT_MS })
}

/**
 * 流式提问（SSE）- 使用 fetch + ReadableStream 消费 Server-Sent Events
 *
 * @param data - 提问请求参数
 * @param callbacks - 流式事件回调
 * @return AbortController 用于取消请求
 */
export function askStream(data: AskRequest, callbacks: StreamCallbacks): AbortController {
  const controller = new AbortController()
  const store = useUserStore()
  const token = store.token
  let hasContent = false

  fetch('/api/chat/ask/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
    signal: controller.signal
  }).then(async (response) => {
    if (!response.ok) {
      // HTTP 错误（如 401/403/500）
      if (response.status === 401 || response.status === 403) {
        store.logout()
        window.location.href = '/login'
      }
      callbacks.onError?.(`请求失败，状态码: ${response.status}`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      callbacks.onError?.('无法获取响应流')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let receivedDone = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 按 SSE 协议解析：事件以 \n\n 分隔
      const parts = buffer.split('\n\n')
      // 最后一个元素可能是未完成的事件，保留在 buffer 中
      buffer = parts.pop() || ''

      for (const part of parts) {
        if (!part.trim()) continue
        let eventName = ''
        let eventData = ''

        for (const line of part.split('\n')) {
          if (line.startsWith('event:')) {
            eventName = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            eventData = line.slice(5).trim()
          }
        }

        if (!eventData) continue

        try {
          const parsed = JSON.parse(eventData)
          switch (eventName) {
            case 'status':
              callbacks.onStatus?.(parsed.type, parsed.message)
              break
            case 'token':
              hasContent = true
              callbacks.onToken?.(parsed.content)
              break
            case 'references':
              callbacks.onReferences?.(parsed.references || [])
              break
            case 'done':
              receivedDone = true
              callbacks.onDone?.(parsed.sessionId)
              break
            case 'error':
              callbacks.onError?.(parsed.message)
              break
            default:
              // 未知事件类型，尝试作为 token 处理
              if (parsed.content) callbacks.onToken?.(parsed.content)
              break
          }
        } catch {
          // JSON 解析失败，忽略
        }
      }
    }

    // 流结束但未收到 done 事件，主动触发 onDone 以避免前端卡在加载状态
    if (!receivedDone) {
      if (!hasContent) {
        callbacks.onError?.('未收到有效响应，请重试')
      }
      callbacks.onDone?.(0)
    }
  }).catch((err) => {
    // 用户主动取消时不报错
    if (err.name === 'AbortError') return
    callbacks.onError?.(err.message || '网络错误，请检查连接')
  })

  return controller
}

/**
 * 获取会话列表
 *
 * @return Promise 响应数据
 */
export function listSessions(params: Record<string, any>): Promise<MultiResult<SessionResponse>> {
  const flatParams = buildPageQuery({
    page: params.page,
    size: params.size,
    condition: params.condition
  })
  return request.get('/api/chat/session', { params: flatParams })
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
