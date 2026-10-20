<script setup>
import contactsHeroImageUrl from '../../assets/heroes/contacts/hero.png'
import contactsHeroMiddleUrl from '../../assets/heroes/contacts/middle.png'
import contactsDividerUrl from '../../assets/heroes/contacts/divider.png'
import BaseButton from '../../components/BaseButton.vue'
import BrandedMap from '../../components/branded-map.vue'
import ContactInfoCard from './ContactInfoCard.vue'
import PageHero from '../../components/PageHero.vue'
import HeroDivider from '../../components/HeroDivider.vue'
import ActionTile from '../../components/ActionTile.vue'
import { contacts } from '../../data/contacts.js'
import { sitePath } from '../../utils/site-path'

const contactsHeroLayers = {
  background: {
    src: contactsHeroImageUrl,
    className: 'absolute inset-0 size-full object-cover object-center',
    alt: 'Иллюстрация кирпичного промышленного здания у воды',
  },
  middle: {
    src: contactsHeroMiddleUrl,
    className: 'absolute left-0 h-auto w-[82vw] sm:w-[55vw] wide:w-[44vw]',
    alt: 'Рабочие загружают бочки в деревянную повозку у завода',
  },
}

const contactsHeroLayout = {
  mobile: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, scale: 3, x: -500, y: -200, constraints: { horizontal: 'left', vertical: 'bottom' } },
  },
  tablet: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, scale: 3, x: -600, y: -300, constraints: { horizontal: 'left', vertical: 'bottom' } },
  },
  desktop: {
    background: { enabled: true, scale: 1, x: 0, y: 0 },
    middle: { enabled: true, scale: 1.5, x: -100, y: -200, constraints: { horizontal: 'left', vertical: 'bottom' } },
  },
}

</script>

<template>
  <div>
    <PageHero
      class="contacts-hero"
      title-id="contacts-title"
      :layers="contactsHeroLayers"
      :layer-layout="contactsHeroLayout"
      layer-entrance="split-slide"
      animate-copy
    >
      <template #title>Будем<br>знакомы</template>
      <span class="wide:block wide:whitespace-nowrap">Товарищество пиво-медоваренного завода </span>
      <span class="wide:block wide:whitespace-nowrap">«МЁДВЕДЬ». Производим и поставляем </span>
      <span class="wide:block wide:whitespace-nowrap">медовуху, сидр и пуаре из Санкт-Петербурга.</span>
    </PageHero>

    <HeroDivider :image-url="contactsDividerUrl" />

    <section class="section-decorated bg-panel pt-20 pb-20 text-foreground sm:pt-24 sm:pb-24 wide:pt-40 wide:pb-28" aria-labelledby="contacts-details-title">
      <div class="site-container">
        <div class="grid items-end gap-6 site-grid nav:gap-8">
          <h2 id="contacts-details-title" class="font-display text-h2 wrap-break-word hyphens-auto uppercase nav:col-span-8">Связаться</h2>
          <p class="max-w-md text-body-large font-medium text-subtle nav:col-span-4">Выберите контакт в зависимости от вашего вопроса.</p>
        </div>

        <div class="mt-12 grid gap-4 sm:mt-16 site-grid">
          <ContactInfoCard class="nav:col-span-6" v-bind="contacts.general" />
          <ContactInfoCard class="nav:col-span-6" v-bind="contacts.sales" />
        </div>
      </div>
    </section>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" aria-labelledby="contacts-address-title">
      <div class="site-container">
        <div class="grid gap-12 site-grid nav:gap-10">
          <div class="nav:col-span-5">
            <h2 id="contacts-address-title" class="font-display text-h2 wrap-break-word hyphens-auto uppercase">Наш адрес</h2>
            <address class="mt-6 max-w-3xl text-body-large font-bold not-italic">{{ contacts.address }}</address>
            <p class="mt-6 max-w-2xl text-body font-medium text-subtle">Въезд со стороны набережной Обводного канала, между домами 205А и 207Б.</p>
            <BaseButton class="mt-10 inline-flex items-center justify-center" :href="contacts.routeUrl" target="_blank" rel="noopener noreferrer">
              Построить маршрут
            </BaseButton>
          </div>
          <BrandedMap class="nav:col-span-7" :embed-url="contacts.mapEmbedUrl" :title="contacts.mapTitle" :marker-url="contacts.addressMapUrl" />
        </div>
      </div>
    </section>

    <section class="bg-foreground py-20 text-surface sm:py-24 wide:py-28" aria-labelledby="contacts-catalog-title">
      <div class="site-container">
        <div class="grid items-end gap-6 site-grid nav:gap-8">
          <h2 id="contacts-catalog-title" class="font-display text-h2 uppercase nav:col-span-7">Наши напитки</h2>
          <p class="max-w-md text-body-large font-medium text-surface/75 nav:col-span-5">Выберите формат поставки — покажем подходящий ассортимент.</p>
        </div>
        <div class="mt-12 grid gap-4 sm:mt-16 site-grid">
          <ActionTile class="nav:col-span-6" :href="sitePath('/katalog/?packaging=kegs#assortment')" label="Оптовые поставки" title="Кеги 30 л" compact />
          <ActionTile class="nav:col-span-6" :href="sitePath('/katalog/?packaging=packaged#assortment')" label="Бутылки и банки" title="Фасовка" tone="surface" compact />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contacts-hero :deep(.hero-overlay-bottom),
.contacts-hero :deep(.hero-overlay-center) {
  transform: scaleX(-1);
}

.contacts-hero :deep(.site-container > .flex) {
  align-items: flex-end;
  text-align: right;
}
</style>
