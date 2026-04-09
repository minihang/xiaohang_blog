<template>
  <Teleport to="body">
    <Transition name="captcha-ovl">
      <div
        v-if="modelValue"
        class="captcha-overlay"
        role="presentation"
        @click.self="close"
      >
        <div
          class="captcha-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          @click.stop
        >
          <button class="captcha-modal__close" type="button" aria-label="关闭" @click="close">
            <span class="material-symbols-outlined">close</span>
          </button>

          <div class="captcha-modal__icon-wrap">
            <span class="material-symbols-outlined captcha-modal__shield">verified_user</span>
          </div>
          <h3 :id="titleId" class="captcha-modal__title">{{ title }}</h3>
          <p class="captcha-modal__desc">{{ description }}</p>

          <div class="captcha-modal__challenge" aria-live="polite">
            <span class="captcha-modal__num">{{ captcha.a }}</span>
            <span class="captcha-modal__op">+</span>
            <span class="captcha-modal__num">{{ captcha.b }}</span>
            <span class="captcha-modal__eq">=</span>
            <input
              ref="captchaInputEl"
              v-model="captchaInput"
              class="captcha-modal__answer"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="?"
              @keyup.enter="onConfirm"
            />
          </div>

          <p v-if="captchaModalError" class="captcha-modal__error">{{ captchaModalError }}</p>

          <button class="captcha-modal__refresh" type="button" @click="newCaptcha">
            <span class="material-symbols-outlined text-lg">refresh</span>
            换一题
          </button>

          <div class="captcha-modal__actions">
            <button class="captcha-modal__btn captcha-modal__btn--ghost" type="button" @click="close">
              取消
            </button>
            <button class="captcha-modal__btn captcha-modal__btn--primary" type="button" @click="onConfirm">
              <span class="material-symbols-outlined text-lg">{{ confirmIcon }}</span>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { checkCaptchaAnswer, createCaptchaChallenge } from '../utils/simpleCaptcha'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '安全验证' },
  description: { type: String, default: '请完成下列算式。' },
  confirmText: { type: String, default: '确认' },
  /** Material Symbols 图标名，不含后缀 */
  confirmIcon: { type: String, default: 'check' },
})

const emit = defineEmits(['update:modelValue', 'verified'])

const titleId = `captcha-modal-title-${Math.random().toString(36).slice(2, 9)}`

const captcha = ref(createCaptchaChallenge())
const captchaInput = ref('')
const captchaInputEl = ref(null)
const captchaModalError = ref('')

function newCaptcha() {
  captcha.value = createCaptchaChallenge()
  captchaInput.value = ''
}

function close() {
  captchaModalError.value = ''
  emit('update:modelValue', false)
}

function onConfirm() {
  captchaModalError.value = ''
  if (!checkCaptchaAnswer(captchaInput.value, captcha.value.answer)) {
    captchaModalError.value = '答案不正确，请重试或点击换一题。'
    newCaptcha()
    nextTick(() => captchaInputEl.value?.focus())
    return
  }
  emit('verified')
  emit('update:modelValue', false)
  newCaptcha()
}

watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      captchaModalError.value = ''
      newCaptcha()
      nextTick(() => captchaInputEl.value?.focus())
    }
  },
)

function onEscape(e) {
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => {
  window.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped lang="postcss">
.captcha-overlay {
  @apply fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
}

.captcha-modal {
  @apply relative w-full max-w-md rounded-[1.75rem] p-8 sm:p-10 shadow-2xl shadow-sky-900/20 border border-white/20;
  background: linear-gradient(
    155deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(240, 249, 255, 0.98) 50%,
    rgba(224, 242, 254, 0.95) 100%
  );
}

.dark .captcha-modal {
  @apply border-slate-600/40;
  background: linear-gradient(
    155deg,
    rgba(30, 41, 59, 0.97) 0%,
    rgba(15, 23, 42, 0.98) 100%
  );
}

.captcha-modal__close {
  @apply absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-sky-100/80 hover:text-sky-800 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors border-0 bg-transparent cursor-pointer;
}

.captcha-modal__icon-wrap {
  @apply mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-500/30;
}

.captcha-modal__shield {
  @apply text-4xl text-white;
}

.captcha-modal__title {
  @apply text-center text-2xl font-extrabold tracking-tight text-sky-950 dark:text-sky-50 mb-2;
}

.captcha-modal__desc {
  @apply text-center text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8;
}

.captcha-modal__challenge {
  @apply flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 py-6 px-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-sky-100/80 dark:border-slate-600/50;
}

.captcha-modal__num {
  @apply inline-flex min-w-[2.75rem] items-center justify-center rounded-xl bg-sky-500 text-white text-2xl sm:text-3xl font-black tabular-nums px-3 py-2 shadow-md shadow-sky-500/25;
}

.captcha-modal__op,
.captcha-modal__eq {
  @apply text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-400 px-1;
}

.captcha-modal__answer {
  @apply w-24 sm:w-28 rounded-xl border-2 border-sky-200 dark:border-slate-500 bg-white dark:bg-slate-900 text-center text-2xl font-bold text-sky-900 dark:text-sky-100 py-2.5 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition-shadow;
}

.captcha-modal__error {
  @apply text-sm text-red-600 dark:text-red-400 text-center mb-4 font-medium;
}

.captcha-modal__refresh {
  @apply mx-auto flex items-center gap-1.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200 mb-8 border-0 bg-transparent cursor-pointer py-2 px-3 rounded-full hover:bg-sky-50 dark:hover:bg-slate-800/80 transition-colors;
}

.captcha-modal__actions {
  @apply flex gap-3;
}

.captcha-modal__btn {
  @apply flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all border-0 cursor-pointer;
}

.captcha-modal__btn--ghost {
  @apply bg-slate-100/90 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700;
}

.captcha-modal__btn--primary {
  @apply bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98];
}

.captcha-ovl-enter-active,
.captcha-ovl-leave-active {
  transition: opacity 0.22s ease;
}

.captcha-ovl-enter-active .captcha-modal,
.captcha-ovl-leave-active .captcha-modal {
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.captcha-ovl-enter-from,
.captcha-ovl-leave-to {
  opacity: 0;
}

.captcha-ovl-enter-from .captcha-modal,
.captcha-ovl-leave-to .captcha-modal {
  opacity: 0;
  transform: scale(0.94) translateY(0.5rem);
}
</style>
