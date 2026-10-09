<script setup>
import contactsHeroImageUrl from '../../assets/heroes/contacts/hero.png'
import contactsDividerUrl from '../../assets/heroes/contacts/divider.png'
import CircleArrow from '../../components/CircleArrow.vue'
import ContactInfoCard from './ContactInfoCard.vue'
import ContactSection from '../../components/ContactSection.vue'
import PageHero from '../../components/PageHero.vue'
import HeroDivider from '../../components/HeroDivider.vue'
import SectionLink from '../../components/SectionLink.vue'
import { contacts } from '../../data/contacts.js'
import { sitePath } from '../../utils/site-path'

</script>

<template>
  <div>
    <PageHero
      title-id="contacts-title"
      :image-url="contactsHeroImageUrl"
      image-alt="Иллюстрация кирпичного промышленного здания у воды"
      animate-copy
    >
      <template #title>Будем<br>знакомы</template>
      <span class="wide:block wide:whitespace-nowrap">Товарищество пиво-медоваренного завода </span>
      <span class="wide:block wide:whitespace-nowrap">«МЁДВЕДЬ». Производим и поставляем </span>
      <span class="wide:block wide:whitespace-nowrap">медовуху, сидр и пуаре из Санкт-Петербурга.</span>
    </PageHero>

    <HeroDivider :image-url="contactsDividerUrl" />

    <section class="section-decorated bg-panel py-20 text-foreground sm:py-24 wide:py-28" aria-labelledby="contacts-details-title">
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

    <ContactSection
      title="Запрос на поставку"
      description="Расскажите о вашем вопросе."
      heading-id="contacts-inquiry-title"
      id-prefix="inquiry"
      tone="dark"
    />

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" aria-labelledby="contacts-address-title">
      <div class="site-container">
        <div class="grid gap-6 site-grid nav:gap-10">
          <div class="nav:col-span-5">
            <h2 id="contacts-address-title" class="font-display text-h2 wrap-break-word hyphens-auto uppercase">Наш адрес</h2>
          </div>
          <div class="nav:col-span-7 nav:pt-12">
            <address class="max-w-3xl text-body-large font-bold not-italic">{{ contacts.address }}</address>
            <p class="mt-6 max-w-2xl text-body font-medium text-subtle">Въезд со стороны набережной Обводного канала, между домами 205А и 207Б.</p>
            <a class="group mt-10 inline-flex items-center gap-5 text-label font-extrabold tracking-wide text-brand uppercase focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand" :href="contacts.routeUrl" target="_blank" rel="noopener noreferrer">
              <span class="secondary-action py-3">Построить маршрут</span>
              <CircleArrow hover="brand" size="action" />
            </a>
          </div>
        </div>
        <iframe class="mt-12 h-96 w-full rounded-3xl border-0" :src="contacts.mapEmbedUrl" :title="contacts.mapTitle" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>
    </section>

    <SectionLink
      heading-id="contacts-catalog-title"
      title="Наши напитки"
      description="Познакомьтесь с ассортиментом медовухи, сидра и пуаре."
      :href="sitePath('/katalog/')"
      label="В каталог"
      :background="'foreground'"
    />
  </div>
</template>
