<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LayeredHeroComposition from './LayeredHeroComposition.vue'
import productionImageUrl from '../assets/heroes/production-hero.png'

const props = defineProps({
  titleId: { type: String, required: true },
  imageUrl: { type: String, default: productionImageUrl },
  imageAlt: { type: String, default: 'Производственный цех с оборудованием из нержавеющей стали' },
  overlayVariant: { type: String, default: 'default' },
  pointerParallax: { type: Boolean, default: false },
  layers: { type: Object, default: null },
  layerLayout: { type: Object, default: null },
  motionProfile: { type: String, default: 'wide' },
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
    @pointermove="!layers && updateParallax($event)"
    @pointerleave="!layers && resetParallax()"
    @pointercancel="!layers && resetParallax()"
  >
    <figure v-if="!layers" class="absolute inset-0 -z-1">
      <img
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
    </figure>
    <LayeredHeroComposition v-if="layers" :layers="layers" :layer-layout="layerLayout" :motion-profile="motionProfile" :steam="steam" />
    <figure v-if="layers && overlayVariant === 'catalog'" class="pointer-events-none absolute inset-0 -z-1">
      <span class="catalog-overlay-bottom absolute inset-0" aria-hidden="true" />
      <span class="catalog-overlay-center absolute inset-0" aria-hidden="true" />
    </figure>

    <div class="site-container relative grid min-h-svh grid-rows-1 pt-28 pb-8 sm:pt-32 sm:pb-12">
      <h1 :id="titleId" class="relative z-2 col-start-1 row-start-1 self-center font-display text-h1 uppercase">
        <slot name="title" />
      </h1>

      <p class="hero-description relative z-4 col-start-1 row-start-1 self-end max-w-xl text-surface/80 nav:max-w-md">
        <slot />
      </p>
    </div>
  </section>
</template>

<style scoped>
.catalog-overlay-bottom {
  background: radial-gradient(ellipse 65% 80% at 0% 100%, rgb(16 16 16 / 72%) 0%, rgb(16 16 16 / 40%) 42%, transparent 100%);
}

.catalog-overlay-center {
  background: radial-gradient(ellipse 56% 80% at 0% 48%, rgb(16 16 16 / 56%) 0%, rgb(16 16 16 / 24%) 48%, transparent 100%);
}
</style>
