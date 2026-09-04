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
    ? '-right-4 -bottom-4 size-80 sm:right-6 sm:size-96'
    : props.product.image
      ? 'right-0 -bottom-2 size-52 sm:size-56 wide:size-52'
      : '-right-4 -bottom-20 h-80 w-48 sm:right-6 sm:h-96 sm:w-56 wide:h-80 wide:w-48'
))

const imageStyle = computed(() => (
  props.product.image
    ? 'object-contain'
    : 'product-image border border-foreground/10 bg-surface object-cover shadow-xl'
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
      <h3 class="mt-auto font-display text-h3 text-brand uppercase">
        {{ product.name }}
      </h3>

      <p class="mt-4 max-w-sm text-body">
        {{ product.tastes }}
      </p>
    </div>

    <span
      class="absolute top-6 right-6 z-3 grid size-12 place-items-center rounded-full border border-foreground/20 text-body-large transition duration-200 group-hover:rotate-45 group-hover:border-brand group-hover:bg-brand group-hover:text-surface group-focus-visible:rotate-45 group-focus-visible:border-brand group-focus-visible:bg-brand group-focus-visible:text-surface sm:top-8 sm:right-8"
      aria-hidden="true"
    >
      ↗
    </span>

    <span
      class="absolute z-1 rotate-6 transition duration-300 group-hover:-translate-y-3 group-hover:rotate-2 group-focus-visible:-translate-y-3 group-focus-visible:rotate-2"
      :class="imageLayout"
      aria-hidden="true"
    >
      <img
        class="size-full"
        :class="imageStyle"
        :src="product.image ?? productImageUrl"
        alt=""
      >
    </span>
  </a>
</template>

<style scoped>
.product-image {
  border-radius: 999px 999px 24px 24px;
}
</style>
