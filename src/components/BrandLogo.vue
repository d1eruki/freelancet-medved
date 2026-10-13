<script setup>
import logoUrl from '../assets/branding/brand-logo-seal-lithograph.png?width=320'
import smallLogoUrl from '../assets/branding/brand-logo-seal-lithograph.png?width=160'
</script>

<template>
  <img
    class="block aspect-1224/1285 h-33 w-auto shrink-0 object-contain sm:h-40"
    :src="logoUrl"
    :srcset="`${smallLogoUrl} 160w, ${logoUrl} 320w`"
    sizes="(min-width: 40rem) 153px, 126px"
    width="1224"
    height="1285"
    alt=""
    aria-hidden="true"
    loading="eager"
  >
</template>
