import { onBeforeUnmount, onMounted, ref } from 'vue'

export function usePointerParallax({ range, enabled = () => true }) {
  const offset = ref({ x: 0, y: 0 })
  let media
  let frame = 0
  let pointer

  function cancelUpdate() {
    if (frame) window.cancelAnimationFrame(frame)
    frame = 0
    pointer = undefined
  }

  function reset() {
    cancelUpdate()
    offset.value = { x: 0, y: 0 }
  }

  function render() {
    frame = 0
    const latest = pointer
    pointer = undefined
    if (!latest || !enabled() || !media?.matches || document.hidden || !latest.target.isConnected) return
    const bounds = latest.target.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    const normalize = (position, size) => Math.max(-1, Math.min(1, position / size * 2 - 1))
    offset.value = {
      x: normalize(latest.x - bounds.left, bounds.width) * range.x,
      y: normalize(latest.y - bounds.top, bounds.height) * range.y,
    }
  }

  function update(event) {
    if (!enabled() || !media?.matches || event.pointerType === 'touch' || document.hidden) return
    pointer = { target: event.currentTarget, x: event.clientX, y: event.clientY }
    if (!frame) frame = window.requestAnimationFrame(render)
  }

  onMounted(() => {
    if (!enabled()) return
    media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    media.addEventListener('change', reset)
    window.addEventListener('blur', reset)
  })

  onBeforeUnmount(() => {
    cancelUpdate()
    media?.removeEventListener('change', reset)
    window.removeEventListener('blur', reset)
  })

  return { offset, reset, update }
}
