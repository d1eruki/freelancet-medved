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
    <div class="relative h-64 w-full" :class="{ backward: transitionDirection === 'backward' }">
      <Transition name="packaging">
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
      <h3 class="break-words font-display text-h4 hyphens-auto uppercase">{{ displayName }}</h3>
      <p class="mt-5 text-body font-medium text-subtle">{{ item.description }}</p>
      <p class="mt-7 border-t border-foreground/15 pt-5 text-label font-extrabold tracking-wide text-brand uppercase" aria-live="polite">{{ activeVariant.details ?? item.details }}</p>
    </div>
  </li>
</template>

<style scoped>
.packaging-enter-active,
.packaging-leave-active {
  transition: transform 700ms cubic-bezier(0.65, 0, 0.35, 1);
}

.packaging-enter-from,
.backward .packaging-leave-to {
  transform: translateX(150%);
}

.packaging-leave-to,
.backward .packaging-enter-from {
  transform: translateX(-150%);
}
</style>
