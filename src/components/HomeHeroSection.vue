<script setup>
import { sitePath } from '../utils/site-path'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import LayeredHeroComposition from './LayeredHeroComposition.vue'
import heroLayerForegroundUrl from '../assets/heroes/hero-layer-foreground.png'
import heroLayerForeground640Url from '../assets/heroes/hero-layer-foreground.png?width=640'
import heroLayerForeground960Url from '../assets/heroes/hero-layer-foreground.png?width=960'
import heroLayerForegroundAvifUrl from '../assets/heroes/hero-layer-foreground.png?format=avif'
import heroLayerForegroundAvif640Url from '../assets/heroes/hero-layer-foreground.png?format=avif&width=640'
import heroLayerForegroundAvif960Url from '../assets/heroes/hero-layer-foreground.png?format=avif&width=960'
import heroLayerBackgroundUrl from '../assets/heroes/hero-layer-background.png'
import heroLayerBackground640Url from '../assets/heroes/hero-layer-background.png?width=640'
import heroLayerBackground960Url from '../assets/heroes/hero-layer-background.png?width=960'
import heroLayerBackgroundAvifUrl from '../assets/heroes/hero-layer-background.png?format=avif'
import heroLayerBackgroundAvif640Url from '../assets/heroes/hero-layer-background.png?format=avif&width=640'
import heroLayerBackgroundAvif960Url from '../assets/heroes/hero-layer-background.png?format=avif&width=960'
import heroLayerMiddleUrl from '../assets/heroes/hero-layer-middle.png'
import heroLayerMiddle640Url from '../assets/heroes/hero-layer-middle.png?width=640'
import heroLayerMiddle960Url from '../assets/heroes/hero-layer-middle.png?width=960'
import heroLayerMiddleAvifUrl from '../assets/heroes/hero-layer-middle.png?format=avif'
import heroLayerMiddleAvif640Url from '../assets/heroes/hero-layer-middle.png?format=avif&width=640'
import heroLayerMiddleAvif960Url from '../assets/heroes/hero-layer-middle.png?format=avif&width=960'
import heroLayerMiddleBlinkUrl from '../assets/heroes/hero-layer-middle-blink.png'
import heroLayerMiddleBlink640Url from '../assets/heroes/hero-layer-middle-blink.png?width=640'
import heroLayerMiddleBlink960Url from '../assets/heroes/hero-layer-middle-blink.png?width=960'
import heroLayerMiddleBlinkAvifUrl from '../assets/heroes/hero-layer-middle-blink.png?format=avif'
import heroLayerMiddleBlinkAvif640Url from '../assets/heroes/hero-layer-middle-blink.png?format=avif&width=640'
import heroLayerMiddleBlinkAvif960Url from '../assets/heroes/hero-layer-middle-blink.png?format=avif&width=960'

const heroLayerBackgroundSrcset = `${heroLayerBackground640Url} 640w, ${heroLayerBackground960Url} 960w, ${heroLayerBackgroundUrl} 2048w`
const heroLayerMiddleSrcset = `${heroLayerMiddle640Url} 640w, ${heroLayerMiddle960Url} 960w, ${heroLayerMiddleUrl} 2508w`
const heroLayerMiddleBlinkSrcset = `${heroLayerMiddleBlink640Url} 640w, ${heroLayerMiddleBlink960Url} 960w, ${heroLayerMiddleBlinkUrl} 2508w`
const heroLayerForegroundSrcset = `${heroLayerForeground640Url} 640w, ${heroLayerForeground960Url} 960w, ${heroLayerForegroundUrl} 2048w`
const heroLayerBackgroundAvifSrcset = `${heroLayerBackgroundAvif640Url} 640w, ${heroLayerBackgroundAvif960Url} 960w, ${heroLayerBackgroundAvifUrl} 2048w`
const heroLayerMiddleAvifSrcset = `${heroLayerMiddleAvif640Url} 640w, ${heroLayerMiddleAvif960Url} 960w, ${heroLayerMiddleAvifUrl} 2508w`
const heroLayerMiddleBlinkAvifSrcset = `${heroLayerMiddleBlinkAvif640Url} 640w, ${heroLayerMiddleBlinkAvif960Url} 960w, ${heroLayerMiddleBlinkAvifUrl} 2508w`
const heroLayerForegroundAvifSrcset = `${heroLayerForegroundAvif640Url} 640w, ${heroLayerForegroundAvif960Url} 960w, ${heroLayerForegroundAvifUrl} 2048w`

const heroLayerBackgroundSizes = '(min-width: 54rem) 118vw, (min-width: 40rem) 280vw, 100vw'
const heroLayerMiddleSizes = '(min-width: 54rem) 84vw, (min-width: 40rem) 200vw, 115vw'
const heroLayerForegroundSizes = '(min-width: 54rem) 84vw, (min-width: 40rem) 200vw, 75svh'

const heroLayerLayout = {
  background: { mobile: { scale: 1, x: 0, y: 0 }, desktop: { scale: 2.8, x: 0, y: 0 } },
  middle: { mobile: { scale: 1, x: 0, y: 0 }, desktop: { scale: 2, x: 0, y: 0 } },
  foreground: { mobile: { scale: 2, x: 0, y: 0 }, desktop: { scale: 2, x: 0, y: 0 } },
}

