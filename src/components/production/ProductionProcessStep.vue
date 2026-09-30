<script setup>
defineProps({
  number: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  active: { type: Boolean, required: true },
})

const emit = defineEmits(['select'])
</script>

<template>
  <li>
    <h3>
      <button
        type="button"
        class="group flex w-full items-center gap-5 text-left transition-colors duration-700 ease-in-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        :class="active ? 'text-brand' : 'text-subtle hover:text-foreground'"
        :aria-expanded="active"
        :aria-controls="`production-step-description-${number}`"
        @click="emit('select')"
      >
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-full text-label font-extrabold text-surface transition-colors duration-700 ease-in-out motion-reduce:transition-none"
          :class="active ? 'bg-brand' : 'bg-subtle group-hover:bg-foreground'"
        >{{ number }}</span>
        <span class="font-display text-h4 uppercase">{{ title }}</span>
      </button>
    </h3>
    <div
      :id="`production-step-description-${number}`"
      class="grid transition-[grid-template-rows,opacity] duration-700 ease-in-out motion-reduce:transition-none"
      :class="active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
      :aria-hidden="!active"
    >
      <div class="min-h-0 overflow-hidden">
        <p class="mt-6 max-w-lg pl-15 text-body font-medium text-subtle">{{ text }}</p>
      </div>
    </div>
  </li>
</template>
