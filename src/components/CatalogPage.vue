<script setup>
import { onMounted } from 'vue'
import CatalogCategoryCard from './CatalogCategoryCard.vue'
import HeroCircles from './HeroCircles.vue'
import SectionLink from './SectionLink.vue'
import { catalogCategories } from '../data/catalog'
import { sitePath } from '../utils/site-path'

onMounted(() => {
  document.title = 'Каталог медовухи, сидра и пуаре «МЁДВЕДЬ»'
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    'Медовуха «МЁДВЕДЬ», яблочный сидр и грушевое пуаре от петербургского производителя. Выберите категорию и познакомьтесь с ассортиментом.',
  )
})
</script>

<template>
  <div>
    <section class="relative isolate overflow-hidden bg-foreground text-surface" data-header-theme="light" aria-labelledby="catalog-title">
      <div class="site-container relative grid min-h-svh items-end gap-12 pt-28 pb-10 sm:pt-36 sm:pb-14 nav:grid-cols-12 nav:items-center">
        <div class="relative z-2 nav:col-span-8 nav:pt-16">
          <h1 id="catalog-title" class="font-display text-h1 uppercase">Наши<br>напитки</h1>
          <p class="mt-8 max-w-2xl text-body-large font-medium text-surface/80 sm:mt-10">
            Медовуха, сидр и пуаре собственного производства. Выберите напиток по настроению — от медовых и пряных до свежих фруктовых вкусов.
          </p>
        </div>
        <HeroCircles top-label="Мёд" bottom-label="Сидр" />
      </div>
    </section>

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="catalog-categories-title">
      <div class="site-container">
        <div class="grid items-end gap-8 nav:grid-cols-12">
          <h2 id="catalog-categories-title" class="font-display text-h2 break-words hyphens-auto uppercase nav:col-span-8">Три истории вкуса</h2>
          <p class="max-w-md text-body-large font-medium text-subtle nav:col-span-4">У каждой категории — свой состав, аромат и настроение.</p>
        </div>

        <ul class="mt-12 grid gap-4 sm:mt-16 nav:grid-cols-3">
          <CatalogCategoryCard v-for="category in catalogCategories" :key="category.slug" :category="category" />
        </ul>
      </div>
    </section>

    <SectionLink
      heading-id="catalog-contact-title"
      title="Нужна поставка?"
      description="Свяжитесь с отделом оптовых продаж, чтобы обсудить ассортимент и условия сотрудничества."
      :href="sitePath('/kontakty/')"
      label="Контакты"
    />
  </div>
</template>
