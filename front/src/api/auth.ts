import type { ApiResult, AuthPayload } from '../types'
import { api, getApiErrorMessage } from './http'

/**
 * @param {{ username: string; password: string; signature?: string }} body
 */
interface RegisterBody {
  username: string
  password: string
  signature?: string
}

interface LoginBody {
  username: string
  password: string
}

export async function apiRegister(body: RegisterBody): Promise<ApiResult<AuthPayload>> {
  try {
    const { data } = await api.post<AuthPayload>('/api/auth/register', body)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: getApiErrorMessage(e, '注册失败') }
  }
}

/**
 * @param {{ username: string; password: string }} body
 */
export async function apiLogin(body: LoginBody): Promise<ApiResult<AuthPayload>> {
  try {
    const { data } = await api.post<AuthPayload>('/api/auth/login', body)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: getApiErrorMessage(e, '登录失败') }
  }
}
