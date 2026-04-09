<template>
  <div class="auth-page">
    <section class="auth-page__header">
      <h1 class="auth-page__title">注册</h1>
      <p class="auth-page__subtitle">
        创建账号，在留言板留下声音，并同步你的侧边栏资料展示。点击「注册并登录」后需完成安全验证。
      </p>
    </section>

    <div class="auth-card">
      <form class="auth-form" @submit.prevent="onSubmit">
        <p v-if="error" class="auth-form__error">{{ error }}</p>
        <div>
          <label class="auth-form__label" for="reg-username">用户名</label>
          <input
            id="reg-username"
            v-model="username"
            class="auth-form__control"
            type="text"
            autocomplete="username"
            placeholder="至少 2 个字符"
          />
        </div>
        <div>
          <label class="auth-form__label" for="reg-password">密码</label>
          <input
            id="reg-password"
            v-model="password"
            class="auth-form__control"
            type="password"
            autocomplete="new-password"
            placeholder="至少 4 位"
          />
        </div>
        <div>
          <label class="auth-form__label" for="reg-signature">个人签名</label>
          <input
            id="reg-signature"
            v-model="signature"
            class="auth-form__control"
            type="text"
            autocomplete="off"
            placeholder="一句话介绍自己（可选）"
          />
        </div>
        <button class="auth-form__submit" type="submit">注册并登录</button>
      </form>

      <p class="auth-card__footer">
        已有账号？
        <RouterLink class="auth-card__link" :to="{ name: 'login' }">去登录</RouterLink>
      </p>
    </div>

    <CaptchaVerifyModal
      v-model="showCaptchaModal"
      description="请计算下方算式，验证通过后即可完成注册并登录。"
      confirm-text="确认注册"
      confirm-icon="person_add"
      @verified="completeRegisterAfterCaptcha"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import CaptchaVerifyModal from '../components/CaptchaVerifyModal.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const signature = ref('')
const error = ref('')
const showCaptchaModal = ref(false)

function redirectAfterLogin() {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    router.replace(redirect)
    return
  }
  router.replace({ name: 'home' })
}

function onSubmit() {
  error.value = ''
  const u = username.value.trim()
  const p = password.value
  if (u.length < 2) {
    error.value = '用户名至少 2 个字符'
    return
  }
  if (p.length < 4) {
    error.value = '密码至少 4 位'
    return
  }
  showCaptchaModal.value = true
}

async function completeRegisterAfterCaptcha() {
  const result = await auth.registerAndLogin({
    username: username.value.trim(),
    password: password.value,
    signature: signature.value,
  })
  if (!result.ok) {
    error.value = result.error || '注册失败，请稍后再试'
    return
  }
  redirectAfterLogin()
}
</script>

<style scoped lang="postcss">
.auth-page {
  @apply max-w-md mx-auto py-8;
}

.auth-page__header {
  @apply mb-8 text-center;
}

.auth-page__title {
  @apply text-3xl font-extrabold text-sky-900 tracking-tight mb-2;
}

.auth-page__subtitle {
  @apply text-on-surface-variant text-sm;
}

.auth-card {
  @apply bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-sky-100 dark:border-slate-700 shadow-xl shadow-sky-900/5 p-8;
}

.auth-form {
  @apply space-y-4;
}

.auth-form__error {
  @apply text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl;
}

.auth-form__label {
  @apply block text-xs font-semibold text-slate-600 mb-1;
}

.auth-form__control {
  @apply w-full rounded-2xl border border-sky-100 dark:border-slate-600 bg-sky-50/30 dark:bg-slate-800/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40;
}

.auth-form__submit {
  @apply w-full mt-2 rounded-full bg-primary text-on-primary font-bold py-3 shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all;
}

.auth-card__footer {
  @apply mt-6 text-center text-sm text-slate-500;
}

.auth-card__link {
  @apply text-primary font-semibold hover:underline;
}
</style>
