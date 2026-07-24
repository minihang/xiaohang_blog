<template>
  <aside v-if="isArticleRoute" class="side-nav side-nav--toc">
    <a class="side-nav__toc-back" :href="homeHref" @click.prevent="onBackHome">
      <span class="material-symbols-outlined">arrow_back</span>
      <span>返回首页</span>
    </a>
    <div class="side-nav__toc-divider" aria-hidden="true"></div>

    <div class="side-nav__toc-head">
      <span class="material-symbols-outlined side-nav__toc-icon">toc</span>
      <div class="side-nav__toc-title-wrap">
        <p class="side-nav__toc-kicker">目录</p>
        <h3 class="side-nav__toc-title">{{ tocTitle }}</h3>
      </div>
    </div>

    <nav class="side-nav__toc-list" aria-label="文章目录">
      <a
        v-for="item in tocItems"
        :key="item.id"
        class="side-nav__toc-link"
        :class="{ 'side-nav__toc-link--sub': item.level === 2 }"
        :href="`#${item.id}`"
        @click="onTocClick"
      >
        {{ item.text }}
      </a>
      <p v-if="tocLoading" class="side-nav__toc-empty">目录加载中…</p>
      <p v-else-if="tocItems.length === 0" class="side-nav__toc-empty">暂无目录</p>
    </nav>

  </aside>

  <aside v-else class="side-nav">
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { resolveAssetUrl } from '../utils/assetUrl'
import { fetchArticleById } from '../api/articles'
import type { Article, ArticleBlock, ArticleCategory } from '../types'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn, user } = storeToRefs(auth)
const tocArticle = ref<Article | null>(null)
const tocLoading = ref(false)

const isArticleRoute = computed(() => route.name === 'article')
const homeHref = computed(() => router.resolve({ name: 'home' }).href)

const tocTitle = computed(() => {
  const title = tocArticle.value?.title
  return typeof title === 'string' && title.trim() ? title.trim() : '文章目录'
})

const tocItems = computed(() => {
  const blocks = Array.isArray(tocArticle.value?.blocks) ? tocArticle.value.blocks : []
  return blocks
    .map((block: ArticleBlock, index: number) => ({ block, index }))
    .filter(
      ({ block }) =>
        (block?.type === 'h2' || block?.type === 'lead') && typeof block.text === 'string' && block.text.trim(),
    )
    .map(({ block, index }) => ({
      id: `paper-heading-${index}`,
      text: stripInlineMarkdown(block.text || ''),
      level: block.type === 'lead' ? 2 : 1,
    }))
})

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

function isActive(key: 'all' | ArticleCategory): boolean {
  if (route.name !== 'home') return false
  const q = route.query.cat
  if (key === 'all') return !q || q === 'all'
  return q === key
}

function stripInlineMarkdown(text: string): string {
  return String(text || '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim()
}

function onTocClick(event: MouseEvent) {
  const currentTarget = event.currentTarget as HTMLAnchorElement | null
  const targetId = currentTarget?.getAttribute('href')?.slice(1)
  if (!targetId) return
  const target = document.getElementById(targetId)
  if (!target) return
  event.preventDefault()
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', `#${targetId}`)
}

function onBackHome() {
  const previousLocation = window.history.state?.back
  if (typeof previousLocation === 'string') {
    const previousUrl = new URL(previousLocation, window.location.origin)
    const homePath = router.resolve({ name: 'home' }).path
    if (previousUrl.pathname === homePath) {
      router.back()
      return
    }
  }
  router.push({ name: 'home' })
}

watch(
  () => ({ name: route.name, id: route.params.id }),
  async ({ name, id }) => {
    tocArticle.value = null
    const articleId = Array.isArray(id) ? id[0] : id
    if (name !== 'article' || !articleId) return
    tocLoading.value = true
    try {
      const data = await fetchArticleById(articleId)
      tocArticle.value = data && !data.forbidden ? data : null
    } catch {
      tocArticle.value = null
    } finally {
      tocLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="postcss">
.side-nav {
  @apply hidden lg:flex flex-col w-64 min-w-64 max-w-64 basis-64 shrink-0 p-6 space-y-4 bg-sky-50/50 backdrop-blur-lg rounded-r-[3rem] h-[calc(100vh-8rem)] sticky top-24 shadow-2xl shadow-sky-900/10;
}

.side-nav--toc {
  @apply space-y-5;
}

.side-nav__toc-head {
  @apply flex items-start gap-3 px-2 pb-5 border-b border-sky-100;
}

.side-nav__toc-icon {
  @apply text-2xl text-sky-600 mt-0.5 shrink-0;
}

.side-nav__toc-title-wrap {
  @apply min-w-0 flex-1;
}

.side-nav__toc-kicker {
  @apply text-xs font-bold uppercase tracking-widest text-sky-500 mb-1;
}

.side-nav__toc-title {
  @apply text-base font-extrabold leading-snug text-sky-900 line-clamp-2;
}

.side-nav__toc-list {
  @apply flex flex-col gap-1 flex-grow overflow-y-auto pr-1;
}

.side-nav__toc-link {
  @apply block rounded-2xl px-4 py-2.5 text-sm font-semibold leading-snug text-slate-600 no-underline hover:bg-sky-100/70 hover:text-sky-800 transition-colors;
}

.side-nav__toc-link--sub {
  @apply ml-4 border-l-2 border-sky-100 rounded-l-none pl-3 text-[0.8125rem] font-medium text-slate-500;
}

.side-nav__toc-empty {
  @apply px-4 py-3 text-sm text-slate-500;
}

.side-nav__toc-back {
  @apply flex w-full items-center gap-2 px-3 py-3 text-sm font-bold text-sky-700 no-underline hover:text-sky-900 hover:translate-x-1 transition-all duration-300;
}

.side-nav__toc-divider {
  @apply h-px bg-sky-100;
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
