<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import FlavorCard from './FlavorCard.vue'

const props = defineProps({
  items: { type: Array, required: true },
  lenis: { type: Object, default: null },
})

const track = ref(null)
const deck = ref(null)
const deckHeight = ref(0)
const stepDistance = ref(1)
const stickyTop = ref(96)
const scrollPosition = ref(0)
const reducedMotion = ref(false)
const activeIndex = computed(() => Math.floor(scrollPosition.value))
const transitionProgress = computed(() => Math.max(0, (scrollPosition.value - activeIndex.value - 0.2) / 0.8))
const progress = computed(() => reducedMotion.value
  ? 0
  : transitionProgress.value)
const trackStyle = computed(() => deckHeight.value && props.items.length > 1
  ? { height: `${deckHeight.value + (props.items.length - 1) * stepDistance.value}px` }
  : undefined)
let resizeObserver
let frame
let motionQuery
let snapTarget
let positionInitialized = false

function releaseSnap() {
  snapTarget = undefined
}

function startSnap(index) {
  if (index === undefined || index <= activeIndex.value || !track.value?.getClientRects().length
    || !props.lenis || props.lenis.isStopped) return
  snapTarget = window.scrollY + track.value.getBoundingClientRect().top - stickyTop.value
    + index * stepDistance.value + 1
  props.lenis.scrollTo(snapTarget, {
    duration: 0.45,
    immediate: reducedMotion.value,
    lock: true,
    onComplete: () => {
      releaseSnap()
      schedulePosition()
    },
  })
}

function updatePosition() {
  frame = undefined
  if (!track.value?.getClientRects().length) return
  const previousPosition = scrollPosition.value
  const distance = stickyTop.value - track.value.getBoundingClientRect().top
  scrollPosition.value = Math.max(0, Math.min(props.items.length - 1, distance / stepDistance.value))
  if (!positionInitialized) {
    positionInitialized = true
    return
  }
  if (snapTarget !== undefined) {
    return
  }
  if (scrollPosition.value <= previousPosition || activeIndex.value >= props.items.length - 1) return

  const nextTop = Math.min(32, (activeIndex.value + 1) * 16)
  const shownHeight = transitionProgress.value * (deckHeight.value - nextTop)
  const cardHeight = deckHeight.value - 32
  if (shownHeight < cardHeight * 0.25) return

  // Порог считается по видимой части входящей карточки, а не длине жеста.
  startSnap(activeIndex.value + 1)
}

function schedulePosition() {
  if (frame === undefined) frame = window.requestAnimationFrame(updatePosition)
}

function measure() {
  if (!deck.value?.offsetHeight) return
  deckHeight.value = deck.value.offsetHeight
  // На коротком экране сначала прокручиваем карточку до её нижней части.
  stickyTop.value = Math.min(96, window.innerHeight - deckHeight.value - 24)
  stepDistance.value = Math.max(240, window.innerHeight * 0.8)
  schedulePosition()
}

function updateMotionPreference() {
  reducedMotion.value = motionQuery.matches
}

function cardStyle(index) {
  const offset = index - activeIndex.value
  const stackPosition = activeIndex.value + progress.value
  const depth = Math.max(0, stackPosition - index)
  const backDepth = Math.min(2, depth)
  const fraction = scrollPosition.value - activeIndex.value
  const retiringOpacity = offset === -2 ? Math.max(0, 1 - fraction / 0.2) : 1
  const opacity = (1 - backDepth * 0.28) * retiringOpacity
  // Просмотренные карточки остаются сверху, новая поднимается поверх них.
  // У стопки видны два верхних края, независимо от количества вкусов.
  const top = Math.max(0, index - Math.max(0, stackPosition - 2)) * 16
  const y = offset <= 0
    ? top
    : offset === 1
      ? deckHeight.value * (1 - progress.value) + top * progress.value
      : deckHeight.value

  return {
    transform: `translate3d(0, ${y}px, 0) scale(${1 - backDepth * 0.06})`,
    transformOrigin: 'top center',
    opacity,
    zIndex: index + 1,
    visibility: offset >= -2 && offset <= 1 && opacity > 0 ? 'visible' : 'hidden',
    pointerEvents: isInteractive(index) ? 'auto' : 'none',
  }
}

function isInteractive(index) {
  return index === activeIndex.value || (index === activeIndex.value + 1 && progress.value > 0)
}

watch(() => props.lenis, (lenis, _previous, onCleanup) => {
  if (!lenis) return
  const stopListening = lenis.on('scroll', schedulePosition)
  onCleanup(stopListening)
  schedulePosition()
}, { immediate: true, flush: 'post' })

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateMotionPreference()
  motionQuery.addEventListener('change', updateMotionPreference)
  resizeObserver = new ResizeObserver(measure)
  if (deck.value) resizeObserver.observe(deck.value)
  window.addEventListener('resize', measure, { passive: true })
  measure()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', updateMotionPreference)
  window.removeEventListener('resize', measure)
  releaseSnap()
  if (frame !== undefined) window.cancelAnimationFrame(frame)
})
</script>

<template>
  <div
    v-if="items.length"
    ref="track"
    :style="trackStyle"
    role="region"
    aria-label="Вкусы"
  >
    <div class="sticky" :style="{ top: `${stickyTop}px` }">
      <ul ref="deck" class="relative isolate grid overflow-hidden pb-8">
        <FlavorCard
          v-for="(item, index) in items"
          :key="item.name"
          class="col-start-1 row-start-1"
          :item="item"
          :style="cardStyle(index)"
          :inert="!isInteractive(index)"
          :aria-hidden="!isInteractive(index)"
        />
      </ul>
      <p class="sr-only" aria-live="polite" aria-atomic="true">
        {{ activeIndex + 1 }} / {{ items.length }} — {{ items[activeIndex].name }}
      </p>
    </div>
  </div>
</template>
