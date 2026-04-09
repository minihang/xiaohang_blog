import axios from 'axios'

const AUTH_STORAGE_KEY = 'blog_auth_v1'

export function getStoredToken() {
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
