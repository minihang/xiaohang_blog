import { api } from './http'

/**
 * @returns {Promise<{ user: Record<string, unknown> }>}
 */
export async function fetchProfile() {
  const { data } = await api.get('/api/profile')
  return data
}

/**
 * @param {{ displayName: string; signature: string }} body
 */
export async function updateProfile(body) {
  const { data } = await api.patch('/api/profile', body)
  return data
}

/**
 * @param {File} file
 */
export async function uploadAvatar(file) {
  const fd = new FormData()
  fd.append('avatar', file)
  const { data } = await api.post('/api/profile/avatar', fd)
  return data
}
