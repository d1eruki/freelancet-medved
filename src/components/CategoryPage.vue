<script setup>
import { onMounted } from 'vue'
import CategoryHero from './CategoryHero.vue'
import FlavorCard from './FlavorCard.vue'
import SectionLink from './SectionLink.vue'
import { sitePath } from '../utils/site-path'

const props = defineProps({
  category: { type: Object, required: true },
})

onMounted(() => {
  document.title = `${props.category.name} «МЁДВЕДЬ» — ассортимент`
  document.querySelector('meta[name="description"]')?.setAttribute('content', props.category.description)
})
</script>

<template>
  <div>
    <CategoryHero :category="category" />

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" :aria-labelledby="`${category.slug}-range-title`">
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

        <ul class="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 nav:grid-cols-3">
          <FlavorCard v-for="item in category.items" :key="item.name" :item="item" />
        </ul>
      </div>
    </section>

    <SectionLink
      :heading-id="`${category.slug}-contact-title`"
      title="Обсудим поставку"
      description="По вопросам оптовых заказов и сотрудничества обращайтесь в отдел продаж."
      :href="sitePath('/kontakty/')"
      label="Контакты"
      :background="'foreground'"
    />
  </div>
</template>
