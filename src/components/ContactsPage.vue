<script setup>
import { onMounted } from 'vue'
import contactsHeroImageUrl from '../assets/contacts-hero.png'
import CircleArrow from './CircleArrow.vue'
import ContactInfoCard from './ContactInfoCard.vue'
import ContactSection from './ContactSection.vue'
import PageHero from './PageHero.vue'
import SectionLink from './SectionLink.vue'
import { sitePath } from '../utils/site-path'

const address = '190020, Санкт-Петербург, Курляндская ул., д. 28, литер Г, помещение 75'
const routeUrl = `https://yandex.ru/maps/?mode=routes&rtext=~${encodeURIComponent(address)}&rtt=auto`

onMounted(() => {
  document.title = 'Контакты пиво-медоваренного завода «МЁДВЕДЬ»'
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    'Адрес и контакты пиво-медоваренного завода «МЁДВЕДЬ» в Санкт-Петербурге. Телефон и почта отдела оптовых продаж.',
  )
})
</script>

<template>
  <div>
    <PageHero
      title-id="contacts-title"
      :image-url="contactsHeroImageUrl"
      image-alt="Интерьер медоварни с медным производственным оборудованием"
    >
      <template #title>Контакты</template>
      Товарищество пиво-медоваренного завода «МЁДВЕДЬ». Производим и поставляем медовуху, сидр и пуаре из Санкт-Петербурга.
    </PageHero>

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="contacts-details-title">
      <div class="site-container">
        <div class="grid items-end gap-6 nav:grid-cols-12 nav:gap-8">
          <h2 id="contacts-details-title" class="font-display text-h2 wrap-break-word hyphens-auto uppercase nav:col-span-8">Связаться</h2>
          <p class="max-w-md text-body-large font-medium text-subtle nav:col-span-4">Выберите контакт в зависимости от вашего вопроса.</p>
        </div>

        <div class="mt-12 grid gap-4 sm:mt-16 nav:grid-cols-2">
          <ContactInfoCard
            label="Общие вопросы"
            title="Завод «МЁДВЕДЬ»"
            hours="Пн–пт, 9:30–18:00"
            phone="+7 (812) 940-84-27"
            phone-href="tel:+78129408427"
            email="info@medved.beer"
            email-href="mailto:info@medved.beer"
          />
          <ContactInfoCard
            label="Сотрудничество и поставки"
            title="Оптовые продажи"
            hours="Пн–пт, 9:30–20:00"
            phone="+7 (963) 312-89-39"
            phone-href="tel:+79633128939"
            email="opt@medved.beer"
            email-href="mailto:opt@medved.beer?subject=%D0%97%D0%B0%D0%BF%D1%80%D0%BE%D1%81%20%D0%BE%20%D1%81%D0%BE%D1%82%D1%80%D1%83%D0%B4%D0%BD%D0%B8%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%B5"
            tone="brand"
          />
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

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="contacts-address-title">
      <div class="site-container">
        <div class="grid gap-6 nav:grid-cols-12 nav:gap-10">
          <div class="nav:col-span-5">
            <h2 id="contacts-address-title" class="font-display text-h2 wrap-break-word hyphens-auto uppercase">Наш адрес</h2>
          </div>
          <div class="nav:col-span-7 nav:pt-12">
            <address class="max-w-3xl text-body-large font-bold not-italic">{{ address }}</address>
            <p class="mt-6 max-w-2xl text-body font-medium text-subtle">Въезд со стороны набережной Обводного канала, между домами 205А и 207Б.</p>
            <a class="group mt-10 inline-flex items-center gap-5 text-label font-extrabold tracking-wide text-brand uppercase focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand" :href="routeUrl" target="_blank" rel="noopener noreferrer">
              <span class="secondary-action py-3">Построить маршрут</span>
              <CircleArrow hover="brand" size="action" />
            </a>
          </div>
        </div>
        <iframe class="mt-12 h-96 w-full rounded-3xl border-0" src="https://yandex.ru/map-widget/v1/?ll=30.280969%2C59.910135&amp;z=17&amp;pt=30.280969%2C59.910135%2Cpm2rdm" title="Яндекс Карта: Курляндская улица, 28Г, Санкт-Петербург" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
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
