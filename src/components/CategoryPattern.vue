<script setup>
import { mdiFoodApple, mdiFruitPear, mdiHexagonMultiple } from '@mdi/js'

defineProps({
  slug: { type: String, required: true },
  idPrefix: { type: String, required: true },
})

const patternPaths = {
  medovuha: mdiHexagonMultiple,
  sidr: mdiFoodApple,
  puare: mdiFruitPear,
}

const patternPositions = [
  { x: 56, y: 56 },
  { x: 168, y: 56 },
  { x: 0, y: 168 },
  { x: 112, y: 168 },
  { x: 224, y: 168 },
]
</script>

<template>
  <svg aria-hidden="true" focusable="false">
    <defs>
      <pattern :id="`${idPrefix}-${slug}-pattern`" width="224" height="224" patternUnits="userSpaceOnUse">
        <g fill="currentColor">
          <path
            v-for="position in patternPositions"
            :key="`${position.x}-${position.y}`"
            :d="patternPaths[slug]"
            :transform="`translate(${position.x - 24} ${position.y - 24}) scale(2)`"
          />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" :fill="`url(#${idPrefix}-${slug}-pattern)`" />
  </svg>
</template>
