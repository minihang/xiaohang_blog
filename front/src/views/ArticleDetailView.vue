<template>
  <div v-if="articleLoading" class="paper-loading">
    <p class="paper-loading__text">文章加载中…</p>
  </div>

  <div v-else-if="loadError" class="denied">
    <div class="denied__card">
      <p class="denied__text">{{ loadError }}</p>
      <RouterLink class="denied__back" to="/">返回首页</RouterLink>
    </div>
  </div>

  <div v-else-if="article?.forbidden" class="denied">
    <div class="article-topbar">
      <RouterLink class="article-back-home" :to="{ name: 'home' }">
        <span class="material-symbols-outlined article-back-home__icon">arrow_back</span>
        返回首页
      </RouterLink>
    </div>
    <div class="denied__card">
      <span class="material-symbols-outlined denied__icon">lock</span>
      <h2 class="denied__title">无权访问</h2>
      <p class="denied__text">
        <template v-if="article.visibility === 'login'">本文仅登录用户可阅读全文，请先登录。</template>
        <template v-else-if="article.visibility === 'admin'">本文仅管理员可阅读全文。</template>
        <template v-else>您没有权限阅读此内容。</template>
      </p>
      <RouterLink class="denied__back" to="/">返回首页</RouterLink>
    </div>
  </div>

  <div v-else-if="article">
    <div class="article-topbar">
      <RouterLink class="article-back-home" :to="{ name: 'home' }">
        <span class="material-symbols-outlined article-back-home__icon">arrow_back</span>
        返回首页
      </RouterLink>
    </div>

    <div class="paper-hero">
      <div class="paper-hero__overlay"></div>
      <img class="paper-hero__img" alt="" :src="article.heroImage" />
      <div class="paper-hero__content">
        <div class="paper-hero__meta">
          <span class="paper-hero__pill">{{ article.heroPill || article.category }}</span>
        </div>
        <h1 class="paper-hero__title">
          {{ article.title }}
        </h1>
        <div class="paper-hero__bottom">
          <div class="paper-hero__author">
            <div class="paper-hero__avatar">
              <img class="paper-hero__avatar-img" alt="" :src="article.authorAvatar" />
            </div>
            <div class="paper-hero__author-text">
              <p class="paper-hero__author-name">{{ article.authorName }}</p>
              <p class="paper-hero__author-date">{{ article.authorPublished }}</p>
            </div>
          </div>
          <div v-if="isAdmin" class="paper-hero__actions">
            <RouterLink class="paper-hero__action-btn" :to="{ name: 'edit', params: { id: String(article.id) } }">
              <span class="material-symbols-outlined paper-hero__action-icon">edit</span>
              <span>编辑文章</span>
            </RouterLink>
            <button class="paper-hero__action-btn paper-hero__action-btn--danger" type="button"
              @click="onDeleteArticle">
              <span class="material-symbols-outlined paper-hero__action-icon">delete</span>
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="canRead" class="paper-grid">
      <div class="paper-main paper-main--full">
        <div class="paper-card">
          <article class="paper-article">
            <template v-for="(block, i) in article.blocks" :key="i">
              <p v-if="block.type === 'lead'" class="paper-article__lead" v-html="renderInlineMarkdown(block.text)"></p>
              <h2 v-else-if="block.type === 'h2'" class="paper-article__h2">
                <span class="paper-article__h2-bar paper-article__h2-bar--primary"></span>
                <span v-html="renderInlineMarkdown(block.text)"></span>
              </h2>
              <p v-else-if="block.type === 'p'" v-html="renderInlineMarkdown(block.text)"></p>
              <div v-else-if="block.type === 'quote'" class="paper-quote">
                <p class="paper-quote__text" v-html="renderInlineMarkdown(block.text)"></p>
              </div>
              <ul v-else-if="block.type === 'checklist'" class="paper-checklist">
                <li v-for="(item, j) in block.items" :key="j" class="paper-checklist__item">
                  <!-- <span class="material-symbols-outlined paper-checklist__icon">check_circle</span> -->
                  <span>
                    <template v-if="Array.isArray(item)">
                      <strong v-if="item[0]" v-html="renderInlineMarkdown(item[0])"></strong>
                      <span v-if="item[0]">&nbsp;</span>
                      <span v-html="renderInlineMarkdown(item[1])"></span>
                    </template>
                    <template v-else>
                      <span v-html="renderInlineMarkdown(item)"></span>
                    </template>
                  </span>
                </li>
              </ul>
              <div v-else-if="block.type === 'code'" class="paper-code">
                <div class="paper-code__header">
                  <label class="paper-code__picker">
                    <span class="paper-code__picker-label">语言</span>
                    <select class="paper-code__select" :value="getCodeChoice(block, i)"
                      @change="(e) => (codeLangChoiceByIndex[i] = e.target.value)">
                      <option v-for="opt in CODE_LANG_OPTIONS" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>
                </div>
                <pre class="paper-code__pre"><code class="hljs" v-html="highlightCode(block, i).html"></code></pre>
              </div>
              <img v-else-if="block.type === 'img'" class="paper-article__img" alt=""
                :src="resolveAssetUrl(block.src)" />
            </template>
          </article>

          <div class="paper-share">
            <div class="paper-share__left">
              <button class="paper-share__btn" type="button" :disabled="likeSubmitting"
                :aria-label="`点赞，当前 ${displayLikeCount} 次`" @click="onLike">
                <span class="material-symbols-outlined">favorite</span>
                <span class="paper-share__count">{{ displayLikeCount }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="denied">
      <div class="denied__card">
        <span class="material-symbols-outlined denied__icon">lock</span>
        <h2 class="denied__title">无权访问</h2>
        <p class="denied__text">
          <template v-if="article.visibility === 'login'">本文仅登录用户可阅读全文，请先登录。</template>
          <template v-else-if="article.visibility === 'admin'">本文仅管理员可阅读全文。</template>
          <template v-else>您没有权限阅读此内容。</template>
        </p>
        <RouterLink class="denied__back" to="/">返回首页</RouterLink>
      </div>
    </div>
  </div>

  <div v-else class="denied">
    <div class="denied__card">
      <p class="denied__text">文章不存在</p>
      <RouterLink class="denied__back" to="/">返回首页</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { renderInlineMarkdown } from '../utils/inlineCode'
import { resolveAssetUrl } from '../utils/assetUrl'
import { useAuthStore } from '../stores/auth'
import { deleteArticle, fetchArticleById, likeArticle } from '../api/articles'
import { canReadArticleBody } from '../utils/articleAccess'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isLoggedIn, isAdmin } = storeToRefs(authStore)

