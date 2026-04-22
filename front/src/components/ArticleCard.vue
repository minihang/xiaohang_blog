<template>
  <article class="article-card group">
    <div v-if="isPinned" class="article-card__pin-wrap">
      <span class="article-card__pin-mark">
        <span class="material-symbols-outlined article-card__pin-icon">keep</span>
        <span>已置顶</span>
      </span>
    </div>
    <div class="article-card__media">
      <img class="article-card__img" :src="resolveAssetUrl(imageUrl)" :alt="imageAlt || ''" />
      <div class="article-card__badge-wrap">
        <span class="article-card__badge">{{ category }}</span>
      </div>
    </div>

    <div class="article-card__body">
      <div>
        <div class="article-card__meta">
          <span class="article-card__meta-item article-card__meta-item--date">
            <span class="material-symbols-outlined article-card__meta-icon">calendar_today</span>
            {{ date }}
          </span>
          <span class="article-card__meta-item" :class="accessClass">
            <span class="material-symbols-outlined article-card__meta-icon">{{ accessIcon }}</span>
            {{ accessLabel }}
          </span>
        </div>

        <h2 class="article-card__title">
          {{ title }}
        </h2>

        <p class="article-card__excerpt">
          {{ excerpt }}
        </p>
      </div>

      <div class="article-card__footer">
        <button class="article-card__btn" type="button" @click="$emit('read', id)">
          {{ actionText }}
          <span class="material-symbols-outlined article-card__btn-icon">{{ actionIcon }}</span>
        </button>
        <button v-if="canPin" class="article-card__pin-btn" type="button" :disabled="pinLoading"
          @click="$emit('toggle-pin', id)">
          <span class="material-symbols-outlined article-card__pin-icon">{{ isPinned ? 'keep_off' : 'keep' }}</span>
          <span>{{ pinLoading ? '处理中…' : isPinned ? '取消置顶' : '置顶' }}</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { resolveAssetUrl } from '../utils/assetUrl'

const props = defineProps({
  id: { type: [String, Number], required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  imageAlt: { type: String, default: '' },
  date: { type: String, required: true },
  access: { type: String, default: 'public' }, // public | login | admin
  isPinned: { type: Boolean, default: false },
  canPin: { type: Boolean, default: false },
  pinLoading: { type: Boolean, default: false },
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  actionText: { type: String, default: '阅读全文' },
  actionIcon: { type: String, default: 'arrow_right_alt' },
  /** 列表接口会带上，卡片可不展示 */
  likeCount: { type: Number, default: undefined },
})

defineEmits({
  read: () => true,
  'toggle-pin': () => true,
})

const accessLabel = computed(() => {
  if (props.access === 'login') return '登录可见'
  if (props.access === 'admin') return '仅管理员'
  return '所有人'
})

const accessIcon = computed(() => {
  if (props.access === 'login') return 'person'
  if (props.access === 'admin') return 'admin_panel_settings'
  return 'lock_open'
})

const accessClass = computed(() => {
  if (props.access === 'login') return 'article-card__meta-item--login'
  if (props.access === 'admin') return 'article-card__meta-item--admin'
  return 'article-card__meta-item--public'
})
</script>

<style scoped lang="postcss">
.article-card {
  @apply relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl shadow-sky-900/5 hover:shadow-sky-900/10 transition-all duration-500 flex flex-col md:flex-row w-full;
}

.article-card__media {
  @apply md:w-1/3 relative overflow-hidden;
}

.article-card__img {
  @apply h-64 md:h-full w-full object-cover group-hover:scale-110 transition-transform duration-700;
}

.article-card__badge-wrap {
  @apply absolute top-4 left-4;
}

.article-card__pin-wrap {
  @apply absolute top-4 right-8 z-10;
}

.article-card__badge {
  @apply bg-tertiary-container text-on-tertiary-container text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full backdrop-blur-md;
}

.article-card__body {
  @apply md:w-2/3 p-8 flex flex-col justify-between;
}

.article-card__meta {
  @apply flex items-center gap-3 mb-4;
}

.article-card__meta-item {
  @apply flex items-center gap-1 text-xs font-bold uppercase tracking-tighter;
}

.article-card__meta-item--date {
  @apply text-sky-600/60;
}

.article-card__meta-item--public {
  @apply text-emerald-500;
}

.article-card__meta-item--login {
  @apply text-amber-500;
}

.article-card__meta-item--admin {
  @apply text-red-500;
}

.article-card__meta-icon {
  @apply text-sm;
}

.article-card__title {
  @apply text-2xl font-bold text-sky-950 mb-3 group-hover:text-primary transition-colors;
}

.article-card__excerpt {
  @apply text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-2;
}

.article-card__footer {
  @apply flex items-center justify-between mt-auto;
}

.article-card__btn {
  @apply text-primary font-bold text-sm flex items-center gap-1;
}

.article-card__pin-btn {
  @apply text-xs font-bold px-3 py-1.5 rounded-full border border-sky-200 text-sky-700 bg-white/90 backdrop-blur-sm hover:bg-sky-50 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1;
}

.article-card__pin-mark {
  @apply text-xs font-bold px-3 py-1.5 rounded-full bg-sky-100/90 text-sky-700 border border-sky-300/60 inline-flex items-center gap-1 backdrop-blur-sm shadow-sm;
}

.article-card__pin-icon {
  @apply text-base;
}

.article-card__btn-icon {
  @apply transition-transform;
}

.article-card__btn:hover .article-card__btn-icon {
  @apply translate-x-1;
}
</style>
