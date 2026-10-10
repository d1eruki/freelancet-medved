<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import AgeGate from './components/AgeGate.vue'
import CustomCursor from './components/CustomCursor.vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import MetrikaNotice from './components/metrika-notice.vue'
import { vTypography } from './directives/typography'
import { findPage, notFoundPage, getPageRobots } from './data/page-routes'

const props = defineProps({
  path: { type: String, default: '/' },
  pageComponent: { type: Object, required: true },
  pageData: { type: Object, default: () => ({}) },
})

const ageConfirmationKey = 'medved-age-confirmed'
const isAgeConfirmed = ref(false)
const lenis = shallowRef(null)
const currentPath = props.path
const page = findPage(currentPath)
const pageProps = computed(() => {
  if (page?.type === 'production') return { lenis: lenis.value }
  return props.pageData
})

onMounted(() => {
  const seo = page || notFoundPage
  document.title = seo.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
  if (seo.canonicalUrl) document.querySelector('link[rel="canonical"]')?.setAttribute('href', seo.canonicalUrl)
  else document.querySelector('link[rel="canonical"]')?.remove()
  document.querySelector('meta[name="robots"]')?.setAttribute('content', getPageRobots(seo, import.meta.env.VITE_SITE_ENV))
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
      <component :is="pageComponent" v-bind="pageProps" />
    </main>

    <SiteFooter />
    <MetrikaNotice v-if="isAgeConfirmed" />
  </div>

  <AgeGate v-if="!isAgeConfirmed" @confirm="confirmAge" />
  <CustomCursor />
</template>
