<!-- Первый экран главной страницы с анимированной многослойной иллюстрацией. -->
<script setup>
import BaseButton from '../../components/BaseButton.vue'
import { sitePath } from '../../utils/site-path'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useImageLoading } from '../../composables/use-image-loading.js'
import LayeredHeroComposition from '../../components/LayeredHeroComposition.vue'
import { layerEntranceTimings } from '../../utils/hero-entrance'
import heroLayerForeground from '../../assets/heroes/home/foreground-layer.png?responsive'
import heroLayerMiddleBlink from '../../assets/heroes/home/middle-blink.png?responsive'
import heroLayerMiddle from '../../assets/heroes/home/middle-layer.png?responsive'
import heroLayerBackground from '../../assets/heroes/home/background-layer.png?responsive'

const heroLayerSizes = 'max(100vw, calc((100svh + 8svh) * 1.3042))'
const heroFigureSizes = '(min-width: 80rem) min(75vw, 105.48svh), (min-width: 40rem) min(120vw, 168.76svh), min(150vw, 210.95svh)'
const heroLayerClassName = 'home-hero-layer absolute inset-x-0 top-0 w-full object-contain object-top'

const heroLayerLayout = {
  mobile: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 1.5, x: 0, y: -50 },
    foreground: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 1.5, x: -50, y: -50 },
  },
  tablet: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 1.2, x: 0, y: -50 },
    foreground: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 1.2, x: -100, y: -50 },
  },
  desktop: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 0.75, x: 0, y: -175 },
    foreground: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 0.75, x: -100, y: -125 },
  },
}

const isBlinking = ref(false)
const hero = ref(null)
const { shouldLoad: canLoadBlink } = useImageLoading(hero, {
  media: '(prefers-reduced-motion: no-preference)',
})
const heroLayers = computed(() => ({
  background: {
    ...heroLayerBackground,
    sizes: heroLayerSizes,
    className: `${heroLayerClassName} home-hero-background`,
  },
  middle: {
    ...(isBlinking.value ? heroLayerMiddleBlink : heroLayerMiddle),
    sizes: heroFigureSizes,
    className: heroLayerClassName,
    alt: '',
  },
  foreground: {
    ...heroLayerForeground,
    sizes: heroFigureSizes,
    className: heroLayerClassName,
    alt: 'Медведь с бутылкой напитка «Медведь»',
    fetchpriority: 'high',
  },
}))
let blinkIdleCallback
let blinkLoadTimer
let blinkTimer
let blinkMedia
let blinkReady = false
let blinkLoading = false
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

function loadBlinkFrame() {
  if (isUnmounted || blinkReady || blinkLoading || !canLoadBlink.value) return
  blinkLoading = true
  const preloadBlink = (srcset, src) => {
    const image = new Image()
    image.sizes = heroFigureSizes
    image.srcset = srcset
    image.src = src
    return image.decode()
  }
  preloadBlink(heroLayerMiddleBlink.srcset, heroLayerMiddleBlink.src)
    .then(() => {
      if (isUnmounted) return
      blinkReady = true
      scheduleBlink()
    }).catch(() => {
      // Keep the original image if the blink frame cannot be loaded.
    }).finally(() => { blinkLoading = false })
}

function deferBlinkLoad() {
  if ('requestIdleCallback' in window) {
    blinkIdleCallback = window.requestIdleCallback(loadBlinkFrame, { timeout: 2000 })
  } else {
    blinkLoadTimer = window.setTimeout(loadBlinkFrame, 0)
  }
}

onMounted(() => {
  blinkMedia = window.matchMedia('(prefers-reduced-motion: no-preference)')
  blinkMedia.addEventListener('change', scheduleBlink)
  document.addEventListener('visibilitychange', scheduleBlink)
  if (document.readyState === 'complete') deferBlinkLoad()
  else window.addEventListener('load', deferBlinkLoad, { once: true })
})

watch(canLoadBlink, allowed => {
  if (allowed && document.readyState === 'complete') deferBlinkLoad()
})

