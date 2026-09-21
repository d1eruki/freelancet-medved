<script setup>
import { ref } from 'vue'
import AboutPage from './components/AboutPage.vue'
import AboutSection from './components/AboutSection.vue'
import AgeGate from './components/AgeGate.vue'
import CatalogPage from './components/CatalogPage.vue'
import CategoryPage from './components/CategoryPage.vue'
import ContactsPage from './components/ContactsPage.vue'
import CustomCursor from './components/CustomCursor.vue'
import HeroSection from './components/HeroSection.vue'
import HomeContactSection from './components/HomeContactSection.vue'
import LegalPage from './components/LegalPage.vue'
import PartnersPage from './components/PartnersPage.vue'
import ProductionPage from './components/ProductionPage.vue'
import ProductsSection from './components/ProductsSection.vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { vTypography } from './directives/typography'
import { catalogCategories } from './data/catalog'
import { legalContent } from './data/legal-content'

const ageConfirmationKey = 'medved-age-confirmed'
const isAgeConfirmed = ref(false)
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
const currentPath = window.location.pathname.slice(basePath.length).replace(/\/+$/, '') || '/'
const isAboutPage = currentPath === '/o-kompanii'
const isPartnersPage = currentPath === '/partnery'
const isProductionPage = currentPath === '/proizvodstvo'
const isCatalogPage = currentPath === '/katalog'
const isContactsPage = currentPath === '/kontakty'
const legalPage = currentPath === '/politika-konfidencialnosti'
  ? legalContent.privacy
  : currentPath === '/disclaimer'
    ? legalContent.disclaimer
    : null
const category = catalogCategories.find((item) => currentPath === `/katalog/${item.slug}`)

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
      <PartnersPage v-else-if="isPartnersPage" />
      <AboutPage v-else-if="isAboutPage" />
      <CatalogPage v-else-if="isCatalogPage" />
      <ContactsPage v-else-if="isContactsPage" />
      <LegalPage v-else-if="legalPage" :page="legalPage" />
      <CategoryPage v-else-if="category" :category="category" />

      <template v-else>
        <HeroSection />
        <ProductsSection />
        <AboutSection />
        <HomeContactSection />
      </template>
    </main>

    <SiteFooter />
  </div>

  <AgeGate v-if="!isAgeConfirmed" @confirm="confirmAge" />
  <CustomCursor />
</template>
