<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
})

const activeVariantIndex = ref(0)
const transitionDirection = ref('forward')
const activeVariant = computed(() => props.item.variants[activeVariantIndex.value])
const displayName = computed(() => props.item.name.replace(/^(?:Сидр|Медовуха|Пуаре)\s+/u, ''))

function selectVariant(index) {
  if (index === activeVariantIndex.value) return
  transitionDirection.value = index > activeVariantIndex.value ? 'forward' : 'backward'
  activeVariantIndex.value = index
}
</script>

<template>
  <li class="flex min-h-80 flex-col overflow-hidden rounded-3xl bg-surface p-6 sm:p-8">
    <div class="relative h-64 w-full">
      <Transition
        enter-active-class="transition-[translate] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        leave-active-class="transition-[translate] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        :enter-from-class="transitionDirection === 'backward' ? '-translate-x-[150%]' : 'translate-x-[150%]'"
        :leave-to-class="transitionDirection === 'backward' ? 'translate-x-[150%]' : '-translate-x-[150%]'"
      >
        <img
          :key="activeVariant.volume"
          class="absolute inset-0 h-full w-full object-contain"
          :src="activeVariant.image"
          :alt="`${item.name}, ${activeVariant.volume}`"
          loading="lazy"
        >
      </Transition>
    </div>
    <div class="mt-4 flex flex-wrap items-center justify-center gap-2" role="group" :aria-label="`Выбор объёма: ${item.name}`">
      <button
        v-for="(variant, index) in item.variants"
        :key="variant.volume"
        class="min-h-10 rounded-full px-3 py-2 text-caption font-extrabold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
      <p class="mt-6 text-body font-medium text-subtle">{{ item.description }}</p>
      <p class="mt-10 border-t border-foreground/15 pt-6 text-label font-extrabold tracking-wide text-brand uppercase" aria-live="polite">{{ activeVariant.details ?? item.details }}</p>
    </div>
  </li>
</template>
