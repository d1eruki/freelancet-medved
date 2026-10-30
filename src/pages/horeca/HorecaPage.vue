<!-- Страница сотрудничества с барами и ресторанами с заявкой на дегустацию. -->
<script setup>
import SiteImage from '../../components/site-image.vue'
import { ref } from 'vue'
import horecaHeroBackground from '../../assets/about/about-company-enhanced.png?responsive'
import PageHero from '../../components/PageHero.vue'
import ContactActionSection from '../../components/contact-action-section.vue'
import InfoCard from '../../components/InfoCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import ContactFormDialog from '../../components/contact-form-dialog.vue'
import CatalogCategoryCard from '../catalog/CatalogCategoryCard.vue'
import HorecaCocktailsSection from './HorecaCocktailsSection.vue'
import { catalogCategories } from '../../data/catalog'
import { sitePath } from '../../utils/site-path'
import deliveryPhotoUrl from '../../assets/horeca/delivery-photo.jpg'

const isTastingFormOpen = ref(false)

</script>

<template>
  <div>
    <PageHero
      title-id="horeca-page-title"
      mobile-actions-bottom
      :title-z-index="0"
      :image-url="horecaHeroBackground.src"
      image-alt="Фирменные бокалы с напитками на стойке бара"
    >
      <template #title>Для ваших<br>гостей</template>
      <span class="wide:block wide:whitespace-nowrap">Медовуха, сидр и пуаре «МЁДВЕДЬ» </span>
      <span class="wide:block wide:whitespace-nowrap">для баров и ресторанов. Поставляем напитки оптом </span>
      <span class="wide:block wide:whitespace-nowrap">в многооборотных кегах и одноразовой ПЭТ-таре.</span>
      <template #actions>
        <BaseButton class="w-full max-w-xl px-6 py-4 sm:w-auto" aria-haspopup="dialog" @click="isTastingFormOpen = true">
          Заказать дегустационный сет
        </BaseButton>
      </template>
    </PageHero>

    <ContactFormDialog
      source="horeca-hero-tasting"
      v-if="isTastingFormOpen"
      id-prefix="horeca-tasting"
      title="Заказать дегустационный сет"
      @close="isTastingFormOpen = false"
    />


    <div class="relative isolate bg-panel">
    <section class="horeca-assortment section-decorated bg-panel pt-20 pb-20 text-foreground sm:pt-24 sm:pb-24 wide:pt-28 wide:pb-28" aria-labelledby="horeca-assortment-title">
      <div class="site-container">
        <div class="grid items-end gap-6 site-grid nav:gap-8">
          <h2 id="horeca-assortment-title" class="font-display text-h2 break-words hyphens-auto uppercase nav:col-span-8">Три характера<br>для вашей карты</h2>
          <p class="max-w-md text-body-large font-medium text-subtle nav:col-span-4">
            Пряные, яблочные и грушевые вкусы. Выберите сорта для своего бара или ресторана — от сухих до сладких.
          </p>
        </div>

        <ul class="mt-12 grid gap-4 sm:mt-16 site-grid">
          <CatalogCategoryCard v-for="category in catalogCategories" :key="category.slug" class="nav:col-span-4" :category="category" />
        </ul>
      </div>
    </section>

    <HorecaCocktailsSection />
    </div>

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" aria-labelledby="horeca-formats-title">
      <div class="site-container">
        <div>
          <h2 id="horeca-formats-title" class="font-display text-h2 uppercase">Напитки в нужном формате</h2>
          <p class="mt-6 max-w-2xl text-body-large font-medium text-subtle">
            Поставляем оптом. Формат тары и ассортимент согласуем при обсуждении заказа.
          </p>
        </div>

        <dl class="mt-12 grid min-w-0 gap-12 sm:mt-16 sm:gap-16">
          <div>
            <dt class="font-display text-h3 hyphens-manual text-brand uppercase">Много&shy;оборотные кеги</dt>
            <dd class="mt-6 max-w-xl text-body-large font-medium text-subtle">
              Медовуха, сидр и пуаре для подачи в розлив. Доступные сорта и условия работы с многооборотной тарой уточните в отделе продаж.
            </dd>
          </div>
          <div>
            <dt class="font-display text-h3 text-brand uppercase">Одноразовая ПЭТ-тара</dt>
            <dd class="mt-6 max-w-xl text-body-large font-medium text-subtle">
              Другой формат оптовой поставки — по согласованию с покупателем. Для знакомства с напитками подготовим выбранные сорта в ПЭТ-бутылках для дегустации.
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="relative isolate overflow-hidden bg-panel py-20 text-surface sm:py-24 wide:py-28" aria-labelledby="horeca-delivery-title">
      <SiteImage
        :src="deliveryPhotoUrl"
        alt=""
        aria-hidden="true"
        decoding="async"
        width="1195"
        height="768"
        class="pointer-events-none absolute inset-0 -z-10 size-full object-cover object-right nav:object-center"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 -z-10 bg-linear-to-l from-transparent from-15% via-black/60 via-45% to-black/60"
      />
      <div class="site-container relative">
        <h2 id="horeca-delivery-title" class="font-display text-h2 break-words hyphens-auto uppercase">Из Петербурга<br>к вашим гостям</h2>
        <p class="mt-6 max-w-2xl text-body-large font-medium text-surface/75">
          В Петербурге и области доставляем сами, в других регионах работаем с дистрибьюторами.
        </p>

        <ul class="mt-12 grid gap-4 sm:mt-16 site-grid">
          <InfoCard
            class="shadow-2xl/10 nav:col-span-4"
            title="Санкт-Петербург и область"
            text="Доставляем напитки собственным транспортом. Адрес заведения и детали поставки обсудите с отделом продаж."
            variant="distribution"
            compact
          >
            <template #title>Санкт-<wbr>Петербург<br>и область</template>
          </InfoCard>
          <InfoCard
            class="shadow-2xl/10 nav:col-span-4"
            title="Другие регионы"
            text="Работаем через региональных дистрибьюторов. Свяжитесь с нами, чтобы уточнить возможность поставки в ваш город."
            variant="distribution"
            compact
          />
        </ul>
      </div>
    </section>

    <ContactActionSection
      title-id="horeca-start-title"
      title="Начнём со знакомства"
      :href="sitePath('/kontakty/')"
      action-label="Обсудить поставку и дегустацию"
      action-title="Связаться с отделом продаж"
    >
      <p>
        Расскажите о своём заведении: в каком городе работаете, какие напитки ищете и какой формат поставки вам нужен.
      </p>
      <p>
        Обсудим ассортимент и оптовые цены. Перед поставкой подготовим выбранные напитки для дегустации в ПЭТ-бутылках.
      </p>
    </ContactActionSection>
  </div>
</template>

<style scoped>
.horeca-assortment {
  overflow: visible;
  z-index: 1;
}
</style>
