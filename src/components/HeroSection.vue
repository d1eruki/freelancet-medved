<script setup>
import { sitePath } from '../utils/site-path'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import HeroSteam from './HeroSteam.vue'
import heroLayerForegroundUrl from '../assets/hero-layer-foreground.png'
import heroLayerForeground960Url from '../assets/hero-layer-foreground.png?width=960'
import heroLayerForeground1440Url from '../assets/hero-layer-foreground.png?width=1440'
import heroLayerForegroundAvifUrl from '../assets/hero-layer-foreground.png?format=avif'
import heroLayerForegroundAvif960Url from '../assets/hero-layer-foreground.png?format=avif&width=960'
import heroLayerForegroundAvif1440Url from '../assets/hero-layer-foreground.png?format=avif&width=1440'
import heroLayerBackgroundUrl from '../assets/hero-layer-background.png'
import heroLayerBackground960Url from '../assets/hero-layer-background.png?width=960'
import heroLayerBackground1440Url from '../assets/hero-layer-background.png?width=1440'
import heroLayerBackgroundAvifUrl from '../assets/hero-layer-background.png?format=avif'
import heroLayerBackgroundAvif960Url from '../assets/hero-layer-background.png?format=avif&width=960'
import heroLayerBackgroundAvif1440Url from '../assets/hero-layer-background.png?format=avif&width=1440'
import heroLayerMiddleUrl from '../assets/hero-layer-middle.png'
import heroLayerMiddle960Url from '../assets/hero-layer-middle.png?width=960'
import heroLayerMiddle1440Url from '../assets/hero-layer-middle.png?width=1440'
import heroLayerMiddleAvifUrl from '../assets/hero-layer-middle.png?format=avif'
import heroLayerMiddleAvif960Url from '../assets/hero-layer-middle.png?format=avif&width=960'
import heroLayerMiddleAvif1440Url from '../assets/hero-layer-middle.png?format=avif&width=1440'
import heroLayerMiddleBlinkUrl from '../assets/hero-layer-middle-blink.png'
import heroLayerMiddleBlink960Url from '../assets/hero-layer-middle-blink.png?width=960'
import heroLayerMiddleBlink1440Url from '../assets/hero-layer-middle-blink.png?width=1440'
import heroLayerMiddleBlinkAvifUrl from '../assets/hero-layer-middle-blink.png?format=avif'
import heroLayerMiddleBlinkAvif960Url from '../assets/hero-layer-middle-blink.png?format=avif&width=960'
import heroLayerMiddleBlinkAvif1440Url from '../assets/hero-layer-middle-blink.png?format=avif&width=1440'

const heroLayerBackgroundSrcset = `${heroLayerBackground960Url} 960w, ${heroLayerBackground1440Url} 1440w, ${heroLayerBackgroundUrl} 2048w`
const heroLayerMiddleSrcset = `${heroLayerMiddle960Url} 960w, ${heroLayerMiddle1440Url} 1440w, ${heroLayerMiddleUrl} 2508w`
const heroLayerMiddleBlinkSrcset = `${heroLayerMiddleBlink960Url} 960w, ${heroLayerMiddleBlink1440Url} 1440w, ${heroLayerMiddleBlinkUrl} 2508w`
const heroLayerForegroundSrcset = `${heroLayerForeground960Url} 960w, ${heroLayerForeground1440Url} 1440w, ${heroLayerForegroundUrl} 2048w`
const heroLayerBackgroundAvifSrcset = `${heroLayerBackgroundAvif960Url} 960w, ${heroLayerBackgroundAvif1440Url} 1440w, ${heroLayerBackgroundAvifUrl} 2048w`
const heroLayerMiddleAvifSrcset = `${heroLayerMiddleAvif960Url} 960w, ${heroLayerMiddleAvif1440Url} 1440w, ${heroLayerMiddleAvifUrl} 2508w`
const heroLayerMiddleBlinkAvifSrcset = `${heroLayerMiddleBlinkAvif960Url} 960w, ${heroLayerMiddleBlinkAvif1440Url} 1440w, ${heroLayerMiddleBlinkAvifUrl} 2508w`
const heroLayerForegroundAvifSrcset = `${heroLayerForegroundAvif960Url} 960w, ${heroLayerForegroundAvif1440Url} 1440w, ${heroLayerForegroundAvifUrl} 2048w`

const heroLayerBackgroundSizes = '(min-width: 54rem) 118vw, (min-width: 40rem) 280vw, 100vw'
const heroLayerMiddleSizes = '(min-width: 54rem) 84vw, (min-width: 40rem) 200vw, 115vw'
const heroLayerForegroundSizes = '(min-width: 54rem) 84vw, (min-width: 40rem) 200vw, 75svh'

const bearImage = ref(null)
const isBlinking = ref(false)
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

const parallaxOffset = ref({ x: 0, y: 0 })
let parallaxMedia

function resetParallax() {
  parallaxOffset.value = { x: 0, y: 0 }
}

function updateParallax(event) {
  if (!parallaxMedia?.matches || event.pointerType === 'touch') return

  const bounds = event.currentTarget.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return

  const normalize = (position, size) => Math.max(-1, Math.min(1, position / size * 2 - 1))
  parallaxOffset.value = {
    x: normalize(event.clientX - bounds.left, bounds.width) * 24,
    y: normalize(event.clientY - bounds.top, bounds.height) * 16,
  }
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
  parallaxMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  parallaxMedia.addEventListener('change', resetParallax)
  window.addEventListener('blur', resetParallax)
})

