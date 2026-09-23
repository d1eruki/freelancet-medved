<script setup>
import { onMounted, ref } from 'vue'
import { vFitty } from '../directives/fitty'
import { sitePath } from '../utils/site-path'
import brewingImageUrl from '../assets/production-brewing.png'
import fermentationImageUrl from '../assets/production-fermentation.png'
import conditioningImageUrl from '../assets/production-conditioning.png'
import bottlingImageUrl from '../assets/production-bottling.png'
import ActionTile from './ActionTile.vue'
import NumberedInfoCard from './NumberedInfoCard.vue'
import PageHero from './PageHero.vue'
import ProductionProcessStep from './ProductionProcessStep.vue'

const ingredients = [
  {
    title: 'Мёд и патока',
    text: 'Цветочный и гречишный мёд формируют основу напитка, а патока дополняет рецептуру.',
    icons: ['hexagons'],
  },
  {
    title: 'Фрукты и солод',
    text: 'Используем соки из ягод и фруктов, квасное сусло и солод.',
    icons: ['apple', 'wheat'],
  },
  {
    title: 'Травы и пряности',
    text: 'Подбираем сочетания для каждого сорта и добавляем их на этапе дображивания.',
    icons: ['leaf'],
  },
]

const processSteps = [
  {
    number: '01',
    title: 'Варка',
    text: 'Натуральные ингредиенты варятся в котле по рецептуре будущего напитка.',
    image: brewingImageUrl,
  },
  {
    number: '02',
    title: 'Брожение',
    text: 'Полученное сусло охлаждается, поступает в отдельную ёмкость, после чего в него добавляются дрожжи.',
    image: fermentationImageUrl,
  },
  {
    number: '03',
    title: 'Дображивание',
    text: 'Сусло снимается с дрожжей и выдерживается в танке с травами и пряностями, которые формируют вкус сорта.',
    image: conditioningImageUrl,
  },
  {
    number: '04',
    title: 'Розлив',
    text: 'Через несколько недель готовый напиток отправляется на розлив и дальнейшую транспортировку.',
    image: bottlingImageUrl,
  },
]

const activeStepIndex = ref(0)
let lastSlideAt = 0
let touchStartY = null

function selectStep(index) {
  if (index < 0 || index >= processSteps.length || index === activeStepIndex.value) return
  activeStepIndex.value = index
  lastSlideAt = Date.now()
}

function handleProcessWheel(event) {
  if (!window.matchMedia('(min-width: 54rem)').matches || event.deltaY === 0) return

  const direction = Math.sign(event.deltaY)
  const nextIndex = activeStepIndex.value + direction
  if (nextIndex < 0 || nextIndex >= processSteps.length) {
    if (Date.now() - lastSlideAt < 750) event.preventDefault()
    return
  }

  event.preventDefault()
  if (Date.now() - lastSlideAt < 750) return
  selectStep(nextIndex)
}

function handleProcessTouchStart(event) {
  touchStartY = event.changedTouches[0]?.clientY ?? null
}

function handleProcessTouchEnd(event) {
  if (touchStartY === null) return
  const distance = touchStartY - (event.changedTouches[0]?.clientY ?? touchStartY)
  touchStartY = null
  if (Math.abs(distance) > 40) selectStep(activeStepIndex.value + Math.sign(distance))
}

