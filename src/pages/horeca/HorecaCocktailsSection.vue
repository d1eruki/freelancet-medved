<script setup>
import { computed, ref } from 'vue'
import background from '../../assets/horeca/cocktails/cocktails-background.png?responsive'
import CircleArrow from '../../components/CircleArrow.vue'
import CocktailRecipeCard from './CocktailRecipeCard.vue'
import { cocktailRecipes } from '../../data/cocktail-recipes.js'

const activeIndex = ref(0)
const activeRecipe = computed(() => cocktailRecipes[activeIndex.value])
const switching = ref(false)
const direction = ref(1)
let touchStart = null

// Координаты общей стойки на исходном фоне 1672 × 941.
// Учитываем видимые границы PNG, чтобы прозрачные поля не смещали опору.
const foregroundTransform = computed(() => {
  const [, , width, height] = activeRecipe.value.imageFrame.bounds
  const scale = Math.min(650 / width, 470 / height) * 1.15
  return `translate(${430 - width * scale / 2} ${875 - height * scale}) scale(${scale})`
})

function moveSlide(step) {
  if (switching.value) return
  direction.value = step
  switching.value = true
  activeIndex.value = (activeIndex.value + step + cocktailRecipes.length) % cocktailRecipes.length
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
    class="relative isolate h-svh overflow-hidden bg-brand pt-20 pb-[7svh] text-surface sm:pt-24 nav:pt-24 nav:pb-6"
    :style="{ '--slide-enter-x': `${direction * 24}px`, '--slide-leave-x': `${direction * -24}px` }"
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

    <Transition name="cocktail-slide" mode="out-in">
      <svg
        :key="activeRecipe.id"
        class="pointer-events-none absolute inset-0 -z-10 hidden size-full nav:block"
        viewBox="0 0 1672 941"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        :aria-label="activeRecipe.imageAlt"
      >
        <g :transform="foregroundTransform">
          <image
            :href="activeRecipe.image.src"
            :x="-activeRecipe.imageFrame.bounds[0]"
            :y="-activeRecipe.imageFrame.bounds[1]"
            :width="activeRecipe.imageFrame.width"
            :height="activeRecipe.imageFrame.height"
          />
        </g>
      </svg>
    </Transition>

    <div class="site-container relative flex h-full min-h-0 flex-col">
      <h2 id="horeca-cocktails-title" class="shrink-0 font-display text-h2 break-words hyphens-auto uppercase">Коктейли на основе<br>наших напитков</h2>

      <div
        id="horeca-cocktail-slides"
        class="mt-6 min-h-0 flex-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface nav:mt-8"
        tabindex="0"
        aria-label="Рецепты коктейлей. Листайте стрелками или свайпом"
        @keydown.left.prevent="moveSlide(-1)"
        @keydown.right.prevent="moveSlide(1)"
      >
        <Transition name="cocktail-slide" mode="out-in" @after-enter="switching = false">
          <div :key="activeRecipe.id" class="h-full min-h-0" role="group" aria-roledescription="слайд" :aria-label="`${activeIndex + 1} из ${cocktailRecipes.length}`">
            <CocktailRecipeCard :recipe="activeRecipe" @previous="moveSlide(-1)" @next="moveSlide(1)" />
          </div>
        </Transition>
      </div>

      <div class="mt-6 hidden shrink-0 items-center justify-between gap-4 nav:flex">
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
.cocktail-slide-enter-active,
.cocktail-slide-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.cocktail-slide-enter-from {
  opacity: 0;
  transform: translateX(var(--slide-enter-x));
}

.cocktail-slide-leave-to {
  opacity: 0;
  transform: translateX(var(--slide-leave-x));
}

@media (prefers-reduced-motion: reduce) {
  .cocktail-slide-enter-active,
  .cocktail-slide-leave-active {
    transition-duration: 1ms;
  }

  .cocktail-slide-enter-from,
  .cocktail-slide-leave-to {
    transform: none;
  }
}
</style>
