<script setup>
import horecaHeroForeground from '../../assets/heroes/horeca/foreground.png?responsive'
import horecaHeroMiddle from '../../assets/heroes/horeca/middle.png?responsive'
import horecaHeroBackground from '../../assets/heroes/horeca/background.png?responsive'
import PageHero from '../PageHero.vue'
import HeroDivider from '../HeroDivider.vue'
import ActionTile from '../ActionTile.vue'
import NumberedInfoCard from '../NumberedInfoCard.vue'
import CatalogCategoryCard from '../catalog/CatalogCategoryCard.vue'
import { catalogCategories } from '../../data/catalog'
import { sitePath } from '../../utils/site-path'
import horecaDividerUrl from '../../assets/heroes/horeca/divider.png'

const horecaHeroLayout = {
  background: { mobile: { scale: 1, x: 0, y: 0 }, desktop: { scale: 1, x: 0, y: 0 } },
  middle: { mobile: { scale: 1, x: 0, y: 0 }, desktop: { scale: 1, x: 50, y: 100 } },
  foreground: { mobile: { scale: 1, x: 0, y: 0 }, desktop: { scale: 1, x: 100, y: 0 } },
}
const horecaHeroSteam = { fit: 'cover', anchorX: 0.71, anchorY: 0.2, scaleDivisor: 3500 }

const horecaHeroLayers = {
  background: {
    ...horecaHeroBackground,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
    alt: 'Старинный бар с деревянными полками, бутылками и хмелем',
  },
  middle: {
    ...horecaHeroMiddle,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
  },
  foreground: {
    ...horecaHeroForeground,
    sizes: '100vw',
    className: 'absolute inset-0 size-full object-cover object-center',
  },
}
</script>

<template>
  <div>
    <PageHero
      title-id="horeca-page-title"
      :title-z-index="0"
      :layers="horecaHeroLayers"
      :layer-layout="horecaHeroLayout"
      :steam="horecaHeroSteam"
    >
      <template #title>Для ваших<br>гостей</template>
      <span class="wide:block wide:whitespace-nowrap">Мид, сидр и пуаре «МЁДВЕДЬ» </span>
      <span class="wide:block wide:whitespace-nowrap">для баров и ресторанов. Поставляем напитки оптом </span>
      <span class="wide:block wide:whitespace-nowrap">в многооборотных кегах и одноразовой ПЭТ-таре.</span>
    </PageHero>

    <HeroDivider :image-url="horecaDividerUrl" />

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="horeca-assortment-title">
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

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="horeca-formats-title">
      <div class="site-container">
        <div class="grid items-end gap-6 site-grid nav:gap-8">
          <h2 id="horeca-formats-title" class="font-display text-h2 break-words hyphens-auto uppercase nav:col-span-8">Напитки в нужном<br>формате</h2>
          <p class="max-w-md text-body-large font-medium text-subtle nav:col-span-4">
            Поставляем оптом. Формат тары и ассортимент согласуем при обсуждении заказа.
          </p>
        </div>

        <dl class="mt-12 grid gap-10 border-t border-foreground/15 pt-10 sm:mt-16 site-grid nav:gap-8">
          <div class="nav:col-span-6">
            <dt class="font-display text-h3 text-brand uppercase">Многооборотные кеги</dt>
            <dd class="mt-6 max-w-xl text-body-large font-medium text-subtle">
              Мид, сидр и пуаре для подачи в розлив. Доступные сорта и условия работы с многооборотной тарой уточните в отделе продаж.
            </dd>
          </div>
          <div class="nav:col-span-6">
            <dt class="font-display text-h3 text-brand uppercase">Одноразовая ПЭТ-тара</dt>
            <dd class="mt-6 max-w-xl text-body-large font-medium text-subtle">
              Другой формат оптовой поставки — по согласованию с покупателем. Для знакомства с напитками подготовим выбранные сорта в ПЭТ-бутылках для дегустации.
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="horeca-delivery-title">
      <div class="site-container">
        <h2 id="horeca-delivery-title" class="font-display text-h2 break-words hyphens-auto uppercase">Из Петербурга<br>к вашим гостям</h2>
        <p class="mt-6 max-w-2xl text-body-large font-medium text-subtle">
          В Петербурге и области доставляем сами, в других регионах работаем с дистрибьюторами.
        </p>

        <ul class="mt-12 grid gap-4 sm:mt-16 site-grid">
          <NumberedInfoCard
            class="nav:col-span-6"
            title="Санкт-Петербург и область"
            text="Доставляем напитки собственным транспортом. Адрес заведения и детали поставки обсудите с отделом продаж."
            variant="distribution"
            compact
          />
          <NumberedInfoCard
            class="nav:col-span-6"
            title="Другие регионы"
            text="Работаем через региональных дистрибьюторов. Свяжитесь с нами, чтобы уточнить возможность поставки в ваш город."
            variant="distribution"
            compact
          />
        </ul>
      </div>
    </section>

    <section class="bg-foreground py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="horeca-start-title">
      <div class="site-container">
        <h2 id="horeca-start-title" class="font-display text-h2 break-words hyphens-auto uppercase">Начнём со знакомства</h2>
        <div class="mt-12 grid gap-10 sm:mt-16 site-grid nav:gap-6">
          <div class="grid content-start gap-6 nav:col-span-5">
            <p class="text-body-large font-medium text-surface/85">
              Расскажите о своём заведении: в каком городе работаете, какие напитки ищете и какой формат поставки вам нужен.
            </p>
            <p class="text-body-large font-medium text-surface/85">
              Обсудим ассортимент и оптовые цены. Перед поставкой подготовим выбранные напитки для дегустации в ПЭТ-бутылках.
            </p>
          </div>
          <ActionTile
            class="nav:col-span-7"
            :href="sitePath('/kontakty/')"
            label="Обсудить поставку и дегустацию"
            title="Связаться с отделом продаж"
            compact
          />
        </div>
      </div>
    </section>
  </div>
</template>
