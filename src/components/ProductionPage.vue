<script setup>
import { onMounted } from 'vue'
import { sitePath } from '../utils/site-path'
import productionImageUrl from '../assets/production-meadery.png'
import CircleArrow from './CircleArrow.vue'

const ingredients = [
  {
    number: '01',
    title: 'Мёд и патока',
    text: 'Цветочный и гречишный мёд формируют основу напитка, а патока дополняет рецептуру.',
  },
  {
    number: '02',
    title: 'Фрукты и солод',
    text: 'Используем соки из ягод и фруктов, квасное сусло и солод.',
  },
  {
    number: '03',
    title: 'Травы и пряности',
    text: 'Подбираем сочетания для каждого сорта и добавляем их на этапе дображивания.',
  },
]

const processSteps = [
  {
    number: '01',
    title: 'Варка',
    text: 'Натуральные ингредиенты варятся в котле по рецептуре будущего напитка.',
  },
  {
    number: '02',
    title: 'Брожение',
    text: 'Полученное сусло охлаждается, поступает в отдельную ёмкость, после чего в него добавляются дрожжи.',
  },
  {
    number: '03',
    title: 'Дображивание',
    text: 'Сусло снимается с дрожжей и выдерживается в танке с травами и пряностями, которые формируют вкус сорта.',
  },
  {
    number: '04',
    title: 'Розлив',
    text: 'Через несколько недель готовый напиток отправляется на розлив и дальнейшую транспортировку.',
  },
]

const qualityPoints = [
  'Натуральное сырьё без добавления спирта',
  'Подготовленная вода',
  'Проверенные поставщики',
  'Контроль времени и температуры',
]

onMounted(() => {
  document.title = 'Производство «МЁДВЕДЬ» — традиционные рецептуры и современное оборудование'

  const description = document.querySelector('meta[name="description"]')
  description?.setAttribute(
    'content',
    'Как производят медовуху и сидр «МЁДВЕДЬ»: натуральное сырьё, брожение без добавления спирта и контроль качества на каждом этапе.',
  )
})
</script>