const article = ref(null)
const articleLoading = ref(true)
const loadError = ref('')
const likeSubmitting = ref(false)

const CODE_LANG_OPTIONS = [
  { value: 'auto', label: '自动检测' },
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'bash', label: 'Bash' },
  { value: 'css', label: 'CSS' },
  { value: 'diff', label: 'Diff' },
  { value: 'html', label: 'HTML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
]

const codeLangChoiceByIndex = ref({})

function normalizeLang(raw) {
  const v = String(raw || '').trim().toLowerCase()
  if (!v) return 'auto'
  if (v === 'auto') return 'auto'
  return v
}

function getCodeChoice(block, i) {
  const picked = codeLangChoiceByIndex.value?.[i]
  if (picked != null && picked !== '') return normalizeLang(picked)
  return normalizeLang(block?.lang)
}

function highlightCode(block, i) {
  const code = typeof block?.code === 'string' ? block.code : ''
  const choice = getCodeChoice(block, i)
  if (!code) return { html: '', detected: '' }

  if (choice === 'plaintext') {
    return { html: hljs.highlight(code, { language: 'plaintext' }).value, detected: 'plaintext' }
  }

  if (choice !== 'auto') {
    try {
      return { html: hljs.highlight(code, { language: choice }).value, detected: choice }
    } catch {
      // fallback to auto
    }
  }

  const res = hljs.highlightAuto(code)
  return { html: res.value, detected: res.language || '' }
}

