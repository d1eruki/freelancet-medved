<script setup>
import HomeHeroSection from './HomeHeroSection.vue'
import HomeProductsSection from './HomeProductsSection.vue'
import HomeAboutSection from './HomeAboutSection.vue'
import ContactSection from '../../components/ContactSection.vue'
import HeroDivider from '../../components/HeroDivider.vue'
import homeDividerUrl from '../../assets/heroes/home/divider.png'
</script>

<template>
  <HomeHeroSection />
  <!-- The grass baseline is at 69.1% of the image height, below its transparent top. -->
  <HeroDivider class="[&>img]:-translate-y-[69.1%] [&>img]:object-[center_69.1%]" :image-url="homeDividerUrl" />
  <HomeProductsSection />
  <HomeAboutSection />
  <ContactSection
    id="contact-form"
    class="scroll-mt-20"
    title="Связаться с нами"
    description="Оставьте контакты и расскажите о вашем вопросе."
    heading-id="home-contact-title"
    id-prefix="home-contact"
  />
</template>
