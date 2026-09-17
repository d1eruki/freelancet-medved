<script setup>
import { sitePath } from '../utils/site-path'

defineProps({
  category: { type: Object, required: true },
})

const patternPaths = {
  medovuha: 'M -10 -18 H 10 L 20 0 L 10 18 H -10 L -20 0 Z',
  sidr: 'M 0 -14 C -7 -20 -18 -18 -20 -8 C -23 2 -16 18 -8 22 C -3 25 -1 21 0 21 C 1 21 3 25 8 22 C 16 18 23 2 20 -8 C 18 -18 7 -20 0 -14 Z M -1 -14 L -2 -26 L 1 -27 L 2 -14 Z M 1 -23 C 5 -29 13 -30 17 -26 C 14 -20 8 -19 1 -23 Z',
  puare: 'M 0 -24 C -7 -24 -10 -17 -9 -11 C -8 -5 -12 -2 -16 5 C -21 14 -16 24 -7 27 C -3 29 3 29 7 27 C 16 24 21 14 16 5 C 12 -2 8 -5 9 -11 C 10 -17 7 -24 0 -24 Z M -1 -24 L 0 -35 L 3 -35 L 2 -24 Z M 2 -30 C 6 -36 12 -36 16 -32 C 13 -27 7 -25 2 -30 Z',
}

const patternPositions = [
  { x: 56, y: 56 },
  { x: 168, y: 56 },
  { x: 0, y: 168 },
  { x: 112, y: 168 },
  { x: 224, y: 168 },
]
</script>

<template>
  <section class="relative isolate min-h-svh overflow-hidden bg-foreground text-surface" data-header-theme="light" :aria-labelledby="`${category.slug}-title`">
    <svg class="pointer-events-none absolute inset-0 size-full text-surface opacity-[0.07]" aria-hidden="true" focusable="false">
      <defs>
        <pattern :id="`${category.slug}-pattern`" width="224" height="224" patternUnits="userSpaceOnUse">
          <g fill="currentColor">
            <path
              v-for="position in patternPositions"
              :key="`${position.x}-${position.y}`"
              :d="patternPaths[category.slug]"
              :transform="`translate(${position.x} ${position.y})`"
            />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" :fill="`url(#${category.slug}-pattern)`" />
    </svg>

    <div class="site-container absolute inset-x-0 top-28 z-2 sm:top-40">
      <a class="secondary-action inline-flex py-2 text-label font-extrabold tracking-wide text-surface/80 uppercase focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface" :href="sitePath('/katalog/')">← Все напитки</a>
    </div>
    <div class="site-container relative z-1 flex min-h-svh flex-col items-center justify-center pt-28 pb-40 text-center sm:pt-36 sm:pb-48">
      <h1 :id="`${category.slug}-title`" class="font-display text-h1 break-words hyphens-auto uppercase">{{ category.name }}</h1>
      <p class="mt-8 max-w-2xl text-body-large font-medium text-surface/80">{{ category.description }}</p>
    </div>
    <img class="absolute top-[66%] left-1/2 w-[125vw] max-w-none -translate-x-1/2 sm:top-[62%] sm:w-[90vw] nav:top-[60%] nav:w-[75vw]" :src="category.image" :alt="category.imageAlt">
  </section>
</template>
