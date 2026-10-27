<!-- Слайдер продукции в раннем светлом оформлении с фотографическими бокалами. -->
<script setup>
import { sitePath } from '../../utils/site-path'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import meadGlass from '../../assets/home/neuro-mead-glass.png?responsive'
import ciderGlass from '../../assets/home/neuro-cider-glass.png?responsive'
import perryGlass from '../../assets/home/neuro-perry-glass.png?responsive'
import ProductCard from './ProductCard.vue'
import { catalogCategories } from '../../data/catalog'

const glasses = { medovuha: meadGlass, sidr: ciderGlass, puare: perryGlass }
const patternPaths = {
  medovuha: 'M4 18v-5l4-2 4 2v5l-4 2-4-2M8 11V6l4-2 4 2v5M12 13l4-2 4 2v5l-4 2-4-2',
  sidr: 'M4 11.3c0 3.1.4 5.3 2.2 8 1.4 1.8 3.2 2.2 5.1 1 .4-.3 1-.3 1.4 0 1.9 1.2 3.7.8 5.1-1 1.8-2.7 2.2-4.9 2.2-8 0-2.6-2-5.3-4.4-5.3-1.3 0-2.4.7-3.3 1.4-.2.2-.4.2-.6 0C10.8 6.7 9.7 6 8.4 6 6 6 4 8.7 4 11.3M12 7c0-1.2.9-4 3-4',
  puare: 'M12 7c-2 0-3 2-3 4-1 2-4 3-4 6 0 3 3 5 7 5s7-2 7-5c0-3-3-4-4-6 0-2-1-4-3-4ZM12 7V5c0-2 1-3 3-3',
}

const products = catalogCategories.map((category) => ({
  slug: category.slug,
  name: category.name,
  label: category.tagline,
  description: category.description,
  varieties: category.introduction,
  href: sitePath(`/katalog/${category.slug}/`),
  image: glasses[category.slug],
}))

const activeIndex = ref(0)
const tabList = ref(null)
const isTransitioning = ref(false)
const isTextHidden = ref(false)
const motionDirection = ref('')
const dragOffset = ref(0)
const isDragging = ref(false)
const trackTransform = computed(() => `translate3d(calc(-${activeIndex.value * 100}% + ${dragOffset.value}px), 0, 0)`)
let gesture = null
let suppressClick = false

const textFadeDuration = 360
const imageMotionDuration = 820
let slideTimer
let revealTimer

watch(activeIndex, () => {
  if (tabList.value?.contains(document.activeElement)) {
    tabList.value.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true })
  }
}, { flush: 'post' })

function handleTabKeydown(event, index) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const targets = {
    ArrowLeft: (index - 1 + products.length) % products.length,
    ArrowRight: (index + 1) % products.length,
    Home: 0,
    End: products.length - 1,
  }
  if (!Object.hasOwn(targets, event.key)) return
  event.preventDefault()
  showProduct(targets[event.key])
}

function clearTransitionTimers() {
  window.clearTimeout(slideTimer)
  window.clearTimeout(revealTimer)
}

function showProduct(index) {
  if (index === activeIndex.value || isTransitioning.value || gesture) {
    return
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    activeIndex.value = index
    return
  }

  isTransitioning.value = true
  isTextHidden.value = true

  slideTimer = window.setTimeout(() => {
    settleProduct(index)
  }, textFadeDuration)
}

function settleProduct(index) {
  const direction = index === activeIndex.value
    ? (dragOffset.value < 0 ? 'backward' : 'forward')
    : (index > activeIndex.value ? 'forward' : 'backward')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  motionDirection.value = reducedMotion ? '' : direction
  activeIndex.value = index
  dragOffset.value = 0
  isDragging.value = false
  isTransitioning.value = true
  revealTimer = window.setTimeout(() => {
    motionDirection.value = ''
    isTextHidden.value = false

    isTransitioning.value = false
  }, reducedMotion ? 0 : imageMotionDuration)
}

function startDrag(event) {
  if (!event.isPrimary || event.button !== 0 || isTransitioning.value || gesture) return
  suppressClick = false
  gesture = {
    id: event.pointerId, x: event.clientX, y: event.clientY,
    width: event.currentTarget.clientWidth,
    lastX: event.clientX, lastTime: event.timeStamp, velocity: 0,
  }
}

function moveDrag(event) {
  if (!gesture || gesture.id !== event.pointerId) return
  const dx = event.clientX - gesture.x
  const dy = event.clientY - gesture.y
  if (!isDragging.value) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 4) return
    if (event.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx) * 1.4) {
      gesture = null
      return
    }
    if (Math.abs(dx) < 4) return
    isDragging.value = true
    isTextHidden.value = true
    suppressClick = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const elapsed = event.timeStamp - gesture.lastTime
  if (elapsed > 0) gesture.velocity = (event.clientX - gesture.lastX) / elapsed
  gesture.lastX = event.clientX
  gesture.lastTime = event.timeStamp
  const beyondEdge = (activeIndex.value === 0 && dx > 0) || (activeIndex.value === products.length - 1 && dx < 0)
  dragOffset.value = Math.max(-gesture.width, Math.min(gesture.width, dx * (beyondEdge ? 0.2 : 1)))
}

