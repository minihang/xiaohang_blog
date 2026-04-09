<template>
  <div class="auth-page">
    <section class="auth-page__header">
      <h1 class="auth-page__title">登录</h1>
      <p class="auth-page__subtitle">请使用已注册的账号登录。</p>
    </section>

    <div class="auth-card">
      <form class="auth-form" @submit.prevent="onSubmit">
        <p v-if="error" class="auth-form__error">{{ error }}</p>
        <div>
          <label class="auth-form__label" for="login-username">用户名</label>
          <input
            id="login-username"
            v-model="username"
            class="auth-form__control"
            type="text"
            autocomplete="username"
            placeholder="用户名"
          />
        </div>
        <div>
          <label class="auth-form__label" for="login-password">密码</label>
          <input
            id="login-password"
            v-model="password"
            class="auth-form__control"
            type="password"
            autocomplete="current-password"
            placeholder="密码"
          />
        </div>
        <button class="auth-form__submit" type="submit">登录</button>
      </form>

      <p class="auth-card__footer">
        还没有账号？
        <RouterLink class="auth-card__link" :to="{ name: 'register' }">去注册</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

async function onSubmit() {
  error.value = ''
  const result = await auth.loginWithCredentials({
    username: username.value,
    password: password.value,
  })
  if (!result.ok) {
    error.value = result.error
    return
  }
  router.replace({ name: 'home' })
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
