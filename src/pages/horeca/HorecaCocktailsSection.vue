<!-- Фотографический слайдер рецептов коктейлей с ингредиентами и приготовлением. -->
<script setup>
import { computed, ref } from 'vue'
import CircleArrow from '../../components/CircleArrow.vue'
import CocktailRecipeCard from './CocktailRecipeCard.vue'
import { cocktailRecipes } from '../../data/cocktail-recipes.js'

const activeIndex = ref(0)
const activeRecipe = computed(() => cocktailRecipes[activeIndex.value])
let touchStart

function moveSlide(step) {
  activeIndex.value = (activeIndex.value + step + cocktailRecipes.length) % cocktailRecipes.length
}

function startSwipe(event) {
  if (event.target.closest('[role="tablist"]')) return
  const touch = event.touches[0]
  touchStart = { x: touch.clientX, y: touch.clientY }
}

function endSwipe(event) {
  if (!touchStart) return
  const touch = event.changedTouches[0]
  const x = touch.clientX - touchStart.x
  const y = touch.clientY - touchStart.y
  touchStart = undefined
  if (Math.abs(x) > 48 && Math.abs(x) > Math.abs(y) * 1.4) moveSlide(x < 0 ? 1 : -1)
}
</script>

<template>
  <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" aria-labelledby="horeca-cocktails-title">
    <div class="site-container">
      <div class="flex flex-wrap items-end justify-between gap-10">
        <div>
          <h2 id="horeca-cocktails-title" class="font-display text-h2 uppercase">Коктейли<br>для вашей карты</h2>
          <p class="mt-6 max-w-2xl text-body-large text-subtle">Рецепты на основе медовухи, сидра и пуаре.</p>
        </div>
        <div class="hidden gap-4 nav:flex" aria-label="Выбор рецепта">
          <button class="rounded-full focus-visible:outline-4 focus-visible:outline-brand" type="button" aria-label="Предыдущий рецепт" aria-controls="horeca-cocktail-slides" @click="moveSlide(-1)">
            <CircleArrow direction="left" tone="brand" />
          </button>
          <button class="rounded-full focus-visible:outline-4 focus-visible:outline-brand" type="button" aria-label="Следующий рецепт" aria-controls="horeca-cocktail-slides" @click="moveSlide(1)">
            <CircleArrow tone="brand" />
          </button>
        </div>
      </div>
      <div
        id="horeca-cocktail-slides"
        class="mt-12 sm:mt-16"
        @touchstart.passive="startSwipe"
        @touchend.passive="endSwipe"
        @touchcancel="touchStart = undefined"
      >
        <CocktailRecipeCard
          :key="activeRecipe.id"
          :recipe="activeRecipe"
          @previous="moveSlide(-1)"
          @next="moveSlide(1)"
        />
      </div>
      <p class="sr-only" aria-live="polite">Выбран рецепт: {{ activeRecipe.name }}</p>
    </div>
  </section>
</template>
