<template>
  <div class="message-page">
    <section class="message-header">
      <RouterLink class="message-header__back" :to="{ name: 'home' }">
        <span class="material-symbols-outlined message-header__back-icon">arrow_back</span>
        返回首页
      </RouterLink>
      <div class="message-header__text">
        <h1 class="message-header__title">留言板</h1>
        <p class="message-header__subtitle">
          这里是一个自由呼吸的角落。留下你的足迹，分享你的故事，或者仅仅是一句简单的问候。
        </p>
      </div>
    </section>

    <div class="message-grid">
      <div ref="messageFormCardEl" class="message-form-card">
        <div class="message-form-card__title-row">
          <span class="material-symbols-outlined message-form-card__icon">edit_note</span>
          <h2 class="message-form-card__title">撰写新留言</h2>
        </div>

        <div v-if="replyingTo" class="message-reply-hint" role="status">
          <span class="material-symbols-outlined message-reply-hint__icon">reply</span>
          <span class="message-reply-hint__text">
            正在回复 <strong>{{ replyingTo.authorName }}</strong>
          </span>
          <button type="button" class="message-reply-hint__cancel" @click="clearReplyTarget">
            取消
          </button>
        </div>

        <form class="message-form" @submit.prevent="onSubmit">
          <fieldset class="message-form__fieldset">
            <p v-if="submitError" class="message-form__error">{{ submitError }}</p>
            <div>
              <label class="message-form__label">你的昵称</label>
              <input v-model="nickname" class="message-form__control" placeholder="怎么称呼你？" type="text" maxlength="32" />
            </div>
            <div>
              <label class="message-form__label">留言内容</label>
              <textarea ref="contentTextareaEl" v-model="content"
                class="message-form__control message-form__control--textarea" placeholder="此刻在想什么..." rows="5"
                maxlength="2000"></textarea>
            </div>
            <button class="message-form__submit" type="submit">
              <span class="material-symbols-outlined">send</span>
              发送留言
            </button>
          </fieldset>
          <p class="message-form__hint">请友善发言，维护社区环境</p>
        </form>
      </div>

      <div class="message-wall">
        <div class="message-wall__header">
          <h3 class="message-wall__title">
            <span class="material-symbols-outlined message-wall__title-icon">forum</span>
            最新动态 ({{ totalCount }})
          </h3>
          <div class="message-wall__filters">
            <span class="message-wall__pill">全部留言</span>
          </div>
        </div>

        <p v-if="listLoading && messages.length === 0" class="message-loading-tip">留言加载中…</p>
        <p v-else-if="!listLoading && messages.length === 0" class="message-empty-tip">暂时还没有留言，来当第一个吧。</p>

        <div v-for="msg in messages" :key="msg.id" class="message-card group">
          <div class="message-card__row">
            <div class="message-card__avatar">
              <img :alt="msg.authorName + ' 的头像'" class="message-card__avatar-img"
                :src="resolveAssetUrl(msg.avatarUrl)" />
            </div>
            <div class="message-card__content">
              <div class="message-card__meta">
                <span class="message-card__name">{{ msg.authorName }}</span>
                <span class="message-card__time">{{ msg.timeLabel }}</span>
              </div>
              <p v-if="msg.replyToAuthorName" class="message-card__reply-ref">
                回复 {{ msg.replyToAuthorName }}
              </p>
              <p class="message-card__text">
                {{ msg.content }}
              </p>
              <div class="message-card__actions">
                <button v-if="canDeleteMessage" class="message-card__action message-card__action--danger" type="button"
                  :aria-label="`删除 ${msg.authorName} 的留言`" @click="removeMessage(msg)">
                  <span class="material-symbols-outlined message-card__action-icon">delete</span>
                  删除
                </button>
                <button class="message-card__action message-card__action--secondary" type="button"
                  @click="beginReply(msg)">
                  <span class="material-symbols-outlined message-card__action-icon">reply</span>
                  回复
                </button>
              </div>
            </div>
          </div>
        </div>

        <button v-if="hasMore" class="message-more" type="button" :disabled="listLoading" @click="loadMore">
          <span class="message-more__text">{{ listLoading ? '加载中…' : '展开更多留言' }}</span>
          <span class="material-symbols-outlined message-more__icon"
            :class="{ 'message-more__icon--spin': listLoading }">
            keyboard_double_arrow_down
          </span>
        </button>
        <p v-else-if="messages.length > 0" class="message-end-tip">已显示全部留言</p>
      </div>
    </div>

    <CaptchaVerifyModal v-model="showCaptchaModal" description="请计算下方算式，验证通过后将立即发送你的留言。" confirm-text="确认发送"
      confirm-icon="send" @verified="confirmCaptchaAndSend" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { deleteMessage, fetchMessageList, postMessage } from '../api/messages'
