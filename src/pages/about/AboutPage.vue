<!-- Страница компании с историей, напитками и наградами. -->
<script setup>
import SiteImage from '../../components/site-image.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import aboutHeroBackground from '../../assets/heroes/about/background.png?responsive'
import SectionWatermark from '../../components/SectionWatermark.vue'
import { sitePath } from '../../utils/site-path'
import aboutCompanyImageUrl from '../../assets/about/about-company-enhanced.png'
import breweryBuildingUrl from '../../assets/about/brewery-building.jpg'
import awardInterfood2007Url from '../../assets/awards/award-interfood-2007.jpg'
import awardMedovukhaFest2016Url from '../../assets/awards/award-medovukha-fest-2016.jpg'
import awardNewProduct2007Url from '../../assets/awards/award-new-product-2007.jpg'
import awardMedovukhaFest2017ParticipantUrl from '../../assets/awards/award-medovukha-fest-2017-participant.jpg'
import awardMedovukhaFest2017TastingUrl from '../../assets/awards/award-medovukha-fest-2017-tasting.jpg'
import CircleArrow from '../../components/CircleArrow.vue'
import BaseButton from '../../components/BaseButton.vue'
import ContactActionSection from '../../components/contact-action-section.vue'
import AwardCard from './AwardCard.vue'
import PageHero from '../../components/PageHero.vue'
import CatalogCategoryCard from '../catalog/CatalogCategoryCard.vue'
import { catalogCategories } from '../../data/catalog.js'

const awardsTrack = ref(null)
const canScrollAwardsBack = ref(false)
const canScrollAwardsForward = ref(false)
let awardsResizeObserver

function updateAwardsNavigation() {
  const track = awardsTrack.value
  if (!track) return
  canScrollAwardsBack.value = track.scrollLeft > 2
  canScrollAwardsForward.value = track.scrollLeft < track.scrollWidth - track.clientWidth - 2
}

