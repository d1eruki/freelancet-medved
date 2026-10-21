<!-- Карточка награды со ссылкой на изображение диплома. -->
<script setup>
defineProps({
  award: { type: Object, required: true },
})
</script>

<template>
  <li class="group w-[78vw] max-w-96 shrink-0 snap-start text-foreground sm:w-80 nav:w-96">
    <a class="block h-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand" :href="award.image" target="_blank" rel="noopener">
      <figure class="flex h-full flex-col gap-6">
        <div class="h-80 sm:h-96">
          <img
            class="size-full object-contain transition duration-500 group-hover:scale-105"
            :src="award.image"
            :alt="`Диплом: ${award.title}, ${award.year} год`"
            loading="lazy"
          >
        </div>
        <figcaption class="flex flex-col gap-6">
          <span class="block font-display text-h5 text-brand uppercase">{{ award.title }}</span>
          <span class="flex items-baseline gap-4 text-body font-medium text-subtle">
            <span class="shrink-0 text-label text-brand">{{ award.year }}</span>
            <span>{{ award.text }}</span>
          </span>
        </figcaption>
      </figure>
    </a>
  </li>
</template>
