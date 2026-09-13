<script setup>
import { onMounted } from 'vue'
import { sitePath } from '../utils/site-path'
import aboutCompanyImageUrl from '../assets/about-company.jpg'
import productionImageUrl from '../assets/production-meadery.png'
import awardInterfood2007Url from '../assets/award-interfood-2007.jpg'
import awardMedovukhaFest2016Url from '../assets/award-medovukha-fest-2016.jpg'
import awardNewProduct2007Url from '../assets/award-new-product-2007.jpg'
import awardMedovukhaFest2017ParticipantUrl from '../assets/award-medovukha-fest-2017-participant.jpg'
import awardMedovukhaFest2017TastingUrl from '../assets/award-medovukha-fest-2017-tasting.jpg'
import CircleArrow from './CircleArrow.vue'

const ingredients = [
  'Гречишный и цветочный мёд',
  'Яблочный и ягодные соки',
  'Имбирный корень и пряности',
]

const productGroups = [
  {
    title: 'Медовуха',
    text: 'Светлые, тёмные, ягодные и пряные сорта под маркой «МЁДВЕДЬ».',
  },
  {
    title: 'Сидр',
    text: '«ДЖИНДЖЕР ХОРС», «КОРК СПИРИТ» и «МЭРИОН».',
  },
  {
    title: 'Пуаре',
    text: 'Грушевый напиток «ВАЛЕНТАЙН».',
  },
]

const awards = [
  {
    year: '2007',
    title: 'Золотая медаль «Интерфуд»',
    text: 'Лучшая продовольственная продукция.',
    image: awardInterfood2007Url,
  },
  {
    year: '2007',
    title: 'Новая продукция Петербурга',
    text: 'Смотр-конкурс «Лучшая продовольственная продукция».',
    image: awardNewProduct2007Url,
  },
  {
    year: '2016',
    title: 'Народная дегустация',
    text: 'Потребительский конкурс «Медовуха Fest».',
    image: awardMedovukhaFest2016Url,
  },
  {
    year: '2017',
    title: 'Участник «Медовуха Fest»',
    text: 'За активное участие в гастрономическом фестивале.',
    image: awardMedovukhaFest2017ParticipantUrl,
  },
  {
    year: '2017',
    title: 'Народная дегустация',
    text: 'Потребительский конкурс «Медовуха Fest».',
    image: awardMedovukhaFest2017TastingUrl,
  },
]

onMounted(() => {
  document.title = 'О компании «МЁДВЕДЬ» — петербургская традиция медоварения'

  const description = document.querySelector('meta[name="description"]')
  description?.setAttribute(
    'content',
    'История пиво-медоваренного завода «МЁДВЕДЬ»: традиции Ивана Дурдина, современное производство, ассортимент и награды.',
  )
})
</script>