function formatLikeCount(n) {
  const x = Number(n) || 0
  if (x >= 1_000_000) return `${(x / 1_000_000).toFixed(1)}M`
  if (x >= 10_000) return `${Math.round(x / 1000)}k`
  if (x >= 1000) return `${(x / 1000).toFixed(1)}k`
  return String(x)
}

const displayLikeCount = computed(() => formatLikeCount(article.value?.likeCount))

watch(
  () => route.params.id,
  async (id) => {
    article.value = null
    loadError.value = ''
    articleLoading.value = true
    codeLangChoiceByIndex.value = {}
    try {
      const data = await fetchArticleById(id)
      article.value = data
    } catch (e) {
      loadError.value = String(e?.message || '加载失败')
    } finally {
      articleLoading.value = false
    }
  },
  { immediate: true },
)

const canRead = computed(() => {
  const a = article.value
  if (!a) return false
  return canReadArticleBody(a.visibility, {
    isLoggedIn: isLoggedIn.value,
    isAdmin: isAdmin.value,
  })
})

async function onLike() {
  const a = article.value
  if (!a?.id || likeSubmitting.value) return
  likeSubmitting.value = true
  try {
    const { likeCount } = await likeArticle(a.id)
    article.value = { ...a, likeCount }
  } catch (e) {
    window.alert(String(e?.response?.data?.error || e?.message || '点赞失败'))
  } finally {
    likeSubmitting.value = false
  }
}

async function onDeleteArticle() {
  const a = article.value
  if (!a?.id) return
  if (!window.confirm(`确定删除文章「${a.title}」？此操作不可恢复。`)) return
  try {
    await deleteArticle(a.id)
    router.replace({ name: 'home' })
  } catch (e) {
    window.alert(String(e?.response?.data?.error || e?.message || '删除失败'))
  }
}
</script>

<style scoped lang="postcss">
.paper-loading {
  @apply flex justify-center items-center min-h-[40vh] px-4;
}

.paper-loading__text {
  @apply text-on-surface-variant;
}

.article-topbar {
  @apply max-w-7xl mx-auto w-full px-4 md:px-8 mb-5 pt-2;
}

.article-back-home {
  @apply inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 transition-colors no-underline rounded-full py-2 pl-1 pr-3 hover:bg-sky-50/80 dark:hover:bg-slate-800/60;
}

.article-back-home__icon {
  @apply text-xl;
}

.paper-hero {
  @apply relative w-full rounded-xl overflow-hidden mb-8 shadow-2xl shadow-sky-900/10;
}

.paper-hero__overlay {
  @apply absolute inset-0 bg-gradient-to-t from-sky-900/80 to-transparent z-10;
}

.paper-hero__img {
  @apply w-full h-[400px] object-cover;
}

.paper-hero__content {
  @apply absolute bottom-0 left-0 p-8 lg:p-12 z-20 w-full;
}

.paper-hero__meta {
  @apply flex items-center space-x-3 mb-4;
}

.paper-hero__pill {
  @apply px-4 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full uppercase tracking-wider;
}

.paper-hero__title {
  @apply text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl;
}

.paper-hero__bottom {
  @apply flex flex-wrap items-center justify-between gap-6;
}

.paper-hero__author {
  @apply flex items-center space-x-4;
}

.paper-hero__avatar {
  @apply w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden;
}

.paper-hero__avatar-img {
  @apply w-full h-full object-cover;
}

.paper-hero__author-text {
  @apply text-white;
}

.paper-hero__author-name {
  @apply text-sm font-bold;
}

.paper-hero__author-date {
  @apply text-xs text-white/70;
}

.paper-hero__actions {
  @apply flex items-center space-x-3;
}

.paper-hero__action-btn {
  @apply flex items-center space-x-2 px-5 py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-sm font-bold rounded-full transition-all duration-300 active:scale-95 no-underline;
}

