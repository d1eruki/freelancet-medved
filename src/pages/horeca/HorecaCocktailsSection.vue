<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import background from '../../assets/horeca/cocktails/cocktails-background.png?responsive'
import CircleArrow from '../../components/CircleArrow.vue'
import CocktailRecipeCard from './CocktailRecipeCard.vue'
import { cocktailRecipes } from '../../data/cocktail-recipes.js'

const activeIndex = ref(0)
const activeRecipe = computed(() => cocktailRecipes[activeIndex.value])
const switching = ref(false)
const direction = ref(1)
const pendingIndex = ref(0)
const mobileSlide = ref(false)
let turnAnimations = []
let disposed = false
const pageFrames = computed(() => {
  if (!switching.value) return [{ key: 'full', side: 'full', face: 'static', recipe: activeRecipe.value }]
  const next = cocktailRecipes[pendingIndex.value]
  const forward = direction.value > 0
  const frames = mobileSlide.value ? [
    { key: 'stationary-next', side: 'full', face: 'static', recipe: next },
    { key: 'front', side: 'full', face: 'front', recipe: activeRecipe.value },
  ] : [
    { key: 'stationary-old', side: forward ? 'left' : 'right', face: 'static', recipe: activeRecipe.value },
    { key: 'stationary-next', side: forward ? 'right' : 'left', face: 'static', recipe: next },
    { key: 'front', side: forward ? 'right' : 'left', face: 'front', recipe: activeRecipe.value },
    { key: 'back', side: forward ? 'right' : 'left', face: 'back', recipe: next },
  ]
  return frames.map(frame => ({ ...frame, recipe: { ...frame.recipe, id: `${frame.recipe.id}-${frame.key}` } }))
})
const scene = ref(null)
const slideViewport = ref(null)
const sceneStyle = ref({})
let sceneObserver = null
let touchStart = null

// Общий лист содержит и рецепт, и коктейль. Сохраняем положение картинки
// относительно всей секции, хотя сам лист расположен под заголовком.
function updateSceneFrame() {
  if (!scene.value || !slideViewport.value) return
  const frame = scene.value.getBoundingClientRect()
  const viewport = slideViewport.value.getBoundingClientRect()
  sceneStyle.value = {
    '--slide-width': `${viewport.width}px`,
    '--scene-left': `${frame.left - viewport.left}px`,
    '--scene-top': `${frame.top - viewport.top}px`,
    '--scene-width': `${frame.width}px`,
    '--scene-height': `${frame.height}px`,
  }
}

onMounted(() => {
  updateSceneFrame()
  sceneObserver = new ResizeObserver(updateSceneFrame)
  sceneObserver.observe(scene.value)
  sceneObserver.observe(slideViewport.value)
})

onBeforeUnmount(() => {
  disposed = true
  sceneObserver?.disconnect()
  turnAnimations.forEach(animation => animation.cancel())
})

// Координаты общей стойки на исходном фоне 1672 × 941.
// Учитываем видимые границы PNG, чтобы прозрачные поля не смещали опору.
function foregroundTransform(recipe) {
  const [, , width, height] = recipe.imageFrame.bounds
  const scale = Math.min(650 / width, 470 / height) * 1.15
  return `translate(${430 - width * scale / 2} ${875 - height * scale}) scale(${scale})`
}

