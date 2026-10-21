<!-- Интерактивная Яндекс Карта с фирменным оформлением и запасным встраиванием. -->
<script>
let apiPromise

function loadMapsApi(apiKey) {
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const timeout = window.setTimeout(() => fail(new Error('Yandex Maps loading timed out')), 20000)
    const fail = (error) => {
      window.clearTimeout(timeout)
      script.remove()
      reject(error)
    }
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`
    script.async = true
    script.onerror = () => fail(new Error('Yandex Maps could not be loaded'))
    script.onload = async () => {
      try {
        await window.ymaps3.ready
        window.clearTimeout(timeout)
        resolve(window.ymaps3)
      } catch (error) {
        fail(error)
      }
    }
    document.head.append(script)
  }).catch((error) => {
    apiPromise = undefined
    throw error
  })

  return apiPromise
}
</script>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import logoUrl from '../assets/branding/brand-logo-mark.svg'

const props = defineProps({
  embedUrl: { type: String, required: true },
  title: { type: String, required: true },
  markerUrl: { type: String, required: true },
  markerLabel: { type: String, default: 'МЁДВЕДЬ' },
})

const container = ref(null)
const canvas = ref(null)
const ready = ref(false)
const activated = ref(false)
let map
let observer
let disposed = false

async function initialize() {
  activated.value = true
  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY?.trim()
  if (!apiKey) return

  try {
    const api = await loadMapsApi(apiKey)
    if (disposed) return

    // Используем тот же центр и масштаб, что и у резервной встроенной карты.
    const embed = new URL(props.embedUrl)
    const center = embed.searchParams.get('ll').split(',').map(Number)
    const zoom = Number(embed.searchParams.get('z')) || 17
    const theme = getComputedStyle(container.value)
    const color = name => theme.getPropertyValue(`--color-${name}`).trim()
    const surface = color('surface')
    const panel = color('panel')
    const brand = color('brand')
    const customization = [
      { elements: 'geometry', stylers: [{ color: surface }] },
      { tags: { any: ['urban_area', 'building'] }, elements: 'geometry.fill', stylers: [{ color: panel }] },
      { tags: { any: ['building'] }, elements: 'geometry.outline', stylers: [{ color: brand, opacity: 0.25 }] },
      { tags: { any: ['road'] }, elements: 'geometry.fill', stylers: [{ color: surface }] },
      { tags: { any: ['road'] }, elements: 'geometry.outline', stylers: [{ color: panel }] },
      { tags: { any: ['water'] }, elements: 'geometry.fill', stylers: [{ color: brand, opacity: 0.3 }] },
      { tags: { any: ['vegetation', 'park'] }, elements: 'geometry.fill', stylers: [{ color: brand, opacity: 0.18 }] },
      { elements: 'label.text.fill', stylers: [{ color: color('foreground') }] },
      { elements: 'label.text.outline', stylers: [{ color: surface }] },
      { elements: 'label.icon', stylers: [{ color: brand }] },
    ]

    map = new api.YMap(canvas.value, {
      location: { center, zoom },
      mode: 'vector',
      behaviors: ['drag', 'pinchZoom', 'dblClick'],
    })
    map.addChild(new api.YMapDefaultSchemeLayer({ customization }))
    map.addChild(new api.YMapDefaultFeaturesLayer({}))

    const marker = document.createElement('a')
    marker.href = props.markerUrl
    marker.target = '_blank'
    marker.rel = 'noopener noreferrer'
    marker.setAttribute('aria-label', `${props.markerLabel}: открыть в Яндекс Картах`)
    marker.className = 'inline-flex size-12 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border-2 border-surface bg-brand shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand'
    const logo = document.createElement('span')
    logo.className = 'block size-8 bg-surface'
    logo.style.mask = `url("${logoUrl}") center / contain no-repeat`
    logo.setAttribute('aria-hidden', 'true')
    marker.append(logo)
    map.addChild(new api.YMapMarker({ coordinates: center }, marker))
    ready.value = true
  } catch (error) {
    map?.destroy()
    map = undefined
    if (!disposed) console.warn('Не удалось подключить оформление карты; используется встроенная карта.', error)
  }
}

function changeZoom(amount) {
  if (map) map.setLocation({ zoom: Math.min(21, Math.max(0, map.zoom + amount)), duration: 200 })
}

onMounted(() => {
  if (!('IntersectionObserver' in window)) {
    initialize()
    return
  }
  observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return
    observer.disconnect()
    initialize()
  }, { rootMargin: '300px' })
  observer.observe(container.value)
})

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  map?.destroy()
})
</script>

<template>
  <div ref="container" class="relative isolate h-96 w-full overflow-hidden rounded-3xl bg-panel" data-lenis-prevent>
    <div ref="canvas" class="absolute inset-0" :aria-label="title" role="region" :inert="!ready" :aria-hidden="!ready" />
    <iframe
      v-if="activated && !ready"
      class="absolute inset-0 size-full border-0"
      :src="embedUrl"
      :title="title"
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
    />
    <div v-if="ready" class="absolute top-4 right-4 flex flex-col gap-3">
      <button
        v-for="control in [{ label: 'Приблизить карту', amount: 1, text: '+' }, { label: 'Отдалить карту', amount: -1, text: '−' }]"
        :key="control.amount"
        type="button"
        class="flex size-12 cursor-pointer items-center justify-center rounded-full bg-surface text-body-large font-bold text-brand shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        :aria-label="control.label"
        @click="changeZoom(control.amount)"
      >{{ control.text }}</button>
    </div>
  </div>
</template>
