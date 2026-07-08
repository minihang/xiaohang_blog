import type { Id, Message, MessageListResponse } from '../types'
import { api, getApiErrorMessage } from './http'

/**
 * @param {{ cursor?: number; limit?: number }} params
 */
export async function fetchMessageList({
  cursor = 0,
  limit,
}: { cursor?: number; limit?: number } = {}): Promise<MessageListResponse> {
  const params: { cursor: number; limit?: number } = { cursor }
  if (limit != null) params.limit = limit
  try {
    const { data } = await api.get<MessageListResponse>('/api/messages', { params })
    return data
  } catch {
    throw new Error('加载留言失败')
  }
}

/**
 * @param {{ authorName: string; content: string; replyToId?: string | number | null }} body
 */
export async function postMessage(body: {
  authorName: string
  content: string
  replyToId?: Id | null
}): Promise<Message> {
  try {
    const { data } = await api.post<Message>('/api/messages', body)
    return data
  } catch (e) {
    throw new Error(getApiErrorMessage(e, '发送失败'))
  }
}

/**
 * @param {string | number} id
 */
export async function deleteMessage(id: Id): Promise<unknown> {
  try {
    const { data } = await api.delete(`/api/messages/${encodeURIComponent(String(id))}`)
    return data
  } catch (e) {
    throw new Error(getApiErrorMessage(e, '删除失败'))
  }
}
