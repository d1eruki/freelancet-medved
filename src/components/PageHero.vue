<script setup>
import productionImageUrl from '../assets/production-hero.png'

defineProps({
  titleId: { type: String, required: true },
  imageUrl: { type: String, default: productionImageUrl },
  imageAlt: { type: String, default: 'Производственный цех с оборудованием из нержавеющей стали' },
})
</script>

<template>
  <section
    class="relative isolate min-h-svh overflow-hidden bg-foreground text-surface"
    data-header-theme="light"
    :aria-labelledby="titleId"
  >
    <figure class="absolute inset-0 -z-1">
      <img
        class="size-full object-cover object-center"
        :src="imageUrl"
        :alt="imageAlt"
      >
      <span class="absolute inset-0 bg-foreground/60" aria-hidden="true" />
      <span class="absolute inset-0 bg-linear-to-t from-foreground/85 via-transparent to-foreground/20" aria-hidden="true" />
      <span class="absolute inset-0 hidden bg-linear-to-r from-foreground/75 via-foreground/15 to-transparent nav:block" aria-hidden="true" />
    </figure>

    <div class="site-container relative z-2 grid min-h-svh grid-rows-[1fr_auto] pt-28 pb-8 sm:pt-32 sm:pb-12">
      <h1 :id="titleId" class="self-center font-display text-h1 uppercase">
        <slot name="title" />
      </h1>

      <p class="max-w-xl text-body-large font-medium text-surface/80 nav:max-w-md">
        <slot />
      </p>
    </div>
  </section>
</template>
