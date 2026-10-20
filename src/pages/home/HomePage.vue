<script setup>
import HomeHeroSection from './HomeHeroSection.vue'
import HomeProductsSection from './HomeProductsSection.vue'
import HomeAboutSection from './HomeAboutSection.vue'
import HeroDivider from '../../components/HeroDivider.vue'
import homeDivider from '../../assets/heroes/home/divider.png?responsive'
</script>

<template>
  <HomeHeroSection />
  <HeroDivider
    natural-height
    :image-url="homeDivider.src"
    :image-srcset="homeDivider.srcset"
    image-sizes="max(100vw, 412px)"
    fetchpriority="high"
  />
  <HomeProductsSection />
  <HomeAboutSection />
</template>

