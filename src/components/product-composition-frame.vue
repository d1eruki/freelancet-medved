<!-- Общая рамка композиции продукции с размещением и анимацией слоёв. -->
<script setup>
import SiteImage from './site-image.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BrandedGlass from './branded-glass.vue'

const props = defineProps({
  frame: { type: Object, required: true },
  layers: { type: Array, required: true },
})

const compositionStyle = computed(() => ({
  '--frame-center': `${-props.frame.center}%`,
  '--frame-height': `${props.frame.heightScale * 100}%`,
  '--frame-top': `${props.frame.topOffset}%`,
}))
function imageSizes(widthScale) {
  return `(min-width: 54rem) ${Math.ceil(576 * widthScale)}px, (min-width: 40rem) ${Math.ceil(448 * widthScale)}px, min(calc((100vw - 144px) * ${widthScale}), ${Math.ceil(384 * widthScale)}px)`
}
const frameImageSizes = computed(() => imageSizes(props.frame.heightScale * props.frame.width / props.frame.height))
function layerSizes(layer) {
  if (layer.sizes) return layer.sizes
  const glass = layer.glass
  return glass ? imageSizes(glass.slider.heightScale * glass.width / glass.height) : frameImageSizes.value
}
function layerStyle(layer) {
  if (layer.style) return layer.style
  const { slider } = layer.glass
  return {
    '--frame-center': `${-slider.center}%`,
    '--frame-height': `${slider.heightScale * 100}%`,
    '--frame-top': `${slider.topOffset}%`,
    left: `${slider.leftOffset ?? 50}%`,
    transformOrigin: slider.origin,
  }
}

const composition = ref(null)
const shadowClip = ref({ visibility: 'hidden' })
const counterClip = ref({ visibility: 'hidden' })
let resizeObserver
onMounted(() => {
  const element = composition.value
  const section = element.closest('section')
  const counter = section?.querySelector('[data-product-counter]')
  if (!counter) return
  const updateClip = () => {
    const frame = element.getBoundingClientRect()
    const surface = counter.getBoundingClientRect()
    // Маска снаружи движущегося слоя удерживает тень на стойке при наклоне.
    shadowClip.value = {
      clipPath: `inset(${surface.top - frame.top}px ${frame.right - surface.right}px ${frame.bottom - surface.bottom}px ${surface.left - frame.left}px)`,
    }
    // Предплечье остаётся за дальней кромкой стойки даже при движении кисти.
    counterClip.value = {
      '--counter-edge': `${surface.top - frame.top}px`,
      maskImage: 'linear-gradient(to bottom, #000 calc(var(--counter-edge) - 1px), transparent var(--counter-edge))',
    }
  }
  resizeObserver = new ResizeObserver(updateClip)
  for (const target of [element, counter, section]) resizeObserver.observe(target)
  updateClip()
})
onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <span ref="composition" class="product-composition" :style="compositionStyle" aria-hidden="true">
    <span v-for="layer in layers" :key="layer.source" class="product-layer-clip" :class="layer.classes" :style="layer.shadow ? shadowClip : layer.behindCounter ? counterClip : undefined">
      <span class="product-motion-layer" :class="`product-${layer.kind}`" :style="layer.motion">
        <span class="product-layer-content" :class="{ 'product-catch-layer': layer.catch }" :style="layer.contentStyle">
          <BrandedGlass
            v-if="layer.glass"
            class="product-layer product-model"
            :class="`product-${layer.kind}`"
            :style="[layerStyle(layer), layer.poseStyle]"
            :glass="layer.glass"
            :sizes="layerSizes(layer)"
          />
          <SiteImage
            v-else
            class="product-layer"
            :class="[`product-${layer.kind}`, layer.shadow ? 'product-shadow' : 'product-model', { 'product-grip': layer.catch }]"
            :style="[layerStyle(layer), layer.poseStyle]"
            :src="layer.image.src"
            :srcset="layer.image.srcset"
            :sizes="layerSizes(layer)"
            alt=""
            draggable="false"
            decoding="async"
          />
        </span>
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
.product-layer-content {
  position: absolute;
  inset: 0;
}
/* Объект и его тень движутся одинаково; перемещение снаружи вращения. */
.product-motion-layer {
  position: absolute;
  inset: 0;
  transform: translateX(var(--product-translation, 0px));
  transition: transform var(--layer-motion-duration, 600ms) var(--product-track-easing) var(--layer-motion-delay, 0ms);
}
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
