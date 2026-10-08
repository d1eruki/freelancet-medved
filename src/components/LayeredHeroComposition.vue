<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { usePointerParallax } from '../composables/use-pointer-parallax.js'
import HeroSteam from './HeroSteam.vue'
import { heroLayerStyle } from '../utils/hero-layer-layout'
import { entranceMotions } from '../utils/hero-entrance'

const pointerRange = { x: 12, y: 12 }

const middleMotion = { parallaxFactor: 1 / 6, scrollDistance: 24, floatDistance: '-3px', floatDuration: '8s' }

const layerMotion = {
  background: { parallaxFactor: 0, scrollDistance: 0 },
  middle: middleMotion,
  middle2: middleMotion,
  foreground: { parallaxFactor: 1 / 2, scrollDistance: 48, floatDistance: '-4px', floatDuration: '6s' },
}

const middleShadow = { offsetX: 0, offsetY: 0, blur: 100, color: [1, 1, 1], opacity: 1 }

const layerShadows = {
  middle: middleShadow,
  middle2: middleShadow,
  foreground: { offsetX: 0, offsetY: 0, blur: 100, color: [0, 0, 0], opacity: 1 },
}

const props = defineProps({
  layers: { type: Object, required: true },
  layerLayout: { type: Object, required: true },
  layerZIndex: { type: Object, default: null },
  entrance: { type: String, default: 'rise', validator: (value) => Object.hasOwn(entranceMotions, value) },
  steam: { type: Object, default: null },
})

const host = ref(null)
const middleImage = ref(null)
const { offset: parallaxOffset, reset: resetParallax, update: updateParallax } = usePointerParallax({ range: pointerRange })
const scrollProgress = ref(0)
const layersVisible = ref(true)
let section
let scrollMotionMedia
let visibilityObserver
let inViewport = true
let scrollFrame = 0

function setMiddleImage(element) {
  middleImage.value = element
}

function syncLayerMotion() {
  layersVisible.value = inViewport && !document.hidden
}

function updateScrollProgress() {
  scrollFrame = 0
  if (!scrollMotionMedia.matches) {
    scrollProgress.value = 0
    return
  }

  const bounds = section.getBoundingClientRect()
  scrollProgress.value = bounds.height
    ? Math.max(0, Math.min(1, -bounds.top / bounds.height))
    : 0
}

function scheduleScrollProgress() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollProgress)
}

function layerStyle(layer, name) {
  const motion = layerMotion[name]
  const shadow = layerShadows[name]
  return {
    ...heroLayerStyle(
      props.layerLayout[name],
      parallaxOffset.value.x * (motion?.parallaxFactor ?? 0),
      parallaxOffset.value.y * (motion?.parallaxFactor ?? 0),
    ),
    '--hero-layer-base-x-mobile': layer.baseX?.mobile ?? '0px',
    '--hero-layer-base-x-desktop': layer.baseX?.desktop ?? '0px',
    '--hero-layer-scroll-y': `${-scrollProgress.value * (motion?.scrollDistance ?? 0)}px`,
    '--float-distance': motion?.floatDistance,
    '--float-duration': motion?.floatDuration,
    animationPlayState: layersVisible.value ? 'running' : 'paused',
    filter: shadow
      ? `drop-shadow(${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px rgba(${shadow.color.join(', ')}, ${shadow.opacity}))`
      : undefined,
  }
}

onMounted(() => {
  section = host.value.parentElement
  section.addEventListener('pointermove', updateParallax)
  section.addEventListener('pointerleave', resetParallax)
  section.addEventListener('pointercancel', resetParallax)
  scrollMotionMedia = window.matchMedia('(prefers-reduced-motion: no-preference)')
  scrollMotionMedia.addEventListener('change', scheduleScrollProgress)
  window.addEventListener('scroll', scheduleScrollProgress, { passive: true })
  window.addEventListener('resize', scheduleScrollProgress)
  scheduleScrollProgress()
  visibilityObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry.isIntersecting
    syncLayerMotion()
  })
  visibilityObserver.observe(section)
  document.addEventListener('visibilitychange', syncLayerMotion)
})

