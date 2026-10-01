<script setup>
import HomeHeroSection from './HomeHeroSection.vue'
import HomeProductsSection from './HomeProductsSection.vue'
import HomeAboutSection from './HomeAboutSection.vue'
import ContactSection from '../ContactSection.vue'
import HeroDivider from '../HeroDivider.vue'
import homeDividerUrl from '../../assets/heroes/home/divider.png'
</script>

<template>
  <HomeHeroSection />
  <HeroDivider class="-translate-y-[max(5.6vw,43px)]" :image-url="homeDividerUrl" />
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
