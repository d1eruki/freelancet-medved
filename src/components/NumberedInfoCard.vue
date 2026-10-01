<script setup>
import { IconApple, IconHexagons, IconLeaf, IconWheat } from '@tabler/icons-vue'

const ingredientIcons = {
  hexagons: IconHexagons,
  apple: IconApple,
  wheat: IconWheat,
  leaf: IconLeaf,
}

defineProps({
  title: { type: String, required: true },
  text: { type: String, required: true },
  variant: { type: String, required: true },
  compact: { type: Boolean, default: false },
  icons: { type: Array, default: () => [] },
})
</script>

<template>
  <component
    :is="variant === 'group' ? 'article' : 'li'"
    class="flex flex-col rounded-3xl p-6"
    :class="{
      'min-h-80 bg-panel sm:p-8 wide:min-h-96 wide:p-10': variant === 'group',
      'min-h-80 bg-surface text-foreground sm:p-8 wide:min-h-96 wide:p-10': variant === 'ingredient',
      'min-h-80 bg-surface sm:p-8 wide:min-h-96': variant === 'process',
      'min-h-72 bg-surface text-foreground sm:p-8 wide:min-h-80': variant === 'distribution' && !compact,
      'min-h-56 bg-surface text-foreground sm:p-8 wide:min-h-64': variant === 'distribution' && compact,
    }"
  >
    <div v-if="variant === 'ingredient'" class="flex gap-2 text-brand" aria-hidden="true">
      <component
        v-for="icon in icons"
        :key="icon"
        :is="ingredientIcons[icon]"
        class="size-12 shrink-0"
      />
    </div>
    <h3
      class="mt-auto font-display text-h4 text-brand uppercase"
    >{{ title }}</h3>
    <p
      class="mt-6 text-body font-medium text-subtle"
      :class="{
        'max-w-sm': variant === 'ingredient',
      }"
    >{{ text }}</p>
  </component>
</template>
