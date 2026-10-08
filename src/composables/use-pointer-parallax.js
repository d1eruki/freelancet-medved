import { onBeforeUnmount, onMounted, ref } from 'vue'

export function usePointerParallax({ range, enabled = () => true }) {
  const offset = ref({ x: 0, y: 0 })
  let media

  function reset() {
    offset.value = { x: 0, y: 0 }
  }

  function update(event) {
    if (!enabled() || !media?.matches || event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    const normalize = (position, size) => Math.max(-1, Math.min(1, position / size * 2 - 1))
    offset.value = {
      x: normalize(event.clientX - bounds.left, bounds.width) * range.x,
      y: normalize(event.clientY - bounds.top, bounds.height) * range.y,
    }
  }

  onMounted(() => {
    if (!enabled()) return
    media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    media.addEventListener('change', reset)
    window.addEventListener('blur', reset)
  })

  onBeforeUnmount(() => {
    media?.removeEventListener('change', reset)
    window.removeEventListener('blur', reset)
  })

  return { offset, reset, update }
}
