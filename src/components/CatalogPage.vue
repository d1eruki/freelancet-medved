<script setup>
import { onMounted } from 'vue'
import CatalogCategoryCard from './CatalogCategoryCard.vue'
import PageHero from './PageHero.vue'
import SectionLink from './SectionLink.vue'
import { catalogCategories } from '../data/catalog'
import { sitePath } from '../utils/site-path'
import catalogHeroBackgroundUrl from '../assets/heroes/catalog-hero-background.png'
import catalogHeroBackground640Url from '../assets/heroes/catalog-hero-background.png?width=640'
import catalogHeroBackground960Url from '../assets/heroes/catalog-hero-background.png?width=960'
import catalogHeroBackgroundAvifUrl from '../assets/heroes/catalog-hero-background.png?format=avif'
import catalogHeroBackgroundAvif640Url from '../assets/heroes/catalog-hero-background.png?format=avif&width=640'
import catalogHeroBackgroundAvif960Url from '../assets/heroes/catalog-hero-background.png?format=avif&width=960'
import catalogHeroForegroundUrl from '../assets/heroes/catalog-hero-foreground.png'
import catalogHeroForeground640Url from '../assets/heroes/catalog-hero-foreground.png?width=640'
import catalogHeroForeground960Url from '../assets/heroes/catalog-hero-foreground.png?width=960'
import catalogHeroForegroundAvifUrl from '../assets/heroes/catalog-hero-foreground.png?format=avif'
import catalogHeroForegroundAvif640Url from '../assets/heroes/catalog-hero-foreground.png?format=avif&width=640'
import catalogHeroForegroundAvif960Url from '../assets/heroes/catalog-hero-foreground.png?format=avif&width=960'

const catalogHeroLayout = {
  background: { mobile: { scale: 1, x: 0, y: 0 }, desktop: { scale: 1, x: 0, y: 0 } },
  foreground: { mobile: { scale: 1, x: 0, y: 0 }, desktop: { scale: 0.85, x: 200, y: 100 } },
}

const catalogHeroLayers = {
  background: {
    src: catalogHeroBackgroundUrl,
    srcset: `${catalogHeroBackground640Url} 640w, ${catalogHeroBackground960Url} 960w, ${catalogHeroBackgroundUrl} 1672w`,
    avifSrcset: `${catalogHeroBackgroundAvif640Url} 640w, ${catalogHeroBackgroundAvif960Url} 960w, ${catalogHeroBackgroundAvifUrl} 1672w`,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
    alt: 'Старинная иллюстрация: цветущие деревья у реки и город на дальнем берегу',
    zIndex: -2,
  },
  foreground: {
    src: catalogHeroForegroundUrl,
    srcset: `${catalogHeroForeground640Url} 640w, ${catalogHeroForeground960Url} 960w, ${catalogHeroForegroundUrl} 1672w`,
    avifSrcset: `${catalogHeroForegroundAvif640Url} 640w, ${catalogHeroForegroundAvif960Url} 960w, ${catalogHeroForegroundAvifUrl} 1672w`,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
    zIndex: 3,
  },
}

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
      :layers="catalogHeroLayers"
      :layer-layout="catalogHeroLayout"
      motion-profile="wide"
    >
      <template #title>Наши<br>напитки</template>
      Медовуха, сидр и пуаре собственного производства. Выберите напиток по настроению — от медовых и пряных до свежих фруктовых вкусов.
    </PageHero>

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="catalog-categories-title">
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
