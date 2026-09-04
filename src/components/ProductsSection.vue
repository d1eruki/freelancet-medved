<script setup>
import ProductCard from './ProductCard.vue'
import meadImageUrl from '../assets/mead-glass-cutout.png'
import ciderImageUrl from '../assets/cider-glass-cutout.png'
import perryImageUrl from '../assets/perry-glass-cutout.png'

const products = [
  {
    name: 'Медовуха',
    tastes: 'Светлая, тёмная, имбирная, вишнёвая, сливовая, клюквенная, чёрная смородина',
    href: '/katalog/medovuha/',
    image: meadImageUrl,
    featured: true,
  },
  {
    name: 'Сидр',
    tastes: 'Сухой, полусухой, сладкий, полусладкий',
    href: '/katalog/sidr/',
    image: ciderImageUrl,
    featured: false,
  },
  {
    name: 'Пуаре',
    tastes: 'Сладкий',
    href: '/katalog/puare/',
    image: perryImageUrl,
    featured: false,
  },
]
</script>

<template>
  <section class="min-h-svh bg-surface py-20 text-foreground sm:py-24 wide:py-40" aria-labelledby="products-title">
    <div class="site-container">
      <div class="mb-12 grid items-end gap-6 wide:mb-20 wide:grid-cols-3 wide:gap-12">
        <h2 id="products-title" class="min-w-0 font-display text-h2 text-brand uppercase wide:col-span-2">
          Продукция
        </h2>

        <p class="max-w-lg text-body-large font-medium wide:col-span-1 wide:max-w-none">
          Производим русские<br class="hidden wide:block"> хмельные напитки с 2006 года
        </p>
      </div>

      <div class="grid gap-5 nav:grid-cols-2 wide:grid-cols-12 wide:grid-rows-2">
        <ProductCard
          v-for="product in products"
          :key="product.href"
          :product="product"
          :featured="product.featured"
        />
      </div>
    </div>
  </section>
</template>