onBeforeUnmount(() => {
  isUnmounted = true
  window.removeEventListener('load', deferBlinkLoad)
  if (blinkIdleCallback !== undefined) window.cancelIdleCallback(blinkIdleCallback)
  window.clearTimeout(blinkLoadTimer)
  stopBlinking()
  blinkMedia?.removeEventListener('change', scheduleBlink)
  document.removeEventListener('visibilitychange', scheduleBlink)
})
</script>

<template>
  <section
    ref="hero"
    class="relative isolate h-svh overflow-hidden bg-brand text-surface"
    aria-labelledby="hero-title"
  >
    <div class="site-container flex h-full flex-col gap-10 pt-24 pb-4 sm:pt-32 sm:pb-8 wide:pt-36">
      <h1 id="hero-title" class="home-hero-title absolute top-62 left-0 z-20 w-full -translate-y-full px-4 text-center font-display text-h1 uppercase sm:top-1/2 sm:-translate-y-1/2 sm:px-6" :style="layerEntranceTimings.rise">
        <span class="font-normal">Лапу приложили</span><br>
        к напиткам
      </h1>

      <div class="home-hero-details relative z-20 grid flex-1 grid-rows-[auto_minmax(0,1fr)] items-start gap-8 pt-44 sm:grid-cols-[1fr_1.4fr_1fr] sm:grid-rows-none sm:items-end sm:gap-6 sm:pt-0" :style="layerEntranceTimings.rise">
        <div class="max-w-sm sm:mb-12 wide:mb-16">
          <p class="hero-description text-center sm:text-left">
            <span class="wide:block wide:whitespace-nowrap">Пиво-медоваренный завод «Медведь». </span>
            <span class="wide:block wide:whitespace-nowrap">Производим медовуху, сидр и пуаре </span>
            <span class="wide:block wide:whitespace-nowrap">в Санкт-Петербурге с 2006 года.</span>
          </p>
        </div>

        <div class="flex w-full flex-col items-start self-end gap-4 sm:col-start-3 sm:row-start-1 sm:mb-12 sm:w-max sm:flex-row sm:items-center sm:self-auto sm:justify-self-end wide:mb-16">
          <BaseButton
            variant="surface"
            class="w-full focus-visible:-translate-y-1 focus-visible:shadow-xl sm:w-auto"
            :href="sitePath('/katalog/')"
          >
            Смотреть каталог
          </BaseButton>

        </div>
      </div>
    </div>
    <LayeredHeroComposition :layers="heroLayers" :layer-layout="heroLayerLayout" />
    <span class="home-hero-overlay pointer-events-none absolute inset-0 z-11" aria-hidden="true" />
    <span class="home-hero-corner-overlay pointer-events-none absolute inset-0 z-11" aria-hidden="true" />
  </section>
</template>

<style scoped>
.home-hero-overlay {
  background: radial-gradient(ellipse 56% 80% at 50% 24%, rgb(16 16 16 / 28%) 0%, rgb(16 16 16 / 12%) 48%, transparent 100%);
}

.home-hero-corner-overlay {
  background:
    radial-gradient(ellipse 55% 55% at 0% 90%, rgb(16 16 16 / 56%) 0%, rgb(16 16 16 / 28%) 48%, transparent 100%),
    radial-gradient(ellipse 55% 55% at 100% 90%, rgb(16 16 16 / 56%) 0%, rgb(16 16 16 / 28%) 48%, transparent 100%);
}

@media (min-width: 40rem) {
  .home-hero-overlay {
    background: radial-gradient(ellipse 56% 80% at 50% 48%, rgb(16 16 16 / 28%) 0%, rgb(16 16 16 / 12%) 48%, transparent 100%);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .home-hero-title,
  .home-hero-details {
    animation: home-hero-title-rise 500ms ease-out var(--hero-title-delay) both;
  }

  .home-hero-details {
    animation-delay: var(--hero-description-delay);
  }
}

@keyframes home-hero-title-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.home-hero-layer) {
  height: calc(100% + 8svh);
}
:deep(.home-hero-background) {
  object-fit: cover;
}
</style>
