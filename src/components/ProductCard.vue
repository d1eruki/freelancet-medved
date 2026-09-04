<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  textHidden: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <article
    class="product-card relative isolate block overflow-hidden bg-transparent"
    :class="{
      'is-text-hidden': textHidden,
    }"
    :aria-label="product.name"
  >
    <div class="site-container relative grid h-full min-h-144 py-12 sm:min-h-160 nav:min-h-0 nav:grid-cols-12 nav:grid-rows-2">
      <div class="product-copy relative z-2 nav:col-span-4 nav:row-span-2 nav:self-center">
        <p class="text-label font-bold tracking-wider uppercase">{{ product.label }}</p>

        <h3 class="mt-4 font-display text-h3 text-brand uppercase">
          {{ product.name }}
        </h3>

        <p class="mt-6 max-w-sm text-body font-medium">
          {{ product.description }}
        </p>
      </div>

      <div class="product-copy relative z-2 mt-8 nav:col-span-4 nav:col-start-9 nav:row-span-2 nav:mt-0 nav:self-center">
        <p class="text-label font-bold tracking-wider uppercase">Вкусы</p>

        <p class="mt-4 max-w-sm text-body font-medium">
          {{ product.tastes }}
        </p>

        <a
          class="product-interactive mt-8 inline-flex items-center gap-3 text-label font-bold uppercase focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
          :href="product.href"
          :tabindex="active ? 0 : -1"
        >
          <span
            class="product-detail-icon grid size-10 place-items-center rounded-full bg-brand text-surface transition duration-200"
            aria-hidden="true"
          >
            →
          </span>
          Подробнее
        </a>
      </div>

      <a
        class="product-interactive product-visual absolute bottom-0 left-1/2 z-1 size-96 -translate-x-1/2 rotate-0 transition duration-500 focus-visible:outline-4 focus-visible:outline-brand sm:size-112 nav:bottom-3 nav:size-auto nav:h-11/12 nav:max-h-144 nav:aspect-square"
        :href="product.href"
        :tabindex="active ? 0 : -1"
        :aria-label="`Подробнее о напитке «${product.name}»`"
      >
        <img class="size-full object-contain" :src="product.image" alt="">
      </a>
    </div>
  </article>
</template>

<style scoped>
.product-copy {
  transition: opacity 360ms cubic-bezier(0.4, 0, 0.2, 1);
}

.is-text-hidden .product-copy {
  opacity: 0;
}

.product-card:has(.product-interactive:is(:hover, :focus-visible)) .product-visual {
  rotate: 3deg;
}

.product-card:has(.product-interactive:is(:hover, :focus-visible)) .product-detail-icon {
  rotate: -45deg;
  background-color: var(--color-foreground);
}
</style>
