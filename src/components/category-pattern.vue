<!-- Повторяющийся узор категории для хиро и движущегося фона слайдера. -->
<script setup>
defineProps({
  slug: { type: String, required: true },
  idPrefix: { type: String, required: true },
})

const paths = {
  medovuha: 'M4 18v-5l4-2 4 2v5l-4 2-4-2M8 11V6l4-2 4 2v5M12 13l4-2 4 2v5l-4 2-4-2',
  sidr: 'M4 11.3c0 3.1.4 5.3 2.2 8 1.4 1.8 3.2 2.2 5.1 1 .4-.3 1-.3 1.4 0 1.9 1.2 3.7.8 5.1-1 1.8-2.7 2.2-4.9 2.2-8 0-2.6-2-5.3-4.4-5.3-1.3 0-2.4.7-3.3 1.4-.2.2-.4.2-.6 0C10.8 6.7 9.7 6 8.4 6 6 6 4 8.7 4 11.3M12 7c0-1.2.9-4 3-4',
  puare: 'M12 7c-2 0-3 2-3 4-1 2-4 3-4 6 0 3 3 5 7 5s7-2 7-5c0-3-3-4-4-6 0-2-1-4-3-4ZM12 7V5c0-2 1-3 3-3',
}
const positions = [[32, 32], [144, 32], [-24, 144], [88, 144], [200, 144]]
</script>

<template>
  <svg aria-hidden="true" focusable="false">
    <defs>
      <pattern :id="`${idPrefix}-${slug}-pattern`" width="224" height="224" patternUnits="userSpaceOnUse">
        <path
          v-for="(position, index) in positions"
          :key="index"
          :d="paths[slug]"
          :transform="`translate(${position[0]} ${position[1]}) scale(2)`"
          fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" :fill="`url(#${idPrefix}-${slug}-pattern)`" />
  </svg>
</template>
