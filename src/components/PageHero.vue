<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import HeroSteam from './HeroSteam.vue'
import productionImageUrl from '../assets/production-hero.png'
import { heroLayerStyle } from '../utils/hero-layer-layout'

const props = defineProps({
  titleId: { type: String, required: true },
  imageUrl: { type: String, default: productionImageUrl },
  imageAlt: { type: String, default: 'Производственный цех с оборудованием из нержавеющей стали' },
  overlayVariant: { type: String, default: 'default' },
  pointerParallax: { type: Boolean, default: false },
  layers: { type: Object, default: null },
  layerLayout: { type: Object, default: null },
})

const heroSection = ref(null)
const middleImage = ref(null)
const parallaxOffset = ref({ x: 0, y: 0 })
const layersVisible = ref(true)
let parallaxMedia
let visibilityObserver
let inViewport = true

function syncLayerMotion() {
  layersVisible.value = inViewport && !document.hidden
}

function resetParallax() {
  parallaxOffset.value = { x: 0, y: 0 }
}

function updateParallax(event) {
  if (!props.pointerParallax || !parallaxMedia?.matches || event.pointerType === 'touch') return

  const bounds = event.currentTarget.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return

  const normalize = (position, size) => Math.max(-1, Math.min(1, position / size * 2 - 1))
  parallaxOffset.value = {
    x: normalize(event.clientX - bounds.left, bounds.width) * 40,
    y: normalize(event.clientY - bounds.top, bounds.height) * 28,
  }
}

onMounted(() => {
  if (props.layers) {
    visibilityObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting
      syncLayerMotion()
    })
    visibilityObserver.observe(heroSection.value)
    document.addEventListener('visibilitychange', syncLayerMotion)
  }
  if (!props.pointerParallax) return
  parallaxMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  parallaxMedia.addEventListener('change', resetParallax)
  window.addEventListener('blur', resetParallax)
})

onBeforeUnmount(() => {
  visibilityObserver?.disconnect()
  if (props.layers) document.removeEventListener('visibilitychange', syncLayerMotion)
  parallaxMedia?.removeEventListener('change', resetParallax)
  if (props.pointerParallax) window.removeEventListener('blur', resetParallax)
})
</script>

