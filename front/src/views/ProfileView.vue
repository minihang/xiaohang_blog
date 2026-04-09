<template>
  <div class="profile-page">
    <section class="profile-page__header">
      <h1 class="profile-page__title">个人中心</h1>
      <p class="profile-page__subtitle">管理显示名称、签名与头像。登录账号不可修改。</p>
    </section>

    <div class="profile-card">
      <p v-if="loadError" class="profile-card__error">{{ loadError }}</p>
      <p v-else-if="loading" class="profile-card__muted">加载中…</p>
      <template v-else>
        <div class="profile-avatar">
          <div class="profile-avatar__preview">
            <img :alt="(displayName || '用户') + ' 的头像'" :src="avatarPreviewSrc" class="profile-avatar__img" />
          </div>
          <div class="profile-avatar__actions">
            <label class="profile-avatar__upload">
              <input
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="profile-avatar__file"
                type="file"
                @change="onAvatarFile"
              />
              <span class="profile-avatar__upload-btn">选择图片</span>
            </label>
            <p class="profile-avatar__hint">JPG / PNG / WebP / GIF，最大 2MB</p>
            <p v-if="avatarError" class="profile-card__error profile-card__error--small">{{ avatarError }}</p>
            <p v-else-if="avatarOk" class="profile-card__ok">{{ avatarOk }}</p>
          </div>
        </div>

        <div class="profile-fields">
          <div>
            <label class="profile-fields__label" for="profile-username">登录账号</label>
            <input
              id="profile-username"
              class="profile-fields__control profile-fields__control--readonly"
              readonly
              type="text"
              :value="username"
            />
          </div>
          <div>
            <label class="profile-fields__label" for="profile-display">显示名称</label>
            <input
              id="profile-display"
              v-model="displayName"
              class="profile-fields__control"
              maxlength="40"
              type="text"
              placeholder="侧栏与导航上展示的名称"
            />
          </div>
          <div>
            <label class="profile-fields__label" for="profile-signature">个人签名</label>
            <textarea
              id="profile-signature"
              v-model="signature"
              class="profile-fields__control profile-fields__control--textarea"
              maxlength="200"
              placeholder="一句话介绍自己"
              rows="3"
            />
          </div>
        </div>

        <p v-if="saveError" class="profile-card__error">{{ saveError }}</p>
        <p v-else-if="saveOk" class="profile-card__ok">{{ saveOk }}</p>
        <button
          class="profile-card__submit"
          type="button"
          :disabled="saving"
          @click="onSaveProfile"
        >
          {{ saving ? '保存中…' : '保存资料' }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { fetchProfile, updateProfile, uploadAvatar } from '../api/profile'
import { resolveAssetUrl } from '../utils/assetUrl'

const auth = useAuthStore()

const loading = ref(true)
const loadError = ref('')
const username = ref('')
const displayName = ref('')
const signature = ref('')
const saving = ref(false)
const saveError = ref('')
const saveOk = ref('')
const avatarError = ref('')
const avatarOk = ref('')

const avatarPreviewSrc = computed(() => {
  const u = auth.user?.avatar
  if (typeof u === 'string' && u.length) return resolveAssetUrl(u)
  return 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
})

function syncFormFromStore() {
  const u = auth.user
  if (!u) return
  username.value = typeof u.username === 'string' ? u.username : ''
  displayName.value = typeof u.name === 'string' ? u.name : ''
  signature.value = typeof u.signature === 'string' ? u.signature : ''
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await fetchProfile()
    auth.applyUser(data.user)
    syncFormFromStore()
  } catch (e) {
    loadError.value = String(e?.response?.data?.error || e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  syncFormFromStore()
  load()
})

watch(
  () => auth.user,
  () => {
    syncFormFromStore()
  },
  { deep: true },
)

async function onSaveProfile() {
  saveError.value = ''
  saveOk.value = ''
  saving.value = true
  try {
    const data = await updateProfile({
      displayName: displayName.value.trim(),
      signature: signature.value.trim(),
    })
    auth.applyUser(data.user)
    saveOk.value = '已保存'
    setTimeout(() => {
      saveOk.value = ''
    }, 2500)
  } catch (e) {
    saveError.value = String(e?.response?.data?.error || e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function onAvatarFile(ev) {
  const input = ev.target
  const file = input?.files?.[0]
  if (input) input.value = ''
  if (!file) return
  avatarError.value = ''
  avatarOk.value = ''
  try {
    const data = await uploadAvatar(file)
    auth.applyUser(data.user)
    avatarOk.value = '头像已更新'
    setTimeout(() => {
      avatarOk.value = ''
    }, 2500)
  } catch (e) {
    avatarError.value = String(e?.response?.data?.error || e?.message || '上传失败')
  }
}
</script>

<style scoped lang="postcss">
.profile-page {
  @apply max-w-lg mx-auto py-8;
}

.profile-page__header {
  @apply mb-8 text-center;
}

.profile-page__title {
  @apply text-3xl font-extrabold text-sky-900 tracking-tight mb-2;
}

.profile-page__subtitle {
  @apply text-on-surface-variant text-sm;
}

.profile-card {
  @apply bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-sky-100 dark:border-slate-700 shadow-xl shadow-sky-900/5 p-8;
}

.profile-card__error {
  @apply text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl mb-4;
}

.profile-card__error--small {
  @apply mb-0 mt-2;
}

.profile-card__ok {
  @apply text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-xl mb-4;
}

.profile-card__muted {
  @apply text-center text-on-surface-variant py-8;
}

.profile-card__submit {
  @apply w-full mt-4 rounded-full bg-primary text-on-primary font-bold py-3 shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50;
}

.profile-avatar {
  @apply flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-8 pb-8 border-b border-sky-100 dark:border-slate-700;
}

.profile-avatar__preview {
  @apply w-28 h-28 rounded-full overflow-hidden border-4 border-sky-100 dark:border-slate-600 shrink-0 shadow-lg;
}

.profile-avatar__img {
  @apply w-full h-full object-cover;
}

.profile-avatar__actions {
  @apply flex-1 text-center sm:text-left;
}

.profile-avatar__upload {
  @apply inline-block cursor-pointer;
}

.profile-avatar__upload-btn {
  @apply inline-flex items-center justify-center rounded-full border-2 border-primary text-primary font-bold px-6 py-2 text-sm hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors;
}

.profile-avatar__hint {
  @apply mt-2 text-xs text-slate-500;
}

.profile-fields {
  @apply space-y-4;
}

.profile-fields__label {
  @apply block text-xs font-semibold text-slate-600 mb-1;
}

.profile-fields__control {
  @apply w-full rounded-2xl border border-sky-100 dark:border-slate-600 bg-sky-50/30 dark:bg-slate-800/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40;
}

.profile-fields__control--readonly {
  @apply opacity-80 cursor-not-allowed bg-slate-100/50 dark:bg-slate-800/80;
}

.profile-fields__control--textarea {
  @apply resize-y min-h-[5rem];
}

.profile-avatar__file {
  @apply sr-only;
}
</style>
