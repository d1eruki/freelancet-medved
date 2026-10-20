<script setup>
import { computed } from 'vue'
import ProductComposition from '#product-composition'
import CircleArrow from '../../components/CircleArrow.vue'
import BaseButton from '../../components/BaseButton.vue'
import { siteVariant } from '../../data/site-variants.js'

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
  pawMotion: { type: Object, default: undefined },
})
const emit = defineEmits(['previous', 'next'])

const dragAngleCss = computed(() => `${props.dragAngle}deg`)
const compositionMotion = computed(() => siteVariant.name === 'client' ? {
  pawMotion: props.pawMotion,
} : {})
</script>

<template>
  <article
    class="product-card relative isolate block bg-transparent"
    :class="{
      'is-text-hidden': textHidden,
      'is-moving-forward': siteVariant.name !== 'client' && motionDirection === 'forward',
      'is-moving-backward': siteVariant.name !== 'client' && motionDirection === 'backward',
      'is-dragging': dragging,
    }"
    :aria-label="product.name"
  >
    <div class="site-container relative flex flex-col items-center py-6 text-center sm:py-8 nav:grid nav:h-full nav:min-h-0 site-grid nav:grid-rows-2 nav:text-left">
      <div class="product-copy relative z-0 w-full max-w-md nav:col-span-4 nav:row-span-2 nav:max-w-none nav:self-center">
        <h3 class="font-display text-product-title text-surface uppercase">
          {{ product.name }}
        </h3>

        <p class="mx-auto mt-6 max-w-sm text-body font-medium text-surface nav:mx-0">
          {{ product.description }}
        </p>
      </div>

      <div class="contents nav:relative nav:z-2 nav:col-span-4 nav:col-start-9 nav:row-span-2 nav:block nav:w-full nav:self-center">
        <p class="product-copy relative z-2 order-1 mx-auto mt-8 w-full max-w-md text-body font-medium text-surface nav:mx-0 nav:mt-0">
          {{ product.varieties }}
        </p>

        <div class="product-copy relative z-2 order-3 -mt-6 inline-flex nav:mt-10">
          <BaseButton
            class="product-interactive inline-flex items-center justify-center"
            :href="product.href"
            :tabindex="active ? 0 : -1"
          >
            Подробнее
          </BaseButton>
        </div>
      </div>

      <div class="relative -top-4 order-2 mt-8 flex w-full items-center justify-center gap-2 nav:static nav:top-auto nav:contents">
        <button
          class="product-copy group shrink-0 rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand nav:hidden"
          type="button"
          aria-label="Предыдущий напиток"
          :tabindex="active ? 0 : -1"
          @click="emit('previous')"
        >
          <CircleArrow direction="left" hover="control" tone="surface" />
        </button>

        <a
          class="product-interactive product-visual relative z-1 min-w-0 max-w-96 flex-1 aspect-square focus-visible:outline-4 focus-visible:outline-brand sm:max-w-112 nav:absolute nav:-bottom-1 nav:left-1/2 nav:size-auto nav:h-11/12 nav:max-h-144 nav:max-w-none nav:aspect-square nav:flex-none nav:-translate-x-1/2"
          draggable="false"
          :href="product.href"
          :tabindex="active ? 0 : -1"
          :aria-label="`Подробнее о напитке «${product.name}»`"
        >
          <ProductComposition :renders="product.renders" v-bind="compositionMotion" />
        </a>

        <button
          class="product-copy group shrink-0 rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand nav:hidden"
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

.is-moving-forward :deep(.product-layer:not(.product-grip)) {
  animation: product-inertia-forward 820ms cubic-bezier(0.4, 0, 0.2, 1);
}
.is-moving-backward :deep(.product-layer:not(.product-grip)) {
  animation: product-inertia-backward 820ms cubic-bezier(0.4, 0, 0.2, 1);
}
.is-moving-forward :deep(.product-layer.product-glass), .is-moving-backward :deep(.product-layer.product-glass) {
  animation-delay: 100ms;
  animation-fill-mode: backwards;
}
.is-dragging :deep(.product-composition), .is-dragging :deep(.product-motion-layer), .is-dragging :deep(.product-layer) { transition: none; }
.is-dragging :deep(.product-layer:not(.product-grip)) { rotate: v-bind(dragAngleCss); }

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
  :deep(.product-layer) {
    animation: none;
    rotate: none;
    transition: none;
  }
}
</style>
