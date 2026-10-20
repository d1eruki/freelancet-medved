<script setup>
import { computed } from 'vue'
import ProductCompositionFrame from './product-composition-frame.vue'
import { productRenderFrame } from '#product-slider-renders'
import pawBack from '../assets/home/product-renders/bear-paw-back.png?responsive'
import pawFront from '../assets/home/product-renders/bear-paw-front.png?responsive'
import thumbClosed from '../assets/home/product-renders/bear-paw-thumb-closed.png?responsive'
import thumbOpen from '../assets/home/product-renders/bear-paw-thumb-open.png?responsive'

const props = defineProps({
  renders: { type: Object, required: true },
  pawMotion: { type: Object, required: true },
})
const motionStyle = computed(() => ({
  '--paw-anchor': `${props.pawMotion.anchor}px`,
  '--client-glass-x': `${props.pawMotion.glassX}px`,
}))
const layers = computed(() => {
  const glass = props.renders.pair
  const { slider } = glass
  const [, originY] = slider.origin.split(' ').map(parseFloat)
  const pawStyle = {
    '--frame-center': '-50%',
    '--frame-height': `${slider.heightScale * 100}%`,
    '--frame-top': `${slider.topOffset}%`,
    left: `${(slider.leftOffset ?? 50) + (50 - slider.center) * slider.heightScale * glass.width / glass.height}%`,
    transformOrigin: `50% ${originY}%`,
  }
  const pawSizes = `(min-width: 54rem) ${Math.ceil(576 * slider.heightScale)}px, (min-width: 40rem) ${Math.ceil(448 * slider.heightScale)}px, min(calc((100vw - 144px) * ${slider.heightScale}), ${Math.ceil(384 * slider.heightScale)}px)`
  const images = { back: pawBack, fingers: pawFront, closed: thumbClosed, open: thumbOpen }
  function handLayer(side, part) {
    const hand = props.pawMotion[side]
    const front = part !== 'back'
    return {
      source: `${side}-${part}`,
      kind: 'paw',
      image: images[part],
      style: {
        ...pawStyle,
        // Основание открытого пальца перекрывает ладонь в общей системе слоёв.
        '--frame-center': part === 'open' ? (side === 'left' ? '-58%' : '-42%') : '-50%',
        scale: side === 'left' ? '-1 1' : '1 1',
        rotate: `${hand.angle}deg`,
        opacity: part === 'closed' ? hand.thumb : part === 'open' ? 1 - hand.thumb : 1,
      },
      sizes: pawSizes,
      // В покое маска касается предплечья; пальцы перед бокалом видны целиком.
      behindCounter: !front || hand.withdraw > 0,
      catch: true,
      classes: ['paw-hand', `paw-${part}`],
      contentStyle: { transform: `translate(${hand.x}px, ${hand.withdraw * 65}%)` },
    }
  }
  const glassPose = { rotate: `${props.pawMotion.angle}deg` }
  return [
    { source: 'pairShadow', kind: 'pair', shadow: true, image: props.renders.pairShadow,
      style: { transformOrigin: productRenderFrame.origins.glass }, poseStyle: glassPose },
    handLayer('left', 'back'),
    handLayer('right', 'back'),
    handLayer('left', 'open'),
    handLayer('right', 'open'),
    { source: 'pair', kind: 'pair', glass, poseStyle: glassPose },
    ...['left', 'right'].flatMap(side => ['fingers', 'closed'].map(part => handLayer(side, part))),
  ]
})
</script>

<template>
  <ProductCompositionFrame
    class="client-composition"
    :style="motionStyle"
    :frame="productRenderFrame"
    :layers="layers"
  />
</template>

<style scoped>
/* Смещение и угол при контакте приходят из одного расчёта для кисти и бокала. */
.client-composition :deep(.paw-hand) {
  transform: translateX(var(--paw-anchor));
}
.client-composition :deep(.product-motion-layer.product-paw) {
  transform: none;
}
.client-composition :deep(.product-motion-layer.product-pair) {
  transform: translateX(var(--client-glass-x));
}
.client-composition :deep(.product-motion-layer),
.client-composition :deep(.product-layer) {
  transition: none;
  animation: none;
}
</style>
