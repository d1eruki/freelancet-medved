<script setup>
defineProps({
  imageUrl: { type: String, required: true },
  imageSrcset: { type: String, default: undefined },
  imageSizes: { type: String, default: undefined },
  fetchpriority: { type: String, default: undefined },
})
</script>

<template>
  <div class="pointer-events-none relative z-10 h-0" aria-hidden="true">
    <img
      class="absolute inset-x-0 top-0 h-64 w-full -translate-y-1/2 object-cover object-center"
      :src="imageUrl"
      :srcset="imageSrcset"
      :sizes="imageSizes"
      :fetchpriority="fetchpriority"
      alt=""
      decoding="async"
    >
  </div>
</template>