onBeforeUnmount(() => {
  isUnmounted = true
  stopBlinking()
  blinkMedia?.removeEventListener('change', scheduleBlink)
  document.removeEventListener('visibilitychange', scheduleBlink)
  parallaxMedia?.removeEventListener('change', resetParallax)
  window.removeEventListener('blur', resetParallax)
})
</script>

<template>
  <section
    class="relative isolate min-h-svh bg-brand text-surface"
    data-header-theme="light"
    aria-labelledby="hero-title"
    @pointermove="updateParallax"
    @pointerleave="resetParallax"
    @pointercancel="resetParallax"
  >
    <div class="site-container flex min-h-svh flex-col gap-10 pt-24 pb-8 sm:pt-32 sm:pb-104 nav:pb-0 wide:pt-36">
      <h1 id="hero-title" class="absolute top-28 left-0 z-2 w-full translate-y-0 px-4 text-center font-display text-h1 uppercase sm:top-1/2 sm:-translate-y-1/2 sm:px-6">
        <span class="font-handwriting font-normal">Лапу приложили</span><br>
        к хорошим напиткам
      </h1>

      <div class="relative z-1 grid flex-1 grid-rows-[auto_minmax(0,1fr)] items-start gap-8 pt-44 sm:grid-rows-none sm:items-end sm:pt-0 nav:grid-cols-[1fr_1.4fr_1fr] nav:gap-6">
        <div class="max-w-sm nav:mb-12 wide:mb-16">
          <p class="text-center text-body-large sm:text-left">
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
    <picture>
      <source type="image/avif" :sizes="heroLayerBackgroundSizes" :srcset="heroLayerBackgroundAvifSrcset">
      <img
        class="hero-layer-background pointer-events-none absolute left-1/2 h-96 w-full top-0 -translate-x-1/2 scale-280 object-contain object-bottom grayscale mix-blend-luminosity opacity-60 nav:h-[65svh] nav:w-[42%] blur-[0.8px]"
        :sizes="heroLayerBackgroundSizes"
        :srcset="heroLayerBackgroundSrcset"
        :src="heroLayerBackgroundUrl"
        alt=""
        aria-hidden="true"
      >
    </picture>
    <picture>
      <source type="image/avif" :sizes="heroLayerMiddleSizes" :srcset="isBlinking ? heroLayerMiddleBlinkAvifSrcset : heroLayerMiddleAvifSrcset">
      <img
        ref="bearImage"
        class="hero-layer-middle pointer-events-none absolute left-220 h-96 w-full top-160 -translate-x-1/2 scale-200 object-contain object-bottom blur-[1px] transition-[translate] duration-500 ease-out motion-reduce:transition-none nav:h-[65svh] nav:w-[42%]"
        :style="{ translate: `calc(-50% + ${parallaxOffset.x / 3}px) ${parallaxOffset.y / 3}px` }"
        :sizes="heroLayerMiddleSizes"
        :srcset="isBlinking ? heroLayerMiddleBlinkSrcset : heroLayerMiddleSrcset"
        :src="isBlinking ? heroLayerMiddleBlinkUrl : heroLayerMiddleUrl"
        alt=""
        aria-hidden="true"
      >
    </picture>
    <picture>
      <source type="image/avif" :sizes="heroLayerForegroundSizes" :srcset="heroLayerForegroundAvifSrcset">
      <img
        class="hero-layer-foreground pointer-events-none absolute left-80 top-60 h-96 w-full -translate-x-1/2 scale-125 object-contain object-bottom transition-[translate] duration-500 ease-out motion-reduce:transition-none sm:left-140 sm:top-110 sm:scale-200 nav:h-[65svh] nav:w-[42%]"
        :style="{ translate: `calc(var(--hero-foreground-offset-x, -50%) + ${parallaxOffset.x}px) ${parallaxOffset.y}px` }"
        :sizes="heroLayerForegroundSizes"
        :srcset="heroLayerForegroundSrcset"
        :src="heroLayerForegroundUrl"
        fetchpriority="high"
        alt="Медведь с бутылкой напитка «Медведь»"
      >
    </picture>
    <HeroSteam :source="bearImage" />
  </section>
</template>

<style scoped>
@media (max-width: 39.999rem) {
  .hero-layer-background {
    inset: 0;
    width: 100%;
    height: 100%;
    scale: 1;
    translate: 0;
    object-fit: cover;
    object-position: center bottom;
  }

  .hero-layer-middle {
    top: auto;
    bottom: -3svh;
    left: 60%;
    width: min(115vw, 32rem);
    height: auto;
    scale: 1;
  }

  .hero-layer-foreground {
    --hero-foreground-offset-x: 0px;
    top: auto;
    right: 40vw;
    bottom: 8svh;
    left: auto;
    width: auto;
    height: 55svh;
    scale: 2;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .hero-layer-middle {
    --float-distance: -3px;
    animation: hero-layer-float 8s ease-in-out infinite;
  }

  .hero-layer-foreground {
    --float-distance: -4px;
    animation: hero-layer-float 6s ease-in-out infinite;
  }
}

/* Animate transform separately from the cursor-driven translate property. */
@keyframes hero-layer-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(var(--float-distance));
  }
}
</style>
