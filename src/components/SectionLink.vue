<!-- Секция с заголовком, описанием и кнопкой перехода. -->
<script setup>
import BaseButton from './BaseButton.vue'

defineProps({
  headingId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  href: { type: String, required: true },
  label: { type: String, required: true },
  background: { type: String, default: 'brand' },
  buttonBelow: { type: Boolean, default: false },
})
</script>

<template>
  <section
    class="relative isolate py-20 text-surface sm:py-24 wide:py-28"
    :class="[
      background === 'brand' ? 'bg-brand' : 'bg-foreground',
      $slots.illustration ? 'z-10 overflow-visible' : 'overflow-hidden',
    ]"
    :aria-labelledby="headingId"
  >
    <div class="site-container relative z-10 grid items-end gap-10 site-grid">
      <div class="nav:col-span-8">
        <h2 :id="headingId" class="font-display text-h2 break-words hyphens-auto uppercase"><slot name="title">{{ title }}</slot></h2>
        <p class="mt-6 max-w-2xl text-body-large font-medium text-surface/85"><slot name="description">{{ description }}</slot></p>
      </div>
      <BaseButton
        class="justify-self-start focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface nav:col-span-4"
        :class="{ 'w-full sm:w-auto nav:col-start-1 nav:row-start-2': buttonBelow }"
        :href="href"
        variant="surface"
      >
        {{ label }}
      </BaseButton>
    </div>
    <div
      v-if="$slots.illustration"
      class="pointer-events-none relative z-0 -mb-24 mt-10 w-full sm:-mb-28 nav:absolute nav:-bottom-8 nav:-right-[8vw] nav:m-0 nav:w-[60vw]"
      aria-hidden="true"
    >
      <slot name="illustration" />
    </div>
  </section>
</template>