function endDrag(event) {
  if (!gesture || gesture.id !== event.pointerId) return
  const width = gesture.width
  const velocity = event.timeStamp - gesture.lastTime < 100 ? gesture.velocity : 0
  gesture = null
  if (!isDragging.value) return
  const distance = Math.abs(dragOffset.value)
  const flick = distance > 16 && Math.abs(velocity) > 0.35
    && Math.sign(velocity) === Math.sign(dragOffset.value)
  const shouldSwitch = event.type !== 'pointercancel'
    && (distance > Math.min(40, width * 0.08) || flick)
  const index = Math.max(0, Math.min(products.length - 1,
    activeIndex.value + (shouldSwitch ? (dragOffset.value < 0 ? 1 : -1) : 0)))
  settleProduct(index)
}

function cancelDrag(event) {
  if (gesture && !isDragging.value) gesture = null
  else if (gesture) endDrag(event)
}

function preventDragClick(event) {
  if (!suppressClick) return
  event.preventDefault()
  event.stopPropagation()
  suppressClick = false
}

function showPrevious() {
  showProduct((activeIndex.value - 1 + products.length) % products.length)
}

function showNext() {
  showProduct((activeIndex.value + 1) % products.length)
}

onBeforeUnmount(clearTransitionTimers)
</script>

<template>
  <section class="relative isolate flex min-h-svh flex-col overflow-hidden bg-surface text-foreground nav:h-svh" aria-labelledby="products-title">
    <span class="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[30svh] bg-brand/7" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-x-0 top-0 bottom-[30svh] z-1 overflow-hidden" aria-hidden="true">
      <div
        class="product-track flex h-full"
        :class="{ 'is-dragging': isDragging }"
        :style="{ transform: trackTransform }"
      >
        <svg
          v-for="product in products"
          :key="product.slug"
          class="h-full w-full shrink-0 text-brand opacity-[0.07]"
          focusable="false"
        >
          <defs>
            <pattern :id="`home-product-pattern-${product.slug}`" width="224" height="224" patternUnits="userSpaceOnUse">
              <path
                v-for="(position, index) in [[32, 32], [144, 32], [-24, 144], [88, 144], [200, 144]]"
                :key="index"
                :d="patternPaths[product.slug]"
                :transform="`translate(${position[0]} ${position[1]}) scale(2)`"
                fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" :fill="`url(#home-product-pattern-${product.slug})`" />
        </svg>
      </div>
    </div>

    <div class="site-container relative z-2 shrink-0 pt-20 sm:pt-24">
      <div class="grid items-end gap-6 pb-6 wide:grid-cols-3 wide:gap-12">
        <h2 id="products-title" class="min-h-[1em] min-w-0 font-display text-h2 text-center text-brand uppercase nav:text-left wide:col-span-2">
          Продукция
        </h2>

      </div>
    </div>

    <div class="relative flex flex-col nav:min-h-0 nav:flex-1">
      <div class="relative z-1 touch-pan-y select-none overflow-hidden nav:min-h-0 nav:flex-1"
        @pointerdown="startDrag"
        @pointermove="moveDrag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
        @pointerleave="cancelDrag"
        @lostpointercapture="endDrag"
        @dragstart.prevent
        @click.capture="preventDragClick"
      >
        <div
          class="product-track flex nav:h-full"
          :class="{ 'is-dragging': isDragging }"
          :style="{ transform: trackTransform }"
        >
          <ProductCard
            v-for="(product, index) in products"
            :key="product.href"
            :id="`home-product-panel-${product.slug}`"
            role="tabpanel"
            :aria-labelledby="`home-product-tab-${product.slug}`"
            :inert="index !== activeIndex || undefined"
            class="w-full shrink-0 nav:h-full"
            :product="product"
            :active="index === activeIndex"
            :text-hidden="isTextHidden"
            :motion-direction="motionDirection"
            :dragging="isDragging"
            :drag-angle="dragOffset < 0 ? 3 : -3"
            :aria-hidden="index !== activeIndex"
            @previous="showPrevious"
            @next="showNext"
          />
        </div>
      </div>

      <span class="sr-only" aria-live="polite">Выбран напиток: {{ products[activeIndex].name }}</span>

      <div class="site-container relative z-2 hidden shrink-0 pb-8 nav:block">
        <div class="flex flex-wrap items-center justify-center gap-3 pt-4">
          <div
            ref="tabList"
            class="hidden flex-wrap items-center justify-center gap-3 nav:flex"
            role="tablist"
            aria-label="Выбор напитка"
          >
            <button
              v-for="(product, index) in products"
              :key="product.href"
              :id="`home-product-tab-${product.slug}`"
              class="rounded-full px-5 py-3 text-label font-bold uppercase transition focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
              :class="index === activeIndex
                ? 'bg-brand text-surface'
                : 'bg-surface text-foreground hover:bg-brand hover:text-surface'"
              type="button"
              role="tab"
              :aria-controls="`home-product-panel-${product.slug}`"
              :aria-selected="index === activeIndex"
              :tabindex="index === activeIndex ? 0 : -1"
              @click="showProduct(index)"
              @keydown="handleTabKeydown($event, index)"
            >
              {{ product.name }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.product-track {
  --product-track-duration: 700ms;
  --product-track-easing: cubic-bezier(0.65, 0, 0.35, 1);
  transition: transform var(--product-track-duration) var(--product-track-easing);
  will-change: transform;
}

.product-track.is-dragging {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .product-track { transition: none; }
}
</style>