onBeforeUnmount(() => {
  section?.removeEventListener('pointermove', updateParallax)
  section?.removeEventListener('pointerleave', resetParallax)
  section?.removeEventListener('pointercancel', resetParallax)
  scrollMotionMedia?.removeEventListener('change', scheduleScrollProgress)
  window.removeEventListener('scroll', scheduleScrollProgress)
  window.removeEventListener('resize', scheduleScrollProgress)
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
  visibilityObserver?.disconnect()
  document.removeEventListener('visibilitychange', syncLayerMotion)
})
</script>

<template>
  <div ref="host" class="layered-hero-composition">
    <picture
      v-for="(layer, name) in layers"
      :key="name"
      class="hero-composition-plane"
      :class="entranceMotions[entrance][name]"
      :style="{ zIndex: layerZIndex?.[name] ?? layer.zIndex }"
    >
      <source v-if="layer.avifSrcset" type="image/avif" :sizes="layer.sizes" :srcset="layer.avifSrcset">
      <img
        :ref="name === 'middle' ? setMiddleImage : undefined"
        :class="['hero-composition-layer', layer.className, {
          'hero-composition-layer-moving': name !== 'background',
          'hero-composition-layer-float': layerMotion[name]?.floatDuration,
        }]"
        :style="layerStyle(layer, name)"
        :sizes="layer.sizes"
        :srcset="layer.srcset"
        :src="layer.src"
        :fetchpriority="layer.fetchpriority"
        :alt="layer.alt ?? ''"
        :aria-hidden="layer.alt ? undefined : 'true'"
      >
    </picture>
    <HeroSteam
      v-if="steam"
      :source="middleImage"
      :fit="steam.fit"
      :anchor-x="steam.anchorX"
      :anchor-y="steam.anchorY"
      :scale-divisor="steam.scaleDivisor"
    />
  </div>
</template>

<style scoped>
.layered-hero-composition {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-composition-plane {
  position: absolute;
  inset: 0;
}

.hero-composition-layer {
  pointer-events: none;
  scale: var(--hero-layer-mobile-scale);
  translate: calc(var(--hero-layer-base-x-mobile) + var(--hero-layer-mobile-x) + var(--hero-layer-parallax-x)) calc(var(--hero-layer-mobile-y) + var(--hero-layer-parallax-y) + var(--hero-layer-scroll-y));
}

.hero-composition-layer-moving {
  transition: translate 500ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .hero-composition-layer-moving {
    transition: none;
  }
}

@media (min-width: 40rem) {
  .hero-composition-layer {
    scale: var(--hero-layer-desktop-scale);
    translate: calc(var(--hero-layer-base-x-desktop) + var(--hero-layer-desktop-x) + var(--hero-layer-parallax-x)) calc(var(--hero-layer-desktop-y) + var(--hero-layer-parallax-y) + var(--hero-layer-scroll-y));
  }
}

@media (prefers-reduced-motion: no-preference) {
  .hero-composition-plane-rise,
  .hero-composition-plane-rise-delayed {
    transform-origin: center bottom;
    animation: hero-layer-rise var(--hero-rise-duration, 1000ms) cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .hero-composition-plane-rise-delayed {
    animation-delay: var(--hero-secondary-rise-delay, 120ms);
  }

  .hero-composition-plane-slide,
  .hero-composition-plane-slide-delayed,
  .hero-composition-plane-slide-left {
    animation: hero-layer-slide-in var(--hero-slide-duration) cubic-bezier(0.4, 0.8, 0.6, 1) var(--hero-slide-delay) both;
  }

  .hero-composition-plane-slide-delayed {
    animation-delay: var(--hero-secondary-slide-delay);
  }

  .hero-composition-plane-slide-left {
    animation-name: hero-layer-slide-in-left;
  }

  .hero-composition-layer-float {
    animation: hero-layer-float var(--float-duration) ease-in-out infinite;
  }
}

@keyframes hero-layer-rise {
  from {
    transform: perspective(1200px) rotateX(72deg);
  }

  to {
    transform: perspective(1200px) rotateX(0);
  }
}

@keyframes hero-layer-slide-in {
  from { transform: translateX(100vw); }
  to { transform: translateX(0); }
}

@keyframes hero-layer-slide-in-left {
  from { transform: translateX(-100vw); }
  to { transform: translateX(0); }
}

@keyframes hero-layer-float {
  0%,
  100% { transform: translateY(0); }
  50% { transform: translateY(var(--float-distance)); }
}
</style>
