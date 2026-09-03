<script setup>
import ProductCard from './ProductCard.vue'

const products = [
  {
    index: '01',
    name: 'Медовуха',
    tastes: 'Светлая, тёмная, имбирная, вишнёвая, сливовая, клюквенная, чёрная смородина',
    href: '/katalog/medovuha/',
    featured: true,
  },
  {
    index: '02',
    name: 'Сидр',
    tastes: 'Сухой, полусухой, сладкий, полусладкий',
    href: '/katalog/sidr/',
    featured: false,
  },
  {
    index: '03',
    name: 'Пуаре',
    tastes: 'Сладкий',
    href: '/katalog/puare/',
    featured: false,
  },
]
</script>

<template>
  <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-40" aria-labelledby="products-title">
    <div class="site-container">
      <div class="mb-12 grid items-end gap-6 nav:grid-cols-2 wide:mb-20 wide:grid-cols-5 wide:gap-12">
        <h2 id="products-title" class="font-display text-4xl leading-none text-brand uppercase sm:text-6xl wide:col-span-3 wide:text-8xl">
          Продукция
        </h2>

        <p class="max-w-lg text-lg leading-relaxed font-medium sm:text-xl wide:col-span-2">
          Производим русские хмельные напитки с 2006 года
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
