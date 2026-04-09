<template>
  <div class="edit-card">
    <div class="edit-card__header">
      <div>
        <h1 class="edit-card__title">{{ isNew ? '发布新文章' : '编辑文章' }}</h1>
        <p class="edit-card__subtitle">
          填写元数据与正文块（类 Markdown）；保存后将解析为内容块并跳转文章详情。需管理员权限。
        </p>
      </div>
      <button class="edit-card__back" type="button" @click="onBackHome">返回首页</button>
    </div>

    <p v-if="loading" class="edit-card__status">加载中…</p>
    <p v-else-if="loadError" class="edit-card__error">{{ loadError }}</p>

    <div v-else class="edit-form">
      <div class="edit-form__grid">
        <div>
          <label class="edit-form__label" for="edit-title">标题</label>
          <input id="edit-title" v-model="title" class="edit-form__control" maxlength="200" placeholder="文章标题"
            type="text" />
        </div>
        <div>
          <label class="edit-form__label" for="edit-category">分类</label>
          <select id="edit-category" v-model="category" class="edit-form__control edit-form__control--select">
            <option v-for="c in ARTICLE_CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label class="edit-form__label" for="edit-visibility">可见性</label>
          <select id="edit-visibility" v-model="visibility" class="edit-form__control edit-form__control--select">
            <option value="public">公开</option>
            <option value="login">仅登录</option>
            <option value="admin">仅管理员</option>
          </select>
        </div>
        <div>
          <label class="edit-form__label" for="edit-date">日期文案</label>
          <input id="edit-date" v-model="datePicker" class="edit-form__control" type="date" />
        </div>
        <div class="edit-form__span2">
          <label class="edit-form__label" for="edit-excerpt">摘要</label>
          <textarea id="edit-excerpt" v-model="excerpt" class="edit-form__control edit-form__control--textarea"
            maxlength="500" placeholder="列表页展示的摘要" rows="2" />
        </div>
        <div>
          <label class="edit-form__label" for="edit-image">列表封面 URL</label>
          <input id="edit-image" v-model="imageUrl" class="edit-form__control" placeholder="https://…" type="url" />
        </div>
        <div>
          <label class="edit-form__label" for="edit-hero">详情头图 URL</label>
          <input id="edit-hero" v-model="heroImage" class="edit-form__control" placeholder="https://…" type="url" />
        </div>
      </div>

      <div>
        <div class="edit-form__blocks-head">
          <label class="edit-form__label" for="edit-blocks">正文（类 Markdown）</label>
          <div class="edit-form__blocks-actions">
            <button class="edit-mini edit-mini--ghost" type="button" @click="isPreview = !isPreview">
              {{ isPreview ? '返回编辑' : '预览样式' }}
            </button>
          </div>
        </div>
        <p class="edit-form__hint">
          支持 7 种模块：<code>lead</code>、<code>h2</code>、<code>p</code>、<code>quote</code>、<code>checklist</code>、<code>img</code>、<code>code</code>。行内语法：<code>**加粗**</code>。
          快捷键：<code>Ctrl+2</code> 标题、<code>Ctrl+Q</code> 引用、<code>Ctrl+U</code> 无序列表、<code>Ctrl+B</code> 加粗、<code>Ctrl+Shift+K</code> 代码块、<code>Ctrl+Shift+`</code> 行内代码、<code>Ctrl+Shift+I</code> 图片、<code>Ctrl+Shift+L</code> Lead。
        </p>
        <div class="edit-md">
          <div v-if="!isPreview" class="edit-md__pane">
            <textarea
              id="edit-blocks"
              ref="mdEl"
              v-model="blocksMd"
              class="edit-form__control edit-form__control--code edit-md__textarea"
              spellcheck="false"
              @input="autoResizeMd"
              @paste="onMdPaste"
              @keydown="onMdKeydown"
            />
            <p v-if="mdError" class="edit-md__error">{{ mdError }}</p>
          </div>
          <div v-else class="edit-md__pane edit-md__preview">
            <article class="paper-article paper-article--preview">
              <template v-for="(block, i) in previewBlocks" :key="i">
                <p v-if="block.type === 'lead'" class="paper-article__lead" v-html="renderInlineMarkdown(block.text)">
                </p>
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
                    <span class="paper-code__label">Code</span>
                    <span class="paper-code__meta">{{ block.lang ? `lang: ${block.lang}` : 'lang: auto' }}</span>
                  </div>
                  <pre
                    class="paper-code__pre"><code class="hljs" v-html="highlightPreviewCode(block).html"></code></pre>
                </div>
                <img v-else-if="block.type === 'img'" class="paper-article__img" alt="" :src="resolveAssetUrl(block.src)" />
              </template>
            </article>
          </div>
        </div>
      </div>

      <p v-if="saveError" class="edit-card__error">{{ saveError }}</p>

      <div class="edit-form__actions">
        <button class="edit-form__btn edit-form__btn--secondary" type="button" @click="reset">重置</button>
        <button class="edit-form__btn edit-form__btn--primary" type="button" :disabled="saving" @click="onSave">
          {{ saving ? '保存中…' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { ARTICLE_CATEGORIES } from '../data/articles'
import { createArticle, fetchArticleById, updateArticle } from '../api/articles'
import { uploadArticleImage } from '../api/uploads'
import { useAuthStore } from '../stores/auth'
import { blocksToPaperMarkdown, parsePaperMarkdown } from '../utils/paperMarkdown'
import { renderInlineMarkdown } from '../utils/inlineCode'
import { resolveAssetUrl } from '../utils/assetUrl'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { user } = storeToRefs(auth)

const isNew = computed(() => route.name === 'edit-new')

const category = ref('随笔')
const visibility = ref('public')
const date = ref('')
const datePicker = ref('')
const title = ref('')
const excerpt = ref('')
const imageUrl = ref('')
const heroImage = ref('')
const blocksMd = ref('')
const mdEl = ref(null)
const isPreview = ref(false)

const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const saveError = ref('')
const mdError = ref('')

const previewBlocks = computed(() => {
  const res = parsePaperMarkdown(blocksMd.value)
  mdError.value = res.error ? String(res.error) : ''
  return res.blocks || []
})

function autoResizeMd() {
  const el = mdEl.value
  if (!el) return
  // reset then grow to content height
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

async function onMdPaste(e) {
  const el = mdEl.value
  const items = e?.clipboardData?.items
  if (!el || !items || items.length === 0) return

  const imgItem = Array.from(items).find((it) => it && it.kind === 'file' && /^image\//i.test(it.type))
  if (!imgItem) return

  const file = imgItem.getAsFile()
  if (!file) return

  e.preventDefault()

  try {
    const { url } = await uploadArticleImage(file)
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const v = blocksMd.value
    const insert = `\n![](${url})\n`
    blocksMd.value = v.slice(0, start) + insert + v.slice(end)
    nextTick(() => {
      el.focus()
      const cursor = start + '\n![]('.length
      el.setSelectionRange(cursor, cursor)
      autoResizeMd()
    })
  } catch (err) {
    window.alert(String(err?.response?.data?.error || err?.message || '图片上传失败'))
  }
}

onMounted(() => {
  nextTick(() => autoResizeMd())
})

watch(
  () => blocksMd.value,
  () => {
    nextTick(() => autoResizeMd())
  },
)

watch(
  () => isPreview.value,
  (v) => {
    if (!v) nextTick(() => autoResizeMd())
  },
)

function highlightPreviewCode(block) {
  const code = typeof block?.code === 'string' ? block.code : ''
  const lang = typeof block?.lang === 'string' ? block.lang.trim() : ''
  if (!code) return { html: '' }
  if (lang) {
    try {
      return { html: hljs.highlight(code, { language: lang }).value }
    } catch {
      // fallback
    }
  }
  return { html: hljs.highlightAuto(code).value }
}

function todayText() {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}.${String(m).padStart(2, '0')}.${String(day).padStart(2, '0')}`
}

