<script setup>
import { useId } from 'vue'
import bearMark from '../assets/branding/brand-logo-mark.svg'

const printMaskId = `glass-print-${useId()}`
// Узкие полосы огибают цилиндр, сохраняя исходный рисунок медведя.
const stripCount = 24
const halfAngle = 0.7
const projectX = angle => (Math.sin(angle) / Math.sin(halfAngle) + 1) * 81
const printStrips = Array.from({ length: stripCount }, (_, index) => {
  const angle = -halfAngle + index / stripCount * halfAngle * 2
  const nextAngle = -halfAngle + (index + 1) / stripCount * halfAngle * 2
  const x = projectX(angle)
  return {
    x,
    y: -(1 - Math.cos((angle + nextAngle) / 2)) * 14,
    width: projectX(nextAngle) - x + 0.15,
    viewBox: `${index / stripCount * 162} 0 ${162 / stripCount} 133`,
  }
})

defineProps({
  glass: { type: Object, required: true },
  sizes: { type: String, required: true },
  showLogo: { type: Boolean, default: true },
})
</script>

<template>
  <span class="branded-glass" :style="{ aspectRatio: `${glass.width} / ${glass.height}` }" aria-hidden="true">
    <img
      class="glass-image"
      :src="glass.image.src"
      :srcset="glass.image.srcset"
      :sizes="sizes"
      loading="lazy"
      decoding="async"
      draggable="false"
      alt=""
    >
    <svg v-if="showLogo" class="glass-print" viewBox="0 -4 162 141" aria-hidden="true">
      <defs>
        <mask :id="printMaskId" maskUnits="userSpaceOnUse" x="0" y="0" width="162" height="133" style="mask-type: alpha">
          <image :href="bearMark" width="162" height="133" />
        </mask>
      </defs>
      <svg
        v-for="(strip, index) in printStrips"
        :key="index"
        :x="strip.x"
        :y="strip.y"
        :width="strip.width"
        height="133"
        :viewBox="strip.viewBox"
        preserveAspectRatio="none"
        overflow="hidden"
      >
        <rect width="162" height="133" fill="#754023" :mask="`url(#${printMaskId})`" />
      </svg>
    </svg>
  </span>
</template>

<style scoped>
.branded-glass {
  display: block;
  position: relative;
  pointer-events: none;
}
.glass-image {
  display: block;
  width: 100%;
  height: 100%;
}
.glass-print {
  position: absolute;
  left: 26%;
  top: 39%;
  width: 48%;
  height: 22%;
  opacity: 0.78;
  mix-blend-mode: multiply;
}
</style>
