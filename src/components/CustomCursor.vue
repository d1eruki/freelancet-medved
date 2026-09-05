<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import pawUrl from '../assets/paw-cursor.svg'

const cursorElement = ref(null)
const cursorLabel = ref(null)

let cursorFrame = 0
let cursorX = -100
let cursorY = -100
let finePointer
let isEnabled = false

function renderCursor() {
  cursorElement.value?.style.setProperty('--cursor-x', `${cursorX}px`)
  cursorElement.value?.style.setProperty('--cursor-y', `${cursorY}px`)
  cursorFrame = 0
}

function setCursorState(event) {
  const target = event.target

  if (!(target instanceof Element) || !cursorElement.value || !cursorLabel.value) {
    return
  }

  const interactive = target.closest('a, button')
  const storyItem = target.closest('.story-item')
  const productInteractive = target.closest('.product-interactive')
  const formControl = target.closest('input, textarea, select, [contenteditable="true"]')
  let state = ''
  let label = ''

  if (storyItem) {
    state = 'is-action'
  } else if (formControl) {
    state = 'is-hidden'
  } else if (productInteractive) {
    state = 'is-action'
    label = 'ВЫБРАТЬ'
  } else if (interactive) {
    state = 'is-action'

    if (interactive.matches('[href^="mailto:"]')) {
      label = 'ПИСАТЬ'
    } else if (interactive.matches('[href^="tel:"]')) {
      label = 'ЗВОНИТЬ'
    } else if (interactive.matches('button')) {
      label = 'НАЖАТЬ'
    } else {
      label = 'ПЕРЕЙТИ'
    }
  }

  cursorElement.value.classList.remove('is-action', 'is-hidden', 'has-label')

  if (state) {
    cursorElement.value.classList.add(state)
  }

  cursorLabel.value.textContent = label
  cursorElement.value.classList.toggle('has-label', Boolean(label))
}

function handlePointerMove(event) {
  if (!cursorElement.value) {
    return
  }

  cursorX = event.clientX
  cursorY = event.clientY
  cursorElement.value.classList.add('is-visible')
  cursorElement.value.classList.toggle('is-flipped', cursorX > window.innerWidth - 130)

  if (!cursorFrame) {
    cursorFrame = window.requestAnimationFrame(renderCursor)
  }
}

function showCursor() {
  cursorElement.value?.classList.add('is-visible')
}

function hideCursor() {
  cursorElement.value?.classList.remove('is-visible')
}

function pressCursor() {
  cursorElement.value?.classList.add('is-pressed')
}

function releaseCursor() {
  cursorElement.value?.classList.remove('is-pressed')
}

function enableCursor() {
  if (isEnabled || !cursorElement.value) {
    return
  }

  isEnabled = true
  document.documentElement.classList.add('has-custom-cursor')
  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerover', setCursorState)
  document.addEventListener('pointerdown', pressCursor)
  document.addEventListener('pointerup', releaseCursor)
  document.addEventListener('pointercancel', releaseCursor)
  document.documentElement.addEventListener('mouseleave', hideCursor)
  document.documentElement.addEventListener('mouseenter', showCursor)
}

function disableCursor() {
  if (!isEnabled) {
    return
  }

  isEnabled = false
  document.documentElement.classList.remove('has-custom-cursor')
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerover', setCursorState)
  document.removeEventListener('pointerdown', pressCursor)
  document.removeEventListener('pointerup', releaseCursor)
  document.removeEventListener('pointercancel', releaseCursor)
  document.documentElement.removeEventListener('mouseleave', hideCursor)
  document.documentElement.removeEventListener('mouseenter', showCursor)
  cursorElement.value?.classList.remove('is-visible', 'is-action', 'is-hidden', 'is-pressed', 'has-label')

  if (cursorFrame) {
    window.cancelAnimationFrame(cursorFrame)
    cursorFrame = 0
  }
}

function syncCursorAvailability(event) {
  if (event.matches) {
    enableCursor()
  } else {
    disableCursor()
  }
}

onMounted(() => {
  finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  finePointer.addEventListener('change', syncCursorAvailability)

  if (finePointer.matches) {
    enableCursor()
  }
})

onBeforeUnmount(() => {
  finePointer?.removeEventListener('change', syncCursorAvailability)
  disableCursor()
})
</script>

<template>
  <div ref="cursorElement" class="custom-cursor" aria-hidden="true">
    <span class="custom-cursor__visual">
      <img class="custom-cursor__paw" :src="pawUrl" alt="">
      <span ref="cursorLabel" class="custom-cursor__label"></span>
    </span>
  </div>
</template>

<style scoped>
.custom-cursor {
  --cursor-x: -100px;
  --cursor-y: -100px;
  --cursor-action-shadow: color-mix(in srgb, var(--color-brand) 70%, var(--color-foreground));
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
  opacity: 0;
  transform: translate3d(var(--cursor-x), var(--cursor-y), 0);
  transition: opacity 160ms ease;
}

.custom-cursor.is-visible {
  opacity: 1;
}

.custom-cursor__visual {
  position: absolute;
  top: -19px;
  left: -19px;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 50%;
  background: rgb(255 255 255 / 94%);
  box-shadow: 0 8px 24px rgb(16 16 16 / 16%);
  transform: rotate(-12deg) scale(1);
  transition: width 180ms ease, height 180ms ease, top 180ms ease, left 180ms ease,
    background-color 180ms ease, transform 120ms ease, box-shadow 180ms ease;
  backdrop-filter: blur(5px);
}

.custom-cursor__paw {
  display: block;
  width: 22px;
  height: 23px;
  transition: filter 180ms ease, transform 180ms ease;
}

.custom-cursor__label {
  position: absolute;
  top: 50%;
  left: calc(100% + 9px);
  padding: 7px 10px 6px;
  color: var(--color-surface);
  border-radius: 999px;
  background: var(--color-foreground);
  font-size: var(--text-caption);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.1em;
  white-space: nowrap;
  opacity: 0;
  transform: translate3d(-5px, -50%, 0);
  transition: opacity 150ms ease, transform 180ms ease;
}

.custom-cursor.has-label .custom-cursor__label {
  opacity: 1;
  transform: translate3d(0, -50%, 0);
}

.custom-cursor.is-flipped .custom-cursor__label {
  right: calc(100% + 9px);
  left: auto;
  transform: translate3d(5px, -50%, 0);
}

.custom-cursor.is-flipped.has-label .custom-cursor__label {
  transform: translate3d(0, -50%, 0);
}

.custom-cursor.is-action .custom-cursor__visual {
  top: -23px;
  left: -23px;
  width: 46px;
  height: 46px;
  background: var(--color-brand);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--cursor-action-shadow) 36%, transparent);
  transform: rotate(8deg) scale(1);
}

.custom-cursor.is-action .custom-cursor__paw {
  filter: invert(1);
  transform: scale(1.1);
}

.custom-cursor.is-pressed .custom-cursor__visual {
  transform: rotate(0) scale(0.7);
}

.custom-cursor.is-hidden {
  opacity: 0;
}
</style>
