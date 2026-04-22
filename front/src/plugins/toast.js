import { createVNode, reactive, render } from 'vue'
import ToastContainer from '../components/ToastContainer.vue'

/**
 * 创建 Toast 的状态与操作方法。
 *
 * 说明：
 * - 该函数只负责“数据层”，不关心 UI 如何渲染。
 * - 返回的对象会被作为全局单例使用（见文件下方 toastStore）。
 */
function createToastStore() {
  // 响应式状态：ToastContainer 会订阅它并自动更新视图。
  const state = reactive({
    // 当前正在展示的 toast 队列。
    // 每项结构：{ id, message, type }
    items: [],
  })
  // 用于节流去重：记录“同类型同文案”上一次显示时间。
  // key 形如：success:内容已缓存
  const lastShownAtByKey = new Map()

  /**
   * 按 id 移除某条 toast（供自动关闭或手动关闭调用）。
   * @param {string} id
   */
  function remove(id) {
    const idx = state.items.findIndex((it) => it.id === id)
    if (idx >= 0) state.items.splice(idx, 1)
  }

  /**
   * 显示一条 toast（底层通用方法）。
   *
   * @param {string} message 提示文案
   * @param {{
   *   type?: 'success' | 'error' | 'info',
   *   duration?: number,     // 显示时长，毫秒；<=0 表示不自动消失
   *   throttleMs?: number,   // 节流窗口，毫秒；同 type+message 在窗口内不重复弹
   * }} [options]
   * @returns {string|null} 成功显示返回 id；命中节流则返回 null
   */
  function show(message, options = {}) {
    // 生成每条 toast 的唯一 id（用于渲染 key 与后续删除）。
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    // 类型默认 success。
    const type = options.type || 'success'
    // 默认展示 1.8 秒。
    const duration = Number.isFinite(options.duration) ? Number(options.duration) : 1800
    // 文案统一转字符串，避免传入非字符串导致渲染异常。
    const text = String(message || '')
    // 默认节流 900ms，避免短时间连点造成重复刷屏。
    const throttleMs = Number.isFinite(options.throttleMs) ? Number(options.throttleMs) : 900
    // “同类型 + 同文案”视为同一条消息。
    const dedupeKey = `${type}:${text}`
    const now = Date.now()
    const lastAt = lastShownAtByKey.get(dedupeKey) || 0
    // 命中节流窗口：本次不展示。
    if (throttleMs > 0 && now - lastAt < throttleMs) return null

    // 记录本次展示时间。
    lastShownAtByKey.set(dedupeKey, now)
    // 追加到展示队列，由容器组件负责渲染。
    state.items.push({ id, message: text, type })
    // 自动关闭：到时从队列中移除。
    if (duration > 0) {
      window.setTimeout(() => remove(id), duration)
    }
    return id
  }

  return {
    state,
    show,
    remove,
    // 语义化快捷方法：success / error / info
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

// 全局单例：整个前端应用生命周期里只创建一次 store。
const toastStore = createToastStore()

/**
 * Toast 插件：
 * - 在安装时把 ToastContainer 挂到 body 下的独立节点；
 * - 并把单例 toastStore 作为 props 传给容器组件。
 */
export function createToastPlugin() {
  return {
    install() {
      // 防止重复安装导致重复挂载（例如某些热更新场景）。
      if (document.getElementById('global-toast-root')) return
      const mountEl = document.createElement('div')
      mountEl.id = 'global-toast-root'
      document.body.appendChild(mountEl)
      // 通过独立挂载点渲染全局 toast 容器。
      const vnode = createVNode(ToastContainer, { toast: toastStore })
      render(vnode, mountEl)
    },
  }
}

/**
 * 业务侧统一入口：
 * const toast = useToast()
 * toast.success('内容已缓存')
 */
export function useToast() {
  return toastStore
}
