import { api } from './http'

/**
 * @param {string | undefined | null} cat 侧栏分类，all 或未传表示全部
 * @param {{ page?: number; pageSize?: number }} [opts]
 * @returns {Promise<{ list: unknown[]; total: number; page: number; pageSize: number; totalPages: number }>}
 */
export async function fetchArticleList(cat, opts = {}) {
  const raw = Array.isArray(cat) ? cat[0] : cat
  const normalized = !raw || raw === 'all' ? '' : String(raw)
  const page = Number(opts.page) >= 1 ? Math.floor(Number(opts.page)) : 1
  const pageSize = Number(opts.pageSize) >= 1 ? Math.floor(Number(opts.pageSize)) : 6
  const params = {
    page,
    pageSize,
    ...(normalized ? { category: normalized } : {}),
  }
  try {
    const { data } = await api.get('/api/articles', { params })
    return data
  } catch {
    throw new Error('加载文章列表失败')
  }
}

/**
 * @param {string | number} id
 */
export async function fetchArticleById(id) {
  try {
    const { data } = await api.get(`/api/articles/${encodeURIComponent(String(id))}`)
    return data
  } catch (e) {
    if (e?.response?.status === 404) return null
    if (e?.response?.status === 403) {
      const d = e.response?.data || {}
      const v = d.visibility
      return {
        forbidden: true,
        visibility: v === 'login' || v === 'admin' ? v : 'login',
      }
    }
    throw new Error(e?.response?.data?.error || e?.message || '加载文章失败')
  }
}

/**
 * @param {Record<string, unknown>} payload
 */
export async function createArticle(payload) {
  const { data } = await api.post('/api/articles', payload)
  return data
}

/**
 * @param {string | number} id
 * @param {Record<string, unknown>} payload
 */
export async function updateArticle(id, payload) {
  const { data } = await api.put(`/api/articles/${encodeURIComponent(String(id))}`, payload)
  return data
}

/**
 * @param {string | number} id
 */
export async function deleteArticle(id) {
  const { data } = await api.delete(`/api/articles/${encodeURIComponent(String(id))}`)
  return data
}

/**
 * @param {string | number} id
 * @returns {Promise<{ likeCount: number }>}
 */
export async function likeArticle(id) {
  const { data } = await api.post(`/api/articles/${encodeURIComponent(String(id))}/like`)
  return data
}

/**
 * @param {string | number} id
 * @param {boolean | undefined} isPinned 传入可显式设置；不传则切换
 * @returns {Promise<{ id: number; isPinned: boolean }>}
 */
export async function toggleArticlePin(id, isPinned) {
  const payload = typeof isPinned === 'boolean' ? { isPinned } : {}
  const { data } = await api.post(`/api/articles/${encodeURIComponent(String(id))}/pin`, payload)
  return data
}
