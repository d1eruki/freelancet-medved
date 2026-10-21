<!-- Декоративное изображение на границе первого экрана и следующей секции. -->
<script setup>
defineProps({
  imageUrl: { type: String, required: true },
  imageSrcset: { type: String, default: undefined },
  imageSizes: { type: String, default: undefined },
  fetchpriority: { type: String, default: undefined },
  naturalHeight: { type: Boolean, default: false },
})
</script>

<template>
  <div class="pointer-events-none relative z-10 h-0" aria-hidden="true">
    <img
      class="hero-divider-image absolute inset-x-0 w-full"
      :class="{ 'hero-divider-image-natural': naturalHeight }"
      :src="imageUrl"
      :srcset="imageSrcset"
      :sizes="imageSizes"
      :fetchpriority="fetchpriority"
      alt=""
      decoding="async"
    >
  </div>
</template>

<style scoped>
.hero-divider-image {
  top: -128px;
  height: 256px;
  object-fit: cover;
  object-position: center;
}

.hero-divider-image-natural {
  height: auto;
}
</style>