async function moveSlide(step) {
  if (switching.value) return
  direction.value = step
  pendingIndex.value = (activeIndex.value + step + cocktailRecipes.length) % cocktailRecipes.length
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    activeIndex.value = pendingIndex.value
    return
  }
  // Совпадает с nav: 54rem — границей мобильной карточки рецепта.
  mobileSlide.value = !window.matchMedia('(min-width: 54rem)').matches
  switching.value = true
  await nextTick()
  if (disposed) return
  if (mobileSlide.value) {
    const previous = slideViewport.value.querySelector('.cocktail-frame-front')
    const next = slideViewport.value.querySelector('.cocktail-frame-static')
    turnAnimations = [
      previous.animate([
        { opacity: 1, transform: 'translateX(0px)' },
        { opacity: 0, transform: `translateX(${step * -24}px)` },
      ], { duration: 180, easing: 'ease', fill: 'forwards' }),
      next.animate([
        { opacity: 0, transform: `translateX(${step * 24}px)` },
        { opacity: 1, transform: 'translateX(0px)' },
      ], { duration: 180, delay: 180, easing: 'ease', fill: 'both' }),
    ]
  } else {
    const leaves = slideViewport.value.querySelectorAll('[data-turning="true"]')
    turnAnimations = Array.from(leaves, leaf => leaf.animate([
      { transform: 'rotateY(0deg)' },
      { transform: `rotateY(${step * -180}deg)` },
    ], { duration: 900, easing: 'cubic-bezier(.42, 0, .22, 1)', fill: 'forwards' }))
    const shades = slideViewport.value.querySelectorAll('.cocktail-turn-shade')
    turnAnimations.push(...Array.from(shades, shade => shade.animate([
      { opacity: 0 }, { opacity: .65, offset: .5 }, { opacity: 0 },
    ], { duration: 900, easing: 'ease-in-out', fill: 'forwards' })))
  }
  await Promise.allSettled(turnAnimations.map(animation => animation.finished))
  if (disposed) return
  activeIndex.value = pendingIndex.value
  switching.value = false
  await nextTick()
  turnAnimations.forEach(animation => animation.cancel())
  turnAnimations = []
}

function startTouch(event) {
  const touch = event.touches[0]
  touchStart = { x: touch.clientX, y: touch.clientY }
}

function finishTouch(event) {
  if (!touchStart) return
  const touch = event.changedTouches[0]
  const dx = touch.clientX - touchStart.x
  const dy = touch.clientY - touchStart.y
  touchStart = null
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) moveSlide(dx < 0 ? 1 : -1)
}
</script>

<template>
  <section
    ref="scene"
    class="relative isolate h-svh overflow-hidden bg-brand pt-20 pb-[7svh] text-surface sm:pt-24 nav:pt-24 nav:pb-6"
    :data-direction="direction > 0 ? 'forward' : 'backward'"
    :data-page-turn="switching && !mobileSlide"
    aria-labelledby="horeca-cocktails-title"
    aria-roledescription="карусель"
    @touchstart.passive="startTouch"
    @touchend.passive="finishTouch"
    @touchcancel="touchStart = null"
  >
    <picture class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <source type="image/avif" :srcset="background.avifSrcset" sizes="100vw">
      <img class="size-full object-cover object-center" :src="background.src" :srcset="background.srcset" sizes="100vw" alt="" decoding="async">
    </picture>
    <div class="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-black/65 via-black/35 to-black/20 nav:from-black/35 nav:via-transparent" aria-hidden="true" />

    <div class="site-container relative flex h-full min-h-0 flex-col">
      <h2 id="horeca-cocktails-title" class="relative z-20 shrink-0 font-display text-h2 break-words hyphens-auto uppercase">Коктейли на основе<br>наших напитков</h2>

      <div
        id="horeca-cocktail-slides"
        ref="slideViewport"
        class="cocktail-viewport relative mt-6 min-h-0 flex-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface nav:mt-8"
        :style="sceneStyle"
        :aria-busy="switching"
        tabindex="0"
        aria-label="Рецепты коктейлей. Листайте стрелками или свайпом"
        @keydown.left.prevent="moveSlide(-1)"
        @keydown.right.prevent="moveSlide(1)"
      >
        <div
          v-for="frame in pageFrames"
          :key="frame.key"
          class="cocktail-frame"
          :class="[`cocktail-frame-${frame.side}`, `cocktail-frame-${frame.face}`]"
          :data-turning="frame.face !== 'static'"
          :inert="switching"
          :aria-hidden="switching ? true : undefined"
          role="group"
          aria-roledescription="слайд"
          :aria-label="`${activeIndex + 1} из ${cocktailRecipes.length}`"
        >
          <div class="cocktail-face">
            <div class="cocktail-page">
              <div v-if="switching && !mobileSlide" class="cocktail-scene pointer-events-none" aria-hidden="true">
                <picture class="absolute inset-0">
                  <source type="image/avif" :srcset="background.avifSrcset" sizes="100vw">
                  <img class="size-full object-cover object-center" :src="background.src" :srcset="background.srcset" sizes="100vw" alt="" decoding="async">
                </picture>
                <div class="absolute inset-0 bg-linear-to-b from-black/65 via-black/35 to-black/20 nav:from-black/35 nav:via-transparent" />
              </div>
              <svg
                class="cocktail-scene pointer-events-none hidden nav:block"
                viewBox="0 0 1672 941"
                preserveAspectRatio="xMidYMid slice"
                role="img"
                :aria-label="frame.recipe.imageAlt"
              >
                <g :transform="foregroundTransform(frame.recipe)">
                  <image
                    :href="frame.recipe.image.src"
                    :x="-frame.recipe.imageFrame.bounds[0]"
                    :y="-frame.recipe.imageFrame.bounds[1]"
                    :width="frame.recipe.imageFrame.width"
                    :height="frame.recipe.imageFrame.height"
                  />
                </g>
              </svg>
              <div class="relative z-10 h-full min-h-0">
                <CocktailRecipeCard :recipe="frame.recipe" @previous="moveSlide(-1)" @next="moveSlide(1)" />
              </div>
            </div>
            <div v-if="frame.face !== 'static' && !mobileSlide" class="cocktail-turn-shade" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div class="relative z-20 mt-6 hidden shrink-0 items-center justify-between gap-4 nav:flex">
        <p class="text-label font-bold" aria-live="polite" aria-atomic="true">{{ activeIndex + 1 }} / {{ cocktailRecipes.length }}<span class="sr-only"> — {{ activeRecipe.name }}</span></p>
        <div class="flex gap-4">
          <button class="group rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface" type="button" aria-label="Предыдущий рецепт" aria-controls="horeca-cocktail-slides" @click="moveSlide(-1)">
            <CircleArrow direction="left" tone="surface" />
          </button>
          <button class="group rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface" type="button" aria-label="Следующий рецепт" aria-controls="horeca-cocktail-slides" @click="moveSlide(1)">
            <CircleArrow tone="surface" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* На десктопе лист во время поворота выходит поверх соседних секций.
   После анимации возвращаем обычные границы блока. */
