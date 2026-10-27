<!-- Секция обращения в отдел оптовых поставок. -->
<script setup>
import SectionLink from './SectionLink.vue'
import { sitePath } from '../utils/site-path'

defineProps({
  headingId: { type: String, required: true },
  title: { type: String, default: 'Нужна\nпоставка?' },
  description: {
    type: String,
    default: 'Свяжитесь с отделом оптовых продаж, чтобы\nобсудить ассортимент и условия сотрудничества.',
  },
  href: { type: String, default: () => sitePath('/kontakty/') },
  label: { type: String, default: 'Контакты' },
})
</script>

<template>
  <SectionLink
    :heading-id="headingId"
    :title="title.replaceAll('\n', ' ')"
    :description="description.replaceAll('\n', ' ')"
    :href="href"
    :label="label"
    background="foreground"
    button-below
  >
    <template #title>
      <span v-for="(line, index) in title.split('\n')" :key="index" class="block">{{ line }}</span>
    </template>
    <template #description>
      <span v-for="(line, index) in description.split('\n')" :key="index" class="nav:block">{{ `${line} ` }}</span>
    </template>
    <template #illustration>
      <div class="grid aspect-square w-full place-items-center bg-gray-300 text-body-large font-semibold text-gray-700">
        Заглушка
      </div>
    </template>
  </SectionLink>
</template>