.paper-hero__action-btn--danger {
  @apply bg-error/80 hover:bg-error;
}

.paper-hero__action-icon {
  @apply text-sm;
}

.paper-grid {
  @apply grid grid-cols-1 gap-8;
}

.paper-main--full {
  @apply max-w-none;
}

.paper-card {
  @apply bg-surface-container-lowest rounded-xl p-8 lg:p-12 shadow-sm;
}

.paper-article {
  @apply prose prose-sky max-w-none text-on-surface-variant leading-relaxed text-lg space-y-8;
}

.paper-article__lead {
  @apply font-medium text-xl text-primary leading-relaxed;
}

.paper-article__h2 {
  @apply text-2xl font-bold text-sky-900 mt-12 mb-4 flex items-center;
}

.paper-article__h2-bar {
  @apply w-2 h-8 rounded-full mr-4;
}

.paper-article__h2-bar--primary {
  @apply bg-primary-container;
}

.paper-quote {
  @apply my-10 rounded-xl overflow-hidden border-l-4 border-primary-container bg-surface-container-low p-8;
}

.paper-quote__text {
  @apply italic text-sky-800 text-xl font-medium;
}

.paper-checklist {
  @apply list-disc space-y-4 my-8 pl-6;
}

.paper-checklist__item {
  @apply list-item;
}

.paper-checklist__icon {
  @apply text-primary;
}

.paper-article__img {
  @apply w-full rounded-lg shadow-lg my-12;
}

:deep(.paper-inline-code) {
  @apply font-mono text-[0.95em] px-1.5 py-0.5 rounded-md bg-slate-900/10 text-sky-900;
}

:global(.dark) :deep(.paper-inline-code) {
  @apply bg-white/10 text-white;
}

.paper-code {
  @apply my-8 rounded-lg overflow-hidden border border-sky-100 bg-slate-950/95;
}

.paper-code__header {
  @apply flex items-center justify-between gap-4 px-4 py-3 border-b border-white/10 bg-white/5;
}

.paper-code__left {
  @apply flex items-center gap-3 min-w-0;
}

.paper-code__label {
  @apply text-xs font-bold uppercase tracking-wider text-white/70;
}

.paper-code__meta {
  @apply text-xs text-white/55 truncate;
}

.paper-code__picker {
  @apply flex justify-end items-center gap-2 shrink-0 ml-auto;
}

.paper-code__picker-label {
  @apply text-xs text-white/60;
}

.paper-code__select {
  @apply text-xs font-semibold bg-slate-900 text-white border border-white/15 rounded-md px-2 py-1 outline-none;
}

.paper-code__select option {
  color: #0f172a;
  background: #ffffff;
}

.paper-code__pre {
  @apply m-0 px-4 py-4 overflow-x-auto text-sm leading-relaxed text-white/90 font-mono;
}

.paper-share {
  @apply mt-16 pt-8 border-t border-sky-50 flex items-center justify-between;
}

.paper-share__left {
  @apply flex items-center space-x-4;
}

.paper-share__btn {
  @apply flex items-center space-x-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-full hover:bg-sky-100 transition-colors;
}

.paper-share__count {
  @apply text-sm font-bold;
}

.paper-share__right {
  @apply flex items-center space-x-2;
}

.paper-share__icon-btn {
  @apply p-2 text-slate-400 hover:text-sky-500 transition-colors;
}

.denied {
  @apply flex justify-center py-8 px-4;
}

.denied__card {
  @apply max-w-lg w-full rounded-xl border border-sky-100 bg-surface-container-low px-8 py-12 text-center shadow-sm;
}

.denied__icon {
  @apply text-5xl text-sky-300 mb-4;
}

.denied__title {
  @apply text-2xl font-bold text-sky-900 mb-2;
}

.denied__text {
  @apply text-on-surface-variant text-sm leading-relaxed mb-6;
}

.denied__back {
  @apply inline-block text-primary font-bold text-sm hover:underline;
}
</style>
