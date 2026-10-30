<!-- Ассортимент напитков с фильтрами по категории и упаковке. -->
<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { catalogCategories, catalogPackagingOptions, filterCatalogItems } from '../../data/catalog.js'
import FlavorCard from '../category/FlavorCard.vue'
import FlavorCardSlider from '../category/flavor-card-slider.vue'

const props = defineProps({
  initialCategory: { type: String, default: 'all' },
  lenis: { type: Object, default: null },
  ready: { type: Boolean, default: false },
})

const drinkOptions = [
  { value: 'all', label: 'Все напитки' },
  ...catalogCategories.map((category) => ({ value: category.slug, label: category.name })),
]
const selectedDrink = ref(props.initialCategory)
const selectedPackaging = ref('all')
const assortment = ref(null)
const mounted = ref(false)
const items = computed(() => filterCatalogItems(selectedDrink.value, selectedPackaging.value))
const selectionKey = computed(() => `${selectedDrink.value}-${selectedPackaging.value}`)
let scrollFrame
let anchorPending = false

function readFilters() {
  const params = new URLSearchParams(window.location.search)
  const drink = params.get('drink')
  const packaging = params.get('packaging')
  selectedDrink.value = drinkOptions.some((option) => option.value === drink) ? drink : props.initialCategory
  selectedPackaging.value = catalogPackagingOptions.some((option) => option.value === packaging) ? packaging : 'all'
}

function selectFilter(name, value) {
  if (name === 'drink') selectedDrink.value = value
  else selectedPackaging.value = value

  const url = new URL(window.location.href)
  if (selectedDrink.value === props.initialCategory) url.searchParams.delete('drink')
  else url.searchParams.set('drink', selectedDrink.value)
  if (selectedPackaging.value === 'all') url.searchParams.delete('packaging')
  else url.searchParams.set('packaging', selectedPackaging.value)
  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.pushState(null, '', nextUrl)
  }
}

async function scrollToAssortment() {
  if (!mounted.value || !props.ready || !anchorPending) return
  await nextTick()
  window.cancelAnimationFrame(scrollFrame)
  scrollFrame = window.requestAnimationFrame(() => {
    if (!assortment.value || !props.ready) return
    const offset = Number.parseFloat(window.getComputedStyle(assortment.value).scrollMarginTop) || 0
    if (props.lenis) {
      props.lenis.resize()
      props.lenis.scrollTo(assortment.value, { immediate: true, force: true, offset: -offset })
    } else {
      assortment.value.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
    anchorPending = false
  })
}

function restoreFilters() {
  readFilters()
  anchorPending = window.location.hash === '#assortment'
  scrollToAssortment()
}

watch(() => [props.ready, props.lenis], scrollToAssortment, { flush: 'post' })

onMounted(() => {
  mounted.value = true
  restoreFilters()
  window.addEventListener('popstate', restoreFilters)
  window.addEventListener('hashchange', restoreFilters)
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(scrollFrame)
  window.removeEventListener('popstate', restoreFilters)
  window.removeEventListener('hashchange', restoreFilters)
})
</script>

<template>
  <section
    id="assortment"
    ref="assortment"
    class="section-decorated scroll-mt-28 bg-panel py-20 text-foreground max-sm:overflow-clip sm:scroll-mt-32 sm:py-24 wide:py-28"
    aria-labelledby="assortment-title"
  >
    <div class="site-container">
      <div class="grid gap-10">
        <div class="min-w-0">
          <h2 id="assortment-title" class="font-display text-h2 break-words uppercase">Ассортимент</h2>
          <p class="mt-6 max-w-2xl text-body-large font-medium text-subtle">От мягких медовых нот до свежих фруктовых и насыщенных ягодных оттенков. Выберите свой вкус и удобный формат упаковки.</p>
        </div>

        <div class="grid min-w-0 gap-4">
          <fieldset class="min-w-0">
            <legend class="sr-only">Вид напитка</legend>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="option in drinkOptions"
                :key="option.value"
                type="button"
                class="min-h-10 rounded-full px-4 py-2 text-caption font-extrabold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                :class="selectedDrink === option.value ? 'bg-brand text-surface' : 'bg-brand/10 text-foreground hover:bg-brand/20'"
                :aria-pressed="selectedDrink === option.value"
                aria-controls="assortment-results"
                @click="selectFilter('drink', option.value)"
              >{{ option.label }}</button>
            </div>
          </fieldset>
          <fieldset class="min-w-0">
            <legend class="sr-only">Упаковка</legend>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="option in catalogPackagingOptions"
                :key="option.value"
                type="button"
                class="min-h-10 rounded-full px-4 py-2 text-caption font-extrabold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                :class="selectedPackaging === option.value ? 'bg-brand text-surface' : 'bg-brand/10 text-foreground hover:bg-brand/20'"
                :aria-pressed="selectedPackaging === option.value"
                aria-controls="assortment-results"
                @click="selectFilter('packaging', option.value)"
              >{{ option.label }}</button>
            </div>
          </fieldset>
          <p class="text-body font-medium text-subtle" role="status" aria-live="polite" aria-atomic="true">Найдено напитков: {{ items.length }}</p>
        </div>
      </div>

      <div id="assortment-results">
        <FlavorCardSlider v-if="items.length" :key="selectionKey" class="mt-12 sm:hidden" :items="items" :lenis="lenis" />

        <ul v-if="items.length" class="mt-12 hidden gap-4 sm:mt-16 sm:grid sm:max-nav:grid-cols-2 site-grid">
          <FlavorCard v-for="item in items" :key="`${selectionKey}-${item.name}`" class="nav:col-span-4" :item="item" />
        </ul>
        <p v-else class="mt-12 text-body-large font-medium sm:mt-16">Для этого сочетания нет напитков. Выберите другой вид или упаковку.</p>
      </div>
    </div>
  </section>
</template>