<template>
  <div>
    <section
      class="relative isolate min-h-svh overflow-hidden bg-foreground text-surface"
      data-header-theme="light"
      aria-labelledby="about-page-title"
    >
      <div class="site-container grid min-h-svh items-end gap-10 pt-28 pb-8 sm:pt-36 sm:pb-12 nav:grid-cols-12 nav:items-center nav:gap-6">
        <div class="relative z-2 nav:col-span-7 nav:pt-16">
          <p class="mb-6 text-label font-extrabold tracking-widest text-brand-strong uppercase">
            Санкт-Петербург · с 2006 года
          </p>
          <h1 id="about-page-title" class="max-w-5xl font-display text-h1 uppercase">
            Традиция<br>живёт здесь
          </h1>
          <p class="mt-8 max-w-xl text-body-large font-medium text-surface/70 sm:mt-10">
            Продолжаем петербургскую историю медоварения в стенах бывшей солодовни завода Ивана Дурдина.
          </p>
        </div>

        <figure class="relative z-1 min-h-104 overflow-hidden rounded-3xl sm:min-h-136 nav:col-span-5 nav:min-h-160">
          <img
            class="absolute inset-0 size-full object-cover"
            :src="productionImageUrl"
            alt="Медоваренное производство с медным варочным оборудованием"
          >
          <span class="absolute inset-0 bg-linear-to-t from-foreground/80 via-transparent to-transparent" aria-hidden="true" />
          <figcaption class="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-5 sm:right-8 sm:bottom-8 sm:left-8">
            <span class="max-w-64 text-label font-bold tracking-wide uppercase">Товарищество пиво-медоваренного завода «МЁДВЕДЬ»</span>
            <span class="font-display text-h4 text-brand-strong">2006</span>
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="tradition-title">
      <div class="site-container grid gap-12 nav:grid-cols-12 nav:gap-6">
        <div class="nav:col-span-4">
          <p class="font-display text-h1 text-brand uppercase">Мёд</p>
          <p class="mt-3 text-label font-extrabold tracking-widest uppercase">Напиток с историей</p>
        </div>

        <div class="nav:col-span-8">
          <h2 id="tradition-title" class="max-w-5xl font-display text-h2 uppercase">
            От княжеских дворов до петербургских заводов
          </h2>
          <div class="mt-10 grid gap-6 text-body-large font-medium text-subtle sm:grid-cols-2">
            <p>
              На Руси медовые напитки варили и в крестьянских избах, и на княжеских дворах. Ими встречали дружины и отмечали народные праздники.
            </p>
            <p>
              Традиция пережила распространение государственных кабаков, а с началом индустриальной эпохи медовые напитки снова стали заметной частью городской культуры.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden bg-brand py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="durdin-title">
      <span class="about-watermark pointer-events-none absolute -right-8 bottom-0 font-display uppercase" aria-hidden="true">Дурдин</span>

      <div class="site-container relative">
        <div class="grid gap-12 nav:grid-cols-12 nav:gap-6">
          <div class="nav:col-span-5">
            <p class="font-display text-h1 text-brand-strong">1874</p>
            <p class="mt-3 text-label font-extrabold tracking-widest uppercase">Солодовня на Обводном канале</p>
          </div>

          <div class="nav:col-span-7">
            <h2 id="durdin-title" class="max-w-4xl font-display text-h2 uppercase">
              Наследие Ивана Дурдина
            </h2>
            <p class="mt-10 max-w-3xl text-body-large font-medium text-surface/75">
              Товарищество пиво-медоваренного завода Ивана Дурдина входило в число лидеров дореволюционной индустрии Петербурга. Предприятие выпускало сортовое пиво и несколько видов мёда, разливало их в фирменные бутылки и развозило собственными подводами.
            </p>

            <div class="mt-12 grid gap-4 sm:grid-cols-2">
              <article class="rounded-3xl bg-surface p-6 text-foreground sm:p-8">
                <p class="font-display text-h4 text-brand-strong uppercase">Имперский герб</p>
                <p class="mt-5 text-body font-medium text-subtle">Завод получил право изображать герб Российской империи на этикетках.</p>
              </article>
              <article class="rounded-3xl border border-surface/30 p-6 sm:p-8">
                <p class="font-display text-h4 text-brand-strong uppercase">100 лошадей</p>
                <p class="mt-5 text-body font-medium text-surface/70">Собственная служба доставки развозила продукцию по городу на грузовых подводах.</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-panel py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="today-title">
      <div class="site-container grid gap-4 nav:grid-cols-12">
        <figure class="relative min-h-120 overflow-hidden rounded-3xl nav:col-span-5 nav:min-h-160">
          <img
            class="absolute inset-0 size-full object-cover"
            :src="aboutCompanyImageUrl"
            alt="Напитки «МЁДВЕДЬ» в фирменных бокалах"
          >
          <span class="absolute inset-0 bg-linear-to-t from-foreground/75 via-transparent to-transparent" aria-hidden="true" />
          <figcaption class="absolute right-6 bottom-6 left-6 text-label font-extrabold tracking-widest text-surface uppercase sm:right-8 sm:bottom-8 sm:left-8">
            Петербургский характер
          </figcaption>
        </figure>

        <article class="flex min-h-120 flex-col rounded-3xl bg-surface p-6 sm:p-8 nav:col-span-7 nav:min-h-160 wide:p-12">
          <p class="text-label font-extrabold tracking-widest text-brand-strong uppercase">Традиция продолжается</p>
          <h2 id="today-title" class="mt-8 max-w-4xl font-display text-h2 uppercase">
            Сегодня здесь варит «МЁДВЕДЬ»
          </h2>
          <div class="mt-auto grid gap-6 pt-12 text-body-large font-medium text-subtle sm:grid-cols-2">
            <p>
              Наше производство расположено в здании бывшей солодовни Дурдина. В память о традициях предшественников мы продолжаем варить напитки на основе мёда.
            </p>
            <p>
              С 2006 года развиваем ассортимент и экспериментируем со вкусами, соединяя историческую основу с предпочтениями современных покупателей.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="bg-foreground py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="ingredients-title">
      <div class="site-container">
        <div class="grid items-end gap-8 nav:grid-cols-12">
          <h2 id="ingredients-title" class="font-display text-h2 uppercase nav:col-span-8">
            Знакомый состав.<br>Свой характер.
          </h2>
          <p class="max-w-md text-body-large font-medium text-surface/65 nav:col-span-4">
            В основе рецептур — натуральные ингредиенты. Брожение происходит без добавления спирта.
          </p>
        </div>

        <ul class="mt-12 grid gap-4 sm:mt-16 nav:grid-cols-3">
          <li
            v-for="(ingredient, index) in ingredients"
            :key="ingredient"
            class="flex min-h-64 flex-col rounded-3xl border border-surface/20 p-6 sm:p-8"
          >
            <span class="text-label font-extrabold tracking-widest text-brand-strong">0{{ index + 1 }}</span>
            <p class="mt-auto font-display text-h4 uppercase">{{ ingredient }}</p>
          </li>
        </ul>

      </div>
    </section>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="products-title">
      <div class="site-container">
        <div class="grid gap-8 nav:grid-cols-12">
          <p class="text-label font-extrabold tracking-widest text-brand-strong uppercase nav:col-span-4">Что производим</p>
          <h2 id="products-title" class="font-display text-h2 uppercase nav:col-span-8">Три направления</h2>
        </div>

        <div class="mt-12 grid gap-4 sm:mt-16 nav:grid-cols-3">
          <article
            v-for="(group, index) in productGroups"
            :key="group.title"
            class="group flex min-h-80 flex-col rounded-3xl bg-panel p-6 transition-colors duration-300 hover:bg-brand hover:text-surface sm:p-8 wide:min-h-96 wide:p-10"
          >
            <span class="text-label font-extrabold tracking-widest text-brand-strong">0{{ index + 1 }}</span>
            <h3 class="mt-auto font-display text-h4 text-brand uppercase transition-colors group-hover:text-surface">{{ group.title }}</h3>
            <p class="mt-5 text-body font-medium text-subtle transition-colors group-hover:text-surface/70">{{ group.text }}</p>
          </article>
        </div>

        <a class="group mt-10 inline-flex items-center gap-5 text-label font-extrabold tracking-wide uppercase" :href="sitePath('/katalog/')">
          <span class="secondary-action py-3">Перейти в каталог</span>
          <CircleArrow hover="brand" size="action" />
        </a>
      </div>
    </section>

    <section class="overflow-hidden bg-brand-strong py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="awards-title">
      <div class="site-container">
        <div class="grid items-end gap-8 nav:grid-cols-12">
          <h2 id="awards-title" class="font-display text-h2 uppercase nav:col-span-8">Дело говорит<br>за себя</h2>
          <p class="max-w-md text-body-large font-medium text-surface/75 nav:col-span-4">
            Качество продукции отмечено дипломами выставок и фестивалей медовухи.
          </p>
        </div>

        <ul class="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 nav:grid-cols-12">
          <li
            v-for="(award, index) in awards"
            :key="`${award.year}-${award.title}`"
            class="group overflow-hidden rounded-3xl bg-surface text-foreground nav:col-span-4"
            :class="{ 'nav:col-span-6': index > 2 }"
          >
            <a class="block h-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface" :href="award.image" target="_blank" rel="noopener">
              <figure class="flex h-full min-h-120 flex-col">
                <div class="h-72 overflow-hidden bg-panel p-5 sm:h-80 sm:p-7">
                  <img
                    class="size-full object-contain transition duration-500 group-hover:scale-105"
                    :src="award.image"
                    :alt="`Диплом: ${award.title}, ${award.year} год`"
                    loading="lazy"
                  >
                </div>
                <figcaption class="flex flex-1 items-start justify-between gap-6 p-6 sm:p-8">
                  <span>
                    <span class="block font-display text-h4 text-brand uppercase">{{ award.title }}</span>
                    <span class="mt-4 block text-body font-medium text-subtle">{{ award.text }}</span>
                  </span>
                  <span class="font-display text-h4 text-brand-strong">{{ award.year }}</span>
                </figcaption>
              </figure>
            </a>
          </li>
        </ul>
      </div>
    </section>

    <section class="bg-foreground py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="partnership-title">
      <div class="site-container">
        <div class="grid gap-12 nav:grid-cols-12 nav:gap-6">
          <div class="nav:col-span-7">
            <p class="text-label font-extrabold tracking-widest text-brand-strong uppercase">Из Петербурга — в регионы</p>
            <h2 id="partnership-title" class="mt-8 max-w-5xl font-display text-h2 uppercase">Работаем с теми, кто знает толк</h2>
          </div>
          <p class="max-w-xl text-body-large font-medium text-surface/65 nav:col-span-5 nav:self-end">
            Поставляем напитки оптом в многооборотных кегах и одноразовой ПЭТ-таре. Доставляем по Санкт-Петербургу и Ленинградской области, работаем с региональными дистрибьюторами.
          </p>
        </div>

        <div class="mt-16 grid gap-4 nav:grid-cols-2">
          <a class="group flex min-h-64 flex-col rounded-3xl bg-brand p-6 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface sm:p-10" :href="sitePath('/partnery/')">
            <span class="text-label font-extrabold tracking-widest uppercase">Найти продукцию</span>
            <span class="mt-auto flex items-end justify-between gap-8">
              <span class="font-display text-h3 uppercase">Где купить</span>
              <CircleArrow hover="detail" size="action" tone="surface" />
            </span>
          </a>
          <a class="group flex min-h-64 flex-col rounded-3xl bg-surface p-6 text-foreground focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface sm:p-10" :href="sitePath('/kontakty/')">
            <span class="text-label font-extrabold tracking-widest text-brand-strong uppercase">Обсудить сотрудничество</span>
            <span class="mt-auto flex items-end justify-between gap-8">
              <span class="font-display text-h3 uppercase">Связаться</span>
              <CircleArrow hover="brand" size="action" />
            </span>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-watermark {
  color: rgb(255 255 255 / 4%);
  font-size: clamp(7rem, 19vw, 18rem);
  line-height: 0.75;
}
</style>