function scrollAwards(direction) {
  const track = awardsTrack.value
  const firstSlide = track?.firstElementChild
  if (!firstSlide) return
  const step = firstSlide.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap)
  track.scrollBy({
    left: direction * step,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}

function handleAwardsKeydown(event) {
  if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  scrollAwards(event.key === 'ArrowLeft' ? -1 : 1)
}

onMounted(() => {
  awardsResizeObserver = new ResizeObserver(updateAwardsNavigation)
  awardsResizeObserver.observe(awardsTrack.value)
  updateAwardsNavigation()
})

onBeforeUnmount(() => {
  awardsResizeObserver?.disconnect()
})


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

</script>

<template>
  <div>
    <PageHero
      title-id="about-page-title"
      :title-z-index="0"
      :image-url="aboutHeroBackground.src"
      image-alt="Мастер с медовыми сотами в петербургской мастерской"
      layer-entrance="foreground-first"
    >
      <template #title>Традиция<br>живёт здесь</template>
      <span class="wide:block wide:whitespace-nowrap">Петербургский производитель медовухи, </span>
      <span class="wide:block wide:whitespace-nowrap">сидра и пуаре с собственной историей, </span>
      <span class="wide:block wide:whitespace-nowrap">характером и узнаваемыми рецептами.</span>
    </PageHero>


    <section class="bg-surface pt-20 pb-20 text-foreground sm:pt-24 sm:pb-24 wide:pt-28 wide:pb-28" aria-labelledby="tradition-title">
      <div class="site-container grid gap-12 site-grid wide:gap-y-16">
        <div class="nav:col-span-12">
          <p class="font-display text-h1 text-brand uppercase">Медовуха</p>
          <p class="mt-3 text-label font-extrabold tracking-widest uppercase">Напиток с историей</p>
        </div>

        <div class="nav:col-span-12">
          <h2 id="tradition-title" class="font-display text-h2 uppercase">
            От княжеских дворов<br>до заводов Питера
          </h2>
          <div class="mt-6 grid gap-6 text-body-large font-medium text-subtle">
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

    <section class="relative min-h-svh overflow-hidden bg-brand pt-20 text-surface sm:pt-24 nav:pb-24 wide:py-28" aria-labelledby="durdin-title">
      <SectionWatermark text="Дурдин" />

      <div class="site-container relative z-10">
        <div class="grid gap-12 site-grid nav:gap-6">
          <div class="contents nav:block nav:col-span-5">
            <div class="nav:contents">
              <p class="font-display text-h1 text-surface">1874</p>
              <p class="mt-3 text-label font-extrabold tracking-widest uppercase">Солодовня на Обводном канале</p>
            </div>
            <SiteImage
              class="mt-10 block aspect-square w-full rounded-3xl object-cover"
              :src="breweryBuildingUrl"
              alt="Историческое кирпичное здание петербургского завода"
              decoding="async"
            />
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

    <section class="section-decorated bg-panel py-20 text-foreground sm:py-24 wide:py-28" aria-labelledby="today-title">
      <div class="site-container grid gap-4 site-grid">
        <figure class="relative min-h-120 overflow-hidden rounded-3xl nav:col-span-5 nav:min-h-160">
          <SiteImage width="1024" height="1536"
            class="absolute inset-0 size-full object-cover"
            :src="aboutCompanyImageUrl"
            alt="Напитки «МЁДВЕДЬ» в фирменных бокалах"
          />
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

    <section class="bg-brand py-20 text-surface sm:py-24 wide:py-28" aria-labelledby="products-title" aria-describedby="products-description">
      <div class="site-container">
        <h2 id="products-title" class="font-display text-h2 uppercase">Три категории</h2>
        <p id="products-description" class="mt-6 max-w-3xl text-body-large font-medium">Медовуха, сидр и пуаре — три характера напитков «МЁДВЕДЬ».</p>
        <ul class="mt-12 grid gap-4 text-foreground sm:mt-16 nav:grid-cols-3">
          <CatalogCategoryCard v-for="category in catalogCategories" :key="category.slug" :category="category" />
        </ul>
        <BaseButton class="mt-10" variant="surface" :href="sitePath('/katalog/')">Перейти в каталог</BaseButton>
      </div>
    </section>

    <section class="overflow-hidden bg-surface py-20 text-brand sm:py-24 wide:py-28" aria-labelledby="awards-title">
      <div class="site-container">
        <div class="flex flex-wrap items-end justify-between gap-10">
          <div class="flex max-w-4xl flex-col gap-6">
            <h2 id="awards-title" class="font-display text-h2 uppercase">Дело говорит<br>за себя</h2>
            <p class="max-w-xl text-body-large font-medium text-subtle">
              Качество продукции отмечено дипломами выставок и фестивалей напитков.
            </p>
          </div>
          <div class="flex gap-4" aria-label="Управление галереей дипломов">
            <button
              type="button"
              class="rounded-full transition-opacity focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-default disabled:opacity-30"
              aria-label="Предыдущий диплом"
              aria-controls="awards-track"
              :disabled="!canScrollAwardsBack"
              @click="scrollAwards(-1)"
            >
              <CircleArrow direction="left" />
            </button>
            <button
              type="button"
              class="rounded-full transition-opacity focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-default disabled:opacity-30"
              aria-label="Следующий диплом"
              aria-controls="awards-track"
              :disabled="!canScrollAwardsForward"
              @click="scrollAwards(1)"
            >
              <CircleArrow />
            </button>
          </div>
        </div>

        <ul
          id="awards-track"
          ref="awardsTrack"
          class="mt-12 ml-[calc(50%-50vw)] flex w-screen snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto overscroll-x-contain px-4 py-3 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-brand sm:mt-16 sm:scroll-px-[max(24px,calc((100vw-1480px)/2+24px))] sm:gap-8 sm:px-[max(24px,calc((100vw-1480px)/2+24px))] [&::-webkit-scrollbar]:hidden"
          tabindex="0"
          aria-label="Дипломы и награды"
          data-lenis-prevent-touch
          @scroll.passive="updateAwardsNavigation"
          @keydown="handleAwardsKeydown"
        >
          <AwardCard
            v-for="award in awards"
            :key="`${award.year}-${award.title}`"
            :award="award"
          />
        </ul>
      </div>
    </section>

    <ContactActionSection
      title-id="partnership-title"
      title="Работаем с теми, кто знает толк"
      :href="sitePath('/kontakty/')"
      action-label="Начать сотрудничество"
      action-title="Связаться"
    >
      <p>
        Поставляем напитки оптом в многооборотных кегах и одноразовой ПЭТ-таре. Доставляем по Санкт-Петербургу и Ленинградской области, работаем с региональными дистрибьюторами.
      </p>
    </ContactActionSection>
  </div>
</template>
