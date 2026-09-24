<script setup>
import { onMounted } from 'vue'
import CatalogCategoryCard from './CatalogCategoryCard.vue'
import PageHero from './PageHero.vue'
import SectionLink from './SectionLink.vue'
import { catalogCategories } from '../data/catalog'
import { sitePath } from '../utils/site-path'
import catalogHeroUrl from '../assets/catalog-hero.png'

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
    <PageHero
      title-id="catalog-title"
      :image-url="catalogHeroUrl"
      image-alt="Пинтовые бокалы с медовухой, сидром и пуаре"
    >
      <template #title>Наши<br>напитки</template>
      Медовуха, сидр и пуаре собственного производства. Выберите напиток по настроению — от медовых и пряных до свежих фруктовых вкусов.
    </PageHero>

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="catalog-categories-title">
      <div class="site-container">
        <div class="grid items-end gap-6 nav:grid-cols-12 nav:gap-8">
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
      :background="'foreground'"
    />
  </div>
</template>
