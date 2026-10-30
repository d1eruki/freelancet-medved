<!-- Карточка коктейля с ингредиентами, приготовлением и подачей. -->
<script setup>
import SiteImage from '../../components/site-image.vue'
import CircleArrow from '../../components/CircleArrow.vue'
import { computed, ref } from 'vue'

const props = defineProps({
  recipe: { type: Object, required: true },
})
const emit = defineEmits(['previous', 'next'])

const activeTab = ref('description')
let tabDrag = null
let suppressTabClick = false
const tabs = computed(() => [
  { id: 'description', label: 'Описание', text: props.recipe.description },
  { id: 'ingredients', label: 'Ингредиенты', text: props.recipe.ingredients.join('; ') },
  { id: 'preparation', label: 'Приготовление', text: props.recipe.preparation },
  { id: 'serving', label: 'Подача', text: props.recipe.serving },
  ...(props.recipe.barBenefit ? [{ id: 'benefit', label: 'Для бара', text: props.recipe.barBenefit }] : []),
])
const selectedTab = computed(() => tabs.value.find(tab => tab.id === activeTab.value) ?? tabs.value[0])

function selectTab(id, button) {
  activeTab.value = id
  const list = button.parentElement
  const buttonBounds = button.getBoundingClientRect()
  const listBounds = list.getBoundingClientRect()
  const offset = buttonBounds.left < listBounds.left
    ? buttonBounds.left - listBounds.left
    : Math.max(0, buttonBounds.right - listBounds.right)
  list.scrollTo({ left: list.scrollLeft + offset, behavior: 'instant' })
}

function moveTab(event, step) {
  const index = tabs.value.findIndex(tab => tab.id === selectedTab.value.id)
  const nextIndex = (index + step + tabs.value.length) % tabs.value.length
  const button = event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[nextIndex]
  selectTab(tabs.value[nextIndex].id, button)
  button.focus({ preventScroll: true })
}

function startTabDrag(event) {
  if (event.pointerType !== 'mouse' || event.button !== 0) return
  suppressTabClick = false
  tabDrag = { id: event.pointerId, x: event.clientX, scrollLeft: event.currentTarget.scrollLeft }
}

function dragTabs(event) {
  if (!tabDrag || tabDrag.id !== event.pointerId) return
  const distance = event.clientX - tabDrag.x
  if (!suppressTabClick && Math.abs(distance) < 5) return
  suppressTabClick = true
  event.currentTarget.setPointerCapture(event.pointerId)
  event.currentTarget.scrollLeft = tabDrag.scrollLeft - distance
  event.preventDefault()
}

function finishTabDrag(event) {
  if (!tabDrag || tabDrag.id !== event.pointerId) return
  tabDrag = null
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
}

function preventTabDragClick(event) {
  if (!suppressTabClick) return
  suppressTabClick = false
  event.preventDefault()
  event.stopPropagation()
}
</script>

<template>
  <article class="grid min-w-0 gap-10 nav:grid-cols-2 nav:grid-rows-[auto_1fr] nav:content-start nav:gap-y-6 nav:gap-x-10 wide:gap-x-16" :aria-labelledby="`${recipe.id}-title`">
    <SiteImage
      class="hidden h-full min-h-160 w-full rounded-3xl object-cover nav:col-start-1 nav:row-start-1 nav:row-span-2 nav:block"
      media="(width >= 54rem)"
      :src="recipe.image.src"
      :srcset="recipe.image.srcset"
      sizes="calc((min(100vw, 1480px) - 112px) / 2)"
      :alt="recipe.imageAlt"
      width="2400" height="1792"
    />
    <div class="min-w-0 nav:col-start-2 nav:row-start-1">
      <h3 :id="`${recipe.id}-title`" class="font-display text-h3 break-words uppercase">{{ recipe.name }}</h3>
    </div>

    <div class="relative nav:hidden">
      <SiteImage
        class="block h-auto w-full"
        media="(width < 54rem)"
        :src="recipe.image.src"
        :srcset="recipe.image.srcset"
        sizes="(min-width: 40rem) calc(100vw - 48px), calc(100vw - 32px)"
        :alt="recipe.imageAlt"
        width="2400" height="1792"
      />
      <button class="absolute top-1/2 left-0 -translate-y-1/2 rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand" type="button" aria-label="Предыдущий рецепт" aria-controls="horeca-cocktail-slides" @click="emit('previous')">
        <CircleArrow direction="left" />
      </button>
      <button class="absolute top-1/2 right-0 -translate-y-1/2 rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand" type="button" aria-label="Следующий рецепт" aria-controls="horeca-cocktail-slides" @click="emit('next')">
        <CircleArrow />
      </button>
    </div>

    <div class="flex min-w-0 flex-col nav:hidden">
      <div
        class="-mx-6 flex shrink-0 gap-3 overflow-x-auto overscroll-x-contain px-6 py-1 select-none"
        role="tablist"
        aria-label="Разделы рецепта"
        @touchstart.stop
        @touchend.stop
        @pointerdown="startTabDrag"
        @pointermove="dragTabs"
        @pointerup="finishTabDrag"
        @pointercancel="finishTabDrag"
        @lostpointercapture="finishTabDrag"
        @click.capture="preventTabDragClick"
      >
        <button
          v-for="tab in tabs"
          :id="`${recipe.id}-tab-${tab.id}`"
          :key="tab.id"
          class="min-h-11 shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-label font-bold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
          :class="selectedTab.id === tab.id ? 'bg-brand text-surface' : 'bg-brand/10 text-brand'"
          type="button"
          role="tab"
          :aria-selected="selectedTab.id === tab.id"
          :aria-controls="`${recipe.id}-mobile-panel`"
          :tabindex="selectedTab.id === tab.id ? 0 : -1"
          @click="selectTab(tab.id, $event.currentTarget)"
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

    <div class="hidden min-w-0 nav:col-start-2 nav:row-start-2 nav:block">
      <p class="text-body font-medium">{{ recipe.description }}</p>

      <div class="mt-10 grid gap-10 text-body font-medium">
        <div class="grid content-start gap-10">
          <section>
            <h4 class="font-display text-h4 uppercase">Ингредиенты</h4>
            <ul class="mt-6 space-y-3">
              <li v-for="ingredient in recipe.ingredients" :key="ingredient">{{ ingredient }}</li>
            </ul>
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
  </article>
</template>
