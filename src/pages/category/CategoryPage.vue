<script setup>
import DrinkCategoryHero from './DrinkCategoryHero.vue'
import FlavorCard from './FlavorCard.vue'
import FlavorCardSlider from './flavor-card-slider.vue'
import SupplySection from '../../components/supply-section.vue'

defineProps({
  category: { type: Object, required: true },
  lenis: { type: Object, default: null },
})
</script>

<template>
  <div>
    <DrinkCategoryHero :category="category" />

    <section class="section-decorated bg-panel py-20 text-foreground max-sm:overflow-clip sm:py-24 wide:py-28" :aria-labelledby="`${category.slug}-range-title`">
      <div class="site-container">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 :id="`${category.slug}-range-title`" class="font-display text-h2 break-words hyphens-auto uppercase">Ассортимент</h2>
            <p class="mt-6 text-body font-medium text-subtle">
              <span class="font-extrabold text-brand uppercase">{{ category.items.length }} {{ category.items.length === 1 ? 'вкус' : category.items.length < 5 ? 'вкуса' : 'вкусов' }}</span>
              · крепость 4,9%
            </p>
          </div>
        </div>

        <FlavorCardSlider :key="category.slug" class="mt-12 sm:hidden" :items="category.items" :lenis="lenis" />

        <ul class="mt-12 hidden gap-4 sm:mt-16 sm:grid sm:max-nav:grid-cols-2 site-grid">
          <FlavorCard v-for="item in category.items" :key="item.name" class="nav:col-span-4" :item="item" />
        </ul>
      </div>
    </section>

    <SupplySection :heading-id="`${category.slug}-contact-title`" />
  </div>
</template>
