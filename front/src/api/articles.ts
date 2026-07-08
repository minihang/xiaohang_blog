import type {
  Article,
  ArticleDetailResponse,
  ArticleListResponse,
  ArticleVisibility,
  Id,
} from '../types'
import { api, getApiErrorData, getApiErrorMessage, getApiErrorStatus } from './http'

/**
 * @param {string | undefined | null} cat 侧栏分类，all 或未传表示全部
 * @param {{ page?: number; pageSize?: number }} [opts]
 * @returns {Promise<{ list: unknown[]; total: number; page: number; pageSize: number; totalPages: number }>}
 */
export async function fetchArticleList(
  cat: string | string[] | null | undefined,
  opts: { page?: number; pageSize?: number } = {},
): Promise<ArticleListResponse> {
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
    const { data } = await api.get<ArticleListResponse>('/api/articles', { params })
    return data
  } catch {
    throw new Error('加载文章列表失败')
  }
}

/**
 * @param {string | number} id
 */
export async function fetchArticleById(id: Id): Promise<ArticleDetailResponse> {
  try {
    const { data } = await api.get<Article>(`/api/articles/${encodeURIComponent(String(id))}`)
    return data
  } catch (e) {
    if (getApiErrorStatus(e) === 404) return null
    if (getApiErrorStatus(e) === 403) {
      const d = getApiErrorData(e)
      const v = d.visibility
      return {
        forbidden: true,
        visibility: (v === 'login' || v === 'admin' ? v : 'login') satisfies Exclude<
          ArticleVisibility,
          'public'
        >,
      }
    }
    throw new Error(getApiErrorMessage(e, '加载文章失败'))
  }
}

/**
 * @param {Record<string, unknown>} payload
 */
export async function createArticle(payload: Record<string, unknown>): Promise<Article> {
  const { data } = await api.post<Article>('/api/articles', payload)
  return data
}

/**
 * @param {string | number} id
 * @param {Record<string, unknown>} payload
 */
export async function updateArticle(id: Id, payload: Record<string, unknown>): Promise<Article> {
  const { data } = await api.put<Article>(`/api/articles/${encodeURIComponent(String(id))}`, payload)
  return data
}

/**
 * @param {string | number} id
 */
export async function deleteArticle(id: Id): Promise<unknown> {
  const { data } = await api.delete(`/api/articles/${encodeURIComponent(String(id))}`)
  return data
}

/**
 * @param {string | number} id
 * @returns {Promise<{ likeCount: number }>}
 */
export async function likeArticle(id: Id): Promise<{ likeCount: number }> {
  const { data } = await api.post<{ likeCount: number }>(`/api/articles/${encodeURIComponent(String(id))}/like`)
  return data
}

/**
 * @param {string | number} id
 * @param {boolean | undefined} isPinned 传入可显式设置；不传则切换
 * @returns {Promise<{ id: number; isPinned: boolean }>}
 */
export async function toggleArticlePin(id: Id, isPinned?: boolean): Promise<{ id: number; isPinned: boolean }> {
  const payload = typeof isPinned === 'boolean' ? { isPinned } : {}
  const { data } = await api.post<{ id: number; isPinned: boolean }>(
    `/api/articles/${encodeURIComponent(String(id))}/pin`,
    payload,
  )
  return data
}
