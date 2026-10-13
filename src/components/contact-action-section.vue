<script setup>
import ActionTile from './ActionTile.vue'

defineProps({
  titleId: { type: String, required: true },
  title: { type: String, required: true },
  href: { type: String, required: true },
  actionLabel: { type: String, required: true },
  actionTitle: { type: String, required: true },
})
</script>

<template>
  <section class="bg-foreground py-20 text-surface sm:py-24 wide:py-28" :aria-labelledby="titleId">
    <div class="site-container">
      <h2 :id="titleId" class="font-display text-h2 break-words hyphens-auto uppercase">{{ title }}</h2>
      <div class="mt-12 grid gap-10 sm:mt-16 site-grid nav:gap-6">
        <div class="grid content-start gap-6 text-body-large font-medium text-surface/85 nav:col-span-5">
          <slot />
        </div>
        <ActionTile
          class="nav:col-span-7"
          :href="href"
          :label="actionLabel"
          :title="actionTitle"
          compact
        />
      </div>
    </div>
  </section>
</template>
