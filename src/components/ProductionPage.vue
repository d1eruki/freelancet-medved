<script setup>
import { sitePath } from '../utils/site-path'
import productionImageUrl from '../assets/production-meadery.png'
import CircleArrow from './CircleArrow.vue'

const ingredients = [
  {
    number: '01',
    title: 'Мёд',
    text: 'Цветочный и гречишный мёд создают плотную основу и узнаваемый характер напитка.',
  },
  {
    number: '02',
    title: 'Фрукты и ягоды',
    text: 'Используем яблочный сок, ягоды и фрукты для естественного вкуса и аромата.',
  },
  {
    number: '03',
    title: 'Травы и пряности',
    text: 'Подбираем добавки для каждого сорта и вносим их во время дображивания.',
  },
]

const processSteps = [
  {
    title: 'Варим',
    text: 'Соединяем натуральные ингредиенты и варим сусло по рецептуре напитка.',
  },
  {
    title: 'Охлаждаем',
    text: 'Охлаждаем сусло, перекачиваем его в ёмкость для брожения и добавляем дрожжи.',
  },
  {
    title: 'Выдерживаем',
    text: 'Снимаем напиток с дрожжей и отправляем на дображивание с травами и пряностями.',
  },
  {
    title: 'Разливаем',
    text: 'Через несколько недель готовый напиток отправляется на розлив и доставку.',
  },
]

const qualityPoints = [
  'Натуральное сырьё без добавления спирта',
  'Подготовленная вода',
  'Проверенные поставщики',
  'Контроль времени и температуры',
]
</script>

<template>
  <div>
    <section
      class="relative isolate min-h-svh overflow-hidden bg-foreground text-surface"
      data-header-theme="light"
      aria-labelledby="production-title"
    >
      <div class="site-container grid min-h-svh items-end gap-10 pt-28 pb-8 sm:pt-36 sm:pb-12 nav:grid-cols-12 nav:items-center nav:gap-6">
        <div class="relative z-2 nav:col-span-7 nav:pt-16">
          <h1 id="production-title" class="max-w-5xl font-display text-h1 uppercase">
            Варим<br>с характером
          </h1>
          <p class="mt-8 max-w-xl text-body-large font-medium text-surface/70 sm:mt-10">
            Воссоздаём русские напитки из мёда, фруктов, ягод и пряностей — бережно к традиции и точно в современном производстве.
          </p>
        </div>

        <figure class="relative z-1 min-h-104 overflow-hidden rounded-3xl sm:min-h-136 nav:col-span-5 nav:min-h-160">
          <img
            class="absolute inset-0 size-full object-cover"
            :src="productionImageUrl"
            alt="Медоваренное производство с медным варочным оборудованием"
          >
          <span class="absolute inset-0 bg-linear-to-t from-foreground/70 via-transparent to-transparent" aria-hidden="true" />
          <figcaption class="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-6 sm:right-8 sm:bottom-8 sm:left-8">
            <span class="max-w-60 text-label font-bold tracking-wide uppercase">Пиво-медоваренный завод «Мёдведь»</span>
            <span class="font-display text-h4 text-brand">2006</span>
          </figcaption>
        </figure>
      </div>

    </section>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="history-title">
      <div class="site-container grid gap-12 nav:grid-cols-12 nav:gap-6">
        <div class="nav:col-span-5">
          <p class="font-display text-h1 text-brand uppercase">1874</p>
          <p class="mt-2 text-label font-bold tracking-wider uppercase">Петербург</p>
        </div>

        <div class="nav:col-span-7">
          <h2 id="history-title" class="max-w-4xl font-display text-h2 uppercase">
            В стенах солодовни Дурдина
          </h2>
          <div class="mt-10 grid gap-6 text-body-large font-medium text-subtle sm:grid-cols-2">
            <p>
              Производство находится в историческом здании солодовни завода Ивана Дурдина — одном из памятников дореволюционной пиво-медоваренной индустрии.
            </p>
            <p>
              На восьмигранных кирпичных трубах сохранились литые инициалы и годы строительства. Здесь и сегодня пахнет мёдом, солодом и спелыми яблоками.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden bg-brand py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="ingredients-title">
      <div class="site-container">
        <div class="grid items-end gap-8 nav:grid-cols-12">
          <h2 id="ingredients-title" class="font-display text-h2 uppercase nav:col-span-8">
            Основа — натуральное сырьё
          </h2>
          <p class="max-w-md text-body-large font-medium text-surface/70 nav:col-span-4">
            Следуем аутентичным рецептурам и не добавляем спирт в готовые напитки.
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

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="process-title">
      <div class="site-container">
        <div class="grid gap-8 nav:grid-cols-12">
          <p class="text-label font-extrabold tracking-widest text-brand uppercase nav:col-span-4">От котла до розлива</p>
          <h2 id="process-title" class="font-display text-h2 uppercase nav:col-span-8">
            Четыре этапа производства
          </h2>
        </div>

        <ol class="mt-12 border-t border-foreground/30 sm:mt-16">
          <li
            v-for="step in processSteps"
            :key="step.title"
            class="group grid gap-5 border-b border-foreground/30 py-8 sm:grid-cols-12 sm:items-center sm:gap-6 sm:py-10"
          >
            <h3 class="font-display text-h4 uppercase transition-colors duration-200 group-hover:text-brand sm:col-span-6">{{ step.title }}</h3>
            <p class="max-w-2xl text-body-large font-medium text-subtle sm:col-span-6">{{ step.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="relative isolate overflow-hidden bg-foreground py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="quality-title">
      <div class="site-container grid gap-14 nav:grid-cols-12 nav:gap-6">
        <div class="nav:col-span-7">
          <h2 id="quality-title" class="max-w-4xl font-display text-h2 uppercase">
            За вкус отвечаем сами
          </h2>
          <p class="mt-8 max-w-2xl text-body-large font-medium text-surface/65">
            Следим за сырьём, временем и температурой на каждом этапе. Весь ассортимент производится в соответствии с действующими требованиями ТР ТС.
          </p>
        </div>

        <ul class="border-t border-surface/30 nav:col-span-5 nav:self-end">
          <li v-for="point in qualityPoints" :key="point" class="flex items-center gap-4 border-b border-surface/30 py-5 text-body font-bold">
            <span class="size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            {{ point }}
          </li>
        </ul>
      </div>

      <div class="site-container mt-16 sm:mt-20">
        <a
          class="group flex flex-col gap-8 rounded-3xl bg-brand p-6 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface sm:flex-row sm:items-end sm:justify-between sm:p-10 wide:p-12"
          :href="sitePath('/#products')"
        >
          <span>
            <span class="block text-label font-extrabold tracking-widest uppercase">Попробовать результат</span>
            <span class="mt-4 block font-display text-h3 uppercase">Перейти к продукции</span>
          </span>
          <CircleArrow hover="detail" size="action" tone="surface" />
        </a>
      </div>
    </section>
  </div>
</template>