<template>
  <section
    ref="heroSection"
    class="relative isolate min-h-svh overflow-hidden bg-foreground text-surface"
    data-header-theme="light"
    :aria-labelledby="titleId"
    @pointermove="updateParallax"
    @pointerleave="resetParallax"
    @pointercancel="resetParallax"
  >
    <figure class="absolute inset-0 -z-1">
      <template v-if="layers">
        <picture>
          <source type="image/avif" :sizes="layers.background.sizes" :srcset="layers.background.avifSrcset">
          <img class="hero-configured-layer absolute inset-0 size-full object-cover object-center" :style="heroLayerStyle(layerLayout?.background)" :sizes="layers.background.sizes" :srcset="layers.background.srcset" :src="layers.background.src" :alt="imageAlt">
        </picture>
        <picture>
          <source type="image/avif" :sizes="layers.middle.sizes" :srcset="layers.middle.avifSrcset">
          <img
            ref="middleImage"
            class="hero-configured-layer catalog-layer-middle pointer-events-none absolute inset-0 size-full object-cover object-center transition-[translate] duration-500 ease-out motion-reduce:transition-none"
            :style="{ ...heroLayerStyle(layerLayout?.middle, parallaxOffset.x / 3, parallaxOffset.y / 3), animationPlayState: layersVisible ? 'running' : 'paused' }"
            :sizes="layers.middle.sizes"
            :srcset="layers.middle.srcset"
            :src="layers.middle.src"
            alt=""
            aria-hidden="true"
          >
        </picture>
        <picture>
          <source type="image/avif" :sizes="layers.foreground.sizes" :srcset="layers.foreground.avifSrcset">
          <img
            class="hero-configured-layer catalog-layer-foreground pointer-events-none absolute inset-0 size-full object-cover object-center transition-[translate] duration-500 ease-out motion-reduce:transition-none"
            :style="{ ...heroLayerStyle(layerLayout?.foreground, parallaxOffset.x, parallaxOffset.y), animationPlayState: layersVisible ? 'running' : 'paused' }"
            :sizes="layers.foreground.sizes"
            :srcset="layers.foreground.srcset"
            :src="layers.foreground.src"
            alt=""
            aria-hidden="true"
          >
        </picture>
      </template>
      <img
        v-else
        class="object-cover object-center"
        :class="pointerParallax ? 'absolute -inset-x-12 -inset-y-8 h-[calc(100%+4rem)] w-[calc(100%+6rem)] transition-[translate] duration-500 ease-out motion-reduce:transition-none' : 'size-full'"
        :style="pointerParallax ? { translate: `${parallaxOffset.x}px ${parallaxOffset.y}px` } : undefined"
        :src="imageUrl"
        :alt="imageAlt"
      >
      <template v-if="overlayVariant === 'default'">
        <span class="absolute inset-0 bg-foreground/60" aria-hidden="true" />
        <span class="absolute inset-0 bg-linear-to-t from-foreground/85 via-transparent to-foreground/20" aria-hidden="true" />
        <span class="absolute inset-0 hidden bg-linear-to-r from-foreground/75 via-foreground/15 to-transparent nav:block" aria-hidden="true" />
      </template>
      <template v-else-if="overlayVariant === 'catalog'">
        <span class="catalog-overlay-bottom pointer-events-none absolute inset-0" aria-hidden="true" />
        <span class="catalog-overlay-center pointer-events-none absolute inset-0" aria-hidden="true" />
      </template>
    </figure>
    <HeroSteam v-if="layers" :source="middleImage" fit="cover" :anchor-x="0.71" :anchor-y="0.2" :scale-divisor="3500" />

    <div class="site-container relative z-2 grid min-h-svh grid-rows-[1fr_auto] pt-28 pb-8 sm:pt-32 sm:pb-12">
      <h1 :id="titleId" class="self-center font-display text-h1 uppercase">
        <slot name="title" />
      </h1>

      <p class="max-w-xl text-body-large font-medium text-surface/80 nav:max-w-md">
        <slot />
      </p>
    </div>
  </section>
</template>

<style scoped>
.hero-configured-layer {
  scale: var(--hero-layer-mobile-scale);
  translate: calc(var(--hero-layer-mobile-x) + var(--hero-layer-parallax-x)) calc(var(--hero-layer-mobile-y) + var(--hero-layer-parallax-y));
}

@media (min-width: 40rem) {
  .hero-configured-layer {
    scale: var(--hero-layer-desktop-scale);
    translate: calc(var(--hero-layer-desktop-x) + var(--hero-layer-parallax-x)) calc(var(--hero-layer-desktop-y) + var(--hero-layer-parallax-y));
  }
}

@media (prefers-reduced-motion: no-preference) {
  .catalog-layer-middle {
    --float-distance: -3px;
    animation: catalog-layer-float 8s ease-in-out infinite;
  }

  .catalog-layer-foreground {
    --float-distance: -4px;
    animation: catalog-layer-float 6s ease-in-out infinite;
  }
}

@keyframes catalog-layer-float {
  0%,
  100% { transform: translateY(0); }
  50% { transform: translateY(var(--float-distance)); }
}

.catalog-overlay-bottom {
  background: radial-gradient(ellipse 65% 80% at 0% 100%, rgb(16 16 16 / 72%) 0%, rgb(16 16 16 / 40%) 42%, transparent 100%);
}

.catalog-overlay-center {
  background: radial-gradient(ellipse 56% 80% at 0% 48%, rgb(16 16 16 / 56%) 0%, rgb(16 16 16 / 24%) 48%, transparent 100%);
}
</style>
