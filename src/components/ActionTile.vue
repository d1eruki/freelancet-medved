<script setup>
import CircleArrow from './CircleArrow.vue'

defineProps({
  href: { type: String, required: true },
  label: { type: String, required: true },
  title: { type: String, required: true },
  tone: { type: String, default: 'brand' },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <a
    class="group flex flex-col rounded-3xl p-6 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface"
    :class="[
      tone === 'brand' ? 'bg-brand' : 'bg-surface text-foreground',
      compact ? 'min-h-44 sm:p-8 nav:min-h-52 wide:p-10' : 'min-h-64 sm:p-10',
    ]"
    :href="href"
  >
    <span class="mt-auto text-label font-extrabold tracking-widest uppercase" :class="{ 'text-brand': tone === 'surface' }">{{ label }}</span>
    <span class="mt-6 flex items-end justify-between gap-8" :class="compact ? 'flex-nowrap' : 'flex-wrap'">
      <span class="min-w-0 font-display text-h3 uppercase">{{ title }}</span>
      <CircleArrow :hover="tone === 'brand' ? 'detail' : 'brand'" size="action" :tone="tone === 'brand' ? 'surface' : 'brand'" />
    </span>
  </a>
</template>
