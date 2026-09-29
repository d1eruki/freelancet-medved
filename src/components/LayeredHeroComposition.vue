<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import HeroSteam from './HeroSteam.vue'
import { heroLayerStyle } from '../utils/hero-layer-layout'

const motionProfiles = {
  gentle: { x: 24, y: 16 },
  wide: { x: 40, y: 28 },
}

const layerMotion = {
  background: { parallaxFactor: 0 },
  middle: { parallaxFactor: 1 / 3, floatDistance: '-3px', floatDuration: '8s' },
  foreground: { parallaxFactor: 1, floatDistance: '-4px', floatDuration: '6s' },
}

const props = defineProps({
  layers: { type: Object, required: true },
  layerLayout: { type: Object, required: true },
  motionProfile: { type: String, default: 'wide' },
  steam: { type: Object, default: null },
})

const host = ref(null)
const middleImage = ref(null)
const parallaxOffset = ref({ x: 0, y: 0 })
const layersVisible = ref(true)
let section
let parallaxMedia
let visibilityObserver
let inViewport = true

function setMiddleImage(element) {
  middleImage.value = element
}

function syncLayerMotion() {
  layersVisible.value = inViewport && !document.hidden
}

function resetParallax() {
  parallaxOffset.value = { x: 0, y: 0 }
}

function updateParallax(event) {
  if (!parallaxMedia?.matches || event.pointerType === 'touch') return

  const bounds = section.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return

  const normalize = (position, size) => Math.max(-1, Math.min(1, position / size * 2 - 1))
  const range = motionProfiles[props.motionProfile] ?? motionProfiles.wide
  parallaxOffset.value = {
    x: normalize(event.clientX - bounds.left, bounds.width) * range.x,
    y: normalize(event.clientY - bounds.top, bounds.height) * range.y,
  }
}

function layerStyle(layer, name) {
  const motion = layerMotion[name]
  return {
    ...heroLayerStyle(
      props.layerLayout[name],
      parallaxOffset.value.x * (motion?.parallaxFactor ?? 0),
      parallaxOffset.value.y * (motion?.parallaxFactor ?? 0),
    ),
    '--hero-layer-base-x-mobile': layer.baseX?.mobile ?? '0px',
    '--hero-layer-base-x-desktop': layer.baseX?.desktop ?? '0px',
    '--float-distance': motion?.floatDistance,
    '--float-duration': motion?.floatDuration,
    animationPlayState: layersVisible.value ? 'running' : 'paused',
    zIndex: layer.zIndex,
  }
}

onMounted(() => {
  section = host.value.parentElement
  section.addEventListener('pointermove', updateParallax)
  section.addEventListener('pointerleave', resetParallax)
  section.addEventListener('pointercancel', resetParallax)
  parallaxMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  parallaxMedia.addEventListener('change', resetParallax)
  window.addEventListener('blur', resetParallax)
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
  parallaxMedia?.removeEventListener('change', resetParallax)
  window.removeEventListener('blur', resetParallax)
  visibilityObserver?.disconnect()
  document.removeEventListener('visibilitychange', syncLayerMotion)
})
</script>

<template>
  <div ref="host" class="layered-hero-composition">
    <picture v-for="(layer, name) in layers" :key="name">
      <source v-if="layer.avifSrcset" type="image/avif" :sizes="layer.sizes" :srcset="layer.avifSrcset">
      <img
        :ref="name === 'middle' ? setMiddleImage : undefined"
        :class="['hero-composition-layer', layer.className, {
          'hero-composition-layer-moving': name !== 'background',
          'hero-composition-layer-float': layerMotion[name]?.floatDuration,
          'drop-shadow-[0_0_100px_rgba(1,1,1,0.5)]': name === 'middle',
          'drop-shadow-[0_0_100px_rgba(0,0,0,1)]': name === 'foreground',
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

.hero-composition-layer {
  pointer-events: none;
  scale: var(--hero-layer-mobile-scale);
  translate: calc(var(--hero-layer-base-x-mobile) + var(--hero-layer-mobile-x) + var(--hero-layer-parallax-x)) calc(var(--hero-layer-mobile-y) + var(--hero-layer-parallax-y));
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
    translate: calc(var(--hero-layer-base-x-desktop) + var(--hero-layer-desktop-x) + var(--hero-layer-parallax-x)) calc(var(--hero-layer-desktop-y) + var(--hero-layer-parallax-y));
  }
}

@media (prefers-reduced-motion: no-preference) {
  .hero-composition-layer-float {
    animation: hero-layer-float var(--float-duration) ease-in-out infinite;
  }
}

@keyframes hero-layer-float {
  0%,
  100% { transform: translateY(0); }
  50% { transform: translateY(var(--float-distance)); }
}
</style>
