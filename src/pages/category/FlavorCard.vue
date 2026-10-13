<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import popularCardBackground from '../../assets/ui/popular-card-background.webp'

const props = defineProps({
  item: { type: Object, required: true },
})

const activeVariantIndex = ref(0)
const transitionDirection = ref('forward')
const activeVariant = computed(() => props.item.variants[activeVariantIndex.value])
const displayName = computed(() => props.item.name.replace(/^(?:Сидр|Медовуха|Пуаре)\s+/u, ''))
const card = ref(null)
const background = ref(null)
const productViewport = ref(null)
const productClip = ref({ clipPath: 'circle(50% at 50% 50%)' })
let resizeObserver

function updateProductClip() {
  const image = background.value
  if (!props.item.popular || !image?.naturalWidth || !productViewport.value) return
  const frame = card.value.getBoundingClientRect()
  const viewport = productViewport.value.getBoundingClientRect()
  // В исходном плакате центр отверстия — (525, 378), радиус — 269 px.
  // Повторяем object-cover/object-top фона, включая боковую обрезку.
  const scale = Math.max(frame.width / image.naturalWidth, frame.height / image.naturalHeight)
  const x = frame.left - viewport.left + (frame.width - image.naturalWidth * scale) / 2 + 525 * scale
  const y = frame.top - viewport.top + 378 * scale
  productClip.value = { clipPath: `circle(${269 * scale}px at ${x}px ${y}px)` }
}

onMounted(() => {
  if (!props.item.popular) return
  resizeObserver = new ResizeObserver(updateProductClip)
  resizeObserver.observe(card.value)
  resizeObserver.observe(productViewport.value)
  updateProductClip()
})
onBeforeUnmount(() => resizeObserver?.disconnect())

function selectVariant(index) {
  if (index === activeVariantIndex.value) return
  transitionDirection.value = index > activeVariantIndex.value ? 'forward' : 'backward'
  activeVariantIndex.value = index
}
</script>

<template>
  <li
    ref="card"
    class="relative isolate flex min-h-80 flex-col overflow-hidden rounded-3xl bg-surface p-6 sm:p-8"
  >
    <img
      v-if="item.popular"
      ref="background"
      class="pointer-events-none absolute inset-0 -z-1 h-full w-full object-cover object-top"
      :src="popularCardBackground"
      alt=""
      aria-hidden="true"
      loading="lazy"
      @load="updateProductClip"
    >
    <span
      v-if="item.popular"
      class="absolute top-6 right-6 z-10 rounded-full bg-brand px-3 py-2 text-caption font-extrabold tracking-wide text-surface uppercase sm:top-8 sm:right-8"
    >
      Популярное
    </span>
    <div ref="productViewport" class="relative h-64 w-full" :style="item.popular ? productClip : undefined">
      <Transition
        enter-active-class="transition-[translate] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        leave-active-class="transition-[translate] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        :enter-from-class="transitionDirection === 'backward' ? '-translate-x-[150%]' : 'translate-x-[150%]'"
        :leave-to-class="transitionDirection === 'backward' ? 'translate-x-[150%]' : '-translate-x-[150%]'"
      >
        <img
          v-if="activeVariant.image"
          :key="activeVariant.volume"
          class="absolute inset-0 h-full w-full object-contain"
          :src="activeVariant.image"
          :alt="`${item.name}, ${activeVariant.volume}`"
          loading="lazy"
        >
        <div
          v-else
          :key="activeVariant.volume"
          class="absolute inset-0 flex items-center justify-center text-body"
          :class="item.popular ? 'text-foreground/70' : 'text-subtle'"
          role="img"
          :aria-label="`${item.name}, ${activeVariant.volume}: фото пока нет`"
        >
          Фото пока нет
        </div>
      </Transition>
    </div>
    <div class="mt-4 flex flex-wrap items-center justify-center gap-2" role="group" :aria-label="`Выбор объёма: ${item.name}`">
      <button
        v-for="(variant, index) in item.variants"
        :key="variant.volume"
        class="min-h-10 rounded-full px-3 py-2 text-caption font-extrabold tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        :class="index === activeVariantIndex ? 'bg-brand text-surface' : 'bg-brand/10 text-foreground hover:bg-brand/20'"
        type="button"
        :aria-label="`Показать объём ${variant.volume}`"
        :aria-pressed="index === activeVariantIndex"
        @click="selectVariant(index)"
      >
        {{ variant.volume }}
      </button>
    </div>
    <div class="mt-auto pt-8">
      <h3 class="wrap-break-word font-display text-h4 hyphens-auto uppercase">{{ displayName }}</h3>
      <p class="mt-6 text-body font-medium" :class="item.popular ? 'text-foreground/70' : 'text-subtle'">{{ item.description }}</p>
      <p class="mt-10 text-label font-extrabold tracking-wide text-brand uppercase" aria-live="polite">{{ activeVariant.details ?? item.details }}</p>
    </div>
  </li>
</template>