import { resolveAssetUrl } from '../utils/assetUrl'
import CaptchaVerifyModal from '../components/CaptchaVerifyModal.vue'

const auth = useAuthStore()
const { canDeleteMessage, isLoggedIn, user } = storeToRefs(auth)

const nickname = ref('')
const content = ref('')
const submitError = ref('')
const showCaptchaModal = ref(false)

watch(
  [isLoggedIn, user],
  () => {
    if (isLoggedIn.value && user.value?.name) {
      if (!nickname.value.trim()) {
        nickname.value = String(user.value.name)
      }
    } else if (!isLoggedIn.value) {
      nickname.value = ''
    }
  },
  { immediate: true },
)

/** @type {import('vue').Ref<{ id: string; authorName: string } | null>} */
const replyingTo = ref(null)
const messageFormCardEl = ref(null)
const contentTextareaEl = ref(null)

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 去掉首行「回复 @某人：」后是否还有正文 */
function getEffectiveMessageBody(text) {
  return text.replace(/^回复 @[^:]+:\n/, '').trim()
}

function beginReply(msg) {
  const authorName = msg.authorName
  const prefix = `回复 @${authorName}：\n`
  let next = content.value

  if (replyingTo.value) {
    const oldRe = new RegExp(`^回复 @${escapeRegExp(replyingTo.value.authorName)}：\\n`)
    if (oldRe.test(next)) {
      next = next.replace(oldRe, prefix)
    } else {
      next = `${next.trimEnd()}\n\n${prefix}`
    }
  } else if (/^回复 @[^:]+:\n/.test(next)) {
    next = next.replace(/^回复 @[^:]+:\n/, prefix)
  } else if (next.trim()) {
    next = `${next.trim()}\n\n${prefix}`
  } else {
    next = prefix
  }

  replyingTo.value = { id: msg.id, authorName }
  content.value = next
  submitError.value = ''

  nextTick(() => {
    messageFormCardEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const el = contentTextareaEl.value
    el?.focus()
    requestAnimationFrame(() => {
      if (el) el.setSelectionRange(el.value.length, el.value.length)
    })
  })
}

function clearReplyTarget() {
  if (!replyingTo.value) return
  const re = new RegExp(`^回复 @${escapeRegExp(replyingTo.value.authorName)}：\\n`)
  content.value = content.value.replace(re, '').replace(/^\n+/, '')
  replyingTo.value = null
}

/**
 * 仅管理员可删（按钮已 v-if，此处再校验防误触）
 * @param {{ id: string; authorName: string }} msg
 */
async function removeMessage(msg) {
  if (!canDeleteMessage.value) return
  const ok = window.confirm(
    `确定删除「${msg.authorName}」的这条留言吗？此操作不可撤销。`,
  )
  if (!ok) return
  const id = msg.id
  try {
    await deleteMessage(id)
    messages.value = messages.value.filter((m) => m.id !== id)
    totalCount.value = Math.max(0, totalCount.value - 1)
    if (replyingTo.value?.id === id) clearReplyTarget()
  } catch (e) {
    window.alert(String(e?.message || '删除失败'))
  }
}

function openCaptchaModal() {
  showCaptchaModal.value = true
}

