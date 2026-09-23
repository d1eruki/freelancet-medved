<script setup>
import CircleArrow from './CircleArrow.vue'
import { sitePath } from '../utils/site-path'

defineProps({
  category: { type: Object, required: true },
})
</script>

<template>
  <li>
    <a
      class="group flex h-full min-h-144 flex-col overflow-hidden rounded-3xl bg-surface p-6 transition-colors duration-300 hover:bg-brand hover:text-surface focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand sm:p-8"
      :href="sitePath(`/katalog/${category.slug}/`)"
    >
      <div class="relative grid min-h-20 place-items-center overflow-hidden rounded-2xl">
        <img class="h-64 w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-105" :src="category.image" :alt="category.imageAlt">
      </div>
      <div class="mt-10">
        <h3 class="font-display text-h4 uppercase">{{ category.name }}</h3>
        <p class="mt-6 mb-10 text-body font-medium text-subtle transition-colors group-hover:text-surface/80">{{ category.description }}</p>
        <span class="mt-auto flex items-center justify-between gap-4 border-t border-foreground/15 pt-6 text-label font-extrabold tracking-wide uppercase group-hover:border-surface/40">
          <span>Смотреть ассортимент</span>
          <CircleArrow hover="detail" size="action" />
        </span>
      </div>
    </a>
  </li>
</template>
