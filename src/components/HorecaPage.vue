<script setup>
import PageHero from './PageHero.vue'
import SectionLink from './SectionLink.vue'
import { sitePath } from '../utils/site-path'
</script>

<template>
  <div>
    <PageHero title-id="horeca-page-title">
      <template #title>HoReCa</template>
      Медовуха, сидр и пуаре «МЁДВЕДЬ» для баров и ресторанов. Поставляем напитки оптом в многооборотных кегах и одноразовой ПЭТ-таре.
    </PageHero>

    <SectionLink
      heading-id="horeca-assortment-title"
      title="Ассортимент"
      description="Познакомьтесь с напитками в каталоге и обратитесь в отдел продаж, чтобы обсудить заказ."
      :href="sitePath('/katalog/')"
      label="В каталог"
    />

    <SectionLink
      heading-id="horeca-delivery-title"
      title="Поставки"
      description="Доставляем по Санкт-Петербургу и Ленинградской области собственным транспортом. В других регионах работаем с дистрибьюторами."
      :href="sitePath('/kontakty/')"
      label="Контакты"
      background="foreground"
    />
  </div>
</template>
