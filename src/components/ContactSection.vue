<script setup>
import { computed } from 'vue'
import ContactForm from './ContactForm.vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  headingId: { type: String, required: true },
  idPrefix: { type: String, required: true },
  tone: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark'].includes(value),
  },
})

const isDark = computed(() => props.tone === 'dark')
const titleLines = computed(() => props.title.trim().split(/\s+/).reduce((lines, word) => {
  if (lines.length && lines[lines.length - 1].length === 1) {
    lines[lines.length - 1] += ` ${word}`
  } else {
    lines.push(word)
  }
  return lines
}, []))
</script>

<template>
  <section
    class="py-20 sm:py-24 wide:py-28"
    :class="isDark ? 'bg-foreground text-surface' : 'bg-surface text-foreground'"
    :data-header-theme="isDark ? 'light' : 'dark'"
    :aria-labelledby="headingId"
  >
    <div class="site-container">
      <div class="flex flex-col gap-10 nav:flex-row">
        <div class="nav:w-max nav:shrink-0">
          <h2 :id="headingId" :aria-label="title" class="font-display text-h2 uppercase">
            <span v-for="(line, index) in titleLines" :key="index" class="block whitespace-nowrap" aria-hidden="true">{{ line }}</span>
          </h2>
          <p class="mt-6 max-w-md text-body-large font-medium" :class="isDark ? 'text-surface/80' : 'text-subtle'">{{ description }}</p>
        </div>
        <ContactForm class="nav:flex-1" :id-prefix="idPrefix" :tone="tone" />
      </div>
    </div>
  </section>
</template>
