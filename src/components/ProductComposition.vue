<script setup>
import { productRenderFrame } from '../data/product-slider-renders.js'
defineProps({ renders: { type: Object, required: true } })
const layers = [
  { source: 'pairShadow', shadow: true },
  { source: 'pair', shadow: false },
]
</script>

<template>
  <span class="product-composition" :style="{ '--frame-center': `${-productRenderFrame.center}%`, '--frame-height': `${productRenderFrame.heightScale * 100}%`, '--frame-top': `${productRenderFrame.topOffset}%` }" aria-hidden="true">
    <span v-for="layer in layers" :key="layer.source" class="product-motion-layer product-pair">
      <img
        class="product-layer"
        :class="['product-pair', layer.shadow ? 'product-shadow' : 'product-model']"
        :style="{ transformOrigin: productRenderFrame.origins.glass }"
        :src="renders[layer.source]"
        alt=""
        draggable="false"
        decoding="async"
      >
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
/* Трек компенсируется тем же движением; пара и её тень едут вместе.
   Перемещение снаружи вращения не меняет путь при наклоне изображения. */
.product-motion-layer {
  position: absolute;
  inset: 0;
  transform: translateX(var(--product-translation, 0px));
  transition: transform 600ms var(--product-track-easing);
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