<template>
  <div>
    <section
      class="relative isolate min-h-svh overflow-hidden bg-foreground text-surface"
      data-header-theme="light"
      aria-labelledby="production-page-title"
    >
      <figure class="absolute inset-0 -z-1">
        <img
          class="size-full object-cover object-center"
          :src="productionImageUrl"
          alt="Медоваренное производство с медным варочным оборудованием"
        >
        <span class="absolute inset-0 bg-foreground/60" aria-hidden="true" />
        <span class="absolute inset-0 bg-linear-to-t from-foreground/85 via-transparent to-foreground/20" aria-hidden="true" />
        <span class="absolute inset-0 hidden bg-linear-to-r from-foreground/75 via-foreground/15 to-transparent nav:block" aria-hidden="true" />
      </figure>

      <div class="site-container relative z-2 grid min-h-svh grid-rows-[1fr_auto] pt-28 pb-8 sm:pt-32 sm:pb-12">
        <h1 id="production-page-title" class="max-w-6xl self-center font-display text-h1 uppercase">
          Варим<br>с характером
        </h1>

        <p class="max-w-xl text-body-large font-medium text-surface/80 nav:max-w-md">
          Воссоздаём рецептуры русских напитков в исторической солодовне, соединяя натуральное сырьё и современное оборудование.
        </p>
      </div>
    </section>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="production-history-title">
      <div class="site-container grid gap-12 nav:grid-cols-12 nav:gap-6">
        <div class="nav:col-span-4">
          <p class="font-display text-h1 text-brand">1874</p>
          <p class="mt-3 font-display text-h4 text-brand">1880</p>
          <p class="mt-4 text-label font-extrabold tracking-widest uppercase">Годы строительства</p>
        </div>

        <div class="nav:col-span-8">
          <h2 id="production-history-title" class="max-w-5xl font-display text-h2 uppercase">
            Исторический адрес производства
          </h2>
          <p class="mt-10 max-w-4xl text-body-large font-medium text-subtle">
            Производство расположено в бывшей солодовне завода Ивана Дурдина. На её восьмигранных трубах из красного кирпича сохранились медные инициалы «И. Д.» и даты строительства.
          </p>
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden bg-brand py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="production-ingredients-title">
      <span class="production-watermark pointer-events-none absolute -right-8 bottom-0 font-display uppercase" aria-hidden="true">Натурально</span>

      <div class="site-container relative">
        <div class="grid items-end gap-8 nav:grid-cols-12">
          <h2 id="production-ingredients-title" class="font-display text-h2 uppercase nav:col-span-8">
            Знакомые ингредиенты.<br>Честный состав.
          </h2>
          <p class="max-w-md text-body-large font-medium text-surface/75 nav:col-span-4">
            Медовуха и сидр проходят естественное брожение без добавления спирта.
          </p>
        </div>

        <ol class="mt-12 grid gap-4 sm:mt-16 nav:grid-cols-3">
          <li
            v-for="ingredient in ingredients"
            :key="ingredient.number"
            class="flex min-h-80 flex-col rounded-3xl bg-surface p-6 text-foreground sm:p-8 wide:min-h-96 wide:p-10"
          >
            <span class="text-label font-extrabold tracking-widest text-brand">{{ ingredient.number }}</span>
            <h3 class="mt-auto font-display text-h4 text-brand uppercase">{{ ingredient.title }}</h3>
            <p class="mt-5 max-w-sm text-body font-medium text-subtle">{{ ingredient.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="production-process-title">
      <div class="site-container">
        <div class="grid gap-8 nav:grid-cols-12">
          <h2 id="production-process-title" class="font-display text-h2 uppercase nav:col-span-8">
            Четыре этапа производства
          </h2>
        </div>

        <ol class="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 nav:grid-cols-4">
          <li
            v-for="step in processSteps"
            :key="step.number"
            class="group flex min-h-80 flex-col rounded-3xl bg-surface p-6 transition-colors duration-300 hover:bg-brand hover:text-surface sm:p-8 wide:min-h-96"
          >
            <span class="text-label font-extrabold tracking-widest text-brand transition-colors group-hover:text-surface">{{ step.number }}</span>
            <h3 class="mt-auto font-display text-h4 text-brand uppercase transition-colors group-hover:text-surface">{{ step.title }}</h3>
            <p class="mt-5 text-body font-medium text-subtle transition-colors group-hover:text-surface/75">{{ step.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="bg-foreground py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="production-quality-title">
      <div class="site-container grid gap-14 nav:grid-cols-12 nav:gap-6">
        <div class="nav:col-span-7">
          <h2 id="production-quality-title" class="max-w-4xl font-display text-h2 uppercase">
            За вкус отвечаем сами
          </h2>
          <p class="mt-8 max-w-2xl text-body-large font-medium text-surface/65">
            Не экономим на ингредиентах и соблюдаем технологические режимы. Весь ассортимент производится в соответствии с действующими требованиями ТР ТС.
          </p>
        </div>

        <ul class="border-t border-surface/30 nav:col-span-5 nav:self-end">
          <li v-for="point in qualityPoints" :key="point" class="flex items-center gap-4 border-b border-surface/30 py-5 text-body font-bold">
            <span class="size-2 shrink-0 rounded-full bg-surface" aria-hidden="true" />
            {{ point }}
          </li>
        </ul>
      </div>

      <div class="site-container mt-16 grid gap-4 sm:mt-20 nav:grid-cols-2">
        <a class="group flex min-h-64 flex-col rounded-3xl bg-brand p-6 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface sm:p-10" :href="sitePath('/katalog/')">
          <span class="text-label font-extrabold tracking-widest uppercase">Попробовать результат</span>
          <span class="mt-auto flex items-end justify-between gap-8">
            <span class="font-display text-h3 uppercase">В каталог</span>
            <CircleArrow hover="detail" size="action" tone="surface" />
          </span>
        </a>
        <a class="group flex min-h-64 flex-col rounded-3xl bg-surface p-6 text-foreground focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface sm:p-10" :href="sitePath('/kontakty/')">
          <span class="text-label font-extrabold tracking-widest text-brand uppercase">Вопросы и сотрудничество</span>
          <span class="mt-auto flex items-end justify-between gap-8">
            <span class="font-display text-h3 uppercase">Связаться</span>
            <CircleArrow hover="brand" size="action" />
          </span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.production-watermark {
  color: rgb(255 255 255 / 4%);
  font-size: clamp(6rem, 16vw, 15rem);
  line-height: 0.75;
}
</style>
