<script setup>
import BaseButton from '../../components/BaseButton.vue'
import { sitePath } from '../../utils/site-path'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import LayeredHeroComposition from '../../components/LayeredHeroComposition.vue'
import { layerEntranceTimings } from '../../utils/hero-entrance'
import heroLayerForeground from '../../assets/heroes/home/foreground-layer.png?responsive'
import heroLayerMiddleBlink from '../../assets/heroes/home/middle-blink.png?responsive'
import heroLayerMiddle from '../../assets/heroes/home/middle-layer.png?responsive'
import heroLayerBackground from '../../assets/heroes/home/background-layer.png?responsive'

const heroLayerSizes = 'max(100vw, calc((100svh + 8svh) * 1.3042))'
const heroLayerClassName = 'home-hero-layer absolute inset-x-0 top-0 w-full object-contain object-top'

const heroLayerLayout = {
  mobile: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 1.5, x: 0, y: -50 },
    foreground: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 1.5, x: -50, y: 0 },
  },
  tablet: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 1.2, x: 0, y: -50 },
    foreground: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 1.2, x: -100, y: -50 },
  },
  desktop: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 0.75, x: 0, y: -150 },
    foreground: { enabled: true, constraints: { horizontal: 'center', vertical: 'bottom' }, scale: 0.75, x: -100, y: -100 },
  },
}

const isBlinking = ref(false)
const heroLayers = computed(() => ({
  background: {
    ...heroLayerBackground,
    sizes: heroLayerSizes,
    className: `${heroLayerClassName} home-hero-background`,
  },
  middle: {
    ...(isBlinking.value ? heroLayerMiddleBlink : heroLayerMiddle),
    sizes: heroLayerSizes,
    className: heroLayerClassName,
    alt: '',
  },
  foreground: {
    ...heroLayerForeground,
    sizes: heroLayerSizes,
    className: heroLayerClassName,
    alt: 'Медведь с бутылкой напитка «Медведь»',
    fetchpriority: 'high',
  },
}))
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
    image.sizes = heroLayerSizes
    image.srcset = srcset
    image.src = src
    return image.decode()
  }
  preloadBlink(heroLayerMiddleBlink.avifSrcset, heroLayerMiddleBlink.avifSrc)
    .catch(() => preloadBlink(heroLayerMiddleBlink.srcset, heroLayerMiddleBlink.src))
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
    class="relative min-h-svh overflow-hidden bg-brand text-surface"
    aria-labelledby="hero-title"
  >
    <div class="site-container flex min-h-svh flex-col gap-10 pt-24 pb-8 sm:pt-32 sm:pb-0 wide:pt-36">
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
  </section>
</template>

<style scoped>
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
