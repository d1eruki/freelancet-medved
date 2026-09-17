<script setup>
import CircleArrow from './CircleArrow.vue'

defineProps({
  headingId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  href: { type: String, required: true },
  label: { type: String, required: true },
  background: { type: String, default: 'brand' },
})
</script>

<template>
  <section
    class="py-20 text-surface sm:py-24 wide:py-28"
    :class="background === 'brand' ? 'bg-brand' : 'bg-foreground'"
    data-header-theme="light"
    :aria-labelledby="headingId"
  >
    <div class="site-container grid items-end gap-10 nav:grid-cols-12">
      <div class="nav:col-span-8">
        <h2 :id="headingId" class="font-display text-h2 break-words hyphens-auto uppercase">{{ title }}</h2>
        <p class="mt-7 max-w-2xl text-body-large font-medium text-surface/85">{{ description }}</p>
      </div>
      <a class="group inline-flex items-center justify-between gap-6 border-t border-surface/50 pt-5 text-label font-extrabold tracking-wide uppercase focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface nav:col-span-4" :href="href">
        <span class="secondary-action py-3">{{ label }}</span>
        <CircleArrow hover="detail" size="action" tone="surface" />
      </a>
    </div>
  </section>
</template>
