<script setup>
import { vFitty } from '../directives/fitty'

defineProps({
  text: { type: String, required: true },
})
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-0 z-0" aria-hidden="true">
    <span v-fitty class="inline-block whitespace-nowrap font-display uppercase">{{ text }}</span>
  </div>
</template>

<style scoped>
span {
  color: rgb(255 255 255 / 4%);
  line-height: 0.75;
}
</style>