const isBlinking = ref(false)
const heroLayers = computed(() => ({
  background: {
    src: heroLayerBackgroundUrl,
    srcset: heroLayerBackgroundSrcset,
    avifSrcset: heroLayerBackgroundAvifSrcset,
    sizes: heroLayerBackgroundSizes,
    className: 'hero-layer-background absolute left-1/2 top-0 h-96 w-full object-contain object-bottom opacity-60 nav:h-[65svh] nav:w-[42%]',
    baseX: { desktop: '-50%' },
  },
  middle: {
    src: isBlinking.value ? heroLayerMiddleBlinkUrl : heroLayerMiddleUrl,
    srcset: isBlinking.value ? heroLayerMiddleBlinkSrcset : heroLayerMiddleSrcset,
    avifSrcset: isBlinking.value ? heroLayerMiddleBlinkAvifSrcset : heroLayerMiddleAvifSrcset,
    sizes: heroLayerMiddleSizes,
    className: 'hero-layer-middle absolute left-220 top-160 h-96 w-full object-contain object-bottom nav:h-[65svh] nav:w-[42%]',
    baseX: { mobile: '-50%', desktop: '-50%' },
    alt: '',
  },
  foreground: {
    src: heroLayerForegroundUrl,
    srcset: heroLayerForegroundSrcset,
    avifSrcset: heroLayerForegroundAvifSrcset,
    sizes: heroLayerForegroundSizes,
    className: 'hero-layer-foreground absolute left-80 top-60 h-96 w-full object-contain object-bottom sm:left-140 sm:top-110 nav:h-[65svh] nav:w-[42%]',
    baseX: { desktop: '-50%' },
    alt: 'Медведь с бутылкой напитка «Медведь»',
    fetchpriority: 'high',
  },
}))
const heroSteam = {}
let blinkTimer
let blinkMedia
let blinkReady = false
let isUnmounted = false

function stopBlinking() {
  window.clearTimeout(blinkTimer)
  isBlinking.value = false
}

function scheduleBlink() {
  stopBlinking()
  if (isUnmounted || !blinkReady || !blinkMedia?.matches || document.hidden) return

  blinkTimer = window.setTimeout(() => {
    isBlinking.value = true
    blinkTimer = window.setTimeout(scheduleBlink, 150)
  }, 4000 + Math.random() * 3000)
}

onMounted(() => {
  blinkMedia = window.matchMedia('(prefers-reduced-motion: no-preference)')
  blinkMedia.addEventListener('change', scheduleBlink)
  document.addEventListener('visibilitychange', scheduleBlink)
  const preloadBlink = (srcset, src) => {
    const image = new Image()
    image.sizes = heroLayerMiddleSizes
    image.srcset = srcset
    image.src = src
    return image.decode()
  }
  preloadBlink(heroLayerMiddleBlinkAvifSrcset, heroLayerMiddleBlinkAvifUrl)
    .catch(() => preloadBlink(heroLayerMiddleBlinkSrcset, heroLayerMiddleBlinkUrl))
    .then(() => {
      if (isUnmounted) return
      blinkReady = true
      scheduleBlink()
    }).catch(() => {
      // Keep the original image if the blink frame cannot be loaded.
    })
})

onBeforeUnmount(() => {
  isUnmounted = true
  stopBlinking()
  blinkMedia?.removeEventListener('change', scheduleBlink)
  document.removeEventListener('visibilitychange', scheduleBlink)
})
</script>

<template>
  <section
    class="relative isolate min-h-svh bg-brand text-surface"
    data-header-theme="light"
    aria-labelledby="hero-title"
  >
    <div class="site-container flex min-h-svh flex-col gap-10 pt-24 pb-8 sm:pt-32 sm:pb-104 nav:pb-0 wide:pt-36">
      <h1 id="hero-title" class="absolute top-28 left-0 z-2 w-full translate-y-0 px-4 text-center font-display text-h1 uppercase sm:top-1/2 sm:-translate-y-1/2 sm:px-6">
        <span class="font-normal">Лапу приложили</span><br>
        к напиткам
      </h1>

      <div class="relative z-1 grid flex-1 grid-rows-[auto_minmax(0,1fr)] items-start gap-8 pt-44 sm:grid-rows-none sm:items-end sm:pt-0 nav:grid-cols-[1fr_1.4fr_1fr] nav:gap-6">
        <div class="max-w-sm nav:mb-12 wide:mb-16">
          <p class="hero-description text-center sm:text-left">
            Пиво-медоваренный завод «Медведь». Производим медовуху, сидр и пуаре в Санкт-Петербурге с 2006 года.
          </p>
        </div>

        <div class="flex w-full flex-col items-start self-end gap-4 sm:w-auto sm:flex-row sm:items-center sm:self-auto nav:col-start-3 nav:row-start-1 nav:mb-12 nav:w-max nav:justify-self-end wide:mb-16">
          <a
            class="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-surface px-7 text-label font-extrabold tracking-wide text-foreground uppercase transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:shadow-xl sm:w-auto"
            :href="sitePath('/katalog/')"
          >
            Смотреть каталог
          </a>

          <a class="secondary-action w-full py-3 text-center text-label font-extrabold tracking-wide uppercase sm:w-auto" :href="sitePath('/partnery/')">
            Где купить
          </a>

        </div>
      </div>
    </div>
    <LayeredHeroComposition :layers="heroLayers" :layer-layout="heroLayerLayout" motion-profile="gentle" :steam="heroSteam" />
  </section>
</template>

<style scoped>
@media (max-width: 39.999rem) {
  :deep(.hero-layer-background) {
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center bottom;
  }

  :deep(.hero-layer-middle) {
    top: auto;
    bottom: -3svh;
    left: 60%;
    width: min(115vw, 32rem);
    height: auto;
  }

  :deep(.hero-layer-foreground) {
    top: auto;
    right: 40vw;
    bottom: 8svh;
    left: auto;
    width: auto;
    height: 55svh;
  }
}

</style>
