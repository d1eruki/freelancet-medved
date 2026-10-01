<script setup>
defineProps({
  imageUrl: { type: String, required: true },
})
</script>

<template>
  <div class="pointer-events-none relative z-10 h-0" aria-hidden="true">
    <img
      class="absolute inset-x-0 top-0 h-64 w-full -translate-y-1/2 object-cover object-center"
      :src="imageUrl"
      alt=""
      decoding="async"
    >
  </div>
</template>
