<script setup>
defineProps({
  award: { type: Object, required: true },
  wide: { type: Boolean, default: false },
})
</script>

<template>
  <li class="group overflow-hidden rounded-3xl bg-surface text-foreground nav:col-span-4" :class="{ 'nav:col-span-6': wide }">
    <a class="block h-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface" :href="award.image" target="_blank" rel="noopener">
      <figure class="flex h-full min-h-120 flex-col">
        <div class="h-72 overflow-hidden bg-panel p-5 sm:h-80 sm:p-7">
          <img
            class="size-full object-contain transition duration-500 group-hover:scale-105"
            :src="award.image"
            :alt="`Диплом: ${award.title}, ${award.year} год`"
            loading="lazy"
          >
        </div>
        <figcaption class="flex flex-1 flex-wrap items-start justify-between gap-6 p-6 sm:p-8">
          <span>
            <span class="block font-display text-h4 text-brand uppercase">{{ award.title }}</span>
            <span class="mt-4 block text-body font-medium text-subtle">{{ award.text }}</span>
          </span>
          <span class="font-display text-h4 text-brand">{{ award.year }}</span>
        </figcaption>
      </figure>
    </a>
  </li>
</template>
