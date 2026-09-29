<script setup>
import PageHero from './PageHero.vue'
import SectionLink from './SectionLink.vue'
import { sitePath } from '../utils/site-path'
import horecaHeroBackgroundUrl from '../assets/heroes/horeca-hero-background.png'
import horecaHeroBackground640Url from '../assets/heroes/horeca-hero-background.png?width=640'
import horecaHeroBackground960Url from '../assets/heroes/horeca-hero-background.png?width=960'
import horecaHeroBackgroundAvifUrl from '../assets/heroes/horeca-hero-background.png?format=avif'
import horecaHeroBackgroundAvif640Url from '../assets/heroes/horeca-hero-background.png?format=avif&width=640'
import horecaHeroBackgroundAvif960Url from '../assets/heroes/horeca-hero-background.png?format=avif&width=960'
import horecaHeroManUrl from '../assets/heroes/horeca-hero-man.png'
import horecaHeroMan640Url from '../assets/heroes/horeca-hero-man.png?width=640'
import horecaHeroMan960Url from '../assets/heroes/horeca-hero-man.png?width=960'
import horecaHeroManAvifUrl from '../assets/heroes/horeca-hero-man.png?format=avif'
import horecaHeroManAvif640Url from '../assets/heroes/horeca-hero-man.png?format=avif&width=640'
import horecaHeroManAvif960Url from '../assets/heroes/horeca-hero-man.png?format=avif&width=960'
import horecaHeroForegroundUrl from '../assets/heroes/horeca-hero-foreground.png'
import horecaHeroForeground640Url from '../assets/heroes/horeca-hero-foreground.png?width=640'
import horecaHeroForeground960Url from '../assets/heroes/horeca-hero-foreground.png?width=960'
import horecaHeroForegroundAvifUrl from '../assets/heroes/horeca-hero-foreground.png?format=avif'
import horecaHeroForegroundAvif640Url from '../assets/heroes/horeca-hero-foreground.png?format=avif&width=640'
import horecaHeroForegroundAvif960Url from '../assets/heroes/horeca-hero-foreground.png?format=avif&width=960'

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
    zIndex: -2,
  },
  middle: {
    src: horecaHeroManUrl,
    srcset: `${horecaHeroMan640Url} 640w, ${horecaHeroMan960Url} 960w, ${horecaHeroManUrl} 1672w`,
    avifSrcset: `${horecaHeroManAvif640Url} 640w, ${horecaHeroManAvif960Url} 960w, ${horecaHeroManAvifUrl} 1672w`,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
    zIndex: -2,
  },
  foreground: {
    src: horecaHeroForegroundUrl,
    srcset: `${horecaHeroForeground640Url} 640w, ${horecaHeroForeground960Url} 960w, ${horecaHeroForegroundUrl} 1672w`,
    avifSrcset: `${horecaHeroForegroundAvif640Url} 640w, ${horecaHeroForegroundAvif960Url} 960w, ${horecaHeroForegroundAvifUrl} 1672w`,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
    zIndex: 3,
  },
}
</script>

<template>
  <div>
    <PageHero
      title-id="horeca-page-title"
      :layers="horecaHeroLayers"
      :layer-layout="horecaHeroLayout"
      motion-profile="wide"
      :steam="horecaHeroSteam"
    >
      <template #title>HoReCa</template>
      Медовуха, сидр и пуаре «МЁДВЕДЬ» для баров и ресторанов. Поставляем напитки оптом в многооборотных кегах и одноразовой ПЭТ-таре.
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