const messages = ref([])
const nextCursor = ref(0)
const totalCount = ref(0)
const listLoading = ref(false)

const hasMore = computed(() => messages.value.length < totalCount.value)

async function loadInitial() {
  listLoading.value = true
  try {
    const res = await fetchMessageList({ cursor: 0 })
    messages.value = res.list
    nextCursor.value = res.nextCursor
    totalCount.value = res.total
  } catch (e) {
    messages.value = []
    totalCount.value = 0
    window.alert(String(e?.message || '留言加载失败，请确认已启动后端 serve'))
  } finally {
    listLoading.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || listLoading.value) return
  listLoading.value = true
  try {
    const res = await fetchMessageList({ cursor: nextCursor.value })
    messages.value = [...messages.value, ...res.list]
    nextCursor.value = res.nextCursor
    totalCount.value = res.total
  } finally {
    listLoading.value = false
  }
}

onMounted(() => {
  loadInitial()
})

function onSubmit() {
  submitError.value = ''
  const name = nickname.value.trim()
  const text = content.value.trim()
  if (!name) {
    submitError.value = '请填写昵称。'
    return
  }
  if (!getEffectiveMessageBody(content.value)) {
    submitError.value = '请填写留言内容。'
    return
  }
  openCaptchaModal()
}

async function confirmCaptchaAndSend() {
  const name = nickname.value.trim()
  const raw = content.value.trim()
  const target = replyingTo.value
  const body = getEffectiveMessageBody(raw)
  try {
    const created = await postMessage({
      authorName: name,
      content: body,
      replyToId: target?.id != null ? Number(target.id) || target.id : undefined,
    })
    messages.value = [created, ...messages.value]
    totalCount.value += 1
  } catch (e) {
    submitError.value = String(e?.message || '发送失败')
    return
  }

  nickname.value = ''
  content.value = ''
  replyingTo.value = null

  if (isLoggedIn.value && user.value?.name) {
    nickname.value = String(user.value.name)
  }
}
</script>

<style scoped lang="postcss">
.message-page {
  @apply mx-auto w-[90%] sm:w-[85%] md:w-4/5 lg:w-[76%] max-w-5xl;
}

.message-header {
  @apply mb-12 mt-8 flex flex-row items-start gap-4 md:gap-8;
}

.message-header__back {
  @apply inline-flex shrink-0 items-center gap-1.5 rounded-full py-2 pl-1 pr-3 text-sm font-semibold text-sky-600 no-underline transition-colors hover:bg-sky-50/80 hover:text-sky-800 dark:text-sky-400 dark:hover:bg-slate-800/60 dark:hover:text-sky-200;
}

.message-header__back-icon {
  @apply text-xl;
}

.message-header__text {
  @apply min-w-0 flex-1 text-right;
}

.message-header__title {
  @apply mb-4 text-5xl font-extrabold tracking-tight text-primary;
}

.message-header__subtitle {
  @apply ml-auto max-w-2xl text-lg leading-relaxed text-on-surface-variant;
}

.message-grid {
  @apply flex flex-col gap-8 w-full;
}

.message-form-card {
  @apply w-full bg-surface-container-low rounded-xl p-8 shadow-sm;
}

.message-form-card__title-row {
  @apply flex items-center gap-3 mb-6;
}

.message-form-card__icon {
  @apply text-tertiary text-3xl;
}

.message-form-card__title {
  @apply text-2xl font-bold text-on-surface;
}

.message-reply-hint {
  @apply flex flex-wrap items-center gap-2 mb-6 px-4 py-3 rounded-2xl bg-sky-100/80 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 text-sm text-sky-900 dark:text-sky-100;
}

.message-reply-hint__icon {
  @apply text-lg text-sky-600 dark:text-sky-400 shrink-0;
}

.message-reply-hint__text {
  @apply flex-1 min-w-0;
}

.message-reply-hint__cancel {
  @apply ml-auto text-xs font-bold text-sky-700 dark:text-sky-300 hover:underline border-0 bg-transparent cursor-pointer py-1 px-2 rounded-lg hover:bg-sky-200/50 dark:hover:bg-sky-900/50;
}

