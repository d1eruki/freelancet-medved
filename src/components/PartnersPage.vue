<script setup>
import { computed, onMounted, ref } from 'vue'
import CircleArrow from './CircleArrow.vue'
import { partnerCities, partners } from '../data/partners'
import { sitePath } from '../utils/site-path'

const allCitiesLabel = 'Все города'
const selectedCity = ref(allCitiesLabel)

const distributionProducts = [
  {
    number: '01',
    title: 'Медовуха',
    text: 'Семь сортов медовухи «МЁДВЕДЬ».',
  },
  {
    number: '02',
    title: 'Сидр',
    text: '«ДЖИНДЖЕР ХОРС», «КОРК СПИРИТ» и «МЭРИОН».',
  },
  {
    number: '03',
    title: 'Пуаре',
    text: 'Грушевый напиток «ВАЛЕНТАЙН».',
  },
]

const visiblePartners = computed(() => {
  if (selectedCity.value === allCitiesLabel) {
    return partners
  }

  return partners.filter((partner) => partner.city === selectedCity.value)
})

function getRouteUrl(partner) {
  const destination = `Россия, г. ${partner.city}, ${partner.address}`

  return `https://yandex.ru/maps/?mode=routes&rtext=~${encodeURIComponent(destination)}&rtt=auto`
}

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
    <section
      class="relative isolate min-h-svh overflow-hidden bg-foreground text-surface"
      data-header-theme="light"
      aria-labelledby="partners-page-title"
    >
      <div class="site-container grid min-h-svh items-end gap-12 pt-28 pb-8 sm:pt-36 sm:pb-12 nav:grid-cols-12 nav:items-center nav:gap-6">
        <div class="relative z-2 nav:col-span-8 nav:pt-16">
          <h1 id="partners-page-title" class="max-w-6xl font-display text-h1 uppercase">
            Где купить<br>«Мёдведь»
          </h1>
          <p class="mt-8 max-w-2xl text-body-large font-medium text-surface/70 sm:mt-10">
            Ищите нашу медовуху, сидр и пуаре у региональных партнёров — в бутылках, кегах и в розлив.
          </p>
        </div>

        <div class="relative hidden min-h-112 nav:col-span-4 nav:block" aria-hidden="true">
          <span class="absolute top-4 right-0 grid size-64 place-items-center rounded-full border border-surface/40 font-display text-h3 uppercase wide:size-80">
            Где
          </span>
          <span class="absolute right-24 bottom-0 grid size-56 place-items-center rounded-full bg-brand font-display text-h3 uppercase wide:size-64">
            Купить
          </span>
          <span class="absolute right-2 bottom-16 size-5 rounded-full bg-surface" />
        </div>
      </div>
    </section>

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="partners-list-title">
      <div class="site-container">
        <div class="grid items-end gap-8 nav:grid-cols-12">
          <div class="nav:col-span-8">
            <h2 id="partners-list-title" class="font-display text-h2 uppercase">Выберите город</h2>
          </div>
          <p class="max-w-md text-body-large font-medium text-subtle nav:col-span-4">
            Актуальные точки продаж и контакты региональных дистрибьюторов.
          </p>
        </div>

        <fieldset class="mt-10 sm:mt-14">
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

        <ul v-if="visiblePartners.length" class="mt-5 grid gap-4 sm:grid-cols-2 nav:grid-cols-3">
          <li v-for="partner in visiblePartners" :key="`${partner.city}-${partner.name}`">
            <article class="flex h-full min-h-80 flex-col rounded-3xl bg-surface p-6 sm:p-8 wide:min-h-88">
              <p class="text-caption font-extrabold tracking-widest text-brand uppercase">{{ partner.city }}</p>
              <h3 class="mt-6 font-display text-h4 uppercase">
                <span class="mr-2 font-body text-body font-extrabold text-subtle">{{ partner.legalForm }}</span>
                {{ partner.name }}
              </h3>

              <div class="mt-auto pt-10">
                <address class="text-body font-medium text-subtle not-italic">{{ partner.address }}</address>

                <a
                  v-if="partner.phone"
                  class="secondary-action mt-5 inline-flex py-2 text-body font-extrabold text-brand"
                  :href="partner.phoneHref"
                >
                  {{ partner.phone }}
                </a>

                <ul v-if="partner.metro" class="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  <li
                    v-for="station in partner.metro"
                    :key="station.name"
                    class="flex items-center gap-2 text-label font-semibold text-subtle"
                    :aria-label="`${station.name}, ${station.line}`"
                  >
                    <span class="size-2 rounded-full" :style="{ backgroundColor: station.color }" aria-hidden="true" />
                    <span aria-hidden="true">{{ station.name }}</span>
                  </li>
                </ul>

                <a
                  class="group mt-8 flex items-center justify-between gap-5 border-t border-foreground/15 pt-6 text-label font-extrabold tracking-wide uppercase focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
                  :href="getRouteUrl(partner)"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`Построить маршрут до ${partner.legalForm} ${partner.name}`"
                >
                  <span class="secondary-action py-3">Построить маршрут</span>
                  <CircleArrow hover="brand" />
                </a>
              </div>
            </article>
          </li>
        </ul>

        <div v-else class="mt-5 rounded-3xl bg-surface p-8 sm:p-12">
          <p class="font-display text-h4 uppercase">В этом городе пока нет указанных точек продаж</p>
          <p class="mt-5 max-w-2xl text-body-large font-medium text-subtle">
            Свяжитесь с отделом продаж — подскажем ближайшую точку или условия поставки.
          </p>
          <a class="group mt-8 inline-flex items-center gap-5 text-label font-extrabold tracking-wide uppercase" :href="sitePath('/kontakty/')">
            <span class="secondary-action py-3">Связаться</span>
            <CircleArrow hover="brand" size="action" />
          </a>
        </div>
      </div>
    </section>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="regional-title">
      <div class="site-container grid gap-12 nav:grid-cols-12 nav:gap-6">
        <div class="nav:col-span-4">
          <p class="font-display text-h1 text-brand uppercase">Рядом</p>
          <p class="mt-3 text-label font-extrabold tracking-widest uppercase">От Калининграда до Сыктывкара</p>
        </div>

        <div class="nav:col-span-8">
          <h2 id="regional-title" class="max-w-5xl font-display text-h2 uppercase">
            Петербургский характер в разных городах
          </h2>
          <div class="mt-10 grid gap-6 text-body-large font-medium text-subtle sm:grid-cols-2">
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

    <section class="relative overflow-hidden bg-foreground py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="distribution-title">
      <span class="partners-watermark pointer-events-none absolute -right-8 bottom-0 font-display uppercase" aria-hidden="true">Вместе</span>

      <div class="site-container relative">
        <div class="grid items-end gap-8 nav:grid-cols-12">
          <div class="nav:col-span-8">
            <h2 id="distribution-title" class="font-display text-h2 uppercase">Стать дистрибьютором</h2>
          </div>
          <p class="max-w-md text-body-large font-medium text-surface/75 nav:col-span-4">
            Открыты новым контактам и готовы обсудить поставки, оптовые цены и дегустационные образцы.
          </p>
        </div>

        <article class="mt-16 sm:mt-20">
          <p class="text-label font-extrabold tracking-widest text-surface uppercase">Начало сотрудничества</p>
          <h3 class="mt-8 max-w-6xl font-display text-h3 uppercase">
            Тестовые <span class="text-brand">ПЭТ</span> образцы
          </h3>
          <p class="mt-8 max-w-3xl text-body-large font-medium text-surface/75">
            Перед первой поставкой можно заказать тестовые образцы интересующих напитков. Подготовим выбранные сорта медовухи, сидра и пуаре в ПЭТ-бутылках для дегустации.
          </p>
        </article>

        <ul class="mt-12 grid gap-4 sm:mt-16 nav:grid-cols-3">
          <li
            v-for="product in distributionProducts"
            :key="product.number"
            class="flex min-h-72 flex-col rounded-3xl bg-surface p-6 text-foreground sm:p-8 wide:min-h-80"
          >
            <span class="text-label font-extrabold tracking-widest text-brand">{{ product.number }}</span>
            <h3 class="mt-auto font-display text-h4 text-brand uppercase">{{ product.title }}</h3>
            <p class="mt-5 text-body font-medium text-subtle">{{ product.text }}</p>
          </li>
        </ul>

        <div class="mt-12 grid gap-8 border-t border-surface/40 pt-10 nav:grid-cols-12">
          <p class="max-w-3xl text-body font-medium text-surface/75 nav:col-span-7">
            Компания не предлагает и не продаёт алкоголь лицам младше 18 лет. ООО «ФАРТ СПБ» оставляет за собой право отказать в сотрудничестве, если оно нарушает действующие договоры с дистрибьюторами.
          </p>
          <a class="group flex items-center justify-between gap-6 nav:col-span-5 nav:justify-self-stretch" :href="sitePath('/kontakty/')">
            <span class="secondary-action py-3 font-display text-h4 uppercase">Запросить образцы</span>
            <CircleArrow hover="detail" size="action" tone="surface" />
          </a>
        </div>
      </div>
    </section>

    <section
      class="relative overflow-hidden border-t border-surface/20 bg-foreground py-20 text-surface sm:py-24 wide:py-28"
      data-header-theme="light"
      aria-labelledby="distribution-example-title"
    >
      <span class="partners-watermark pointer-events-none absolute -right-8 bottom-0 font-display uppercase" aria-hidden="true">Вместе</span>

      <div class="site-container relative">
        <div class="grid items-end gap-8 nav:grid-cols-12">
          <div class="nav:col-span-8">
            <h2 id="distribution-example-title" class="font-display text-h2 uppercase">Стать дистрибьютором</h2>
          </div>
          <p class="max-w-md text-body-large font-medium text-surface/75 nav:col-span-4">
            Открыты новым контактам и готовы обсудить поставки и оптовые цены.
          </p>
        </div>

        <article class="mt-16 grid gap-10 border-y border-surface/30 py-10 sm:mt-20 sm:py-12 nav:grid-cols-12 nav:items-end">
          <div class="nav:col-span-8">
            <h3 class="max-w-6xl font-display text-h3 uppercase">
              Тестовые <span class="text-brand">ПЭТ</span> образцы
            </h3>
            <p class="mt-7 max-w-3xl text-body-large font-medium text-surface/75">
              Перед первой поставкой можно заказать выбранные сорта медовухи, сидра и пуаре в ПЭТ-бутылках для дегустации.
            </p>
          </div>
          <a class="group flex items-center justify-between gap-6 nav:col-span-4 nav:justify-self-stretch" :href="sitePath('/kontakty/')">
            <span class="secondary-action py-3 font-display text-h4 uppercase">Запросить образцы</span>
            <CircleArrow hover="detail" size="action" tone="surface" />
          </a>
        </article>

        <ul class="mt-8 grid gap-4 nav:grid-cols-3">
          <li
            v-for="product in distributionProducts"
            :key="`example-${product.number}`"
            class="flex min-h-56 flex-col rounded-3xl bg-surface p-6 text-foreground sm:p-8 wide:min-h-64"
          >
            <span class="text-label font-extrabold tracking-widest text-brand">{{ product.number }}</span>
            <h3 class="mt-auto font-display text-h4 text-brand uppercase">{{ product.title }}</h3>
            <p class="mt-5 text-body font-medium text-subtle">{{ product.text }}</p>
          </li>
        </ul>

        <p class="mt-10 max-w-5xl text-label font-medium text-surface/60">
          Компания не предлагает и не продаёт алкоголь лицам младше 18 лет. ООО «ФАРТ СПБ» оставляет за собой право отказать в сотрудничестве, если оно нарушает действующие договоры с дистрибьюторами.
        </p>
      </div>
    </section>

    <section
      class="relative overflow-hidden border-t border-surface/20 bg-foreground py-20 text-surface sm:py-24 wide:py-28"
      data-header-theme="light"
      aria-labelledby="distribution-third-title"
    >
      <span class="partners-watermark pointer-events-none absolute -right-8 bottom-0 font-display uppercase" aria-hidden="true">Вместе</span>

      <div class="site-container relative">
        <div class="grid items-end gap-8 nav:grid-cols-12">
          <h2 id="distribution-third-title" class="font-display text-h2 uppercase nav:col-span-8">Стать дистрибьютором</h2>
          <p class="max-w-md text-body-large font-medium text-surface/75 nav:col-span-4">
            Открыты новым контактам и готовы обсудить поставки и оптовые цены.
          </p>
        </div>

        <div class="mt-14 grid gap-5 border-t border-surface/30 pt-8 sm:mt-16 sm:pt-10 nav:grid-cols-12">
          <p class="text-body-large font-extrabold tracking-wide uppercase nav:col-span-4">
            Тестовые <span class="text-brand">ПЭТ</span>-образцы
          </p>
          <p class="max-w-3xl text-body-large font-medium text-surface/75 nav:col-span-8">
            Перед первой поставкой можно заказать выбранные сорта медовухи, сидра и пуаре в ПЭТ-бутылках для дегустации.
          </p>
        </div>

        <ul class="mt-10 grid gap-4 nav:grid-cols-3">
          <li
            v-for="product in distributionProducts"
            :key="`third-${product.number}`"
            class="flex min-h-56 flex-col rounded-3xl bg-surface p-6 text-foreground sm:p-8 wide:min-h-64"
          >
            <span class="text-label font-extrabold tracking-widest text-brand">{{ product.number }}</span>
            <h3 class="mt-auto font-display text-h4 text-brand uppercase">{{ product.title }}</h3>
            <p class="mt-5 text-body font-medium text-subtle">{{ product.text }}</p>
          </li>
        </ul>

        <a
          class="group mt-4 flex min-h-44 flex-col rounded-3xl bg-brand p-6 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface sm:p-8 nav:min-h-52 wide:p-10"
          :href="sitePath('/kontakty/')"
        >
          <span class="text-label font-extrabold tracking-widest uppercase">Первый шаг к сотрудничеству</span>
          <span class="mt-auto flex items-end justify-between gap-8">
            <span class="font-display text-h3 uppercase">Заказать образцы</span>
            <CircleArrow hover="detail" size="action" tone="surface" />
          </span>
        </a>

        <p class="mt-8 max-w-5xl text-label font-medium text-surface/60">
          Компания не предлагает и не продаёт алкоголь лицам младше 18 лет. ООО «ФАРТ СПБ» оставляет за собой право отказать в сотрудничестве, если оно нарушает действующие договоры с дистрибьюторами.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.partners-watermark {
  color: rgb(255 255 255 / 4%);
  font-size: clamp(7rem, 19vw, 18rem);
  line-height: 0.75;
}
</style>
