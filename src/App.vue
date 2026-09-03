<script setup>
import AboutSection from './components/AboutSection.vue'
import CustomCursor from './components/CustomCursor.vue'
import HeroSection from './components/HeroSection.vue'
import ProductsSection from './components/ProductsSection.vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <div class="min-h-svh overflow-hidden bg-surface text-foreground">
    <SiteHeader />

    <main>
      <HeroSection />
      <ProductsSection />
      <AboutSection />
    </main>

    <SiteFooter />
    <CustomCursor />
  </div>
</template>