function todayPickerValue() {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function pickerToText(v) {
  const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return ''
  return `${m[1]}.${m[2]}.${m[3]}`
}

function textToPicker(v) {
  const s = String(v || '').trim()
  const a = s.match(/^(\d{4})\.(\d{2})\.(\d{2})$/)
  if (a) return `${a[1]}-${a[2]}-${a[3]}`
  const b = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (b) return `${b[1]}-${b[2]}-${b[3]}`
  return ''
}

function publishedLineFromPicker(v) {
  const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return publishedLineFromPicker(todayPickerValue())
  const y = Number(m[1])
  const mo = Number(m[2])
  const day = Number(m[3])
  return `发布于 ${y}年${mo}月${day}日`
}

function defaultBlocksTemplate() {
  return [
    ':::lead',
    '开篇导语。',
    ':::',
    '',
    '**加粗文本**',
    '',
    '## 小标题',
    '',
    '正文段落。',
    '',
    '- 列表项1',
    '- 列表项2（含 `行内代码`）',
    '',
    '> 引用示例',
    '',
    '![](https://example.com/image.png)',
    '',
    '```js',
    "console.log('hello')",
    '```',
  ].join('\n')
}

function applyDefaults() {
  category.value = '随笔'
  visibility.value = 'public'
  datePicker.value = todayPickerValue()
  date.value = pickerToText(datePicker.value) || todayText()
  title.value = ''
  excerpt.value = ''
  imageUrl.value = ''
  heroImage.value = ''
  blocksMd.value = defaultBlocksTemplate()
  mdError.value = ''
  isPreview.value = false
}

async function loadArticle(id) {
  loading.value = true
  loadError.value = ''
  try {
    const a = await fetchArticleById(id)
    if (!a) {
      loadError.value = '文章不存在'
      return
    }
    category.value = a.category
    visibility.value = a.visibility
    date.value = a.date
    datePicker.value = textToPicker(a.date) || todayPickerValue()
    title.value = a.title
    excerpt.value = a.excerpt || ''
    imageUrl.value = a.imageUrl || ''
    heroImage.value = a.heroImage || ''
    blocksMd.value = blocksToPaperMarkdown(a.blocks || [])
    mdError.value = ''
    isPreview.value = false
  } catch (e) {
    loadError.value = String(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => datePicker.value,
  (v) => {
    const t = pickerToText(v)
    if (t) date.value = t
  },
)

watch(
  () => ({ name: route.name, id: route.params.id }),
  ({ name, id }) => {
    if (name === 'edit-new') {
      applyDefaults()
      loadError.value = ''
      return
    }
    if (name === 'edit' && id != null && id !== '') {
      loadArticle(id)
    }
  },
  { immediate: true },
)

function buildPayload() {
  const parsed = parsePaperMarkdown(blocksMd.value)
  if (parsed.error) throw new Error(String(parsed.error))
  const blocks = parsed.blocks
  const authorName = typeof user.value?.name === 'string' && user.value.name.trim() ? user.value.name.trim() : '博主'
  return {
    category: category.value,
    visibility: visibility.value,
    date: date.value.trim(),
    title: title.value.trim(),
    excerpt: excerpt.value.trim(),
    imageUrl: imageUrl.value.trim(),
    heroImage: heroImage.value.trim(),
    authorName,
    authorPublished: publishedLineFromPicker(datePicker.value),
    blocks,
  }
}

function insertIntoTextarea(el, text) {
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const v = blocksMd.value
  blocksMd.value = v.slice(0, start) + text + v.slice(end)
  nextTick(() => {
    el.focus()
    const p = start + text.length
    el.setSelectionRange(p, p)
  })
}

function onMdKeydown(e) {
  const el = mdEl.value
  if (!el) return
  if (e.ctrlKey && !e.shiftKey && e.key === '2') {
    e.preventDefault()
    insertIntoTextarea(el, '\n## ')
    return
  }
  if (e.ctrlKey && e.shiftKey && (e.code === 'Backquote' || e.key === '`')) {
    e.preventDefault()
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const v = blocksMd.value
    if (end > start) {
      const selected = v.slice(start, end)
      blocksMd.value = v.slice(0, start) + `\`${selected}\`` + v.slice(end)
      nextTick(() => {
        el.focus()
        el.setSelectionRange(start + 1, end + 1)
      })
    } else {
      blocksMd.value = v.slice(0, start) + '``' + v.slice(end)
      nextTick(() => {
        el.focus()
        el.setSelectionRange(start + 1, start + 1)
      })
    }
    return
  }
  if (e.ctrlKey && !e.shiftKey && (e.key === 'B' || e.key === 'b')) {
    e.preventDefault()
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const v = blocksMd.value
    if (end > start) {
      const selected = v.slice(start, end)
      blocksMd.value = v.slice(0, start) + `**${selected}**` + v.slice(end)
      nextTick(() => {
        el.focus()
        el.setSelectionRange(start + 2, end + 2)
      })
    } else {
      blocksMd.value = v.slice(0, start) + '****' + v.slice(end)
      nextTick(() => {
        el.focus()
        el.setSelectionRange(start + 2, start + 2)
      })
    }
    return
  }
  if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
    e.preventDefault()
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const text = '\n:::lead\n\n:::\n'
    const v = blocksMd.value
    blocksMd.value = v.slice(0, start) + text + v.slice(end)
    nextTick(() => {
      el.focus()
      el.setSelectionRange(start + '\n:::lead\n'.length, start + '\n:::lead\n'.length)
    })
    return
  }
  if (e.ctrlKey && !e.shiftKey && (e.key === 'Q' || e.key === 'q')) {
    e.preventDefault()
    insertIntoTextarea(el, '\n> ')
    return
  }
  if (e.ctrlKey && !e.shiftKey && (e.key === 'U' || e.key === 'u')) {
    e.preventDefault()
    insertIntoTextarea(el, '\n- ')
    return
  }
  if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
    e.preventDefault()
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const text = '\n```\n\n```\n'
    const v = blocksMd.value
    blocksMd.value = v.slice(0, start) + text + v.slice(end)
    nextTick(() => {
      el.focus()
      el.setSelectionRange(start + '\n```\n'.length, start + '\n```\n'.length)
    })
    return
  }
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
    e.preventDefault()
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const text = '\n![]()\n'
    const v = blocksMd.value
    blocksMd.value = v.slice(0, start) + text + v.slice(end)
    nextTick(() => {
      el.focus()
      el.setSelectionRange(start + '\n![]('.length, start + '\n![]('.length)
    })
    return
  }
}

