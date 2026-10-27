<!-- Страница каталога с категориями напитков и ассортиментом. -->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import catalogHeroBackground from '../../assets/heroes/catalog/background.png?responsive'
import CatalogAssortment from './catalog-assortment.vue'
import CatalogCategoryCard from './CatalogCategoryCard.vue'
import { catalogCategories, catalogPackagingOptions } from '../../data/catalog.js'
import PageHero from '../../components/PageHero.vue'
import SupplySection from '../../components/supply-section.vue'

defineProps({
  lenis: { type: Object, default: null },
  catalogReady: { type: Boolean, default: false },
})

const showAssortment = ref(false)

function readCatalogView() {
  const params = new URLSearchParams(window.location.search)
  showAssortment.value = window.location.hash === '#assortment'
    || catalogPackagingOptions.some((option) => option.value === params.get('packaging'))
    || catalogCategories.some((category) => category.slug === params.get('drink'))
}

onMounted(() => {
  readCatalogView()
  window.addEventListener('popstate', readCatalogView)
  window.addEventListener('hashchange', readCatalogView)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', readCatalogView)
  window.removeEventListener('hashchange', readCatalogView)
})

</script>

<template>
  <div>
    <PageHero
      title-id="catalog-title"
      :title-z-index="0"
      :image-url="catalogHeroBackground.src"
      image-alt="Бокалы медовухи, сидра и пуаре с мёдом и фруктами"
      layer-entrance="foreground-first"
    >
      <template #title>Наши<br>напитки</template>
      <span class="wide:block wide:whitespace-nowrap">Медовуха, сидр и пуаре собственного </span>
      <span class="wide:block wide:whitespace-nowrap">производства. Выберите напиток по настроению — </span>
      <span class="wide:block wide:whitespace-nowrap">от пряных до свежих фруктовых вкусов.</span>
    </PageHero>


    <section v-if="!showAssortment" class="section-decorated bg-panel pt-20 pb-20 text-foreground sm:pt-24 sm:pb-24 wide:pt-28 wide:pb-28" aria-labelledby="catalog-categories-title">
      <div class="site-container">
        <div class="grid items-end gap-6 site-grid nav:gap-8">
          <h2 id="catalog-categories-title" class="font-display text-h2 break-words hyphens-auto uppercase nav:col-span-8">Три истории вкуса</h2>
          <p class="max-w-md text-body-large font-medium text-subtle nav:col-span-4">У каждой категории — свой состав, аромат и настроение.</p>
        </div>

        <ul class="mt-12 grid gap-4 sm:mt-16 site-grid">
          <CatalogCategoryCard v-for="category in catalogCategories" :key="category.slug" class="nav:col-span-4" :category="category" />
        </ul>
      </div>
    </section>

    <CatalogAssortment v-else :lenis="lenis" :ready="catalogReady" />

    <SupplySection heading-id="catalog-contact-title" />
  </div>
</template>
