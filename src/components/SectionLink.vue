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
    class="relative isolate overflow-hidden py-20 text-surface sm:py-24 wide:py-28"
    :class="background === 'brand' ? 'bg-brand' : 'bg-foreground'"
    :aria-labelledby="headingId"
  >
    <div class="site-container relative z-10 grid items-center gap-10 site-grid">
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
      <div
        v-if="$slots.illustration"
        class="pointer-events-none w-full max-w-80 justify-self-center nav:col-span-4 nav:col-start-9 nav:row-start-1 nav:row-span-2 nav:justify-self-end"
        aria-hidden="true"
      >
        <slot name="illustration" />
      </div>
    </div>
  </section>
</template>