section[data-page-turn="true"] {
  overflow: visible;
  z-index: 10;
}

.cocktail-viewport {
  perspective: 1800px;
  perspective-origin: center center;
}

.cocktail-frame {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  transform-style: preserve-3d;
}

.cocktail-frame-left { left: 0; transform-origin: right center; }
.cocktail-frame-right { left: 50%; transform-origin: left center; }
.cocktail-frame-full { inset: 0; width: 100%; transform-origin: left center; }
[data-direction="backward"] .cocktail-frame-full { transform-origin: right center; }
.cocktail-frame-front,
.cocktail-frame-back { z-index: 2; pointer-events: none; }

.cocktail-face {
  position: absolute;
  inset: 0;
  overflow: visible;
  /* Режем только по сторонам листа. Верх и низ охватывают всю секцию,
     включая картинку на стойке за пределами текстовой области. */
  clip-path: inset(
    var(--scene-top, -100svh)
    0
    calc(100% + var(--scene-top, 0px) - var(--scene-height, 100svh))
    0
  );
  backface-visibility: hidden;
}

.cocktail-frame-back .cocktail-face { transform: rotateY(180deg); }

.cocktail-page {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--slide-width, 100%);
}

.cocktail-frame-right .cocktail-page { right: 0; }
.cocktail-frame-left .cocktail-page,
.cocktail-frame-full .cocktail-page { left: 0; }
.cocktail-frame-back.cocktail-frame-right .cocktail-page { left: 0; right: auto; }
.cocktail-frame-back.cocktail-frame-left .cocktail-page { left: auto; right: 0; }

/* В покое изображение сохраняет исходные границы всей секции. */
.cocktail-frame-full .cocktail-face { clip-path: none; }

.cocktail-scene {
  position: absolute;
  left: var(--scene-left, 0px);
  top: var(--scene-top, 0px);
  width: var(--scene-width, 100vw);
  height: var(--scene-height, 100svh);
}

.cocktail-turn-shade {
  position: absolute;
  z-index: 20;
  top: var(--scene-top, 0px);
  left: 0;
  right: 0;
  height: var(--scene-height, 100%);
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(90deg, rgb(0 0 0 / 60%), transparent);
}

[data-direction="backward"] .cocktail-turn-shade {
  background: linear-gradient(270deg, rgb(0 0 0 / 60%), transparent);
}
</style>
