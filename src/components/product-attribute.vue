<script setup>
import { ref, useId } from 'vue'

defineProps({
  label: { type: String, required: true },
  icon: { type: String, required: true },
})

const tooltipId = useId()
const open = ref(false)
const trigger = ref(null)
const arrowLeft = ref(0)

function showTooltip() {
  const buttonBounds = trigger.value.getBoundingClientRect()
  const rowBounds = trigger.value.parentElement.parentElement.getBoundingClientRect()
  arrowLeft.value = buttonBounds.left + buttonBounds.width / 2 - rowBounds.left
  open.value = true
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
      <svg class="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path :d="icon" />
      </svg>
    </button>
    <span
      v-if="open"
      :id="tooltipId"
      role="tooltip"
      class="absolute inset-x-0 bottom-full z-20 pb-4 drop-shadow-xl"
    >
      <span class="block rounded-2xl border border-surface/20 bg-foreground px-4 py-4 text-center text-body font-medium text-surface">{{ label }}</span>
      <svg
        class="absolute bottom-0 h-5 w-8 -translate-x-1/2 text-foreground"
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
