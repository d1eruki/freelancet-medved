<script setup>
defineProps({
  number: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  variant: { type: String, required: true },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <component
    :is="variant === 'group' ? 'article' : 'li'"
    class="flex flex-col rounded-3xl p-6"
    :class="{
      'group min-h-80 bg-panel transition-colors duration-300 hover:bg-brand hover:text-surface sm:p-8 wide:min-h-96 wide:p-10': variant === 'group',
      'min-h-80 bg-surface text-foreground sm:p-8 wide:min-h-96 wide:p-10': variant === 'ingredient',
      'group min-h-80 bg-surface transition-colors duration-300 hover:bg-brand hover:text-surface sm:p-8 wide:min-h-96': variant === 'process',
      'min-h-72 bg-surface text-foreground sm:p-8 wide:min-h-80': variant === 'distribution' && !compact,
      'min-h-56 bg-surface text-foreground sm:p-8 wide:min-h-64': variant === 'distribution' && compact,
    }"
  >
    <span
      class="text-label font-extrabold tracking-widest text-brand"
      :class="{ 'transition-colors group-hover:text-surface': variant === 'group' || variant === 'process' }"
    >{{ number }}</span>
    <h3
      class="mt-auto font-display text-h4 text-brand uppercase"
      :class="{ 'transition-colors group-hover:text-surface': variant === 'group' || variant === 'process' }"
    >{{ title }}</h3>
    <p
      class="mt-5 text-body font-medium text-subtle"
      :class="{
        'transition-colors group-hover:text-surface/70': variant === 'group',
        'max-w-sm': variant === 'ingredient',
        'transition-colors group-hover:text-surface/75': variant === 'process',
      }"
    >{{ text }}</p>
  </component>
</template>
