<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-header__title">{{ pageHeader.title }}</h1>
        <p class="page-header__subtitle">
          {{ pageHeader.subtitle }}
        </p>
      </div>
      <RouterLink v-if="canManageArticles" class="primary-cta" :to="{ name: 'edit-new' }">
        <span class="primary-cta__icon material-symbols-outlined">add_circle</span>
        <span>发布新文章</span>
      </RouterLink>
    </div>

    <p v-if="listLoading" class="empty-tip">文章加载中…</p>
    <p v-else-if="listError" class="empty-tip">{{ listError }}</p>
    <p v-else-if="articles.length === 0" class="empty-tip">该分类下暂无文章</p>
    <div v-else class="article-list">
      <ArticleCard v-for="item in articles" :key="item.id" v-bind="item" :can-pin="canManageArticles"
        :pin-loading="pinBusyId === String(item.id)" @read="onRead" @toggle-pin="onTogglePin" />
    </div>

    <div v-if="!listLoading && !listError && totalPages > 1" class="pager">
      <button class="pager__nav-btn" type="button" :disabled="currentPage <= 1" aria-label="上一页"
        @click="goToPage(currentPage - 1)">
        <span class="material-symbols-outlined pager__icon">chevron_left</span>
      </button>
      <div class="pager__pages">
        <button v-for="p in pageNumbers" :key="p" class="pager__page"
          :class="{ 'pager__page--active': p === currentPage }" type="button" @click="goToPage(p)">
          {{ p }}
        </button>
      </div>
      <button class="pager__nav-btn" type="button" :disabled="currentPage >= totalPages" aria-label="下一页"
        @click="goToPage(currentPage + 1)">
        <span class="material-symbols-outlined pager__icon">chevron_right</span>
      </button>
    </div>
    <p v-else-if="!listLoading && !listError && articles.length > 0 && total > 0" class="pager-meta">
      共 {{ total }} 篇，当前第 {{ currentPage }} / {{ totalPages }} 页
    </p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ArticleCard from '../components/ArticleCard.vue'
import { fetchArticleList, toggleArticlePin } from '../api/articles'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { canManageArticles } = storeToRefs(authStore)

/** 与 SideNavBar 分类一致：all | 随笔 | 科研 | 开发 */
const HEADER_BY_CAT = {
  all: {
    title: '所有文章',
    subtitle:
      '所有的胡思乱想和技术笔记。',
  },
  随笔: {
    title: '随笔手记',
    subtitle:
      '没什么主题，记录点生活碎事、idea、组会要汇报的内容之类。',
  },
  科研: {
    title: '科研笔记',
    subtitle:
      '读过的论文和跑过的实验，主要是怕以后自己忘了。',
  },
  开发: {
    title: '开发手记',
    subtitle:
      '踩坑记录与代码片段，希望能少写点 Bug',
  },
}

function normalizeCatQuery(raw) {
  if (Array.isArray(raw)) return raw[0]
  return raw
}

const activeCatKey = computed(() => {
  const q = normalizeCatQuery(route.query.cat)
  if (!q || q === 'all') return 'all'
  if (Object.prototype.hasOwnProperty.call(HEADER_BY_CAT, q)) return q
  return 'all'
})

const pageHeader = computed(() => HEADER_BY_CAT[activeCatKey.value] ?? HEADER_BY_CAT.all)

const PAGE_SIZE = 6

const currentPage = computed(() => {
  const p = Number(route.query.page)
  return Number.isFinite(p) && p >= 1 ? Math.floor(p) : 1
})

const articles = ref([])
const total = ref(0)
const totalPages = ref(1)
const listLoading = ref(true)
const listError = ref('')
const pinBusyId = ref('')

const pageNumbers = computed(() => {
  const tp = totalPages.value
  const cur = currentPage.value
  if (tp <= 7) {
    return Array.from({ length: tp }, (_, i) => i + 1)
  }
  const windowSize = 5
  let end = Math.min(tp, Math.max(cur + 2, windowSize))
  let start = Math.max(1, end - windowSize + 1)
  end = Math.min(tp, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const out = []
  for (let i = start; i <= end; i += 1) out.push(i)
  return out
})

function homeQueryForPage(page) {
  const q = {}
  if (activeCatKey.value !== 'all') q.cat = activeCatKey.value
  if (page > 1) q.page = String(page)
  return q
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  router.push({ name: 'home', query: homeQueryForPage(page) })
}

async function loadList() {
  listLoading.value = true
  listError.value = ''
  const page = currentPage.value
  try {
    const catParam = activeCatKey.value === 'all' ? undefined : activeCatKey.value
    const res = await fetchArticleList(catParam, { page, pageSize: PAGE_SIZE })
    articles.value = res.list
    total.value = res.total
    totalPages.value = res.totalPages
    if (res.page !== page) {
      router.replace({ name: 'home', query: homeQueryForPage(res.page) })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } catch (e) {
    listError.value = String(e?.message || '加载失败')
    articles.value = []
    total.value = 0
    totalPages.value = 1
  } finally {
    listLoading.value = false
  }
}

watch(
  () => [activeCatKey.value, currentPage.value],
  async () => loadList(),
  { immediate: true },
)

function onRead(id) {
  router.push({ name: 'article', params: { id: String(id) } })
}

async function onTogglePin(id) {
  if (!canManageArticles.value || pinBusyId.value) return
  pinBusyId.value = String(id)
  try {
    await toggleArticlePin(id)
    await loadList()
  } catch (e) {
    listError.value = String(e?.response?.data?.error || e?.message || '置顶失败')
  } finally {
    pinBusyId.value = ''
  }
}
</script>

<style scoped lang="postcss">
.page-header {
  @apply flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12;
}

.page-header__title {
  @apply text-4xl md:text-5xl font-extrabold text-sky-900 tracking-tight mb-4;
}

.page-header__subtitle {
  @apply text-lg text-on-surface-variant max-w-2xl leading-relaxed;
}

.primary-cta {
  @apply flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300;
}

.primary-cta__icon {
  @apply text-xl;
}

.empty-tip {
  @apply text-center text-on-surface-variant py-16 rounded-xl bg-surface-container-low/80 border border-sky-100;
}

.article-list {
  @apply flex flex-col gap-8;
}

.pager {
  @apply mt-16 flex justify-center items-center gap-4;
}

.pager__nav-btn {
  @apply w-12 h-12 rounded-full border-2 border-sky-100 flex items-center justify-center text-sky-600 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all duration-300;
}

.pager__icon {
  @apply text-inherit;
}

.pager__pages {
  @apply flex gap-2;
}

.pager__page {
  @apply w-12 h-12 rounded-full text-slate-500 hover:bg-sky-100 font-bold transition-colors;
}

.pager__page--active {
  @apply bg-sky-500 text-white shadow-lg shadow-sky-200;
}

.pager__nav-btn:disabled {
  @apply opacity-40 cursor-not-allowed hover:bg-transparent hover:text-sky-600 hover:border-sky-100;
}

.pager-meta {
  @apply mt-10 text-center text-sm text-on-surface-variant;
}
</style>
