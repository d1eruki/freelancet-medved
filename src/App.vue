<script setup>
import { ref } from 'vue'
import AboutSection from './components/AboutSection.vue'
import AgeGate from './components/AgeGate.vue'
import CustomCursor from './components/CustomCursor.vue'
import HeroSection from './components/HeroSection.vue'
import ProductionPage from './components/ProductionPage.vue'
import ProductsSection from './components/ProductsSection.vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { vTypography } from './directives/typography'

const ageConfirmationKey = 'medved-age-confirmed'
const isAgeConfirmed = ref(false)
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
const currentPath = window.location.pathname.slice(basePath.length).replace(/\/+$/, '') || '/'
const isProductionPage = currentPath === '/proizvodstvo'

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
      <ProductionPage v-if="isProductionPage" />

      <template v-else>
        <HeroSection />
        <ProductsSection />
        <AboutSection />
      </template>
    </main>

    <SiteFooter />
  </div>

  <AgeGate v-if="!isAgeConfirmed" @confirm="confirmAge" />
  <CustomCursor />
</template>
