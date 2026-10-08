<script setup>
import { ref } from 'vue'

const props = defineProps({
  href: { type: String, default: null },
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'brand', validator: value => ['brand', 'surface', 'outline'].includes(value) },
})

const variants = {
  brand: 'bg-brand px-8 text-surface hover:-translate-y-1 hover:shadow-xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand',
  surface: 'inline-flex items-center justify-center bg-surface px-7 text-foreground hover:-translate-y-1 hover:shadow-xl',
  outline: 'border border-foreground/20 px-8 hover:border-foreground hover:bg-panel focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand',
}
const element = ref(null)
// Сохраняем программный фокус для диалога подтверждения возраста.
defineExpose({ focus: options => element.value?.focus(options) })
</script>

<template>
  <component
    :is="props.href !== null ? 'a' : 'button'"
    ref="element"
    :href="props.href"
    :type="props.href === null ? props.type : undefined"
    class="min-h-14 rounded-full text-label font-extrabold tracking-wide uppercase transition duration-200"
    :class="variants[props.variant]"
  >
    <slot />
  </component>
</template>
