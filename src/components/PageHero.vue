<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LayeredHeroComposition from './LayeredHeroComposition.vue'
import { layerEntranceTimings, imageCopyTiming } from '../utils/hero-entrance'

const pageHeroLayerZIndex = { background: -2, middle: 1, middle2: 1, foreground: 3 }
const props = defineProps({
  titleId: { type: String, required: true },
  titleZIndex: { type: Number, default: 2 },
  imageUrl: { type: String, default: null },
  imageAlt: { type: String, default: 'Производственный цех с оборудованием из нержавеющей стали' },
  contentAlign: { type: String, default: 'left', validator: (value) => ['left', 'center'].includes(value) },
  pointerParallax: { type: Boolean, default: false },
  layers: { type: Object, default: null },
  layerLayout: { type: Object, default: null },
  layerEntrance: { type: String, default: 'rise', validator: (value) => Object.hasOwn(layerEntranceTimings, value) },
  animateCopy: { type: Boolean, default: false },
  steam: { type: Object, default: null },
})

const parallaxOffset = ref({ x: 0, y: 0 })
let parallaxMedia

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
  if (props.layers || !props.pointerParallax) return
  parallaxMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  parallaxMedia.addEventListener('change', resetParallax)
  window.addEventListener('blur', resetParallax)
})

onBeforeUnmount(() => {
  parallaxMedia?.removeEventListener('change', resetParallax)
  if (!props.layers && props.pointerParallax) window.removeEventListener('blur', resetParallax)
})
</script>

<template>
  <section
    class="relative isolate min-h-svh overflow-hidden bg-foreground text-surface"
    data-header-theme="light"
    :aria-labelledby="titleId"
    :style="layers ? layerEntranceTimings[layerEntrance] : animateCopy ? imageCopyTiming : undefined"
    @pointermove="!layers && updateParallax($event)"
    @pointerleave="!layers && resetParallax()"
    @pointercancel="!layers && resetParallax()"
  >
    <figure v-if="!layers && imageUrl" class="absolute inset-0 -z-1">
      <img
        class="object-cover object-center"
        :class="pointerParallax ? 'absolute -inset-x-12 -inset-y-8 h-[calc(100%+4rem)] w-[calc(100%+6rem)] transition-[translate] duration-500 ease-out motion-reduce:transition-none' : 'size-full'"
        :style="pointerParallax ? { translate: `${parallaxOffset.x}px ${parallaxOffset.y}px` } : undefined"
        :src="imageUrl"
        :alt="imageAlt"
      >
    </figure>
    <LayeredHeroComposition v-if="layers" :layers="layers" :layer-layout="layerLayout" :layer-z-index="pageHeroLayerZIndex" :entrance="layerEntrance" :steam="steam" />
    <figure class="pointer-events-none absolute inset-0 -z-1">
      <span class="hero-overlay-bottom absolute inset-0" :class="{ 'is-centered': contentAlign === 'center' }" aria-hidden="true" />
      <span class="hero-overlay-center absolute inset-0" :class="{ 'is-centered': contentAlign === 'center' }" aria-hidden="true" />
    </figure>

    <div class="site-container relative flex min-h-svh flex-col justify-center pt-28 pb-8 sm:pt-32 sm:pb-12">
      <div class="flex flex-col gap-6" :class="{ 'items-center text-center': contentAlign === 'center' }">
        <h1 :id="titleId" class="relative font-display text-h1 uppercase" :class="{ 'hero-copy-rise': layers || animateCopy }" :style="{ zIndex: titleZIndex }">
          <slot name="title" />
        </h1>

        <p class="hero-description relative z-4 max-w-xl text-surface/80 nav:max-w-md" :class="{ 'hero-copy-rise': layers || animateCopy }">
          <slot />
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-overlay-bottom {
  background: radial-gradient(ellipse 65% 80% at 0% 100%, rgb(16 16 16 / 72%) 0%, rgb(16 16 16 / 40%) 42%, transparent 100%);
}

.hero-overlay-center {
  background: radial-gradient(ellipse 56% 80% at 0% 48%, rgb(16 16 16 / 56%) 0%, rgb(16 16 16 / 24%) 48%, transparent 100%);
}

.hero-overlay-bottom.is-centered {
  background: radial-gradient(ellipse 65% 80% at 50% 100%, rgb(16 16 16 / 72%) 0%, rgb(16 16 16 / 40%) 42%, transparent 100%);
}

.hero-overlay-center.is-centered {
  background: radial-gradient(ellipse 56% 80% at 50% 48%, rgb(16 16 16 / 56%) 0%, rgb(16 16 16 / 24%) 48%, transparent 100%);
}

@media (prefers-reduced-motion: no-preference) {
  .hero-copy-rise {
    animation: hero-copy-rise 500ms ease-out var(--hero-title-delay) both;
  }

  .hero-description.hero-copy-rise {
    animation-delay: var(--hero-description-delay);
  }
}

@keyframes hero-copy-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
