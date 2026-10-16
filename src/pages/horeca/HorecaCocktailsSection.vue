<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import bookCover from '../../assets/horeca/cocktails/cocktails-book-cover.png?responsive'
import bookPages from '../../assets/horeca/cocktails/cocktails-book-pages-ink.png?responsive'
import plainBookPages from '../../assets/horeca/cocktails/cocktails-book-pages.png?responsive'
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
  if (!switching.value) return [{ key: 'full', side: 'full', face: 'static', recipe: activeRecipe.value, pageNumber: activeIndex.value + 1 }]
  const next = cocktailRecipes[pendingIndex.value]
  const forward = direction.value > 0
  const frames = mobileSlide.value ? [
    { key: 'stationary', side: 'full', face: 'static', recipe: forward ? activeRecipe.value : next },
    { key: 'front', side: 'full', face: 'front', recipe: forward ? next : activeRecipe.value },
    { key: 'back', side: 'full', face: 'back', recipe: forward ? next : activeRecipe.value },
  ] : [
    { key: 'stationary-old', side: forward ? 'left' : 'right', face: 'static', recipe: activeRecipe.value },
    { key: 'stationary-next', side: forward ? 'right' : 'left', face: 'static', recipe: next },
    { key: 'front', side: forward ? 'right' : 'left', face: 'front', recipe: activeRecipe.value },
    { key: 'back', side: forward ? 'right' : 'left', face: 'back', recipe: next },
  ]
  return frames.map(frame => ({
    ...frame,
    pageNumber: (frame.recipe === next ? pendingIndex.value : activeIndex.value) + 1,
    recipe: { ...frame.recipe, id: `${frame.recipe.id}-${frame.key}` },
  }))
})
const slideViewport = ref(null)
let touchStart = null

onBeforeUnmount(() => {
  disposed = true
  turnAnimations.forEach(animation => animation.cancel())
})

// Сохраняем композицию иллюстраций на листе 1672 × 941.
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
  const leaves = slideViewport.value.querySelectorAll('[data-turning="true"]')
  if (mobileSlide.value) {
    // Входящий лист справа падает на открытую левую страницу.
    // Назад поднимаем текущий лист, открывая предыдущий под ним.
    turnAnimations = Array.from(leaves, leaf => leaf.animate([
      { transform: `rotateY(${step > 0 ? 180 : 0}deg)` },
      { transform: `rotateY(${step > 0 ? 0 : 180}deg)` },
    ], { duration: 800, easing: 'cubic-bezier(.32, .05, .2, 1)', fill: 'both' }))
  } else {
    turnAnimations = Array.from(leaves, leaf => leaf.animate([
      { transform: 'rotateY(0deg)' },
      { transform: `rotateY(${step * -180}deg)` },
    ], { duration: 900, easing: 'cubic-bezier(.42, 0, .22, 1)', fill: 'forwards' }))
  }
  const shades = slideViewport.value.querySelectorAll('.cocktail-turn-shade')
  turnAnimations.push(...Array.from(shades, shade => shade.animate([
    { opacity: 0 }, { opacity: .65, offset: .5 }, { opacity: 0 },
  ], {
    duration: mobileSlide.value ? 800 : 900,
    easing: mobileSlide.value ? 'cubic-bezier(.32, .05, .2, 1)' : 'ease-in-out',
    fill: 'forwards',
  })))
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
    class="cocktail-book relative isolate mx-auto h-svh w-full max-w-[1680px] overflow-hidden text-[#49382c]"
    :data-direction="direction > 0 ? 'forward' : 'backward'"
    :data-page-turn="switching && !mobileSlide"
    :data-mobile-turn="switching && mobileSlide"
    aria-label="Наш вкус — ваш коктейль"
    aria-roledescription="карусель"
    @touchstart.passive="startTouch"
    @touchend.passive="finishTouch"
    @touchcancel="touchStart = null"
  >
    <picture class="cocktail-binding pointer-events-none absolute overflow-hidden" aria-hidden="true">
      <img class="h-full w-[200%] max-w-none nav:w-full" :src="bookCover.src" :srcset="bookCover.srcset" sizes="(min-width: 54rem) 100vw, 200vw" alt="" decoding="async">
    </picture>

      <div
        id="horeca-cocktail-slides"
        ref="slideViewport"
        class="cocktail-viewport absolute inset-0 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
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
          :aria-label="`${frame.pageNumber} из ${cocktailRecipes.length}`"
        >
          <div class="cocktail-face">
            <div class="cocktail-page">
              <picture class="cocktail-paper pointer-events-none absolute overflow-hidden" aria-hidden="true">
                <source media="(min-width: 54rem)" :srcset="bookPages.srcset" sizes="100vw">
                <img class="h-full w-[200%] max-w-none nav:w-full" :src="plainBookPages.src" :srcset="plainBookPages.srcset" sizes="200vw" alt="" decoding="async">
              </picture>
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
              <div class="site-container relative z-10 flex h-full min-h-0 flex-col pt-12 pb-[7svh] sm:pt-16 nav:pt-24 nav:pb-6">
                <div class="relative z-20 shrink-0">
                  <h2 :id="switching ? `horeca-cocktails-title-${frame.key}` : 'horeca-cocktails-title'" class="font-display text-h2 break-words hyphens-auto uppercase">Наш вкус —<br>ваш коктейль</h2>
                </div>
                <div class="cocktail-recipe-area relative mt-6 min-h-0 flex-1 nav:absolute nav:inset-0 nav:mt-0 nav:px-6 nav:pt-24 nav:pb-24">
                  <CocktailRecipeCard :recipe="frame.recipe" @previous="moveSlide(-1)" @next="moveSlide(1)" />
                </div>
                <p class="pointer-events-none relative z-10 mt-6 hidden h-12 shrink-0 items-center text-label font-bold nav:mt-auto nav:flex" aria-hidden="true">{{ frame.pageNumber }} / {{ cocktailRecipes.length }}</p>
              </div>
            </div>
            <div v-if="frame.face !== 'static'" class="cocktail-turn-shade" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div class="cocktail-controls site-container pointer-events-none absolute inset-0 z-20 hidden items-end justify-end pb-10 nav:flex">
        <p class="sr-only" aria-live="polite" aria-atomic="true">{{ activeIndex + 1 }} / {{ cocktailRecipes.length }} — {{ activeRecipe.name }}</p>
        <div class="pointer-events-auto flex gap-4">
          <button class="group rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand" type="button" aria-label="Предыдущий рецепт" aria-controls="horeca-cocktail-slides" @click="moveSlide(-1)">
            <CircleArrow direction="left" tone="brand" />
          </button>
          <button class="group rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand" type="button" aria-label="Следующий рецепт" aria-controls="horeca-cocktail-slides" @click="moveSlide(1)">
            <CircleArrow tone="brand" />
          </button>
        </div>
      </div>
  </section>
