<!-- Декоративное изображение на границе первого экрана и следующей секции. -->
<script setup>
import SiteImage from './site-image.vue'
defineProps({
  imageUrl: { type: String, required: true },
  imageSrcset: { type: String, default: undefined },
  imageSizes: { type: String, default: undefined },
  fetchpriority: { type: String, default: undefined },
  media: { type: String, default: '' },
  naturalHeight: { type: Boolean, default: false },
})
</script>

<template>
  <div class="pointer-events-none relative z-10 h-0" aria-hidden="true">
    <SiteImage
      :critical="fetchpriority === 'high'"
      :picture="Boolean(media)"
      :media="media"
      class="hero-divider-image absolute inset-x-0 w-full"
      :class="{ 'hero-divider-image-natural': naturalHeight }"
      :src="imageUrl"
      :srcset="imageSrcset"
      :sizes="imageSizes"
      :fetchpriority="fetchpriority"
      alt=""
      decoding="async"
    />
  </div>
</template>

<style scoped>
:deep(.hero-divider-image) {
  top: -128px;
  height: 256px;
  object-fit: cover;
  object-position: center;
}

:deep(.hero-divider-image-natural) {
  height: auto;
}
</style>
