<script setup>
defineProps({
  topLabel: { type: String, required: true },
  bottomLabel: { type: String, required: true },
})
</script>

<template>
  <div class="relative hidden min-h-112 nav:col-span-4 nav:block" aria-hidden="true">
    <span class="absolute top-4 right-0 grid size-64 place-items-center rounded-full border border-surface/40 font-display text-h3 uppercase wide:size-80">{{ topLabel }}</span>
    <span class="absolute right-24 bottom-0 grid size-56 place-items-center rounded-full bg-brand font-display text-h3 uppercase wide:size-64">{{ bottomLabel }}</span>
    <span class="absolute right-2 bottom-16 size-5 rounded-full bg-surface" />
  </div>
</template>
