<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { productRenderFrame } from '../data/product-slider-renders.js'
defineProps({ renders: { type: Object, required: true } })
// Rendered pair width includes the transparent frame around the glass and can.
const pairWidthScale = productRenderFrame.heightScale * productRenderFrame.width / productRenderFrame.height
const imageSizes = `(min-width: 54rem) ${Math.ceil(576 * pairWidthScale)}px, (min-width: 40rem) ${Math.ceil(448 * pairWidthScale)}px, min(calc((100vw - 144px) * ${pairWidthScale}), ${Math.ceil(384 * pairWidthScale)}px)`
const composition = ref(null)
const shadowClip = ref({ visibility: 'hidden' })
let resizeObserver
onMounted(() => {
  const element = composition.value
  const section = element.closest('section')
  const counter = section?.querySelector('[data-product-counter]')
  if (!counter) return
  const updateClip = () => {
    const frame = element.getBoundingClientRect()
    const surface = counter.getBoundingClientRect()
    // Маска находится снаружи движущегося слоя: наклон не уводит тень за стойку.
    shadowClip.value = {
      clipPath: `inset(${surface.top - frame.top}px ${frame.right - surface.right}px ${frame.bottom - surface.bottom}px ${surface.left - frame.left}px)`,
    }
  }
  resizeObserver = new ResizeObserver(updateClip)
  for (const target of [element, counter, section]) resizeObserver.observe(target)
  updateClip()
})
onBeforeUnmount(() => resizeObserver?.disconnect())
const layers = [
  { source: 'glassShadow', kind: 'glass', shadow: true },
  { source: 'canShadow', kind: 'can', shadow: true },
  { source: 'glass', kind: 'glass', shadow: false },
  { source: 'can', kind: 'can', shadow: false },
]
</script>

<template>
  <span ref="composition" class="product-composition" :style="{ '--frame-center': `${-productRenderFrame.center}%`, '--frame-height': `${productRenderFrame.heightScale * 100}%`, '--frame-top': `${productRenderFrame.topOffset}%` }" aria-hidden="true">
    <span v-for="layer in layers" :key="layer.source" class="product-layer-clip" :style="layer.shadow ? shadowClip : undefined">
      <span class="product-motion-layer" :class="`product-${layer.kind}`">
      <img
        class="product-layer"
        :class="[`product-${layer.kind}`, layer.shadow ? 'product-shadow' : 'product-model']"
        :style="{ transformOrigin: productRenderFrame.origins[layer.kind] }"
        :src="renders[layer.source].src"
        :srcset="renders[layer.source].srcset"
        :sizes="imageSizes"
        loading="lazy"
        alt=""
        draggable="false"
        decoding="async"
      >
      </span>
    </span>
  </span>
</template>

<style scoped>
.product-composition {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transform: translateX(calc(-1 * var(--product-translation, 0px)));
  transition: transform var(--product-track-duration) var(--product-track-easing);
}
.product-layer-clip {
  position: absolute;
  inset: 0;
}
/* Трек компенсируется тем же движением; каждый объект едет со своей тенью.
   Перемещение снаружи вращения не меняет путь при наклоне изображения. */
.product-motion-layer {
  position: absolute;
  inset: 0;
  transform: translateX(var(--product-translation, 0px));
  transition: transform 600ms var(--product-track-easing);
}
.product-motion-layer.product-glass {
  transition-duration: 700ms;
  transition-delay: 100ms;
}
/* У всех изображений один кадр; дополнительные поля не меняют масштаб пары. */
.product-layer {
  position: absolute;
  top: var(--frame-top);
  left: 50%;
  width: auto;
  height: var(--frame-height);
  translate: var(--frame-center) 0;
  max-width: none;
  transition: rotate 500ms;
}
@media (prefers-reduced-motion: reduce) {
  .product-composition, .product-motion-layer, .product-layer { transition: none; }
}
</style>
