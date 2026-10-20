<script setup>
import sealUrl from '../assets/branding/brand-logo-seal-lithograph.png?width=320'
import smallSealUrl from '../assets/branding/brand-logo-seal-lithograph.png?width=160'
import barrelUrl from '../assets/branding/brand-logo-barrel.png?width=320'
import smallBarrelUrl from '../assets/branding/brand-logo-barrel.png?width=160'
import { siteVariant } from '../data/site-variants.js'

const logoUrl = siteVariant.headerLogo === 'barrel' ? barrelUrl : sealUrl
const smallLogoUrl = siteVariant.headerLogo === 'barrel' ? smallBarrelUrl : smallSealUrl
</script>

<template>
  <img
    class="block aspect-1224/1285 h-33 w-auto shrink-0 object-cover sm:h-40"
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
