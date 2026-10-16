<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { vFitty } from '../directives/fitty'

const props = defineProps({
  text: { type: String, required: true },
})

const lettering = ref(null)
const metrics = ref({ width: props.text.length * 600, baseline: 675 })
let mounted = false

function measureLettering() {
  if (!mounted || !lettering.value) return
  const text = lettering.value
  const width = text.getComputedTextLength()
  if (!width) return
  const canvas = text.ownerDocument.createElement('canvas')
  const context = canvas.getContext('2d')
  const style = text.ownerDocument.defaultView.getComputedStyle(text)
  context.font = `1000px ${style.fontFamily}`
  const bounds = context.measureText(props.text.toUpperCase())
  const ascent = bounds.fontBoundingBoxAscent ?? 800
  const descent = bounds.fontBoundingBoxDescent ?? 200
  // Match the existing 0.75em HTML line box, including its negative leading.
  metrics.value = { width, baseline: ascent + (750 - ascent - descent) / 2 }
}

onMounted(() => {
  mounted = true
  measureLettering()
  lettering.value.ownerDocument.fonts?.ready.then(measureLettering)
})
watch(() => props.text, async () => {
  await nextTick()
  measureLettering()
})
onBeforeUnmount(() => { mounted = false })
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-0 z-0" aria-hidden="true">
    <span v-fitty class="inline-block whitespace-nowrap font-display uppercase">
      <svg
        :key="`${metrics.width}:${metrics.baseline}`"
        :viewBox="`0 0 ${metrics.width} 750`"
        :style="{ width: `${metrics.width / 1000}em` }"
        height="0.75em"
        aria-hidden="true"
        focusable="false"
      >
        <text ref="lettering" x="0" :y="metrics.baseline" font-size="1000" fill="currentColor">{{ text.toUpperCase() }}</text>
      </svg>
    </span>
  </div>
</template>

<style scoped>
span {
  color: rgb(255 255 255 / 4%);
  line-height: 0.75;
}

svg {
  display: inline-block;
  overflow: visible;
  vertical-align: top;
}
</style>
