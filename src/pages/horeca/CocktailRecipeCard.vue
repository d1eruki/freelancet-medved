<script setup>
import { computed, ref } from 'vue'
import CircleArrow from '../../components/CircleArrow.vue'

const props = defineProps({
  recipe: { type: Object, required: true },
})
const emit = defineEmits(['previous', 'next'])

const activeTab = ref('description')
const tabs = computed(() => [
  { id: 'description', label: 'Описание', text: props.recipe.description },
  { id: 'ingredients', label: 'Ингредиенты', text: props.recipe.ingredients.join('; ') },
  { id: 'preparation', label: 'Приготовление', text: props.recipe.preparation },
  { id: 'serving', label: 'Подача', text: props.recipe.serving },
  ...(props.recipe.barBenefit ? [{ id: 'benefit', label: 'Для бара', text: props.recipe.barBenefit }] : []),
])
const selectedTab = computed(() => tabs.value.find(tab => tab.id === activeTab.value) ?? tabs.value[0])
const mobileForegroundTransform = computed(() => {
  const [, , width, height] = props.recipe.imageFrame.bounds
  const scale = Math.min(650 / width, 540 / height)
  return `translate(${450 - width * scale / 2} ${600 - height * scale}) scale(${scale})`
})

function moveTab(event, step) {
  const index = tabs.value.findIndex(tab => tab.id === selectedTab.value.id)
  const nextIndex = (index + step + tabs.value.length) % tabs.value.length
  activeTab.value = tabs.value[nextIndex].id
  event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[nextIndex].focus()
}
</script>

<template>
  <article class="grid h-full min-h-0 min-w-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-4 nav:grid-cols-2 nav:grid-rows-none nav:content-start nav:gap-6 nav:gap-x-12" :aria-labelledby="`${recipe.id}-title`">
    <div class="min-w-0 nav:col-start-2">
      <h3 :id="`${recipe.id}-title`" class="font-display text-h3 break-words uppercase">{{ recipe.name }}</h3>
      <p class="mt-3 text-label font-bold">{{ recipe.englishName }} · {{ recipe.base }}</p>
    </div>

    <div class="nav:hidden">
      <div class="flex flex-wrap gap-3" role="tablist" aria-label="Разделы рецепта">
        <button
          v-for="tab in tabs"
          :id="`${recipe.id}-tab-${tab.id}`"
          :key="tab.id"
          class="min-h-11 rounded-full px-3 py-2 text-label font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface"
          :class="selectedTab.id === tab.id ? 'bg-surface text-brand' : 'bg-surface/10 text-surface'"
          type="button"
          role="tab"
          :aria-selected="selectedTab.id === tab.id"
          :aria-controls="`${recipe.id}-mobile-panel`"
          :tabindex="selectedTab.id === tab.id ? 0 : -1"
          @click="activeTab = tab.id"
          @keydown.right.stop.prevent="moveTab($event, 1)"
          @keydown.left.stop.prevent="moveTab($event, -1)"
        >{{ tab.label }}</button>
      </div>
      <div
        :id="`${recipe.id}-mobile-panel`"
        class="mt-4 text-body font-medium"
        role="tabpanel"
        :aria-labelledby="`${recipe.id}-tab-${selectedTab.id}`"
        tabindex="0"
      >
        <p>{{ selectedTab.text }}</p>
      </div>
    </div>

    <div class="hidden min-w-0 nav:col-start-2 nav:block">
      <p class="text-body font-medium">{{ recipe.description }}</p>

      <div class="mt-10 grid gap-10 text-body font-medium sm:grid-cols-2">
        <div class="grid content-start gap-10">
          <section>
            <h4 class="font-display text-h4 uppercase">Ингредиенты</h4>
            <p class="mt-6">{{ recipe.ingredients.join('; ') }}</p>
          </section>
          <section v-if="recipe.barBenefit">
            <h4 class="font-display text-h4 uppercase">Плюс для бара</h4>
            <p class="mt-6">{{ recipe.barBenefit }}</p>
          </section>
        </div>
        <div class="grid content-start gap-10">
          <section>
            <h4 class="font-display text-h4 uppercase">Приготовление</h4>
            <p class="mt-6">{{ recipe.preparation }}</p>
          </section>
          <section>
            <h4 class="font-display text-h4 uppercase">Подача</h4>
            <p class="mt-6">{{ recipe.serving }}</p>
          </section>
        </div>
      </div>
    </div>

    <div class="relative flex min-h-0 items-end nav:hidden">
      <div class="relative h-full max-h-full w-full" style="height: min(100%, calc((100vw - 2rem) * 0.666667))">
      <svg class="pointer-events-none size-full" viewBox="0 0 900 600" preserveAspectRatio="xMidYMax meet" role="img" :aria-label="recipe.imageAlt">
        <g :transform="mobileForegroundTransform">
          <image
            :href="recipe.image.src"
            :x="-recipe.imageFrame.bounds[0]"
            :y="-recipe.imageFrame.bounds[1]"
            :width="recipe.imageFrame.width"
            :height="recipe.imageFrame.height"
          />
        </g>
      </svg>
      <button class="group absolute top-1/2 left-0 -translate-y-1/2 rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface" type="button" aria-label="Предыдущий рецепт" aria-controls="horeca-cocktail-slides" @click="emit('previous')">
        <CircleArrow direction="left" tone="surface" />
      </button>
      <button class="group absolute top-1/2 right-0 -translate-y-1/2 rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface" type="button" aria-label="Следующий рецепт" aria-controls="horeca-cocktail-slides" @click="emit('next')">
        <CircleArrow tone="surface" />
      </button>
      </div>
    </div>
  </article>
</template>
