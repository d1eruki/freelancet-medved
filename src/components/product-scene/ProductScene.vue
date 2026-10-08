<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createProductScene, productSceneKey } from '../../three/product/product-scene.js'
import { drinkPresets } from '../../data/drink-presets.js'
import canModelUrl from '../../assets/models/can.glb?url'

const props = defineProps({
  canOnly: { type: Boolean, default: false },
  loadGlassOptics: { type: Function, default: null },
  active: { type: Boolean, default: false },
  paused: { type: Boolean, default: false },
  drink: { type: String, default: 'cider', validator: value => Object.hasOwn(drinkPresets, value) },
  foam: { type: Boolean, default: true },
  canLabel: { type: String, default: '' },
  patternSlug: { type: String, required: true },
  fallback: { type: String, default: '' },
})
const emit = defineEmits(['ready', 'error'])
const sharedOwner = inject(productSceneKey, null)
const owner = sharedOwner || createProductScene({ loadGlassOptics: props.loadGlassOptics })
const root = ref(null)
const snapshot = ref(null)
const error = ref('')
let view = null
let activationObserver = null
let mayActivate = false

function model(bank) {
  return {
    host: ref(null), proxy: ref(null), ready: ref(false),
    hitStyle: ref({}),
    props: {
      bank, source: bank ? canModelUrl : '',
      get active() { return props.active },
      get paused() { return props.paused },
      get drink() { return props.drink },
      get foam() { return props.foam },
      get label() { return props.canLabel },
    },
    emit(event, message) {
      if (event === 'error') { error.value = message; emit('error', message) }
    },
  }
}
const glass = model(false)
const can = model(true)
const models = computed(() => props.canOnly ? [can] : [can, glass])
const ready = computed(() => can.ready.value && (props.canOnly || glass.ready.value))
watch(ready, value => emit('ready', value))
watch(() => props.active, active => {
  if (active && view && mayActivate) owner.activate(view)
}, { flush: 'post' })
watch(() => [props.drink, props.foam, props.paused, props.canLabel], () => {
  if (view) owner.refresh(view)
}, { flush: 'post' })

onMounted(() => {
  const section = root.value.closest('section')
  view = {
    root: root.value, section, snapshot: snapshot.value,
    counter: section.querySelector('[data-product-counter]'),
    background: section.querySelector('[data-product-background]'),
    pattern: section.querySelector(`[data-product-pattern="${props.patternSlug}"]`),
    glass: props.canOnly ? null : { ...glass, host: glass.host.value, proxy: glass.proxy.value },
    can: { ...can, host: can.host.value, proxy: can.proxy.value },
  }
  // Тяжёлые GLB и Three.js нужны только при приближении к секции продукции.
  activationObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    mayActivate = true
    activationObserver.disconnect()
    if (props.active) owner.activate(view)
  }, { rootMargin: '200px' })
  activationObserver.observe(section)
})
onBeforeUnmount(() => {
  activationObserver?.disconnect()
  if (view) owner.release(view)
  if (!sharedOwner) owner.dispose()
})
</script>

<template>
  <span ref="root" class="product-scene" :class="{ 'is-loading': !ready, 'has-error': error, 'is-can-only': canOnly }">
    <img v-if="error && fallback" class="product-scene-fallback" :src="fallback" alt="" draggable="false">
    <span v-if="active && !ready && !error" class="product-scene-loader" role="status" aria-label="Загрузка моделей">
      <span class="product-scene-spinner" aria-hidden="true" />
    </span>
    <span v-if="active && error" :class="fallback ? 'sr-only' : 'product-scene-error'" role="status">{{ error }}</span>
    <canvas ref="snapshot" class="product-scene-snapshot" hidden aria-hidden="true" />
    <span
      v-for="(item, index) in models"
      :key="index"
      :ref="element => { item.host.value = element }"
      class="product-scene-model"
      :class="{ 'product-scene-can': index === 0 }"
      aria-hidden="true"
    >
      <span :ref="element => { item.proxy.value = element }" class="product-scene-transform" />
      <span class="product-scene-hit" :style="{ ...item.hitStyle.value, display: ready && !error ? undefined : 'none' }" />
    </span>
  </span>
</template>

<style scoped>
.product-scene {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.product-scene-model {
  position: absolute;
  z-index: 1;
  left: calc(50% + var(--composition-offset, 0px));
  bottom: var(--product-model-bottom, 2.083333%);
  height: var(--product-model-height, 91.666667%);
  aspect-ratio: 1;
  transform: translateX(-50%);
}

.product-scene-can {
  z-index: 0;
  left: calc(50% + var(--composition-offset, 0px) + var(--product-can-offset, 22.222222%));
  bottom: var(--product-can-bottom, 13.888889%);
}

.is-can-only .product-scene-can {
  left: calc(50% + var(--composition-offset, 0px));
  bottom: var(--product-model-bottom, 2.083333%);
}

.product-scene-transform {
  position: absolute;
  inset: 0;
  transform-origin: var(--model-origin, 50% 90%);
  transition: rotate 500ms;
}

.product-scene-hit { position: absolute; z-index: 2; pointer-events: auto; }

.product-scene-snapshot,
.product-scene :deep(.product-scene-canvas) {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  display: block;
}

.product-scene-snapshot[hidden] { display: none; }
.product-scene.is-loading :deep(.product-scene-canvas),
.product-scene.has-error :deep(.product-scene-canvas),
.product-scene.has-error .product-scene-snapshot { visibility: hidden; }

.product-scene-fallback { width: 100%; height: 100%; object-fit: contain; }
.product-scene-error { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }
.product-scene-loader { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; }
.product-scene-spinner { width: 44px; height: 44px; border: 3px solid rgb(61 90 69 / 0.18); border-top-color: #3d5a45; border-radius: 50%; animation: product-scene-spin 800ms linear infinite; }
@keyframes product-scene-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .product-scene-spinner { animation-duration: 2s; }
  .product-scene-transform { transition: none; }
}
</style>
