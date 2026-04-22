<template>
  <nav class="top-nav">
    <div class="top-nav__inner">
      <div class="top-nav__brand">Xiaohang's Blog</div>

      <div class="top-nav__links">
        <RouterLink class="top-nav__link" :class="{ 'top-nav__link--active': path === '/' }" to="/">
          首页
        </RouterLink>
        <RouterLink class="top-nav__link" :class="{ 'top-nav__link--active': path === '/message' }" to="/message">
          留言板
        </RouterLink>
      </div>

      <div class="top-nav__actions">
        <div class="top-nav__auth">
          <span class="top-nav__role-badge" :class="{
            'top-nav__role-badge--guest': !isLoggedIn,
            'top-nav__role-badge--user': isUser,
            'top-nav__role-badge--admin': isAdmin,
          }">
            {{ authStatusLabel }}
          </span>
          <template v-if="!isLoggedIn">
            <RouterLink class="top-nav__text-btn top-nav__text-btn--link" :to="{ name: 'login', query: loginQuery }">
              登录
            </RouterLink>
            <RouterLink class="top-nav__text-btn top-nav__text-btn--primary top-nav__text-btn--link"
              :to="{ name: 'register', query: loginQuery }">
              注册
            </RouterLink>
          </template>
          <template v-else>
            <span v-if="user?.name" class="top-nav__user-name">{{ user.name }}</span>
            <button class="top-nav__text-btn" type="button" @click="logout">退出</button>
          </template>
        </div>
        <!-- <button class="top-nav__icon-btn" type="button">
          <span class="material-symbols-outlined">search</span>
        </button> -->
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth = useAuthStore()
const { isLoggedIn, isAdmin, isUser, user } = storeToRefs(auth)

const path = computed(() => route.path)

const loginQuery = computed(() => {
  const p = route.fullPath
  if (!p || p === '/' || p.startsWith('/login') || p.startsWith('/register')) return {}
  return { redirect: p }
})

const authStatusLabel = computed(() => {
  if (!isLoggedIn.value) return '未登录'
  if (isAdmin.value) return '管理员'
  if (isUser.value) return '普通用户'
  return '已登录'
})

function logout() {
  auth.logout()
}

function toggleDark() {
  document.documentElement.classList.toggle('dark')
}
</script>

<style scoped lang="postcss">
.top-nav {
  @apply fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-xl shadow-sky-900/5 h-20;
}

.top-nav__inner {
  @apply grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] h-full max-w-7xl mx-auto px-4 sm:px-8 items-center;
}

.top-nav__brand {
  @apply text-2xl font-bold tracking-tighter text-sky-800 justify-self-start min-w-0 truncate;
}

.top-nav__links {
  @apply hidden md:flex items-center justify-center gap-8 font-medium tracking-wide text-sm justify-self-center;
}

.top-nav__link {
  @apply text-slate-500 hover:text-sky-500 transition-colors;
}

.top-nav__link--active {
  @apply text-sky-600 font-bold border-b-2 border-sky-500;
}

.top-nav__actions {
  @apply flex items-center gap-2 md:gap-3 flex-wrap justify-end justify-self-end col-start-2 md:col-start-3;
}

.top-nav__auth {
  @apply flex items-center gap-2 mr-1 text-xs flex-wrap justify-end;
}

.top-nav__role-badge {
  @apply px-2 py-0.5 rounded-full font-medium border whitespace-nowrap;
}

.top-nav__role-badge--guest {
  @apply border-slate-200 text-slate-500 bg-slate-50/80;
}

.top-nav__role-badge--user {
  @apply border-sky-200 text-sky-800 bg-sky-50/90;
}

.top-nav__role-badge--admin {
  @apply border-amber-200 text-amber-900 bg-amber-50/90;
}

.top-nav__user-name {
  @apply text-slate-600 max-w-[6rem] truncate hidden sm:inline;
}

.top-nav__text-btn {
  @apply px-2 py-1 rounded-full text-slate-600 hover:bg-sky-50/80 transition-colors whitespace-nowrap border-0 bg-transparent cursor-pointer text-inherit font-normal text-xs;
}

.top-nav__text-btn--link {
  @apply no-underline inline-flex items-center justify-center;
}

.top-nav__text-btn--primary {
  @apply text-primary font-semibold;
}

.top-nav__icon-btn {
  @apply p-2 text-sky-700 hover:bg-sky-50/50 rounded-full transition-all duration-300 scale-95 active:scale-90;
}
</style>
