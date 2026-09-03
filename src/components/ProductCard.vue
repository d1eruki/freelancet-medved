<script setup>
import { computed } from 'vue'
import productImageUrl from '../assets/hero-image-placeholder.png'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
})

const cardLayout = computed(() => (
  props.featured
    ? 'nav:col-span-2 nav:min-h-144 wide:col-span-7 wide:row-span-2 wide:min-h-0'
    : 'nav:col-span-1 nav:min-h-112 wide:col-span-5 wide:min-h-0'
))

const imageLayout = computed(() => (
  props.featured
    ? 'h-96 w-56 sm:h-112 sm:w-64 wide:h-128 wide:w-72'
    : 'h-80 w-48 sm:h-96 sm:w-56 wide:h-80 wide:w-48'
))
</script>

<template>
  <a
    class="product-card group relative isolate min-h-112 overflow-hidden rounded-4xl border border-foreground/5 bg-panel p-7 transition duration-200 hover:-translate-y-1 hover:bg-surface hover:shadow-2xl focus-visible:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand sm:p-10"
    :class="cardLayout"
    :href="product.href"
    :aria-label="product.name"
  >
    <div class="relative z-2 flex h-full max-w-md flex-col items-start">
      <span class="mb-auto font-display text-xs tracking-widest text-subtle" aria-hidden="true">
        {{ product.index }}
      </span>

      <h3 class="mt-8 font-display text-4xl leading-none text-brand uppercase sm:text-5xl wide:text-6xl">
        {{ product.name }}
      </h3>

      <p class="mt-4 max-w-sm text-base leading-relaxed">
        {{ product.tastes }}
      </p>
    </div>

    <span
      class="absolute top-6 right-6 z-3 grid size-12 place-items-center rounded-full border border-foreground/20 text-xl transition duration-200 group-hover:rotate-45 group-hover:border-brand group-hover:bg-brand group-hover:text-surface group-focus-visible:rotate-45 group-focus-visible:border-brand group-focus-visible:bg-brand group-focus-visible:text-surface sm:top-8 sm:right-8"
      aria-hidden="true"
    >
      ↗
    </span>

    <span
      class="absolute -right-4 -bottom-20 z-1 rotate-6 transition duration-300 group-hover:-translate-y-3 group-hover:rotate-2 group-focus-visible:-translate-y-3 group-focus-visible:rotate-2 sm:right-6"
      :class="imageLayout"
      aria-hidden="true"
    >
      <img class="product-image size-full border border-foreground/10 bg-surface object-cover shadow-xl" :src="productImageUrl" alt="">
      <span class="absolute inset-0 grid place-items-center text-xs font-extrabold tracking-widest text-muted uppercase">
        Изображение
      </span>
    </span>
  </a>
</template>

<style scoped>
.product-card::before {
  position: absolute;
  z-index: -1;
  right: -88px;
  bottom: -120px;
  width: 360px;
  height: 360px;
  border: 1px solid rgb(225 110 72 / 20%);
  border-radius: 50%;
  content: '';
}

.product-image {
  border-radius: 999px 999px 24px 24px;
}
</style>
