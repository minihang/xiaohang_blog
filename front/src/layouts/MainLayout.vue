<template>
  <div>
    <TopNavBar />
    <div v-if="showSideNav" class="layout-shell">
      <SideNavBar />
      <main class="layout-shell__main">
        <RouterView />
      </main>
    </div>
    <div v-else class="layout-wide">
      <main class="layout-wide__main">
        <RouterView />
      </main>
    </div>
    <FooterBar />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TopNavBar from '../components/TopNavBar.vue'
import SideNavBar from '../components/SideNavBar.vue'
import FooterBar from '../components/FooterBar.vue'

const route = useRoute()

const showSideNav = computed(() => route.meta?.sideNav !== false)
</script>

<style scoped lang="postcss">
.layout-shell {
  @apply flex max-w-7xl mx-auto pt-24 px-4 min-h-screen;
}

.layout-shell__main {
  @apply flex-grow lg:ml-8 pb-20;
}

.layout-wide {
  @apply flex pt-24 min-h-screen max-w-[1600px] mx-auto;
}

.layout-wide__main {
  @apply flex-1 px-4 md:px-12 pb-20 overflow-x-hidden;
}
</style>
