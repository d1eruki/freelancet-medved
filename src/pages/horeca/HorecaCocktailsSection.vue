<!-- Фотографический слайдер рецептов коктейлей с ингредиентами и приготовлением. -->
<script setup>
import SiteImage from '../../components/site-image.vue'
import { computed, ref } from 'vue'
import CircleArrow from '../../components/CircleArrow.vue'
import CocktailRecipeCard from './CocktailRecipeCard.vue'
import { cocktailRecipes } from '../../data/cocktail-recipes.js'
import orchardSpritz from '../../assets/horeca/cocktails/orchard-spritz.jpg?responsive'
import wildHoneySour from '../../assets/horeca/cocktails/wild-honey-sour.jpg?responsive'
import poireBlanc from '../../assets/horeca/cocktails/poire-blanc.jpg?responsive'
import spicedSpb from '../../assets/horeca/cocktails/spiced-spb.jpg?responsive'

const photos = {
  'orchard-spritz': orchardSpritz,
  'wild-honey-sour': wildHoneySour,
  'poire-blanc': poireBlanc,
  'spiced-spb': spicedSpb,
}
const activeIndex = ref(0)
const activeRecipe = computed(() => ({
  ...cocktailRecipes[activeIndex.value],
  image: photos[cocktailRecipes[activeIndex.value].id],
  imageFrame: { width: 2400, height: 1792, bounds: [0, 0, 2400, 1792] },
}))
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
        <div class="flex gap-4" aria-label="Выбор рецепта">
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
        class="mt-12 h-[calc(100svh-12rem)] min-h-160 sm:mt-16 nav:grid nav:h-auto nav:grid-cols-2 nav:items-start nav:gap-y-10"
        @touchstart.passive="startSwipe"
        @touchend.passive="endSwipe"
        @touchcancel="touchStart = undefined"
      >
        <SiteImage
          class="hidden h-full min-h-160 w-full rounded-3xl object-cover nav:col-start-1 nav:row-start-1 nav:row-span-2 nav:block"
          media="(width >= 54rem)"
          :src="activeRecipe.image.src"
          :srcset="activeRecipe.image.srcset"
          sizes="calc((min(100vw, 1480px) - 48px) / 2)"
          :alt="activeRecipe.imageAlt"
          width="2400" height="1792"
        />
        <CocktailRecipeCard
          :key="activeRecipe.id"
          class="nav:contents"
          :recipe="activeRecipe"
          @previous="moveSlide(-1)"
          @next="moveSlide(1)"
        />
      </div>
      <p class="sr-only" aria-live="polite">Выбран рецепт: {{ activeRecipe.name }}</p>
    </div>
  </section>
</template>
