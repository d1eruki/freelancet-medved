<script setup>
import { onMounted, ref } from 'vue'
import BaseButton from './BaseButton.vue'
import { sitePath } from '../utils/site-path'

const noticeStorageKey = 'medved-metrika-notice-dismissed'
const isVisible = ref(false)

onMounted(() => {
  try {
    isVisible.value = window.localStorage.getItem(noticeStorageKey) !== 'true'
  } catch {
    isVisible.value = true
  }
})

function dismissNotice() {
  isVisible.value = false

  try {
    window.localStorage.setItem(noticeStorageKey, 'true')
  } catch {
    // Уведомление можно закрыть и при недоступном хранилище браузера.
  }
}
</script>

<template>
  <aside
    v-if="isVisible"
    class="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-3xl flex-col gap-10 rounded-3xl border border-foreground/20 bg-surface p-6 text-foreground shadow-xl sm:flex-row sm:items-center"
    aria-label="Использование Яндекс Метрики"
  >
    <p class="min-w-0 text-body">
      Мы используем Яндекс Метрику и cookies для анализа посещаемости сайта.
      <a
        class="underline underline-offset-4 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        :href="sitePath('/politika-konfidencialnosti/')"
      >Политика конфиденциальности</a>.
    </p>
    <BaseButton class="shrink-0" @click="dismissNotice">
      Понятно
    </BaseButton>
  </aside>
</template>