.message-form__intro {
  @apply text-sm text-on-surface-variant bg-surface-container-high/80 rounded-xl px-4 py-3 mb-6 leading-relaxed;
}

.message-form__fieldset {
  @apply border-0 p-0 m-0 space-y-6;
}

.message-form__error {
  @apply text-sm text-error bg-error-container/15 rounded-xl px-4 py-3;
}

.message-form {
  @apply space-y-6;
}

.message-form__label {
  @apply block text-sm font-semibold text-on-surface-variant mb-2 px-1;
}

.message-form__control {
  @apply w-full bg-surface-container-high border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary-container text-on-surface placeholder-outline-variant transition-all duration-300;
}

.message-form__control--textarea {
  @apply resize-none;
}

.message-form__submit {
  @apply w-full bg-gradient-to-r from-primary to-primary-container text-white font-bold py-4 rounded-full shadow-lg shadow-sky-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2;
}

.message-form__submit--disabled {
  @apply opacity-50 pointer-events-none hover:scale-100 active:scale-100;
}

.message-form__hint {
  @apply text-center text-xs text-outline-variant;
}

.message-wall {
  @apply w-full space-y-6;
}

.message-wall__header {
  @apply flex justify-between items-center mb-4;
}

.message-wall__title {
  @apply text-xl font-bold text-on-surface-variant flex items-center gap-2;
}

.message-wall__title-icon {
  @apply text-secondary;
}

.message-wall__filters {
  @apply flex gap-2;
}

.message-wall__pill {
  @apply bg-tertiary-container/20 text-tertiary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider;
}

.message-loading-tip,
.message-empty-tip {
  @apply text-center text-on-surface-variant py-10 rounded-xl bg-surface-container-low/60 border border-sky-100 dark:border-sky-900/20;
}

.message-end-tip {
  @apply text-center text-sm text-outline-variant py-4;
}

.message-card {
  @apply relative bg-surface-container-lowest rounded-xl p-6 shadow-xl shadow-sky-900/5 border border-sky-50 dark:border-sky-900/10 transition-all duration-300 hover:translate-y-[-4px];
}

.message-card__row {
  @apply flex items-start gap-4;
}

.message-card__avatar {
  @apply w-12 h-12 rounded-full overflow-hidden flex-shrink-0;
}

.message-card__avatar-img {
  @apply w-full h-full object-cover;
}

.message-card__content {
  @apply flex-1;
}

.message-card__meta {
  @apply flex justify-between items-center mb-2;
}

.message-card__reply-ref {
  @apply flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 mb-2 px-2 py-1 rounded-lg bg-sky-50/90 dark:bg-sky-950/50 w-fit max-w-full;
}

.message-card__reply-ref-icon {
  @apply text-base shrink-0 opacity-80;
}

.message-card__name {
  @apply font-bold text-sky-800 dark:text-sky-300;
}

.message-card__time {
  @apply text-xs text-outline-variant;
}

.message-card__text {
  @apply text-on-surface-variant leading-relaxed;
}

.message-card__actions {
  @apply mt-4 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300;
}

.message-card__action {
  @apply flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors;
}

.message-card__action--danger {
  @apply text-error hover:bg-error-container/10;
}

.message-card__action--secondary {
  @apply text-secondary hover:bg-secondary-container/10;
}

.message-card__action-icon {
  @apply text-sm;
}

.message-more {
  @apply w-full py-6 flex flex-col items-center gap-2 rounded-xl border border-transparent hover:border-sky-100 dark:hover:border-sky-900/30 transition-colors disabled:opacity-60 disabled:pointer-events-none;
}

.message-more__text {
  @apply text-sm font-bold text-outline hover:text-primary transition-colors;
}

.message-more__icon {
  @apply text-outline transition-transform;
}

.message-more:hover:not(:disabled) .message-more__icon {
  @apply translate-y-1;
}

.message-more__icon--spin {
  @apply animate-pulse;
}
</style>
