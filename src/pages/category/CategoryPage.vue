<script setup>
import DrinkCategoryHero from './DrinkCategoryHero.vue'
import CatalogAssortment from '../catalog/catalog-assortment.vue'
import SupplySection from '../../components/supply-section.vue'

defineProps({
  category: { type: Object, required: true },
  lenis: { type: Object, default: null },
  catalogReady: { type: Boolean, default: false },
})
</script>

<template>
  <div>
    <DrinkCategoryHero :category="category" />

    <CatalogAssortment :initial-category="category.slug" :lenis="lenis" :ready="catalogReady" />

    <SupplySection :heading-id="`${category.slug}-contact-title`" />
  </div>
</template>
