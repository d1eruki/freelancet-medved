<script setup>
defineProps({
  recipe: { type: Object, required: true },
})
</script>

<template>
  <article class="grid min-h-0 min-w-0 grid-cols-3 content-start gap-6 rounded-3xl bg-brand/90 p-4 nav:h-full nav:grid-cols-2 nav:gap-x-12 nav:bg-transparent nav:p-0" :aria-labelledby="`${recipe.id}-title`">
    <picture class="pointer-events-none block h-24 min-h-0 nav:hidden">
      <source type="image/avif" :srcset="recipe.image.avifSrcset" sizes="33vw">
      <img
        class="block h-full w-full object-contain object-bottom"
        :src="recipe.image.src"
        :srcset="recipe.image.srcset"
        sizes="33vw"
        width="1448"
        height="1086"
        :alt="recipe.imageAlt"
        decoding="async"
        draggable="false"
      >
    </picture>

    <div class="col-span-2 min-w-0 nav:col-span-1 nav:col-start-2">
      <h3 :id="`${recipe.id}-title`" class="font-display text-h3 break-words uppercase">{{ recipe.name }}</h3>
      <p class="mt-3 text-label font-bold">{{ recipe.englishName }} · {{ recipe.base }}</p>
    </div>

    <div class="col-span-3 min-w-0 nav:col-span-1 nav:col-start-2">
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

  </article>
</template>
