<script setup>
import { catalogCategories } from '../data/catalog'
import { sitePath } from '../utils/site-path'
import CategoryPattern from './CategoryPattern.vue'

defineProps({
  category: { type: Object, required: true },
})

</script>

<template>
  <section class="relative isolate min-h-svh overflow-hidden bg-foreground text-surface" data-header-theme="light" :aria-labelledby="`${category.slug}-title`">
    <CategoryPattern :slug="category.slug" id-prefix="hero" class="pointer-events-none absolute inset-0 size-full text-surface opacity-[0.07]" />

    <div class="site-container absolute inset-x-0 top-28 z-2 sm:top-40">
      <a class="secondary-action inline-flex py-2 text-label font-extrabold tracking-wide text-surface/80 uppercase focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface" :href="sitePath('/katalog/')">← Все напитки</a>
      <nav class="mx-auto mt-6 flex w-max max-w-full gap-3 overflow-x-auto nav:absolute nav:top-0 nav:left-1/2 nav:mt-0 nav:-translate-x-1/2" aria-label="Виды напитков">
        <a
          v-for="drink in catalogCategories"
          :key="drink.slug"
          class="inline-flex min-h-12 shrink-0 items-center rounded-full border border-surface/60 px-5 py-3 text-label font-extrabold uppercase transition-colors focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-surface"
          :class="drink.slug === category.slug ? 'bg-surface text-foreground' : 'text-surface hover:bg-surface hover:text-foreground'"
          :href="sitePath(`/katalog/${drink.slug}/`)"
          :aria-current="drink.slug === category.slug ? 'page' : undefined"
        >
          {{ drink.name }}
        </a>
      </nav>
    </div>
    <div class="site-container relative z-1 flex min-h-svh flex-col items-center justify-center pt-28 pb-40 text-center sm:pt-36 sm:pb-48">
      <h1 :id="`${category.slug}-title`" class="font-display text-h1 break-words hyphens-auto uppercase">{{ category.name }}</h1>
      <p class="mt-6 max-w-2xl text-body-large font-medium text-surface/80">{{ category.heroDescription }}</p>
    </div>
    <img class="absolute top-[66%] left-1/2 w-[125vw] max-w-none -translate-x-1/2 sm:top-[62%] sm:w-[90vw] nav:top-[60%] nav:w-[75vw]" :src="category.image" :alt="category.imageAlt">
  </section>
</template>
