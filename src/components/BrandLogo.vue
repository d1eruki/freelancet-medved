<!-- Горизонтальный логотип бренда в раннем оформлении сайта. -->
<script setup>
import SiteImage from './site-image.vue'
import logoUrl from '../assets/branding/brand-logo-wordmark.svg'
</script>

<template>
  <SiteImage
    critical
    class="block h-12 w-30 shrink-0 object-contain brightness-0 invert sm:h-14 sm:w-40"
    :src="logoUrl"
    alt=""
    aria-hidden="true"
  />
</template>
