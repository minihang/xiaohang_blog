import { api } from './http'

/**
 * @param {{ username: string; password: string; signature?: string }} body
 */
export async function apiRegister(body) {
  try {
    const { data } = await api.post('/api/auth/register', body)
    return { ok: true, data }
  } catch (e) {
    const err = e?.response?.data ?? {}
    return { ok: false, error: err.error || '注册失败' }
  }
}

/**
 * @param {{ username: string; password: string }} body
 */
export async function apiLogin(body) {
  try {
    const { data } = await api.post('/api/auth/login', body)
    return { ok: true, data }
  } catch (e) {
    const err = e?.response?.data ?? {}
    return { ok: false, error: err.error || '登录失败' }
  }
}
