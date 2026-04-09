import { api } from './http'

/**
 * @param {{ cursor?: number; limit?: number }} params
 */
export async function fetchMessageList({ cursor = 0, limit } = {}) {
  const params = { cursor }
  if (limit != null) params.limit = limit
  try {
    const { data } = await api.get('/api/messages', { params })
    return data
  } catch {
    throw new Error('加载留言失败')
  }
}

/**
 * @param {{ authorName: string; content: string; replyToId?: string | number | null }} body
 */
export async function postMessage(body) {
  try {
    const { data } = await api.post('/api/messages', body)
    return data
  } catch (e) {
    const err = e?.response?.data ?? {}
    throw new Error(err.error || '发送失败')
  }
}

/**
 * @param {string | number} id
 */
export async function deleteMessage(id) {
  try {
    const { data } = await api.delete(`/api/messages/${encodeURIComponent(String(id))}`)
    return data
  } catch (e) {
    const err = e?.response?.data ?? {}
    throw new Error(err.error || '删除失败')
  }
}
