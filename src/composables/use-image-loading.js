import { computed, onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

// Один наблюдатель на приложение; адреса ресурсов появляются только рядом с экраном.
const pending = new Map()
let observer

function observe(element, activate) {
  if (!('IntersectionObserver' in window)) {
    activate()
    return () => {}
  }
  observer ??= new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const callbacks = pending.get(entry.target)
      pending.delete(entry.target)
      observer?.unobserve(entry.target)
      for (const callback of callbacks ?? []) callback()
    }
  }, { rootMargin: '300px' })
  const callbacks = pending.get(element) ?? new Set()
  callbacks.add(activate)
  pending.set(element, callbacks)
  observer.observe(element)
  return () => {
    callbacks.delete(activate)
    if (!callbacks.size && pending.get(element) === callbacks) {
      pending.delete(element)
      observer?.unobserve(element)
    }
    if (!pending.size) {
      observer?.disconnect()
      observer = undefined
    }
  }
}

export function useImageLoading(element, { critical = false, media = '', enabled = true } = {}) {
  const nearby = ref(false)
  const matches = ref(!toValue(media))
  const shouldLoad = computed(() => Boolean(toValue(enabled) && matches.value && (toValue(critical) || nearby.value)))
  let stopObserving
  let query
  let mounted = false

  const updateMatch = () => { matches.value = !query || query.matches }
  function configure() {
    if (!mounted) return
    query?.removeEventListener('change', updateMatch)
    query = toValue(media) ? window.matchMedia(toValue(media)) : undefined
    query?.addEventListener('change', updateMatch)
    updateMatch()
    stopObserving?.()
    stopObserving = undefined
    if (toValue(critical) || nearby.value || !toValue(enabled)) return
    const node = toValue(element)
    if (!node) return
    // SVG <image> внутри defs не имеет собственного видимого прямоугольника.
    const target = node instanceof SVGElement ? node.ownerSVGElement || node : node
    stopObserving = observe(target, () => { nearby.value = true })
  }

  onMounted(() => {
    mounted = true
    configure()
  })
  watch([() => toValue(media), () => toValue(critical), () => toValue(enabled)], configure, { flush: 'post' })
  onBeforeUnmount(() => {
    mounted = false
    stopObserving?.()
    query?.removeEventListener('change', updateMatch)
  })
  return { shouldLoad }
}
