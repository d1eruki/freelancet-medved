<script setup>
import { sitePath } from '../utils/site-path'
import { onBeforeUnmount, ref } from 'vue'
import CircleArrow from './CircleArrow.vue'
import ProductCard from './ProductCard.vue'
import meadImageUrl from '../assets/mead-glass-cutout.png'
import ciderImageUrl from '../assets/cider-glass-cutout.png'
import perryImageUrl from '../assets/perry-glass-cutout.png'

const products = [
  {
    name: 'Медовуха',
    label: 'Мёд, ягоды и пряности',
    description: 'Мягкий хмельной напиток с медовой основой и выразительным ароматом натуральных добавок.',
    tastes: 'Светлая, тёмная, имбирная, вишнёвая, сливовая, клюквенная, чёрная смородина',
    href: sitePath('/katalog/medovuha/'),
    image: meadImageUrl,
  },
  {
    name: 'Сидр',
    label: 'Свежесть спелых яблок',
    description: 'Лёгкий яблочный напиток с чистым фруктовым вкусом и деликатной игрой пузырьков.',
    tastes: 'Сухой, полусухой, сладкий, полусладкий',
    href: sitePath('/katalog/sidr/'),
    image: ciderImageUrl,
  },
  {
    name: 'Пуаре',
    label: 'Тонкий вкус груши',
    description: 'Ароматный грушевый напиток с мягкой сладостью и свежим фруктовым послевкусием.',
    tastes: 'Сладкий',
    href: sitePath('/katalog/puare/'),
    image: perryImageUrl,
  },
]

const activeIndex = ref(0)
const isTransitioning = ref(false)
const isTextHidden = ref(false)
const motionDirection = ref('')
const dragOffset = ref(0)
const isDragging = ref(false)
let gesture = null
let suppressClick = false

const textFadeDuration = 360
const imageMotionDuration = 820
let slideTimer
let revealTimer

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
  <section class="relative isolate flex min-h-svh flex-col overflow-hidden bg-surface text-foreground nav:h-svh" data-header-theme="dark" aria-labelledby="products-title">
    <span class="absolute inset-x-0 bottom-0 z-0 h-[50svh] bg-brand/10" aria-hidden="true" />

    <div class="site-container relative z-2 shrink-0 pt-20 sm:pt-24 wide:pt-28">
      <div class="grid items-end gap-6 pb-8 wide:grid-cols-3 wide:gap-12 wide:pb-10">
        <h2 id="products-title" class="min-w-0 font-display text-h2 text-brand uppercase wide:col-span-2">
          Продукция
        </h2>

      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col">
      <div class="relative z-1 min-h-144 flex-1 touch-pan-y select-none overflow-hidden sm:min-h-160 nav:min-h-0"
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
          class="product-track flex h-full"
          :class="{ 'is-dragging': isDragging }"
          :style="{ transform: `translate3d(calc(-${activeIndex * 100}% + ${dragOffset}px), 0, 0)` }"
        >
          <ProductCard
            v-for="(product, index) in products"
            :key="product.href"
            class="h-full w-full shrink-0"
            :product="product"
            :active="index === activeIndex"
            :text-hidden="isTextHidden"
            :motion-direction="motionDirection"
            :dragging="isDragging"
            :drag-angle="dragOffset < 0 ? 3 : -3"
            :aria-hidden="index !== activeIndex"
          />
        </div>
      </div>

      <span class="sr-only" aria-live="polite">Выбран напиток: {{ products[activeIndex].name }}</span>

      <div class="site-container relative z-2 shrink-0 pb-8">
        <div class="flex flex-wrap items-center justify-center gap-3 pt-6">
          <button
            class="group rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
            type="button"
            aria-label="Предыдущий напиток"
            @click="showPrevious"
          >
            <CircleArrow direction="left" hover="brand" tone="surface" />
          </button>

          <div
            class="flex flex-wrap items-center justify-center gap-3"
            role="tablist"
            aria-label="Выбор напитка"
            @keydown.left.prevent="showPrevious"
            @keydown.right.prevent="showNext"
          >
            <button
              v-for="(product, index) in products"
              :key="product.href"
              class="rounded-full px-5 py-3 text-label font-bold uppercase transition focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
              :class="index === activeIndex
                ? 'bg-brand text-surface'
                : 'bg-surface text-foreground hover:bg-brand/10'"
              type="button"
              role="tab"
              :aria-selected="index === activeIndex"
              :tabindex="index === activeIndex ? 0 : -1"
              @click="showProduct(index)"
            >
              {{ product.name }}
            </button>
          </div>

          <button
            class="group rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
            type="button"
            aria-label="Следующий напиток"
            @click="showNext"
          >
            <CircleArrow hover="brand" tone="surface" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.product-track {
  transition: transform 700ms cubic-bezier(0.65, 0, 0.35, 1);
  will-change: transform;
}

.product-track.is-dragging {
  transition: none;
}

</style>