async function onSave() {
  saveError.value = ''
  let payload
  try {
    payload = buildPayload()
  } catch (e) {
    saveError.value = String(e?.message || '校验失败')
    return
  }
  saving.value = true
  try {
    if (isNew.value) {
      const created = await createArticle(payload)
      router.replace({ name: 'article', params: { id: String(created.id) } })
    } else {
      await updateArticle(route.params.id, payload)
      router.replace({ name: 'article', params: { id: String(route.params.id) } })
    }
  } catch (e) {
    saveError.value = String(e?.response?.data?.error || e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function reset() {
  saveError.value = ''
  if (isNew.value) {
    applyDefaults()
  } else if (route.params.id) {
    loadArticle(route.params.id)
  }
}

function onBackHome() {
  const ok = window.confirm('确定要返回首页吗？已编辑的内容将会丢失。')
  if (!ok) return
  router.push({ name: 'home' })
}
</script>

<style scoped lang="postcss">
.edit-card {
  @apply bg-surface-container-lowest rounded-xl p-8 lg:p-12 shadow-sm max-w-6xl mx-auto w-full;
}

.edit-card__header {
  @apply flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8;
}

.edit-card__title {
  @apply text-3xl lg:text-4xl font-extrabold text-sky-900 tracking-tight mb-2;
}

.edit-card__subtitle {
  @apply text-on-surface-variant text-sm max-w-xl;
}

.edit-card__back {
  @apply shrink-0 bg-sky-100 text-sky-900 px-4 py-2 rounded-full font-bold text-xs hover:bg-sky-200 transition-colors no-underline text-center;
}

.edit-card__status {
  @apply text-on-surface-variant text-center py-12;
}

.edit-card__error {
  @apply text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl mb-4;
}

.edit-form {
  @apply grid grid-cols-1 gap-8;
}

.edit-form__grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.edit-form__span2 {
  @apply md:col-span-2;
}

.edit-form__label {
  @apply block text-sm font-semibold text-on-surface-variant mb-2 px-1;
}

.edit-form__hint {
  @apply text-xs text-on-surface-variant mb-2 leading-relaxed;
}

.edit-form__hint code {
  @apply px-1 rounded bg-sky-100/80 dark:bg-slate-800 text-sky-800 dark:text-sky-200 text-[0.7rem];
}

.edit-form__blocks-head {
  @apply flex items-center justify-between gap-4;
}

.edit-form__blocks-actions {
  @apply flex flex-wrap gap-2 justify-end;
}

.edit-mini {
  @apply text-xs font-bold px-3 py-1.5 rounded-full bg-sky-100 text-sky-900 hover:bg-sky-200 transition-colors;
}

.edit-mini--ghost {
  @apply bg-white text-sky-900 border border-sky-200 hover:bg-sky-50;
}

.edit-form__control {
  @apply w-full bg-surface-container-high border-none rounded-2xl py-3 px-5 focus:ring-2 focus:ring-primary-container text-on-surface placeholder-outline-variant transition-all duration-300;
}

.edit-form__control--select {
  @apply cursor-pointer;
}

.edit-form__control--textarea {
  @apply resize-y min-h-[4rem];
}

.edit-form__control--code {
  @apply font-mono text-sm leading-relaxed resize-y min-h-[12rem];
}

.edit-md {
  @apply grid grid-cols-1 gap-6;
}

.edit-md__pane {
  @apply min-w-0;
}

.edit-md__textarea {
  @apply min-h-[22rem] outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none resize-none overflow-hidden;
}

textarea.edit-md__textarea:focus {
  outline: none;
  box-shadow: none;
}

.edit-md__preview {
  @apply rounded-2xl border border-sky-100 bg-surface-container-lowest p-6 overflow-hidden;
}

.edit-md__error {
  @apply mt-2 text-sm text-red-600;
}

.paper-article--preview {
  @apply text-base;
}

.paper-article {
  @apply prose prose-sky max-w-none text-on-surface-variant leading-relaxed space-y-8;
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

.paper-code__label {
  @apply text-xs font-bold uppercase tracking-wider text-white/70;
}

.paper-code__meta {
  @apply text-xs text-white/55 truncate;
}

.paper-code__pre {
  @apply m-0 px-4 py-4 overflow-x-auto text-sm leading-relaxed text-white/90 font-mono;
}

.edit-form__actions {
  @apply flex flex-wrap gap-3 justify-end;
}

.edit-form__btn {
  @apply px-6 py-3 rounded-full font-bold text-sm transition-colors;
}

.edit-form__btn--secondary {
  @apply bg-sky-100 text-sky-900 hover:bg-sky-200;
}

.edit-form__btn--primary {
  @apply bg-primary text-on-primary shadow-lg shadow-sky-200 hover:scale-[1.01] active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100;
}
</style>
