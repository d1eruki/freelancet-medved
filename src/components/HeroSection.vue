<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import heroImageUrl from '../assets/hero-bear-medved.png'
import heroBackgroundUrl from '../assets/hero-background.png'

const bearOffset = ref({ x: 0, y: 0 })
let parallaxMedia

function resetParallax() {
  bearOffset.value = { x: 0, y: 0 }
}

function moveBear(event) {
  if (!parallaxMedia?.matches || event.pointerType === 'touch') return

  const bounds = event.currentTarget.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return

  const normalize = (position, size) => Math.max(-1, Math.min(1, position / size * 2 - 1))
  bearOffset.value = {
    x: normalize(event.clientX - bounds.left, bounds.width) * 24,
    y: normalize(event.clientY - bounds.top, bounds.height) * 16,
  }
}

onMounted(() => {
  parallaxMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  parallaxMedia.addEventListener('change', resetParallax)
  window.addEventListener('blur', resetParallax)
})

onBeforeUnmount(() => {
  parallaxMedia?.removeEventListener('change', resetParallax)
  window.removeEventListener('blur', resetParallax)
})
</script>

<template>
  <section
    class="relative isolate min-h-svh bg-brand text-surface"
    aria-labelledby="hero-title"
    @pointermove="moveBear"
    @pointerleave="resetParallax"
    @pointercancel="resetParallax"
  >
    <div class="site-container flex min-h-svh flex-col gap-10 pt-28 pb-104 sm:pt-32 nav:pb-0 wide:pt-36">
      <h1 id="hero-title" class="absolute top-1/2 left-0 z-2 w-full -translate-y-1/2 px-4 text-center font-display text-h1 uppercase sm:px-6">
        Пивоварня<br>
        и медоварня
      </h1>

      <div class="relative z-1 grid flex-1 items-end gap-8 nav:grid-cols-[1fr_1.4fr_1fr] nav:gap-6">
        <p class="max-w-sm text-body-large nav:mb-12 wide:mb-16">
          Производим медовуху, сидр и пуаре в Санкт-Петербурге с 2006 года.
        </p>

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
      class="pointer-events-none absolute left-210 h-96 w-full top-110 -translate-x-1/2 scale-400 object-contain object-bottom nav:h-[65svh] nav:w-[42%]"
      :src="heroBackgroundUrl"
      alt=""
      aria-hidden="true"
    >
    <img
      class="pointer-events-none absolute left-210 h-96 w-full top-100 -translate-x-1/2 scale-400 object-contain object-bottom transition-[translate] duration-500 ease-out motion-reduce:transition-none nav:h-[65svh] nav:w-[42%]"
      :style="{ translate: `calc(-50% + ${bearOffset.x}px) ${bearOffset.y}px` }"
      :src="heroImageUrl"
      alt="Медведь с бутылкой напитка «Медведь»"
    >
  </section>
</template>
