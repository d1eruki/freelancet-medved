<script setup>
import { onMounted } from 'vue'
import SectionWatermark from './SectionWatermark.vue'
import { sitePath } from '../utils/site-path'
import aboutCompanyImageUrl from '../assets/about-company.jpg'
import awardInterfood2007Url from '../assets/award-interfood-2007.jpg'
import awardMedovukhaFest2016Url from '../assets/award-medovukha-fest-2016.jpg'
import awardNewProduct2007Url from '../assets/award-new-product-2007.jpg'
import awardMedovukhaFest2017ParticipantUrl from '../assets/award-medovukha-fest-2017-participant.jpg'
import awardMedovukhaFest2017TastingUrl from '../assets/award-medovukha-fest-2017-tasting.jpg'
import CircleArrow from './CircleArrow.vue'
import ActionTile from './ActionTile.vue'
import AwardCard from './AwardCard.vue'
import NumberedInfoCard from './NumberedInfoCard.vue'
import PageHero from './PageHero.vue'
import { catalogCategories } from '../data/catalog'

const productGroups = catalogCategories.map((category) => ({
  title: category.name,
  text: category.description,
}))

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
    'История пиво-медоваренного завода «МЁДВЕДЬ»: традиции Ивана Дурдина, развитие компании, ассортимент и награды.',
  )
})
</script>

<template>
  <div>
    <PageHero title-id="about-page-title">
      <template #title>Традиция<br>живёт здесь</template>
      Петербургский производитель медовухи, сидра и пуаре с собственной историей, характером и узнаваемыми рецептами.
    </PageHero>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="tradition-title">
      <div class="site-container grid gap-12 nav:grid-cols-12 nav:gap-6">
        <div class="nav:col-span-4">
          <p class="font-display text-h1 text-brand uppercase">Мёд</p>
          <p class="mt-3 text-label font-extrabold tracking-widest uppercase">Напиток с историей</p>
        </div>

        <div class="nav:col-span-8">
          <h2 id="tradition-title" class="font-display text-h2 uppercase">
            От княжеских дворов до заводов Питера
          </h2>
          <div class="mt-6 grid gap-6 text-body-large font-medium text-subtle sm:grid-cols-2">
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
      <SectionWatermark text="Дурдин" />

      <div class="site-container relative z-10">
        <div class="grid gap-12 nav:grid-cols-12 nav:gap-6">
          <div class="nav:col-span-5">
            <p class="font-display text-h1 text-surface">1874</p>
            <p class="mt-3 text-label font-extrabold tracking-widest uppercase">Солодовня на Обводном канале</p>
          </div>

          <div class="nav:col-span-7">
            <h2 id="durdin-title" class="max-w-4xl font-display text-h2 uppercase">
              Наследие Ивана Дурдина
            </h2>
            <p class="mt-6 max-w-3xl text-body-large font-medium text-surface/75">
              Товарищество пиво-медоваренного завода Ивана Дурдина входило в число лидеров дореволюционной индустрии Петербурга. Предприятие выпускало сортовое пиво и несколько видов мёда, разливало их в фирменные бутылки и развозило собственными подводами.
            </p>

            <div class="mt-10 grid gap-4 sm:grid-cols-2">
              <article class="rounded-3xl bg-surface p-6 text-foreground sm:p-8">
                <p class="font-display text-h4 text-brand uppercase">Имперский герб</p>
                <p class="mt-6 text-body font-medium text-subtle">Завод получил право изображать герб Российской империи на этикетках.</p>
              </article>
              <article class="rounded-3xl border border-surface/30 bg-brand p-6 sm:p-8">
                <p class="font-display text-h4 text-surface uppercase">100 лошадей</p>
                <p class="mt-6 text-body font-medium text-surface/70">Собственная служба доставки развозила продукцию по городу на грузовых подводах.</p>
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
            <h2 id="today-title" class="max-w-4xl font-display text-h2 uppercase">
            Сегодня здесь варит «МЁДВЕДЬ»
          </h2>
          <div class="mt-6 grid gap-6 text-body-large font-medium text-subtle sm:grid-cols-2">
            <p>
              Товарищество пиво-медоваренного завода «МЁДВЕДЬ» начало работу в 2006 году и продолжило петербургскую традицию медоварения под собственной маркой.
            </p>
            <p>
              Сегодня развиваем ассортимент и экспериментируем со вкусами, соединяя историческую основу с предпочтениями современных покупателей.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="products-title">
      <div class="site-container">
        <div class="grid gap-8 nav:grid-cols-12">
          <h2 id="products-title" class="font-display text-h2 uppercase nav:col-span-8">Три категории</h2>
        </div>

        <div class="mt-12 grid gap-4 sm:mt-16 nav:grid-cols-3">
          <NumberedInfoCard
            v-for="group in productGroups"
            :key="group.title"
            :title="group.title"
            :text="group.text"
            variant="group"
          />
        </div>

        <a class="group mt-10 inline-flex items-center gap-5 text-label font-extrabold tracking-wide uppercase" :href="sitePath('/katalog/')">
          <span class="secondary-action py-3">Перейти в каталог</span>
          <CircleArrow hover="brand" size="action" />
        </a>
      </div>
    </section>

    <section class="overflow-hidden bg-brand py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="awards-title">
      <div class="site-container">
        <div class="grid items-end gap-6 nav:grid-cols-12 nav:gap-8">
          <h2 id="awards-title" class="font-display text-h2 uppercase nav:col-span-8">Дело говорит<br>за себя</h2>
          <p class="max-w-md text-body-large font-medium text-surface/75 nav:col-span-4">
            Качество продукции отмечено дипломами выставок и фестивалей медовухи.
          </p>
        </div>

        <ul class="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 nav:grid-cols-12">
          <AwardCard
            v-for="(award, index) in awards"
            :key="`${award.year}-${award.title}`"
            :award="award"
            :wide="index > 2"
          />
        </ul>
      </div>
    </section>

    <section class="bg-foreground py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="partnership-title">
      <div class="site-container">
        <div class="grid gap-6 nav:grid-cols-12">
          <div class="nav:col-span-7">
            <h2 id="partnership-title" class="max-w-5xl font-display text-h2 uppercase">Работаем с теми, кто знает толк</h2>
          </div>
          <p class="max-w-xl text-body-large font-medium text-surface/65 nav:col-span-5 nav:self-end">
            Поставляем напитки оптом в многооборотных кегах и одноразовой ПЭТ-таре. Доставляем по Санкт-Петербургу и Ленинградской области, работаем с региональными дистрибьюторами.
          </p>
        </div>

        <div class="mt-12 sm:mt-16">
          <ActionTile :href="sitePath('/kontakty/')" label="Начать сотрудничество" title="Связаться" />
        </div>
      </div>
    </section>
  </div>
</template>
