import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiLogin, apiRegister } from '../api/auth'

/** @typedef {'guest' | 'user' | 'admin'} UserRole */

const AUTH_STORAGE_KEY = 'blog_auth_v1'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  /** @type {import('vue').Ref<null | { id?: string | number; name?: string; role?: UserRole; [key: string]: unknown }>} */
  const user = ref(null)
  /** @type {import('vue').Ref<string[]>} */
  const permissions = ref([])

  const isLoggedIn = computed(() => Boolean(token.value && user.value))

  const isGuest = computed(() => !isLoggedIn.value)

  const isUser = computed(() => isLoggedIn.value && user.value?.role === 'user')

  const isAdmin = computed(() => isLoggedIn.value && user.value?.role === 'admin')

  const canWriteMessage = computed(() => isLoggedIn.value && (isUser.value || isAdmin.value))

  const canDeleteMessage = computed(() => isAdmin.value)

  const canManageArticles = computed(() => isAdmin.value)

  function hasPermission(perm) {
    if (!perm) return true
    return permissions.value.includes(perm)
  }

  function hasAnyPermission(perms) {
    if (!perms?.length) return true
    return perms.some((p) => permissions.value.includes(p))
  }

  function hasAllPermissions(perms) {
    if (!perms?.length) return true
    return perms.every((p) => permissions.value.includes(p))
  }

  function persistSession() {
    try {
      if (!token.value || !user.value) {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        return
      }
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          token: token.value,
          user: user.value,
          permissions: permissions.value,
        }),
      )
    } catch {
      /* ignore */
    }
  }

  function hydrateSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data?.token && data?.user) {
        token.value = data.token
        user.value = { ...data.user }
        permissions.value = Array.isArray(data.permissions) ? [...data.permissions] : []
      }
    } catch {
      /* ignore */
    }
  }

  function login(payload) {
    token.value = payload.token
    user.value = payload.user ? { ...payload.user } : null
    permissions.value = Array.isArray(payload.permissions) ? [...payload.permissions] : []
    persistSession()
  }

  function logout() {
    token.value = null
    user.value = null
    permissions.value = []
    persistSession()
  }

  function setPermissions(next) {
    permissions.value = Array.isArray(next) ? [...next] : []
  }

  /** 合并服务端返回的用户字段（头像、显示名、签名等） */
  function applyUser(next) {
    if (!next || typeof next !== 'object') return
    user.value = { ...(user.value || {}), ...next }
    persistSession()
  }

  /**
   * @param {{ username: string; password: string }} creds
   * @returns {Promise<{ ok: true } | { ok: false; error: string }>}
   */
  async function loginWithCredentials(creds) {
    const r = await apiLogin({
      username: String(creds.username || '').trim(),
      password: String(creds.password || ''),
    })
    if (!r.ok) return { ok: false, error: r.error }
    login({
      token: r.data.token,
      user: r.data.user,
      permissions: r.data.permissions,
    })
    return { ok: true }
  }

  /**
   * @param {{ username: string; password: string; signature?: string }} input
   * @returns {Promise<{ ok: true } | { ok: false; error: string }>}
   */
  async function registerAndLogin(input) {
    const r = await apiRegister({
      username: String(input.username || '').trim(),
      password: String(input.password || ''),
      signature: String(input.signature || '').trim(),
    })
    if (!r.ok) return { ok: false, error: r.error }
    login({
      token: r.data.token,
      user: r.data.user,
      permissions: r.data.permissions,
    })
    return { ok: true }
  }

  hydrateSession()

  return {
    token,
    user,
    permissions,
    isLoggedIn,
    isGuest,
    isUser,
    isAdmin,
    canWriteMessage,
    canDeleteMessage,
    canManageArticles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    login,
    logout,
    setPermissions,
    applyUser,
    loginWithCredentials,
    registerAndLogin,
  }
})
