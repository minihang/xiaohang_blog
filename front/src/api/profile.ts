import type { BlogUser } from '../types'
import { api } from './http'

/**
 * @returns {Promise<{ user: Record<string, unknown> }>}
 */
export async function fetchProfile(): Promise<{ user: BlogUser }> {
  const { data } = await api.get<{ user: BlogUser }>('/api/profile')
  return data
}

/**
 * @param {{ displayName: string; signature: string }} body
 */
export async function updateProfile(body: { displayName: string; signature: string }): Promise<{ user: BlogUser }> {
  const { data } = await api.patch<{ user: BlogUser }>('/api/profile', body)
  return data
}

/**
 * @param {File} file
 */
export async function uploadAvatar(file: File): Promise<{ user: BlogUser }> {
  const fd = new FormData()
  fd.append('avatar', file)
  const { data } = await api.post<{ user: BlogUser }>('/api/profile/avatar', fd)
  return data
}
