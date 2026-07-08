import axios from 'axios'

const AUTH_STORAGE_KEY = 'blog_auth_v1'
export const AUTH_EXPIRED_EVENT = 'blog-auth-expired'

interface ApiErrorBody {
  error?: string
  message?: string
  visibility?: unknown
}

export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return typeof data?.token === 'string' ? data.token : null
  } catch {
    return null
  }
}

/** 线上构建时设置 VITE_API_BASE_URL（如 https://api.example.com）；留空则与当前站点同源 /api */
const baseURL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

/** 统一带 Bearer 的 axios 实例；开发环境走 Vite 代理，生产环境走 VITE_API_BASE_URL */
export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = getApiErrorStatus(error)
    const requestUrl = axios.isAxiosError(error) ? String(error.config?.url || '') : ''
    const isAuthRequest = requestUrl.includes('/api/auth/login') || requestUrl.includes('/api/auth/register')
    if (status === 401 && getStoredToken() && !isAuthRequest) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  },
)

export function getApiErrorData(error: unknown): ApiErrorBody {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data ?? {}
  }
  return {}
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = getApiErrorData(error)
  if (typeof data.error === 'string' && data.error) return data.error
  if (typeof data.message === 'string' && data.message) return data.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}
