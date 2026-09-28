<script setup>
import HomeHeroSection from './HomeHeroSection.vue'
import HomeProductsSection from './HomeProductsSection.vue'
import HomeAboutSection from './HomeAboutSection.vue'
import ContactSection from './ContactSection.vue'
</script>

<template>
  <HomeHeroSection />
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
