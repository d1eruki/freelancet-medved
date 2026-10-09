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
  <li
    class="relative isolate flex min-h-80 flex-col overflow-hidden rounded-3xl bg-surface p-6 sm:p-8"
    :class="{ 'bg-linear-to-b from-brand/15 to-brand/15': item.popular }"
  >
    <!-- Google Material Symbols Rounded: star, filled (Apache-2.0). -->
    <svg
      v-if="item.popular"
      class="pointer-events-none absolute -right-36 -bottom-36 -z-1 size-120 fill-current text-surface opacity-40"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M480-269 314-169q-11 7-23 6t-21-8q-9-7-14-17.5t-2-23.5l44-189-147-127q-10-9-12.5-20.5T140-571q4-11 12-18t22-9l194-17 75-178q5-12 15.5-18t21.5-6q11 0 21.5 6t15.5 18l75 178 194 17q14 2 22 9t12 18q4 11 1.5 22.5T809-528L662-401l44 189q3 13-2 23.5T690-171q-9 7-21 8t-23-6L480-269Z" />
    </svg>
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
