<script setup>
import { sitePath } from '../../utils/site-path'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ProductCard from './ProductCard.vue'
import { productSliderRenders } from '#product-slider-renders'
import { catalogCategories } from '../../data/catalog'
import barCounterTexture from '../../assets/home/bar-counter-texture.png?responsive'
import productSliderBackground from '../../assets/home/product-slider-background.png?responsive'
import { siteVariant } from '../../data/site-variants.js'
const products = catalogCategories.map((category) => ({
  slug: category.slug,
  name: category.name,
  label: category.tagline,
  description: category.description,
  varieties: category.introduction,
  href: sitePath(`/katalog/${category.slug}/`),
  renders: productSliderRenders[category.slug],
}))

const activeIndex = ref(0)
const tabList = ref(null)
const track = ref(null)
const panelWidth = ref(0)
const counterVisible = ref(false)
const counterCandidates = barCounterTexture.srcset.split(',').map(candidate => {
  const [url, descriptor] = candidate.trim().split(/\s+/)
  return { url, width: Number.parseInt(descriptor, 10) }
})
const counterBackground = computed(() => {
  if (!counterVisible.value || !panelWidth.value) return undefined
  const candidates = counterCandidates.map(({ url, width }) => `url("${url}") ${width / panelWidth.value}x`)
  return { backgroundImage: `image-set(${candidates.join(', ')})` }
})
let counterObserver
let resizeObserver
onMounted(() => {
  resizeObserver = new ResizeObserver(([entry]) => { panelWidth.value = entry.contentRect.width })
  resizeObserver.observe(track.value)
  counterObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    counterVisible.value = true
    counterObserver.disconnect()
  }, { rootMargin: '1250px' })
  counterObserver.observe(track.value.closest('section'))
})
const isTransitioning = ref(false)
const isTextHidden = ref(false)
const motionDirection = ref('')
const dragOffset = ref(0)
const isDragging = ref(false)
const clientSlider = siteVariant.name === 'client'
const restingPawSide = ref('right')
const pawTransition = ref(null)
const trackTransform = computed(() => `translate3d(calc(-${activeIndex.value * 100}% + ${dragOffset.value}px), 0, 0)`)
let gesture = null
let suppressClick = false

const textFadeDuration = 360
const imageMotionDuration = 920
let slideTimer
let revealTimer
let pawFrame

const clampProgress = value => Math.max(0, Math.min(1, value))
const smoothProgress = value => {
  const t = clampProgress(value)
  return t * t * (3 - 2 * t)
}

function productPawMotion(index) {
  if (!clientSlider) return undefined
  const width = panelWidth.value
  const emptyHand = () => ({ x: 0, angle: 0, withdraw: 1, thumb: 0 })
  const pose = {
    anchor: -index * width,
    glassX: -activeIndex.value * width + dragOffset.value,
    angle: 0,
    left: emptyHand(), right: emptyHand(),
  }
  const showHand = (side, values = {}) => { pose[side] = { ...emptyHand(), withdraw: 0, ...values } }
  if (isDragging.value && index === activeIndex.value) {
    const side = dragOffset.value < 0 ? 'right' : 'left'
    const amount = Math.min(Math.abs(dragOffset.value) / 40, 1)
    pose.angle = -Math.sign(dragOffset.value) * 4 * amount
    showHand(side, { x: Math.max(-40, Math.min(40, dragOffset.value)), angle: pose.angle, withdraw: 1 - amount })
    return pose
  }
  const transition = pawTransition.value
  if (!transition) {
    if (index === activeIndex.value) showHand(restingPawSide.value, { thumb: 1 })
    return pose
  }
  const pushSide = transition.direction === 'forward' ? 'right' : 'left'
  const catchSide = pushSide === 'right' ? 'left' : 'right'
  const drive = pushSide === 'right' ? -1 : 1
  const distance = Math.max(24, Math.min(48, width * 0.024))
  const { elapsed, releaseAt, contactAt } = transition
  if (elapsed < releaseAt) {
    if (index === transition.from) {
      const preparation = smoothProgress(elapsed / 200)
      const push = clampProgress((elapsed - 200) / 240)
      const x = drive * distance * push * push
      pose.glassX = pose.anchor + x
      pose.angle = -drive * 4 * push
      showHand(pushSide, {
        x, angle: pose.angle, thumb: 1 - preparation,
        withdraw: transition.previousSide === pushSide ? 0 : 1 - smoothProgress((elapsed - 60) / 140),
      })
      if (transition.previousSide !== pushSide) {
        showHand(transition.previousSide, { withdraw: preparation, thumb: 1 - preparation })
      }
    }
    return pose
  }
  const flight = clampProgress((elapsed - releaseAt) / 600)
  if (index === transition.from && transition.from !== transition.to) {
    const startX = transition.dragRelease ? transition.fromOffset : drive * distance
    const handStartX = transition.dragRelease ? Math.max(-40, Math.min(40, startX)) : startX
    pose.glassX = pose.anchor + startX + drive * (width + distance) * flight * (0.2 + 0.8 * flight)
    pose.angle = -drive * 4 * (1 - flight)
    showHand(pushSide, {
      x: handStartX + drive * 8 * smoothProgress((elapsed - releaseAt) / 280),
      angle: -drive * 4,
      withdraw: smoothProgress((elapsed - releaseAt - 220) / 360),
    })
  }
  if (index === transition.to) {
    const returning = transition.from === transition.to
    const compression = clampProgress((elapsed - contactAt) / 160)
    const settling = clampProgress((elapsed - contactAt - 160) / 420)
    const spring = settling === 1 ? 0 : Math.exp(-5 * settling)
      * (Math.cos(3 * Math.PI * settling) + 5 / (3 * Math.PI) * Math.sin(3 * Math.PI * settling))
    const contact = elapsed >= contactAt
    const impact = settling > 0 ? spring : compression * (2 - compression)
    const x = contact ? drive * distance * impact : transition.toOffset * (1 - flight * (1.8 - 0.8 * flight))
    pose.glassX = pose.anchor + x
    pose.angle = contact ? drive * 6 * impact : -drive * 4 * (1 - flight)
    showHand(catchSide, {
      x: contact || returning ? x : 0,
      angle: contact || returning ? pose.angle : 0,
      withdraw: returning ? 0 : 1 - smoothProgress((flight - 0.55) / 0.32),
      thumb: smoothProgress((elapsed - contactAt - 80) / 120),
    })
  }
  return pose
}

