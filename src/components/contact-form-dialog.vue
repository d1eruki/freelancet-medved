<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { IconX } from '@tabler/icons-vue'
import ContactForm from './ContactForm.vue'

defineProps({
  source: { type: String, required: true },
  idPrefix: { type: String, required: true },
  title: { type: String, required: true },
})

const emit = defineEmits(['close'])
const dialog = ref(null)
let previousBodyOverflow = ''

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  dialog.value.showModal()
})

onBeforeUnmount(() => {
  dialog.value?.close()
  document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <dialog
    :id="`${idPrefix}-dialog`"
    ref="dialog"
    class="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-3xl border-0 bg-surface p-6 text-foreground shadow-2xl backdrop:bg-foreground/75 backdrop:backdrop-blur-sm sm:p-10"
    :aria-labelledby="`${idPrefix}-title`"
    data-lenis-prevent
    @close="emit('close')"
  >
    <div class="flex items-start justify-between gap-4">
      <h2 :id="`${idPrefix}-title`" class="font-display text-h3 uppercase">{{ title }}</h2>
      <button
        class="grid size-12 shrink-0 place-items-center rounded-full border border-foreground/20 hover:bg-panel focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
        type="button"
        aria-label="Закрыть форму"
        autofocus
        @click="dialog.close()"
      >
        <IconX class="size-6" aria-hidden="true" />
      </button>
    </div>
    <ContactForm class="mt-10" :id-prefix="idPrefix" :source="source" />
  </dialog>
</template>
