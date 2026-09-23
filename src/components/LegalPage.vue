<script setup>
import { onMounted } from 'vue'

const props = defineProps({
  page: {
    type: Object,
    required: true,
  },
})

onMounted(() => {
  document.title = props.page.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', '')
})
</script>

<template>
  <div>
    <section class="bg-foreground pt-32 pb-20 text-surface sm:pt-40 sm:pb-24 wide:pb-28" data-header-theme="light" aria-labelledby="legal-page-title">
      <div class="site-container">
        <h1 id="legal-page-title" class="font-display text-h1 break-words uppercase">
          {{ page.title }}
        </h1>
      </div>
    </section>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-label="Текст документа">
      <div class="site-container">
        <article class="legal-copy max-w-4xl text-body font-medium" data-typography-ignore v-html="page.html"></article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.legal-copy :deep(p) {
  margin-top: calc(var(--spacing) * 6);
  line-height: 1.7;
}

.legal-copy :deep(p:first-child),
.legal-copy :deep(h2:first-child) {
  margin-top: 0;
}

.legal-copy :deep(p:has(> strong)) {
  margin-top: calc(var(--spacing) * 12);
}

.legal-copy :deep(h2) {
  margin-top: calc(var(--spacing) * 12);
  font-family: var(--font-display), sans-serif;
  font-size: var(--text-h4);
  line-height: 1.2;
}

.legal-copy :deep(ul) {
  margin-top: calc(var(--spacing) * 6);
  padding-left: 1.5rem;
  list-style: disc;
}

.legal-copy :deep(li) {
  margin-top: calc(var(--spacing) * 2);
  line-height: 1.7;
}

.legal-copy :deep(a) {
  color: var(--color-brand);
  text-decoration: underline;
  text-underline-offset: 0.25rem;
  overflow-wrap: anywhere;
}

.legal-copy :deep(a:focus-visible) {
  outline: 3px solid var(--color-brand);
  outline-offset: 3px;
}
</style>
