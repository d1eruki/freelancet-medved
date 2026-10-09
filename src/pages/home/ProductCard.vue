<script setup>
import { computed } from 'vue'
import ProductScene from '../../components/product-scene/ProductScene.vue'
import CircleArrow from '../../components/CircleArrow.vue'

const props = defineProps({
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
  motionDirection: {
    type: String,
    default: '',
  },
  dragging: {
    type: Boolean,
    default: false,
  },
  dragAngle: {
    type: Number,
    default: 0,
  },
})
const emit = defineEmits(['previous', 'next'])

const dragAngleCss = computed(() => `${props.dragAngle}deg`)
</script>

<template>
  <article
    class="product-card relative isolate block overflow-hidden bg-transparent"
    :class="{
      'is-text-hidden': textHidden,
      'is-moving-forward': motionDirection === 'forward',
      'is-moving-backward': motionDirection === 'backward',
      'is-dragging': dragging,
    }"
    :aria-label="product.name"
  >
    <div class="site-container relative flex flex-col items-center py-8 text-center sm:py-12 nav:grid nav:h-full nav:min-h-0 site-grid nav:grid-rows-2 nav:text-left">
      <div class="product-copy relative z-0 w-full max-w-md nav:col-span-4 nav:row-span-2 nav:max-w-none nav:self-center">
        <h3 class="font-display text-product-title text-surface uppercase">
          {{ product.name }}
        </h3>

        <p class="mx-auto mt-6 max-w-sm text-body font-medium nav:mx-0">
          {{ product.description }}
        </p>
      </div>

      <div class="product-copy relative z-2 order-3 mt-8 w-full max-w-md nav:order-none nav:col-span-4 nav:col-start-9 nav:row-span-2 nav:mt-0 nav:max-w-none nav:self-center">
        <p class="mx-auto max-w-md text-body font-medium nav:mx-0">
          {{ product.varieties }}
        </p>

        <a
          class="product-interactive group mt-10 inline-flex items-center gap-3 text-label font-bold uppercase focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
          :href="product.href"
          :tabindex="active ? 0 : -1"
        >
          <span class="secondary-action py-3">Подробнее</span>
          <CircleArrow hover="detail" />
        </a>
      </div>

      <div class="order-2 mt-8 flex w-full items-center justify-center gap-2 nav:contents">
        <button
          class="group shrink-0 rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand nav:hidden"
          type="button"
          aria-label="Предыдущий напиток"
          :tabindex="active ? 0 : -1"
          @click="emit('previous')"
        >
          <CircleArrow direction="left" hover="control" tone="surface" />
        </button>

        <a
          class="product-interactive product-visual relative z-1 min-w-0 max-w-64 flex-1 aspect-square focus-visible:outline-4 focus-visible:outline-brand sm:max-w-72 nav:absolute nav:bottom-3 nav:left-1/2 nav:size-auto nav:h-11/12 nav:max-h-144 nav:max-w-none nav:aspect-square nav:flex-none nav:-translate-x-1/2"
          draggable="false"
          :href="product.href"
          :tabindex="active ? 0 : -1"
          :aria-label="`Подробнее о напитке «${product.name}»`"
        >
          <ProductScene
            can-only
            :active="active"
            :paused="dragging || Boolean(motionDirection)"
            :drink="product.drink"
            :can-label="product.canLabel"
            :pattern-slug="product.slug"
            :fallback="product.image"
          />
        </a>

        <button
          class="group shrink-0 rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand nav:hidden"
          type="button"
          aria-label="Следующий напиток"
          :tabindex="active ? 0 : -1"
          @click="emit('next')"
        >
          <CircleArrow hover="control" tone="surface" />
        </button>
      </div>
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

:deep(.product-scene-snapshot) {
  transform-origin: 50% 90%;
}

.is-moving-forward :deep(.product-scene-transform),
.is-moving-forward :deep(.product-scene-snapshot) {
  animation: product-inertia-forward 820ms cubic-bezier(0.4, 0, 0.2, 1);
}

.is-moving-backward :deep(.product-scene-transform),
.is-moving-backward :deep(.product-scene-snapshot) {
  animation: product-inertia-backward 820ms cubic-bezier(0.4, 0, 0.2, 1);
}

.is-dragging :deep(.product-scene-transform) {
  rotate: v-bind(dragAngleCss);
}

@keyframes product-inertia-forward {
  0% {
    rotate: 0deg;
  }

  18%, 72% {
    rotate: 4deg;
  }

  85% {
    rotate: -2deg;
  }

  93% {
    rotate: 1deg;
  }

  100% {
    rotate: 0deg;
  }
}

@keyframes product-inertia-backward {
  0% {
    rotate: 0deg;
  }

  18%, 72% {
    rotate: -4deg;
  }

  85% {
    rotate: 2deg;
  }

  93% {
    rotate: -1deg;
  }

  100% {
    rotate: 0deg;
  }
}
@media (prefers-reduced-motion: reduce) {
  :deep(.product-scene-transform),
  :deep(.product-scene-snapshot) {
    animation: none;
    rotate: none;
  }
}
</style>
