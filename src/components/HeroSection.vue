<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import HeroSteam from './HeroSteam.vue'
import heroLayerForegroundUrl from '../assets/hero-layer-foreground.png'
import heroLayerBackgroundUrl from '../assets/hero-layer-background.png'
import heroLayerMiddleUrl from '../assets/hero-layer-middle.png'
import heroLayerMiddleBlinkUrl from '../assets/hero-layer-middle-blink.png'

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
  const blinkImage = new Image()
  blinkImage.src = heroLayerMiddleBlinkUrl
  blinkImage.decode().then(() => {
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
    aria-labelledby="hero-title"
    @pointermove="updateParallax"
    @pointerleave="resetParallax"
    @pointercancel="resetParallax"
  >
    <div class="site-container flex min-h-svh flex-col gap-10 pt-28 pb-104 sm:pt-32 nav:pb-0 wide:pt-36">
      <h1 id="hero-title" class="absolute top-1/2 left-0 z-2 w-full -translate-y-1/2 px-4 text-center font-display text-h1 uppercase sm:px-6">
        <span class="font-handwriting font-normal">Лапу приложили</span><br>
        к хорошим напиткам
      </h1>

      <div class="relative z-1 grid flex-1 items-end gap-8 nav:grid-cols-[1fr_1.4fr_1fr] nav:gap-6">
        <div class="max-w-sm nav:mb-12 wide:mb-16">
          <p class="mb-3 text-body-large">
            Пиво-медоваренный завод «Медведь»
          </p>
          <p class="text-body-large">
            Производим медовуху, сидр и пуаре в Санкт-Петербурге с 2006 года.
          </p>
        </div>

        <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center nav:col-start-3 nav:row-start-1 nav:mb-12 nav:w-max nav:justify-self-end wide:mb-16">
          <a
            class="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-surface px-7 text-label font-extrabold tracking-wide text-foreground uppercase transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:shadow-xl sm:w-auto"
            href="/katalog/"
          >
            Смотреть продукцию
          </a>

          <a class="secondary-action py-3 text-label font-extrabold tracking-wide uppercase" href="/partnery/">
            Где купить
          </a>
        </div>
      </div>
    </div>
    <img
      class="pointer-events-none absolute left-1/2 h-96 w-full top-0 -translate-x-1/2 scale-280 object-contain object-bottom grayscale mix-blend-luminosity opacity-60 nav:h-[65svh] nav:w-[42%] blur-[0.8px]"
      :src="heroLayerBackgroundUrl"
      alt=""
      aria-hidden="true"
    >
    <img
      ref="bearImage"
      class="hero-layer-middle pointer-events-none absolute left-220 h-96 w-full top-160 -translate-x-1/2 scale-200 object-contain object-bottom blur-[1px] transition-[translate] duration-500 ease-out motion-reduce:transition-none nav:h-[65svh] nav:w-[42%]"
      :style="{ translate: `calc(-50% + ${parallaxOffset.x / 3}px) ${parallaxOffset.y / 3}px` }"
      :src="isBlinking ? heroLayerMiddleBlinkUrl : heroLayerMiddleUrl"
      alt=""
      aria-hidden="true"
    >
    <img
      class="hero-layer-foreground pointer-events-none absolute left-140 h-96 w-full top-110 -translate-x-1/2 scale-200 object-contain object-bottom transition-[translate] duration-500 ease-out motion-reduce:transition-none nav:h-[65svh] nav:w-[42%]"
      :style="{ translate: `calc(-50% + ${parallaxOffset.x}px) ${parallaxOffset.y}px` }"
      :src="heroLayerForegroundUrl"
      alt="Медведь с бутылкой напитка «Медведь»"
    >
    <HeroSteam :source="bearImage" />
  </section>
</template>

<style scoped>
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