function beginClientTransition(index, dragRelease = false) {
  const from = activeIndex.value
  const direction = index === from
    ? (dragOffset.value < 0 ? 'backward' : 'forward')
    : (index > from ? 'forward' : 'backward')
  const drive = direction === 'forward' ? -1 : 1
  const releaseAt = dragRelease ? 0 : 440
  pawTransition.value = {
    from, to: index, direction, previousSide: restingPawSide.value,
    dragRelease, fromOffset: dragOffset.value,
    toOffset: dragRelease ? (index - from) * panelWidth.value + dragOffset.value : -drive * panelWidth.value,
    releaseAt, contactAt: releaseAt + 600, elapsed: 0,
  }
  dragOffset.value = 0
  isDragging.value = false
  isTransitioning.value = true
  isTextHidden.value = true
  let startedAt
  const advance = now => {
    startedAt ??= now
    const transition = pawTransition.value
    transition.elapsed = now - startedAt
    if (transition.elapsed >= releaseAt) activeIndex.value = index
    if (transition.elapsed >= transition.contactAt + 580) {
      restingPawSide.value = direction === 'forward' ? 'left' : 'right'
      pawTransition.value = null
      isTextHidden.value = false
      isTransitioning.value = false
      pawFrame = undefined
      return
    }
    pawFrame = window.requestAnimationFrame(advance)
  }
  pawFrame = window.requestAnimationFrame(advance)
}

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
  if (pawFrame) window.cancelAnimationFrame(pawFrame)
}

function showProduct(index) {
  if (index === activeIndex.value || isTransitioning.value || gesture) {
    return
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    activeIndex.value = index
    return
  }
  if (clientSlider) {
    beginClientTransition(index)
    return
  }

  isTransitioning.value = true
  isTextHidden.value = true

  slideTimer = window.setTimeout(() => {
    settleProduct(index)
  }, textFadeDuration)
}

function settleProduct(index) {
  if (clientSlider && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    beginClientTransition(index, true)
    return
  }
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

onBeforeUnmount(() => {
  clearTransitionTimers()
  resizeObserver?.disconnect()
  counterObserver?.disconnect()
})
</script>

<template>
  <section class="relative isolate flex min-h-svh flex-col overflow-hidden bg-surface text-foreground nav:h-svh" aria-labelledby="products-title">
    <div
      :style="counterBackground"
      data-product-counter
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[30svh] w-full bg-size-[100%_100%] bg-no-repeat"
    />
    <div class="pointer-events-none absolute inset-x-0 top-0 bottom-[30svh] z-1 overflow-hidden" aria-hidden="true">
      <img
        :src="productSliderBackground.src"
        :srcset="productSliderBackground.srcset"
        sizes="max(100vw, calc(70svh * 1.5))"
        loading="lazy"
        decoding="async"
        data-product-background
        alt=""
        class="h-full w-full object-cover"
      />
      <span class="absolute inset-0 bg-black/75" />
    </div>

    <div class="site-container relative z-2 shrink-0 pt-20 sm:pt-24">
      <div class="grid items-end gap-6 pb-6 wide:grid-cols-3 wide:gap-12">
        <h2 id="products-title" class="min-h-[1em] min-w-0 font-display text-h2 text-center text-surface uppercase nav:text-left wide:col-span-2">
          <span class="sr-only">Продукция</span>
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
          ref="track"
          class="product-track flex nav:h-full"
          :class="{ 'is-dragging': isDragging }"
          :style="{ transform: trackTransform, '--product-translation': `${-activeIndex * panelWidth + dragOffset}px` }"
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
            :paw-motion="productPawMotion(index)"
            :aria-hidden="index !== activeIndex"
            @previous="showPrevious"
            @next="showNext"
          />
        </div>
      </div>

      <span class="sr-only" aria-live="polite">Выбран напиток: {{ products[activeIndex].name }}</span>

      <div class="site-container relative z-2 hidden shrink-0 -translate-y-8 pb-8 nav:block">
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
