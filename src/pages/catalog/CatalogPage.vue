<script setup>
import catalogHeroForeground from '../../assets/heroes/catalog/foreground.png?responsive'
import catalogHeroMiddle from '../../assets/heroes/catalog/middle.png?responsive'
import catalogHeroBackground from '../../assets/heroes/catalog/background.png?responsive'
import CatalogCategoryCard from './CatalogCategoryCard.vue'
import PageHero from '../../components/PageHero.vue'
import HeroDivider from '../../components/HeroDivider.vue'
import SectionLink from '../../components/SectionLink.vue'
import { catalogCategories } from '../../data/catalog'
import { sitePath } from '../../utils/site-path'
import catalogDividerUrl from '../../assets/heroes/catalog/divider.png'

const catalogHeroLayout = {
  mobile: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, constraints: { horizontal: 'right', vertical: 'top' }, scale: 3, x: 200, y: 0 },
    foreground: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 2, x: 115, y: -40 },
  },
  tablet: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 0.85, x: 135, y: -100 },
    foreground: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 0.75, x: 225, y: 150 },
  },
  desktop: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, constraints: { horizontal: 'right', vertical: 'bottom' }, scale: 1.1, x: 0, y: -50 },
    foreground: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 0.75, x: 225, y: -50 },
  },
}

const catalogHeroLayers = {
  background: {
    ...catalogHeroBackground,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
    alt: 'Старинная иллюстрация: цветущие деревья у реки и город на дальнем берегу',
  },
  middle: {
    ...catalogHeroMiddle,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
  },
  foreground: {
    ...catalogHeroForeground,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
  },
}

</script>

<template>
  <div>
    <PageHero
      title-id="catalog-title"
      :title-z-index="0"
      :layers="catalogHeroLayers"
      :layer-layout="catalogHeroLayout"
      layer-entrance="foreground-first"
    >
      <template #title>Наши<br>напитки</template>
      <span class="wide:block wide:whitespace-nowrap">Медовуха, сидр и пуаре собственного </span>
      <span class="wide:block wide:whitespace-nowrap">производства. Выберите напиток по настроению — </span>
      <span class="wide:block wide:whitespace-nowrap">от пряных до свежих фруктовых вкусов.</span>
    </PageHero>

    <HeroDivider :image-url="catalogDividerUrl" />

    <section class="section-decorated bg-panel py-20 text-foreground sm:py-24 wide:py-28" aria-labelledby="catalog-categories-title">
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
