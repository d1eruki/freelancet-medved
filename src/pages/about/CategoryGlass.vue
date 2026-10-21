<!-- Интерактивная область бокала со ссылкой на категорию напитков. -->
<script setup>
import SiteImage from '../../components/site-image.vue'
import { computed, useId } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  href: { type: String, required: true },
  image: { type: String, required: true },
  bounds: { type: Object, required: true },
  contour: { type: String, required: true },
})

const clipId = `category-glass-${useId()}`
const position = computed(() => ({
  left: `${props.bounds.x / 1536 * 100}%`,
  top: `${props.bounds.y / 1024 * 100}%`,
  width: `${props.bounds.width / 1536 * 100}%`,
  height: `${props.bounds.height / 1024 * 100}%`,
}))
const viewBox = computed(() => {
  const { x, y, width, height } = props.bounds
  return `${x} ${y} ${width} ${height}`
})
</script>

<template>
  <a
    class="category-glass group absolute cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface"
    :style="position"
    :href="href"
    :aria-label="`Открыть каталог: ${label}`"
  >
    <svg
      class="pointer-events-none size-full overflow-visible opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <clipPath :id="clipId" clipPathUnits="userSpaceOnUse">
          <path :d="contour" />
        </clipPath>
      </defs>
      <SiteImage as="image" :src="image" width="1536" height="1024" :clip-path="`url(#${clipId})`" />
    </svg>
  </a>
</template>

<style scoped>
.category-glass svg {
  filter: brightness(1.22) saturate(1.08);
}
</style>
