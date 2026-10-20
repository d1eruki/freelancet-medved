<script setup>
import { computed } from 'vue'
import ProductCompositionFrame from './product-composition-frame.vue'
import { productRenderFrame } from '#product-slider-renders'

const props = defineProps({ renders: { type: Object, required: true } })
const layers = computed(() => [
  { source: 'pairShadow', kind: 'pair', shadow: true, image: props.renders.pairShadow,
    style: { transformOrigin: productRenderFrame.origins.glass } },
  { source: 'pair', kind: 'pair', glass: props.renders.pair },
])
</script>

<template>
  <ProductCompositionFrame :frame="productRenderFrame" :layers="layers" />
</template>
