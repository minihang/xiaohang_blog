import { createVNode, reactive, render } from 'vue'
import ToastContainer from '../components/ToastContainer.vue'

function createToastStore() {
  const state = reactive({
    items: [],
  })
  const lastShownAtByKey = new Map()

  function remove(id) {
    const idx = state.items.findIndex((it) => it.id === id)
    if (idx >= 0) state.items.splice(idx, 1)
  }

  function show(message, options = {}) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const type = options.type || 'success'
    const duration = Number.isFinite(options.duration) ? Number(options.duration) : 1800
    const text = String(message || '')
    const throttleMs = Number.isFinite(options.throttleMs) ? Number(options.throttleMs) : 900
    const dedupeKey = `${type}:${text}`
    const now = Date.now()
    const lastAt = lastShownAtByKey.get(dedupeKey) || 0
    if (throttleMs > 0 && now - lastAt < throttleMs) return null

    lastShownAtByKey.set(dedupeKey, now)
    state.items.push({ id, message: text, type })
    if (duration > 0) {
      window.setTimeout(() => remove(id), duration)
    }
    return id
  }

  return {
    state,
    show,
    remove,
    success(message, options = {}) {
      return show(message, { ...options, type: 'success' })
    },
    error(message, options = {}) {
      return show(message, { ...options, type: 'error' })
    },
    info(message, options = {}) {
      return show(message, { ...options, type: 'info' })
    },
  }
}

const toastStore = createToastStore()

export function createToastPlugin() {
  return {
    install() {
      if (document.getElementById('global-toast-root')) return
      const mountEl = document.createElement('div')
      mountEl.id = 'global-toast-root'
      document.body.appendChild(mountEl)
      const vnode = createVNode(ToastContainer, { toast: toastStore })
      render(vnode, mountEl)
    },
  }
}

export function useToast() {
  return toastStore
}
