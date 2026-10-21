<!-- Композиция изображений продукции в оригинальной версии слайдера. -->
<script setup>
import { computed } from 'vue'
import ProductCompositionFrame from './product-composition-frame.vue'
import { productRenderFrame } from '#product-slider-renders'

const props = defineProps({ renders: { type: Object, required: true } })
const canStyle = computed(() => {
  const frame = props.renders.canFrame
  if (!frame) return { transformOrigin: productRenderFrame.origins.can }
  const [originX, originY] = productRenderFrame.origins.can.split(' ').map(parseFloat)
  return {
    '--frame-center': `${(frame.left - productRenderFrame.center / 100 * productRenderFrame.width) / frame.width * 100}%`,
    '--frame-height': `${productRenderFrame.heightScale * frame.height / productRenderFrame.height * 100}%`,
    '--frame-top': `${productRenderFrame.topOffset + frame.top / productRenderFrame.height * productRenderFrame.heightScale * 100}%`,
    transformOrigin: `${(originX / 100 * productRenderFrame.width - frame.left) / frame.width * 100}% ${(originY / 100 * productRenderFrame.height - frame.top) / frame.height * 100}%`,
  }
})
const canImageSizes = computed(() => {
  const frame = props.renders.canFrame
  if (!frame) return undefined
  const widthScale = productRenderFrame.heightScale * frame.width / productRenderFrame.height
  return `(min-width: 54rem) ${Math.ceil(576 * widthScale)}px, (min-width: 40rem) ${Math.ceil(448 * widthScale)}px, min(calc((100vw - 144px) * ${widthScale}), ${Math.ceil(384 * widthScale)}px)`
})

const glassMotion = { '--layer-motion-duration': '700ms', '--layer-motion-delay': '100ms' }
const layers = computed(() => [
  { source: 'glassShadow', kind: 'glass', shadow: true, image: props.renders.glassShadow,
    style: { transformOrigin: productRenderFrame.origins.glass }, motion: glassMotion },
  { source: 'canShadow', kind: 'can', shadow: true, image: props.renders.canShadow,
    style: { transformOrigin: productRenderFrame.origins.can } },
  { source: 'glass', kind: 'glass', glass: props.renders.glass, motion: glassMotion },
  { source: 'can', kind: 'can', image: props.renders.can, style: canStyle.value, sizes: canImageSizes.value },
])
</script>

<template>
  <ProductCompositionFrame :frame="productRenderFrame" :layers="layers" />
</template>
