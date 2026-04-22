<template>
  <div class="toast-list" aria-live="polite" aria-atomic="true">
    <TransitionGroup name="toast-fade" tag="div" class="toast-list__inner">
      <div v-for="item in toast.state.items" :key="item.id" class="toast-item" :class="{
        'toast-item--success': item.type === 'success',
        'toast-item--error': item.type === 'error',
        'toast-item--info': item.type === 'info',
      }" role="status">
        {{ item.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
defineProps({
  toast: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped lang="postcss">
.toast-list {
  @apply fixed top-24 left-1/2 z-[1000] -translate-x-1/2 pointer-events-none;
}

.toast-list__inner {
  @apply flex flex-col gap-2;
}

.toast-item {
  @apply rounded-full px-6 py-3 text-sm font-semibold shadow-sm backdrop-blur-sm;
}

.toast-item--success {
  @apply bg-emerald-100/70 text-emerald-700;
}

.toast-item--error {
  @apply bg-red-100/70 text-red-700;
}

.toast-item--info {
  @apply bg-sky-100/70 text-sky-700;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.toast-fade-enter-to,
.toast-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
