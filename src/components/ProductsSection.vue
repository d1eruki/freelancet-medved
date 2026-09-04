<script setup>
import { onBeforeUnmount, ref } from 'vue'
import ProductCard from './ProductCard.vue'
import meadImageUrl from '../assets/mead-glass-cutout.png'
import ciderImageUrl from '../assets/cider-glass-cutout.png'
import perryImageUrl from '../assets/perry-glass-cutout.png'

const products = [
  {
    name: 'Медовуха',
    label: 'Мёд, ягоды и пряности',
    description: 'Мягкий хмельной напиток с медовой основой и выразительным ароматом натуральных добавок.',
    tastes: 'Светлая, тёмная, имбирная, вишнёвая, сливовая, клюквенная, чёрная смородина',
    href: '/katalog/medovuha/',
    image: meadImageUrl,
  },
  {
    name: 'Сидр',
    label: 'Свежесть спелых яблок',
    description: 'Лёгкий яблочный напиток с чистым фруктовым вкусом и деликатной игрой пузырьков.',
    tastes: 'Сухой, полусухой, сладкий, полусладкий',
    href: '/katalog/sidr/',
    image: ciderImageUrl,
  },
  {
    name: 'Пуаре',
    label: 'Тонкий вкус груши',
    description: 'Ароматный грушевый напиток с мягкой сладостью и свежим фруктовым послевкусием.',
    tastes: 'Сладкий',
    href: '/katalog/puare/',
    image: perryImageUrl,
  },
]

const activeIndex = ref(0)
const isTransitioning = ref(false)
const isTextHidden = ref(false)

const textFadeDuration = 360
const slideDuration = 700
let slideTimer
let revealTimer
let unlockTimer

function clearTransitionTimers() {
  window.clearTimeout(slideTimer)
  window.clearTimeout(revealTimer)
  window.clearTimeout(unlockTimer)
}

function showProduct(index) {
  if (index === activeIndex.value || isTransitioning.value) {
    return
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    activeIndex.value = index
    return
  }

  isTransitioning.value = true
  isTextHidden.value = true

  slideTimer = window.setTimeout(() => {
    activeIndex.value = index

    revealTimer = window.setTimeout(() => {
      isTextHidden.value = false

      unlockTimer = window.setTimeout(() => {
        isTransitioning.value = false
      }, textFadeDuration)
    }, slideDuration)
  }, textFadeDuration)
}

function showPrevious() {
  showProduct((activeIndex.value - 1 + products.length) % products.length)
}

function showNext() {
  showProduct((activeIndex.value + 1) % products.length)
}

onBeforeUnmount(clearTransitionTimers)
</script>

<template>
  <section class="relative isolate flex min-h-svh flex-col overflow-hidden bg-surface text-foreground nav:h-svh" aria-labelledby="products-title">
    <span class="absolute inset-x-0 bottom-0 z-0 h-[50svh] bg-brand/10" aria-hidden="true" />

    <div class="site-container relative z-2 shrink-0 pt-20 sm:pt-24 wide:pt-28">
      <div class="grid items-end gap-6 pb-8 wide:grid-cols-3 wide:gap-12 wide:pb-10">
        <h2 id="products-title" class="min-w-0 font-display text-h2 text-brand uppercase wide:col-span-2">
          Продукция
        </h2>

        <p class="max-w-lg text-body-large font-medium wide:col-span-1 wide:max-w-none">
          Производим русские<br class="hidden wide:block"> хмельные напитки с 2006 года
        </p>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col">
      <div class="relative z-1 min-h-144 flex-1 overflow-hidden sm:min-h-160 nav:min-h-0">
        <div
          class="product-track flex h-full"
          :style="{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }"
        >
          <ProductCard
            v-for="(product, index) in products"
            :key="product.href"
            class="h-full w-full shrink-0"
            :product="product"
            :active="index === activeIndex"
            :text-hidden="isTextHidden"
            :aria-hidden="index !== activeIndex"
          />
        </div>
      </div>

      <span class="sr-only" aria-live="polite">Выбран напиток: {{ products[activeIndex].name }}</span>

      <div class="site-container relative z-2 shrink-0 pb-8">
        <div class="flex flex-wrap items-center justify-center gap-3 pt-6">
          <button
            class="grid size-12 place-items-center rounded-full bg-surface text-body-large transition hover:bg-brand hover:text-surface focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
            type="button"
            aria-label="Предыдущий напиток"
            @click="showPrevious"
          >
            ←
          </button>

          <div
            class="flex flex-wrap items-center justify-center gap-3"
            role="tablist"
            aria-label="Выбор напитка"
            @keydown.left.prevent="showPrevious"
            @keydown.right.prevent="showNext"
          >
            <button
              v-for="(product, index) in products"
              :key="product.href"
              class="rounded-full px-5 py-3 text-label font-bold uppercase transition focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
              :class="index === activeIndex
                ? 'bg-brand text-surface'
                : 'bg-surface text-foreground hover:bg-brand/10'"
              type="button"
              role="tab"
              :aria-selected="index === activeIndex"
              :tabindex="index === activeIndex ? 0 : -1"
              @click="showProduct(index)"
            >
              {{ product.name }}
            </button>
          </div>

          <button
            class="grid size-12 place-items-center rounded-full bg-surface text-body-large transition hover:bg-brand hover:text-surface focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
            type="button"
            aria-label="Следующий напиток"
            @click="showNext"
          >
            →
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.product-track {
  transition: transform 700ms cubic-bezier(0.65, 0, 0.35, 1);
  will-change: transform;
}
</style>