</template>

<style scoped>
.cocktail-book {
  --book-edge: 12px;
  --book-inset: 0px;
  z-index: 2;
}

.cocktail-binding,
.cocktail-viewport,
.cocktail-controls {
  inset: var(--book-inset);
}

.cocktail-controls {
  width: calc(100% - 2 * var(--book-inset));
}

/* Лист во время поворота выходит поверх соседних секций.
   После анимации возвращаем обычные границы блока. */
section[data-page-turn="true"],
section[data-mobile-turn="true"] {
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
[data-mobile-turn="true"] .cocktail-frame-full { transform-origin: right center; }
[data-mobile-turn="true"][data-direction="forward"] [data-turning="true"] {
  transform: rotateY(180deg);
}
.cocktail-frame-front,
.cocktail-frame-back { z-index: 2; pointer-events: none; }

.cocktail-face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  backface-visibility: hidden;
}

.cocktail-frame-back .cocktail-face { transform: rotateY(180deg); }

.cocktail-page {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 200%;
}

.cocktail-paper {
  /* Внутренние границы бумаги на изображении обложки:
     торцы занимают около 3% ширины, верх и низ — около 2% высоты. */
  inset: 2% 0 2.4% 6%;
}

.cocktail-page > .site-container {
  /* Поля текста отсчитываются от бумаги, а не от края экрана. */
  padding-left: calc(6% + 24px);
  padding-right: 24px;
  padding-bottom: calc(var(--book-edge) + 16px);
}

@media (min-width: 54rem) {
  .cocktail-book {
    --book-edge: 24px;
    --book-inset: 24px;
  }

  .cocktail-paper { inset: 2% 3% 2.4%; }

  .cocktail-page > .site-container {
    padding-inline: max(24px, calc(var(--book-edge) + 16px));
  }

  .cocktail-recipe-area,
  .cocktail-controls {
    padding-inline: max(24px, calc(var(--book-edge) + 16px));
  }
}

.cocktail-frame-right .cocktail-page { right: 0; }
.cocktail-frame-left .cocktail-page,
.cocktail-frame-full .cocktail-page { left: 0; }
.cocktail-frame-back.cocktail-frame-right .cocktail-page { left: 0; right: auto; }
.cocktail-frame-back.cocktail-frame-left .cocktail-page { left: auto; right: 0; }

.cocktail-frame-full .cocktail-page { width: 100%; }

.cocktail-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.cocktail-turn-shade {
  position: absolute;
  z-index: 20;
  inset: 2% 0 2.4%;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(90deg, rgb(0 0 0 / 60%), transparent);
}

/* 3% ширины разворота = 6% половины листа; у сгиба отступа нет.
   На обороте внешний край меняется местами. */
.cocktail-frame-left .cocktail-turn-shade,
.cocktail-frame-back.cocktail-frame-right .cocktail-turn-shade {
  left: 6%;
  right: 0;
}

.cocktail-frame-right .cocktail-turn-shade,
.cocktail-frame-back.cocktail-frame-left .cocktail-turn-shade {
  left: 0;
  right: 6%;
}

.cocktail-frame-full .cocktail-turn-shade {
  left: 6%;
  right: 0;
}

[data-direction="backward"] .cocktail-turn-shade {
  background: linear-gradient(270deg, rgb(0 0 0 / 60%), transparent);
}

/* На мобильном сгиб всегда справа. Мягкое затемнение следует за углом
   поворота; на обороте направление градиента зеркальное. */
[data-mobile-turn="true"] .cocktail-turn-shade {
  background: linear-gradient(270deg, rgb(73 56 44 / 18%), rgb(73 56 44 / 6%) 20%, transparent 55%);
}

[data-mobile-turn="true"] .cocktail-frame-back .cocktail-turn-shade {
  background: linear-gradient(90deg, rgb(73 56 44 / 18%), rgb(73 56 44 / 6%) 20%, transparent 55%);
}
</style>
