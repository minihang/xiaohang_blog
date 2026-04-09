<template>
  <footer class="footer">
    <div class="footer__links">
      <p class="footer__link">
        联系邮箱：affectionatexiaohang@gmail.com
      </p>
      <p class="footer__link">
        QQ：1017567247
      </p>
      <p class="footer__link">
        联系支持
      </p>
    </div>
    <p class="footer__copyright">
      © 2026 蔚蓝清风 | 保持好奇与热爱
    </p>
  </footer>
</template>

<script setup></script>

<style scoped lang="postcss">
.footer {
  @apply bg-white rounded-t-[3rem] mt-20 w-full py-12 px-8 flex flex-col items-center gap-4;
}

.footer__links {
  @apply flex gap-8 mb-4;
}

.footer__link {
  @apply text-slate-400 hover:text-sky-400 text-xs tracking-widest underline decoration-sky-300 underline-offset-4 opacity-80 hover:opacity-100 transition-opacity;
}

.footer__copyright {
  @apply text-slate-400 text-xs uppercase tracking-widest opacity-80;
}
</style>
