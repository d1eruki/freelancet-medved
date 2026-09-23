<script setup>
import { computed, onMounted, ref } from 'vue'
import CircleArrow from './CircleArrow.vue'
import ActionTile from './ActionTile.vue'
import PageHero from './PageHero.vue'
import PartnerCard from './PartnerCard.vue'
import SectionWatermark from './SectionWatermark.vue'
import { partnerCities, partners } from '../data/partners'
import { sitePath } from '../utils/site-path'
import partnersHeroUrl from '../assets/partners-hero.png'

const allCitiesLabel = 'Все города'
const selectedCity = ref(allCitiesLabel)

const visiblePartners = computed(() => {
  if (selectedCity.value === allCitiesLabel) {
    return partners
  }

  return partners.filter((partner) => partner.city === selectedCity.value)
})

const pointCountLabel = computed(() => {
  const count = visiblePartners.value.length

  if (count % 10 === 1 && count % 100 !== 11) {
    return `${count} точка продажи`
  }

  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return `${count} точки продажи`
  }

  return `${count} точек продаж`
})

onMounted(() => {
  document.title = 'Где купить медовуху и сидр «МЁДВЕДЬ»'

  const description = document.querySelector('meta[name="description"]')
  description?.setAttribute(
    'content',
    'Где купить напитки «МЁДВЕДЬ» в Санкт-Петербурге и регионах: адреса и телефоны точек продаж и дистрибьюторов.',
  )
})
</script>

<template>
  <div>
    <PageHero
      title-id="partners-page-title"
      :image-url="partnersHeroUrl"
      image-alt="Напитки в бутылках и бокале на стойке магазина"
    >
      <template #title>Где купить<br>«Мёдведь»</template>
      Ищите нашу медовуху, сидр и пуаре у региональных партнёров — в бутылках, кегах и в розлив.
    </PageHero>

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="partners-list-title">
      <div class="site-container">
        <div class="grid items-end gap-6 nav:grid-cols-12 nav:gap-8">
          <div class="nav:col-span-8">
            <h2 id="partners-list-title" class="font-display text-h2 uppercase">Выберите город</h2>
          </div>
          <p class="max-w-md text-body-large font-medium text-subtle nav:col-span-4">
            Актуальные точки продаж и контакты региональных дистрибьюторов.
          </p>
        </div>

        <fieldset class="mt-12 sm:mt-16">
          <legend class="sr-only">Фильтр точек продаж по городу</legend>
          <div class="flex flex-wrap gap-2 sm:gap-3">
            <button
              v-for="city in [allCitiesLabel, ...partnerCities]"
              :key="city"
              class="min-h-12 rounded-full border px-5 py-3 text-label font-extrabold tracking-wide uppercase transition duration-200 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-6"
              :class="selectedCity === city
                ? 'border-brand bg-brand text-surface'
                : 'border-foreground/20 bg-surface text-foreground hover:border-brand hover:text-brand'"
              type="button"
              :aria-pressed="selectedCity === city"
              @click="selectedCity = city"
            >
              {{ city }}
            </button>
          </div>
        </fieldset>

        <p class="mt-10 text-label font-extrabold tracking-widest text-brand uppercase" role="status" aria-live="polite">
          {{ pointCountLabel }}
        </p>

        <ul v-if="visiblePartners.length" class="mt-6 grid gap-4 sm:grid-cols-2 nav:grid-cols-3">
          <PartnerCard v-for="partner in visiblePartners" :key="`${partner.city}-${partner.name}`" :partner="partner" />
        </ul>

        <div v-else class="mt-6 rounded-3xl bg-surface p-8 sm:p-12">
          <p class="font-display text-h4 uppercase">В этом городе пока нет указанных точек продаж</p>
          <p class="mt-6 max-w-2xl text-body-large font-medium text-subtle">
            Свяжитесь с отделом продаж — подскажем ближайшую точку или условия поставки.
          </p>
          <a class="group mt-10 inline-flex items-center gap-5 text-label font-extrabold tracking-wide uppercase" :href="sitePath('/kontakty/')">
            <span class="secondary-action py-3">Открыть контакты</span>
            <CircleArrow hover="brand" size="action" />
          </a>
        </div>
      </div>
    </section>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="regional-title">
      <div class="site-container">
        <h2 id="regional-title" class="font-display text-h2 break-words hyphens-auto uppercase">
          Петербургский характер в разных городах
        </h2>

        <div class="mt-12 grid gap-10 nav:grid-cols-2 nav:gap-6">
          <div>
            <p class="font-display text-h1 text-brand uppercase">Рядом</p>
            <p class="mt-3 text-label font-extrabold tracking-widest uppercase">От Калининграда до Сыктывкара</p>
          </div>

          <div class="grid gap-6 text-body-large font-medium text-subtle">
            <p>
              Благодаря региональным партнёрам напитки производства Товарищества пиво-медоваренного завода «МЁДВЕДЬ» разливают в пабах и ресторанах за пределами Петербурга.
            </p>
            <p>
              Медовуху и фирменные сидры можно найти в отделах крафтового пива и специализированных магазинах — в бутылках и в розлив.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section
      class="relative overflow-hidden border-t border-surface/20 bg-foreground py-20 text-surface sm:py-24 wide:py-28"
      data-header-theme="light"
      aria-labelledby="distribution-third-title"
    >
      <SectionWatermark text="Вместе" />

      <div class="site-container relative z-10">
        <h2 id="distribution-third-title" class="font-display text-h2 break-words hyphens-auto uppercase">Стать дистрибьютором</h2>

        <div class="mt-12 grid gap-10 sm:mt-16 nav:grid-cols-12 nav:gap-6">
          <div class="flex flex-col gap-10 nav:col-span-5">
            <div class="grid gap-6">
              <p class="text-body-large font-medium text-surface/75">
                Открыты новым контактам и готовы обсудить поставки и оптовые цены.
              </p>
              <p class="text-body-large font-medium text-surface/75">
                Для поставки доступны все сорта медовухи, сидра и пуаре. Перед поставкой подготовим выбранные напитки для дегустации в ПЭТ-бутылках.
              </p>
            </div>

            <p class="mt-auto text-label font-medium text-surface/60">
              Компания не предлагает и не продаёт алкоголь лицам младше 18 лет. ООО «ФАРТ СПБ» оставляет за собой право отказать в сотрудничестве, если оно нарушает действующие договоры с дистрибьюторами.
            </p>
          </div>

          <ActionTile
            class="nav:col-span-7"
            :href="sitePath('/kontakty/')"
            label="Образцы для дегустации"
            title="Связаться с отделом продаж"
            compact
          />
        </div>
      </div>
    </section>
  </div>
</template>
