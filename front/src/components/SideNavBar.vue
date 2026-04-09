<template>
  <aside class="side-nav">
    <div class="side-nav__profile">
      <template v-if="isLoggedIn">
        <div class="side-nav__avatar">
          <img
            :alt="displayName + ' 的头像'"
            class="side-nav__avatar-img"
            :src="avatarUrl"
          />
        </div>
        <div class="side-nav__profile-text">
          <h3 class="side-nav__name">{{ displayName }}</h3>
          <p class="side-nav__tagline">{{ signatureText }}</p>
        </div>
      </template>
      <template v-else>
        <div class="side-nav__avatar side-nav__avatar--guest">
          <span class="material-symbols-outlined side-nav__avatar-placeholder">person_off</span>
        </div>
        <div class="side-nav__profile-text">
          <h3 class="side-nav__name side-nav__name--muted">未登录</h3>
          <RouterLink class="side-nav__tagline side-nav__tagline--link" :to="{ name: 'login' }">
            登录后显示头像、昵称与签名
          </RouterLink>
        </div>
      </template>
    </div>

    <nav class="side-nav__nav">
      <RouterLink
        class="side-nav__link"
        :class="{ 'side-nav__link--active': isActive('all') }"
        :to="{ name: 'home', query: { cat: 'all' } }"
      >
        <span class="material-symbols-outlined">category</span>
        <span class="side-nav__link-text">ALL</span>
      </RouterLink>
      <RouterLink
        class="side-nav__link"
        :class="{ 'side-nav__link--active': isActive('随笔') }"
        :to="{ name: 'home', query: { cat: '随笔' } }"
      >
        <span class="material-symbols-outlined">auto_stories</span>
        <span class="side-nav__link-text">随笔</span>
      </RouterLink>
      <RouterLink
        class="side-nav__link"
        :class="{ 'side-nav__link--active': isActive('科研') }"
        :to="{ name: 'home', query: { cat: '科研' } }"
      >
        <span class="material-symbols-outlined">psychology</span>
        <span class="side-nav__link-text">科研</span>
      </RouterLink>
      <RouterLink
        class="side-nav__link"
        :class="{ 'side-nav__link--active': isActive('开发') }"
        :to="{ name: 'home', query: { cat: '开发' } }"
      >
        <span class="material-symbols-outlined">terminal</span>
        <span class="side-nav__link-text">开发</span>
      </RouterLink>
    </nav>

    <div class="side-nav__bottom">
      <RouterLink
        v-if="isLoggedIn"
        class="side-nav__link"
        :class="{ 'side-nav__link--active': route.name === 'profile' }"
        :to="{ name: 'profile' }"
      >
        <span class="material-symbols-outlined">person</span>
        <span class="side-nav__link-text">个人中心</span>
      </RouterLink>
      <RouterLink v-else class="side-nav__link" :to="{ name: 'login' }">
        <span class="material-symbols-outlined">login</span>
        <span class="side-nav__link-text">登录 / 注册</span>
      </RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { resolveAssetUrl } from '../utils/assetUrl'

const route = useRoute()
const auth = useAuthStore()
const { isLoggedIn, user } = storeToRefs(auth)

const displayName = computed(() => (user.value?.name ? String(user.value.name) : '用户'))

const DEFAULT_AVATAR =
  'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'

const avatarUrl = computed(() => {
  const u = user.value?.avatar
  if (typeof u === 'string' && u.length > 0) return resolveAssetUrl(u)
  return DEFAULT_AVATAR
})

const signatureText = computed(() => {
  const s = user.value?.signature
  if (typeof s === 'string' && s.trim()) return s.trim()
  return '暂无个人签名'
})

function isActive(key) {
  if (route.name !== 'home') return false
  const q = route.query.cat
  if (key === 'all') return !q || q === 'all'
  return q === key
}
</script>

<style scoped lang="postcss">
.side-nav {
  @apply hidden lg:flex flex-col w-64 p-6 space-y-4 bg-sky-50/50 backdrop-blur-lg rounded-r-[3rem] h-[calc(100vh-8rem)] sticky top-24 shadow-2xl shadow-sky-900/10;
}

.side-nav__profile {
  @apply flex items-center space-x-3 px-2 mb-6 min-h-[3.5rem];
}

.side-nav__profile-text {
  @apply min-w-0 flex-1;
}

.side-nav__avatar {
  @apply w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container shrink-0;
}

.side-nav__avatar--guest {
  @apply flex items-center justify-center bg-slate-200/80 border-slate-300;
}

.side-nav__avatar-placeholder {
  @apply text-2xl text-slate-500;
}

.side-nav__avatar-img {
  @apply w-full h-full object-cover;
}

.side-nav__name {
  @apply text-lg font-bold text-sky-900 leading-tight truncate;
}

.side-nav__name--muted {
  @apply text-slate-500;
}

.side-nav__tagline {
  @apply text-xs text-slate-500 line-clamp-2;
}

.side-nav__tagline--link {
  @apply text-sky-600 hover:text-sky-800 hover:underline no-underline cursor-pointer;
}

.side-nav__nav {
  @apply space-y-2 flex-grow;
}

.side-nav__link {
  @apply flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-sky-100/50 rounded-full hover:translate-x-1 transition-all duration-300 no-underline;
}

.side-nav__link--active {
  @apply bg-sky-500 text-white shadow-lg shadow-sky-200 hover:translate-x-0;
}

.side-nav__link-text {
  @apply text-sm;
}

.side-nav__bottom {
  @apply pt-6 border-t border-sky-100;
}
</style>
