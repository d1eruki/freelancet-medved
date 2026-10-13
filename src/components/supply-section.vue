<script setup>
import SectionLink from './SectionLink.vue'
import { sitePath } from '../utils/site-path'
import deliveryHorseCartUrl from '../assets/horeca/delivery-horse-cart-catalog.png'

defineProps({
  headingId: { type: String, required: true },
  title: { type: String, default: 'Нужна\nпоставка?' },
  description: {
    type: String,
    default: 'Свяжитесь с отделом оптовых продаж, чтобы\nобсудить ассортимент и условия сотрудничества.',
  },
  href: { type: String, default: () => sitePath('/kontakty/') },
  label: { type: String, default: 'Контакты' },
  imageUrl: { type: String, default: deliveryHorseCartUrl },
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
      <img
        :src="imageUrl"
        alt=""
        loading="lazy"
        decoding="async"
        class="block h-auto w-full"
      >
    </template>
  </SectionLink>
</template>
