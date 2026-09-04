<script setup>
import { ref } from 'vue'
import AboutSection from './components/AboutSection.vue'
import AgeGate from './components/AgeGate.vue'
import CustomCursor from './components/CustomCursor.vue'
import HeroSection from './components/HeroSection.vue'
import ProductsSection from './components/ProductsSection.vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { vTypography } from './directives/typography'

const ageConfirmationKey = 'medved-age-confirmed'
const isAgeConfirmed = ref(false)

try {
  isAgeConfirmed.value = window.localStorage.getItem(ageConfirmationKey) === 'true'
} catch {
  isAgeConfirmed.value = false
}

function confirmAge() {
  isAgeConfirmed.value = true

  try {
    window.localStorage.setItem(ageConfirmationKey, 'true')
  } catch {
    // The visitor can continue even when browser storage is unavailable.
  }
}
</script>

<template>
  <div
    v-typography
    class="min-h-svh overflow-hidden bg-surface text-foreground"
    :inert="!isAgeConfirmed || undefined"
    :aria-hidden="!isAgeConfirmed || undefined"
  >
    <SiteHeader />

    <main>
      <HeroSection />
      <ProductsSection />
      <AboutSection />
    </main>

    <SiteFooter />
  </div>

  <AgeGate v-if="!isAgeConfirmed" @confirm="confirmAge" />
  <CustomCursor />
</template>
