<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import AboutPage from './components/AboutPage.vue'
import AboutSection from './components/AboutSection.vue'
import AgeGate from './components/AgeGate.vue'
import CatalogPage from './components/CatalogPage.vue'
import CategoryPage from './components/CategoryPage.vue'
import ContactsPage from './components/ContactsPage.vue'
import CustomCursor from './components/CustomCursor.vue'
import HeroSection from './components/HeroSection.vue'
import ContactSection from './components/ContactSection.vue'
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
const lenis = shallowRef(null)
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


const defaultSeo = {
  title: '«МЁДВЕДЬ» Производитель русской медовухи, сидра, пуаре Санкт-Петербург',
  description: 'Слабоалкогольные напитки оптом от производителя в СПБ',
}
const seoByPath = {
  '/katalog': {
    title: 'Каталог медовухи, сидра и пуаре «МЁДВЕДЬ»',
    description: 'Медовуха «МЁДВЕДЬ», яблочный сидр и грушевое пуаре от петербургского производителя. Выберите категорию и познакомьтесь с ассортиментом.',
  },
  '/proizvodstvo': {
    title: 'Производство «МЁДВЕДЬ» — традиционные рецептуры и современное оборудование',
    description: 'Как производят медовуху и сидр «МЁДВЕДЬ»: натуральное сырьё, брожение без добавления спирта и контроль качества на каждом этапе.',
  },
  '/o-kompanii': {
    title: 'О компании «МЁДВЕДЬ» — петербургская традиция медоварения',
    description: 'История пиво-медоваренного завода «МЁДВЕДЬ»: традиции Ивана Дурдина, развитие компании, ассортимент и награды.',
  },
  '/partnery': {
    title: 'Где купить медовуху и сидр «МЁДВЕДЬ»',
    description: 'Где купить напитки «МЁДВЕДЬ» в Санкт-Петербурге и регионах: адреса и телефоны точек продаж и дистрибьюторов.',
  },
  '/kontakty': {
    title: 'Контакты пиво-медоваренного завода «МЁДВЕДЬ»',
    description: 'Адрес и контакты пиво-медоваренного завода «МЁДВЕДЬ» в Санкт-Петербурге. Телефон и почта отдела оптовых продаж.',
  },
}
const seo = category
  ? {
      title: `${category.name} «МЁДВЕДЬ» — ассортимент`,
      description: category.description,
    }
  : legalPage
    ? { title: legalPage.title, description: '' }
    : seoByPath[currentPath] || defaultSeo
const canonicalPath = currentPath === '/' ? '/' : `${currentPath}/`
const canonicalUrl = new URL(canonicalPath, 'https://medved.beer').href

document.title = seo.title
document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl)
document.querySelector('meta[property="og:title"]')?.setAttribute('content', seo.title)
document.querySelector('meta[property="og:description"]')?.setAttribute('content', seo.description)
document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl)
document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', seo.title)
document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', seo.description)

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
    <SiteHeader :lenis="lenis" />

    <main>
      <ProductionPage v-if="isProductionPage" :lenis="lenis" />
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
        <ContactSection
          id="contact-form"
          class="scroll-mt-20"
          title="Связаться с нами"
          description="Оставьте контакты и расскажите о вашем вопросе."
          heading-id="home-contact-title"
          id-prefix="home-contact"
        />
      </template>
    </main>

    <SiteFooter />
  </div>

  <AgeGate v-if="!isAgeConfirmed" @confirm="confirmAge" />
  <CustomCursor />
</template>
