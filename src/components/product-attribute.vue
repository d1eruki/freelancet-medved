<!-- Иконка характеристики напитка со всплывающей подписью. -->
<script setup>
import { nextTick, ref, useId } from 'vue'

defineProps({
  label: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
})

const tooltipId = useId()
const open = ref(false)
const trigger = ref(null)
const tooltip = ref(null)
const tooltipLeft = ref(0)
const arrowLeft = ref(0)

async function showTooltip() {
  open.value = true
  await nextTick()
  if (!tooltip.value) return

  const buttonBounds = trigger.value.getBoundingClientRect()
  const container = tooltip.value.offsetParent
  const containerBounds = container.getBoundingClientRect()
  const scale = containerBounds.width / container.offsetWidth
  const buttonCenter = (buttonBounds.left + buttonBounds.width / 2 - containerBounds.left) / scale
  const width = tooltip.value.offsetWidth
  tooltipLeft.value = Math.max(0, Math.min(buttonCenter - width / 2, container.clientWidth - width))
  arrowLeft.value = buttonCenter - tooltipLeft.value
}
</script>

<template>
  <span
    class="inline-flex"
    @mouseenter="showTooltip"
    @mouseleave="open = false"
    @focusout="open = false"
    @keydown.esc.stop="open = false"
  >
    <button
      ref="trigger"
      type="button"
      class="flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors hover:bg-brand/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      :aria-label="label"
      :aria-describedby="open ? tooltipId : undefined"
      @focus="showTooltip"
      @click="showTooltip"
    >
      <component :is="icon" class="size-6" :stroke-width="2" aria-hidden="true" focusable="false" />
    </button>
    <span
      v-if="open"
      ref="tooltip"
      :id="tooltipId"
      role="tooltip"
      class="absolute bottom-full z-20 w-max max-w-full pb-3 drop-shadow-lg"
      :style="{ left: `${tooltipLeft}px` }"
    >
      <span class="block rounded-xl bg-foreground px-4 py-3 text-center text-label font-medium text-surface">{{ label }}</span>
      <svg
        class="absolute bottom-0 h-4 w-5 -translate-x-1/2 text-foreground"
        :style="{ left: `${arrowLeft}px` }"
        viewBox="0 0 32 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0 0H32C23 0 23 18 16 18S9 0 0 0Z" />
      </svg>
    </span>
  </span>
</template>
