<script setup>
import PageHero from './PageHero.vue'
import SectionLink from './SectionLink.vue'
import { sitePath } from '../utils/site-path'
import horecaHeroBackgroundUrl from '../assets/heroes/horeca/background.png'
import horecaHeroBackground640Url from '../assets/heroes/horeca/background.png?width=640'
import horecaHeroBackground960Url from '../assets/heroes/horeca/background.png?width=960'
import horecaHeroBackgroundAvifUrl from '../assets/heroes/horeca/background.png?format=avif'
import horecaHeroBackgroundAvif640Url from '../assets/heroes/horeca/background.png?format=avif&width=640'
import horecaHeroBackgroundAvif960Url from '../assets/heroes/horeca/background.png?format=avif&width=960'
import horecaHeroMiddleUrl from '../assets/heroes/horeca/middle.png'
import horecaHeroMiddle640Url from '../assets/heroes/horeca/middle.png?width=640'
import horecaHeroMiddle960Url from '../assets/heroes/horeca/middle.png?width=960'
import horecaHeroMiddleAvifUrl from '../assets/heroes/horeca/middle.png?format=avif'
import horecaHeroMiddleAvif640Url from '../assets/heroes/horeca/middle.png?format=avif&width=640'
import horecaHeroMiddleAvif960Url from '../assets/heroes/horeca/middle.png?format=avif&width=960'
import horecaHeroForegroundUrl from '../assets/heroes/horeca/foreground.png'
import horecaHeroForeground640Url from '../assets/heroes/horeca/foreground.png?width=640'
import horecaHeroForeground960Url from '../assets/heroes/horeca/foreground.png?width=960'
import horecaHeroForegroundAvifUrl from '../assets/heroes/horeca/foreground.png?format=avif'
import horecaHeroForegroundAvif640Url from '../assets/heroes/horeca/foreground.png?format=avif&width=640'
import horecaHeroForegroundAvif960Url from '../assets/heroes/horeca/foreground.png?format=avif&width=960'

const horecaHeroLayout = {
  background: { mobile: { scale: 1, x: 0, y: 0 }, desktop: { scale: 1, x: 0, y: 0 } },
  middle: { mobile: { scale: 1, x: 0, y: 0 }, desktop: { scale: 1, x: 50, y: 100 } },
  foreground: { mobile: { scale: 1, x: 0, y: 0 }, desktop: { scale: 1, x: 100, y: 50 } },
}
const horecaHeroSteam = { fit: 'cover', anchorX: 0.71, anchorY: 0.2, scaleDivisor: 3500 }

const horecaHeroLayers = {
  background: {
    src: horecaHeroBackgroundUrl,
    srcset: `${horecaHeroBackground640Url} 640w, ${horecaHeroBackground960Url} 960w, ${horecaHeroBackgroundUrl} 1672w`,
    avifSrcset: `${horecaHeroBackgroundAvif640Url} 640w, ${horecaHeroBackgroundAvif960Url} 960w, ${horecaHeroBackgroundAvifUrl} 1672w`,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
    alt: 'Старинный бар с деревянными полками, бутылками и хмелем',
  },
  middle: {
    src: horecaHeroMiddleUrl,
    srcset: `${horecaHeroMiddle640Url} 640w, ${horecaHeroMiddle960Url} 960w, ${horecaHeroMiddleUrl} 1672w`,
    avifSrcset: `${horecaHeroMiddleAvif640Url} 640w, ${horecaHeroMiddleAvif960Url} 960w, ${horecaHeroMiddleAvifUrl} 1672w`,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
  },
  foreground: {
    src: horecaHeroForegroundUrl,
    srcset: `${horecaHeroForeground640Url} 640w, ${horecaHeroForeground960Url} 960w, ${horecaHeroForegroundUrl} 1672w`,
    avifSrcset: `${horecaHeroForegroundAvif640Url} 640w, ${horecaHeroForegroundAvif960Url} 960w, ${horecaHeroForegroundAvifUrl} 1672w`,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
  },
}
</script>

<template>
  <div>
    <PageHero
      title-id="horeca-page-title"
      :title-z-index="0"
      :layers="horecaHeroLayers"
      :layer-layout="horecaHeroLayout"
      :steam="horecaHeroSteam"
    >
      <template #title>Для ваших<br>гостей</template>
      <span class="wide:block wide:whitespace-nowrap">Медовуха, сидр и пуаре «МЁДВЕДЬ» </span>
      <span class="wide:block wide:whitespace-nowrap">для баров и ресторанов. Поставляем напитки оптом </span>
      <span class="wide:block wide:whitespace-nowrap">в многооборотных кегах и одноразовой ПЭТ-таре.</span>
    </PageHero>

    <SectionLink
      heading-id="horeca-assortment-title"
      title="Ассортимент"
      description="Познакомьтесь с напитками в каталоге и обратитесь в отдел продаж, чтобы обсудить заказ."
      :href="sitePath('/katalog/')"
      label="В каталог"
    />

    <SectionLink
      heading-id="horeca-delivery-title"
      title="Поставки"
      description="Доставляем по Санкт-Петербургу и Ленинградской области собственным транспортом. В других регионах работаем с дистрибьюторами."
      :href="sitePath('/kontakty/')"
      label="Контакты"
      background="foreground"
    />
  </div>
</template>
