<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { vTypography } from '../directives/typography'

const emit = defineEmits(['confirm'])

const confirmButton = ref(null)
const isDenied = ref(false)
let previousBodyOverflow = ''

function confirmAge() {
  emit('confirm')
}

async function denyAge() {
  isDenied.value = true
  await nextTick()
  confirmButton.value?.focus()
}

async function resetAnswer() {
  isDenied.value = false
  await nextTick()
  confirmButton.value?.focus()
}

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  confirmButton.value?.focus()
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <div v-typography class="fixed inset-0 z-100 grid place-items-center overflow-y-auto bg-foreground/75 p-4 backdrop-blur-sm sm:p-8">
    <section
      class="w-full max-w-2xl rounded-4xl bg-surface p-7 text-center shadow-2xl sm:p-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-description"
    >
      <template v-if="!isDenied">
        <h1 id="age-gate-title" class="font-display text-h3 uppercase">
          Вам уже исполнилось 18 лет?
        </h1>
        <p id="age-gate-description" class="mx-auto mt-5 max-w-lg text-body text-subtle">
          На сайте представлена информация об алкогольной продукции.
        </p>

        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            ref="confirmButton"
            class="min-h-14 rounded-full bg-brand px-8 text-label font-extrabold tracking-wide text-surface uppercase transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
            type="button"
            @click="confirmAge"
          >
            Да, мне есть 18
          </button>
          <button
            class="min-h-14 rounded-full border border-foreground/20 px-8 text-label font-extrabold tracking-wide uppercase transition duration-200 hover:border-foreground hover:bg-panel focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
            type="button"
            @click="denyAge"
          >
            Нет
          </button>
        </div>
      </template>

      <template v-else>
        <p class="mb-4 text-caption font-extrabold tracking-widest text-brand uppercase">Ограничение по возрасту</p>
        <h1 id="age-gate-title" class="font-display text-h3 uppercase">
          Доступ ограничен
        </h1>
        <p id="age-gate-description" class="mx-auto mt-5 max-w-lg text-body text-subtle">
          Сайт предназначен только для посетителей старше 18 лет.
        </p>
        <button
          ref="confirmButton"
          class="mt-8 min-h-14 rounded-full border border-foreground/20 px-8 text-label font-extrabold tracking-wide uppercase transition duration-200 hover:border-foreground hover:bg-panel focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
          type="button"
          @click="resetAnswer"
        >
          Изменить ответ
        </button>
      </template>
    </section>
  </div>
</template>
