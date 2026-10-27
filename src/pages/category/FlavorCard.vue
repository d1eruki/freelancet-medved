<!-- Карточка напитка с характеристиками и переключением вариантов упаковки. -->
<script setup>
import SiteImage from '../../components/site-image.vue'
import { computed, ref } from 'vue'
import { IconBlur, IconCandy, IconCandyOff, IconCircles, IconDroplet, IconDropletHalf2, IconFilterOff, IconLeaf, IconPercentage, IconSparkles } from '@tabler/icons-vue'
import ProductAttribute from '../../components/product-attribute.vue'

const props = defineProps({
  item: { type: Object, required: true },
})

const activeVariantIndex = ref(0)
const transitionDirection = ref('forward')
const sortedVariants = computed(() => {
  const liters = variant => Number.parseFloat(variant.volume.replace(',', '.'))
  return [...props.item.variants].sort((a, b) => {
    const aVolume = liters(a)
    const bVolume = liters(b)
    if (aVolume === 30 && bVolume !== 30) return -1
    if (bVolume === 30 && aVolume !== 30) return 1
    return aVolume - bVolume
  })
})
const activeVariant = computed(() => sortedVariants.value[activeVariantIndex.value])
const attributeIcons = {
  нефильтрованная: IconFilterOff,
  нефильтрованный: IconFilterOff,
  неосветлённая: IconBlur,
  неосветлённый: IconBlur,
  негазированный: IconDroplet,
  газированный: IconCircles,
  полусладкий: IconCandy,
  полусухой: IconDropletHalf2,
  сухой: IconCandyOff,
  жемчужный: IconSparkles,
  традиционный: IconLeaf,
}
const attributes = computed(() => (activeVariant.value.details ?? props.item.details ?? '')
  .split(',')
  .map(detail => detail.trim())
  .filter(Boolean)
  .map(label => ({ label: label.charAt(0).toUpperCase() + label.slice(1), icon: attributeIcons[label] ?? IconLeaf })))
const displayName = computed(() => props.item.name.replace(/^(?:Сидр|Медовуха|Пуаре)\s+/u, ''))
function selectVariant(index) {
  if (index === activeVariantIndex.value) return
  transitionDirection.value = index > activeVariantIndex.value ? 'forward' : 'backward'
  activeVariantIndex.value = index
}
</script>

<template>
  <li
    class="relative isolate flex min-h-80 flex-col overflow-hidden rounded-3xl bg-surface p-6 sm:p-8"
  >
    <span
      v-if="item.popular"
      class="absolute top-6 right-6 z-10 rounded-full bg-brand px-3 py-2 text-caption font-extrabold tracking-wide text-surface uppercase sm:top-8 sm:right-8"
    >
      Популярное
    </span>
    <div class="relative h-64 w-full">
      <Transition
        enter-active-class="transition-[translate] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        leave-active-class="transition-[translate] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        :enter-from-class="transitionDirection === 'backward' ? '-translate-x-[150%]' : 'translate-x-[150%]'"
        :leave-to-class="transitionDirection === 'backward' ? 'translate-x-[150%]' : '-translate-x-[150%]'"
      >
        <SiteImage
          v-if="activeVariant.image"
          :key="activeVariant.volume"
          class="absolute inset-0 h-full w-full object-contain"
          :src="activeVariant.image"
          :alt="`${item.name}, ${activeVariant.volume}`"
        />
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
        v-for="(variant, index) in sortedVariants"
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
      <div :key="activeVariant.volume" class="relative mt-10 flex flex-wrap gap-3" role="group" :aria-label="`Характеристики: ${item.name}`">
        <ProductAttribute v-for="attribute in attributes" :key="attribute.label" :label="attribute.label" :icon="attribute.icon" />
        <ProductAttribute label="Крепость: 4,9%" :icon="IconPercentage" />
      </div>
    </div>
  </li>
</template>
