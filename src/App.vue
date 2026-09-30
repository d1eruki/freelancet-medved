<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import AboutPage from './components/about/AboutPage.vue'
import AgeGate from './components/AgeGate.vue'
import CatalogPage from './components/catalog/CatalogPage.vue'
import CategoryPage from './components/category/CategoryPage.vue'
import ContactsPage from './components/contacts/ContactsPage.vue'
import CustomCursor from './components/CustomCursor.vue'
import HomePage from './components/home/HomePage.vue'
import HorecaPage from './components/horeca/HorecaPage.vue'
import LegalPage from './components/legal/LegalPage.vue'
import NotFoundPage from './components/not-found/NotFoundPage.vue'
import PartnersPage from './components/partners/PartnersPage.vue'
import ProductionPage from './components/production/ProductionPage.vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { vTypography } from './directives/typography'
import { findPage, notFoundPage } from './data/page-routes'

const props = defineProps({ path: { type: String, default: '' } })

const ageConfirmationKey = 'medved-age-confirmed'
const isAgeConfirmed = ref(false)
const lenis = shallowRef(null)
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
const currentPath = props.path || (typeof window === 'undefined' ? '/' : window.location.pathname.slice(basePath.length) || '/')
const page = findPage(currentPath)

onMounted(() => {
  const seo = page || notFoundPage
  document.title = seo.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
  if (seo.canonicalUrl) document.querySelector('link[rel="canonical"]')?.setAttribute('href', seo.canonicalUrl)
  else document.querySelector('link[rel="canonical"]')?.remove()
  document.querySelector('meta[name="robots"]')?.setAttribute('content', seo.robots || 'index, follow')
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', seo.title)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', seo.description)
  if (seo.canonicalUrl) document.querySelector('meta[property="og:url"]')?.setAttribute('content', seo.canonicalUrl)
  else document.querySelector('meta[property="og:url"]')?.remove()
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', seo.title)
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', seo.description)

  try {
    isAgeConfirmed.value = window.localStorage.getItem(ageConfirmationKey) === 'true'
  } catch {
    isAgeConfirmed.value = false
  }
})

function confirmAge() {
  isAgeConfirmed.value = true

  try {
    window.localStorage.setItem(ageConfirmationKey, 'true')
  } catch {
    // The visitor can continue even when browser storage is unavailable.
  }
}

onMounted(() => {
  lenis.value = new Lenis({
    autoRaf: true,
    anchors: true,
    respectReducedMotion: true,
  })

  if (!isAgeConfirmed.value) lenis.value.stop()
})

watch(isAgeConfirmed, (confirmed) => {
  if (confirmed) lenis.value?.start()
  else lenis.value?.stop()
}, { flush: 'post' })

onBeforeUnmount(() => {
  lenis.value?.destroy()
  lenis.value = null
})

</script>

<template>
  <div
    v-typography
    class="min-h-svh overflow-x-clip bg-surface text-foreground"
    :inert="!isAgeConfirmed || undefined"
    :aria-hidden="!isAgeConfirmed || undefined"
  >
    <SiteHeader :lenis="lenis" :path="page?.path || currentPath" />

    <main>
      <ProductionPage v-if="page?.type === 'production'" :lenis="lenis" />
      <PartnersPage v-else-if="page?.type === 'partners'" />
      <AboutPage v-else-if="page?.type === 'about'" />
      <CatalogPage v-else-if="page?.type === 'catalog'" />
      <ContactsPage v-else-if="page?.type === 'contacts'" />
      <HorecaPage v-else-if="page?.type === 'horeca'" />
      <LegalPage v-else-if="page?.type === 'legal'" :page="page.legalPage" />
      <CategoryPage v-else-if="page?.type === 'category'" :category="page.category" />
      <HomePage v-else-if="page?.type === 'home'" />
      <NotFoundPage v-else />
    </main>

    <SiteFooter />
  </div>

  <AgeGate v-if="!isAgeConfirmed" @confirm="confirmAge" />
  <CustomCursor />
</template>