function handleProcessKeydown(event) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  const nextIndex = activeStepIndex.value + (event.key === 'ArrowDown' ? 1 : -1)
  if (nextIndex < 0 || nextIndex >= processSteps.length) return
  event.preventDefault()
  selectStep(nextIndex)
}

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
    <PageHero title-id="production-page-title">
      <template #title>Варим<br>с душой</template>
      Воссоздаём рецептуры русских напитков в исторической солодовне, соединяя натуральное сырьё и современное оборудование.
    </PageHero>

    <section class="bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="production-history-title">
      <div class="site-container grid gap-12 nav:grid-cols-12 nav:gap-6">
        <div class="nav:col-span-4">
          <p class="font-display text-h1 text-brand">1874</p>
          <p class="mt-3 font-display text-h4 text-brand">1880</p>
          <p class="mt-4 text-label font-extrabold tracking-widest uppercase">Годы строительства</p>
        </div>

        <div class="nav:col-span-8">
          <h2 id="production-history-title" class="max-w-5xl font-display text-h2 uppercase">
            Завод с историей
          </h2>
          <p class="mt-10 max-w-4xl text-body-large font-medium text-subtle">
            Производство расположено в бывшей солодовне завода Ивана Дурдина. На её восьмигранных трубах из красного кирпича сохранились медные инициалы «И. Д.» и даты строительства.
          </p>
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden bg-brand py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="production-ingredients-title">
      <div class="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
        <span v-fitty class="production-watermark inline-block whitespace-nowrap font-display uppercase">Натурально</span>
      </div>

      <div class="site-container relative">
        <div class="grid items-end gap-8 nav:grid-cols-12">
          <h2 id="production-ingredients-title" class="font-display text-h2 uppercase nav:col-span-8">
            Честный состав.
          </h2>
          <p class="max-w-md text-body-large font-medium text-surface/75 nav:col-span-4">
            Медовуха и сидр проходят естественное брожение без добавления спирта.
          </p>
        </div>

        <ul class="mt-12 grid gap-4 sm:mt-16 nav:grid-cols-3">
          <NumberedInfoCard
            v-for="ingredient in ingredients"
            :key="ingredient.title"
            :title="ingredient.title"
            :text="ingredient.text"
            :icons="ingredient.icons"
            variant="ingredient"
          />
        </ul>
      </div>
    </section>

    <section
      class="bg-panel overflow-hidden py-20 text-foreground sm:py-24 nav:h-svh nav:py-8"
      data-header-theme="dark"
      aria-labelledby="production-process-title"
      @wheel="handleProcessWheel"
      @keydown="handleProcessKeydown"
    >
      <div class="site-container nav:grid nav:h-full nav:grid-cols-2 nav:gap-10">
        <div class="flex flex-col nav:justify-center">
          <h2 id="production-process-title" class="font-display text-h2 uppercase">
            Четыре этапа
          </h2>

          <ol class="mt-8 flex flex-col gap-6 nav:gap-8">
            <ProductionProcessStep
              v-for="(step, index) in processSteps"
              :key="step.number"
              :number="step.number"
              :title="step.title"
              :text="step.text"
              :active="index === activeStepIndex"
              @select="selectStep(index)"
            />
          </ol>
        </div>

        <div
          class="relative mt-12 h-96 overflow-hidden sm:mt-16 nav:mt-0 nav:h-full"
          @touchstart.passive="handleProcessTouchStart"
          @touchend.passive="handleProcessTouchEnd"
        >
          <img
            v-for="(step, index) in processSteps"
            :key="step.number"
            class="absolute inset-x-0 h-[70%] w-full object-cover transition-[top,opacity] duration-700 ease-in-out motion-reduce:transition-none"
            :class="Math.abs(index - activeStepIndex) > 1 ? 'opacity-0' : index === activeStepIndex ? 'opacity-100' : 'opacity-35'"
            :style="{ top: `${50 + (index - activeStepIndex) * 77}%`, transform: 'translateY(-50%)' }"
            :src="step.image"
            :alt="index === activeStepIndex ? `Иллюстрация этапа «${step.title}»` : ''"
            :loading="index === 0 ? 'eager' : 'lazy'"
          >
        </div>
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
        <ActionTile :href="sitePath('/katalog/')" label="Попробовать результат" title="В каталог" />
        <ActionTile :href="sitePath('/kontakty/')" label="Вопросы и сотрудничество" title="Связаться" tone="surface" />
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
