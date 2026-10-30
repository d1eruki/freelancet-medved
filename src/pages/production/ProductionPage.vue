<!-- Страница производства с ингредиентами и этапами изготовления напитков. -->
<script setup>
import SiteImage from '../../components/site-image.vue'
import { ref, watch } from 'vue'
import CircleArrow from '../../components/CircleArrow.vue'
import { vFitty } from '../../directives/fitty.js'
import Snap from 'lenis/snap'
import { sitePath } from '../../utils/site-path'
import brewingImageUrl from '../../assets/production/production-brewing.png'
import fermentationImageUrl from '../../assets/production/production-fermentation.png'
import conditioningImageUrl from '../../assets/production/production-conditioning.png'
import bottlingImageUrl from '../../assets/production/production-bottling.png'
import productionHeroBackgroundUrl from '../../assets/home/production-photo.png'
import ActionTile from '../../components/ActionTile.vue'
import InfoCard from '../../components/InfoCard.vue'
import PageHero from '../../components/PageHero.vue'
import ProductionProcessStep from './ProductionProcessStep.vue'

const ingredients = [
  {
    title: 'Основа медовухи',
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
const processNavigation = [
  { direction: -1, label: 'Предыдущий этап' },
  { direction: 1, label: 'Следующий этап' },
]
const processScrollSection = ref(null)
const processStepList = ref(null)
let touchStart = null
const desktopProcess = typeof window === 'undefined'
  ? { matches: false, addEventListener() {}, removeEventListener() {} }
  : window.matchMedia('(min-width: 54rem)')

const props = defineProps({
  lenis: { type: Object, default: null },
})

function getProcessStart() {
  const section = processScrollSection.value
  return section ? section.getBoundingClientRect().top + window.scrollY : 0
}

function getStepDistance() {
  const section = processScrollSection.value
  return section ? Math.max(0, section.offsetHeight - window.innerHeight) / processSteps.length : 0
}

function getStepPosition(index) {
  return getProcessStart() + getStepDistance() * index
}

function selectStep(index) {
  if (index < 0 || index >= processSteps.length) return
  if (desktopProcess.matches && props.lenis) {
    props.lenis.scrollTo(getStepPosition(index))
  } else {
    activeStepIndex.value = index
  }
}

function handleProcessTouchStart(event) {
  if (desktopProcess.matches && processStepList.value?.contains(event.target)) {
    touchStart = null
    return
  }
  const touch = event.changedTouches[0]
  touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null
}

function handleProcessTouchEnd(event) {
  if (!touchStart) return
  const touch = event.changedTouches[0]
  const distanceX = touchStart.x - (touch?.clientX ?? touchStart.x)
  const distanceY = touchStart.y - (touch?.clientY ?? touchStart.y)
  touchStart = null
  const distance = desktopProcess.matches ? distanceY : distanceX
  if (Math.abs(distance) > 40 && (desktopProcess.matches || Math.abs(distanceX) > Math.abs(distanceY))) {
    selectStep(activeStepIndex.value + Math.sign(distance))
  }
}

function handleProcessKeydown(event) {
  const nextKey = desktopProcess.matches ? 'ArrowDown' : 'ArrowRight'
  const previousKey = desktopProcess.matches ? 'ArrowUp' : 'ArrowLeft'
  if (event.key !== nextKey && event.key !== previousKey) return
  const nextIndex = activeStepIndex.value + (event.key === nextKey ? 1 : -1)
  if (nextIndex < 0 || nextIndex >= processSteps.length) return
  event.preventDefault()
  selectStep(nextIndex)
}

watch(() => props.lenis, (lenis, _previous, onCleanup) => {
  if (!lenis) return

  const snap = new Snap(lenis, {
    type: 'proximity',
    distanceThreshold: '35%',
    debounce: 180,
  })
  let removeSnapPoints = []

  function updateActiveStep() {
    if (!desktopProcess.matches) return
    const stepDistance = getStepDistance()
    if (!stepDistance) return
    const progress = (lenis.scroll - getProcessStart()) / stepDistance
    activeStepIndex.value = Math.max(0, Math.min(processSteps.length - 1, Math.floor(progress + 0.05)))
  }

  function refreshSnapPoints() {
    removeSnapPoints.forEach((remove) => remove())
    removeSnapPoints = []

    if (desktopProcess.matches && getStepDistance()) {
      removeSnapPoints = processSteps.map((_step, index) => snap.add(getStepPosition(index)))
      snap.start()
      updateActiveStep()
    } else {
      snap.stop()
    }
  }

  const stopListening = lenis.on('scroll', updateActiveStep)
  const resizeObserver = new ResizeObserver(refreshSnapPoints)
  resizeObserver.observe(document.body)
  desktopProcess.addEventListener('change', refreshSnapPoints)
  window.addEventListener('resize', refreshSnapPoints)
  refreshSnapPoints()

  onCleanup(() => {
    stopListening()
    resizeObserver.disconnect()
    desktopProcess.removeEventListener('change', refreshSnapPoints)
    window.removeEventListener('resize', refreshSnapPoints)
    removeSnapPoints.forEach((remove) => remove())
    snap.destroy()
  })
}, { immediate: true })

const qualityPoints = [
  'Натуральное сырьё без добавления спирта',
  'Подготовленная вода',
  'Проверенные поставщики',
  'Контроль времени и температуры',
]

</script>

<template>
  <div>
    <PageHero
      title-id="production-page-title"
      content-align="center"
      :image-url="productionHeroBackgroundUrl"
      layer-entrance="split-slide"
    >
      <template #title>Варим<br>с душой</template>
      <span class="wide:block wide:whitespace-nowrap">Воссоздаём рецептуры русских напитков </span>
      <span class="wide:block wide:whitespace-nowrap">в исторической солодовне, соединяя </span>
      <span class="wide:block wide:whitespace-nowrap">натуральное сырьё и современное оборудование.</span>
    </PageHero>


    <section class="bg-surface pt-20 pb-28 text-foreground sm:pt-24 sm:pb-32 wide:pt-28 wide:pb-40" aria-labelledby="production-history-title">
      <div class="site-container grid gap-12 site-grid nav:gap-6">
        <div class="order-2 nav:order-1 nav:col-span-4">
          <div class="nav:hidden">
            <p v-fitty class="font-display text-h1 whitespace-nowrap text-brand">1874 — 1880</p>
          </div>
          <div class="hidden nav:block">
            <p class="font-display text-h1 text-brand">1874</p>
            <p class="mt-3 font-display text-h4 text-brand">1880</p>
          </div>
          <p class="mt-4 text-label font-extrabold tracking-widest uppercase">Годы строительства</p>
        </div>

        <div class="order-1 nav:order-2 nav:col-span-8">
          <h2 id="production-history-title" class="max-w-5xl font-display text-h2 uppercase">
            Завод с историей
          </h2>
          <p class="mt-6 max-w-4xl text-body-large font-medium text-subtle">
            Производство расположено в бывшей солодовне завода Ивана Дурдина. На её восьмигранных трубах из красного кирпича сохранились медные инициалы «И. Д.» и даты строительства.
          </p>
        </div>
      </div>
    </section>

    <section class="relative flex min-h-svh items-center overflow-hidden bg-brand py-20 text-surface sm:py-24 wide:py-28" aria-labelledby="production-ingredients-title">
      <div class="site-container relative z-10 grid site-grid">
        <div class="nav:col-span-12">
        <div class="grid items-end gap-6 site-grid nav:gap-8">
          <h2 id="production-ingredients-title" class="font-display text-h2 uppercase nav:col-span-8">
            Честный состав
          </h2>
          <p class="max-w-md text-body-large font-medium text-surface/75 nav:col-span-4">
            Медовуха и сидр проходят естественное брожение без добавления спирта.
          </p>
        </div>

        <ul class="mt-12 grid gap-4 sm:mt-16 site-grid">
          <InfoCard
            v-for="ingredient in ingredients"
            :key="ingredient.title"
            class="nav:col-span-4"
            :title="ingredient.title"
            :text="ingredient.text"
            :icons="ingredient.icons"
            variant="ingredient"
          />
        </ul>
        </div>
      </div>
    </section>

    <div ref="processScrollSection" class="nav:h-[400svh]">
      <div class="nav:sticky nav:top-0 nav:h-svh">
        <section
          class="production-process section-decorated bg-panel overflow-hidden py-20 text-foreground sm:py-24 nav:h-full nav:overflow-visible nav:py-8"
          aria-labelledby="production-process-title"
          @keydown="handleProcessKeydown"
        >
          <div
            class="site-container nav:grid nav:h-full nav:grid-cols-2 nav:gap-10"
            @touchstart.passive="handleProcessTouchStart"
            @touchend.passive="handleProcessTouchEnd"
            @touchcancel.passive="touchStart = null"
          >
            <div class="flex flex-col touch-pan-y nav:justify-center">
              <h2 id="production-process-title" class="font-display text-h2 uppercase">
                Четыре этапа
              </h2>

              <ol ref="processStepList" class="mt-12 flex gap-10 py-2 sm:mt-16 nav:mt-8 nav:flex-col nav:gap-8 nav:py-0">
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

              <p
                id="production-step-description"
                class="mt-6 max-w-3xl text-body font-medium text-subtle nav:hidden"
                aria-live="polite"
                aria-atomic="true"
              >{{ processSteps[activeStepIndex].text }}</p>
            </div>

            <div
              id="production-step-images"
              class="relative mt-10 aspect-[4/3] overflow-hidden touch-pan-y nav:mt-0 nav:aspect-auto nav:h-full nav:overflow-visible nav:touch-auto"
            >
              <SiteImage
                v-for="(step, index) in processSteps"
                :key="step.number"
                class="absolute left-0 top-1/2 h-full w-full -translate-y-1/2 translate-x-[calc(var(--step-offset)*110%)] object-contain transition-[translate,opacity] duration-700 ease-in-out motion-reduce:transition-none nav:top-[calc(50%_+_var(--step-offset)*77%)] nav:h-[70%] nav:translate-x-0 nav:object-cover nav:transition-[top,opacity]"
                :class="Math.abs(index - activeStepIndex) > 1 ? 'opacity-0' : index === activeStepIndex ? 'opacity-100' : 'opacity-35'"
                :style="{ '--step-offset': index - activeStepIndex }"
                :src="step.image"
                :alt="index === activeStepIndex ? `Иллюстрация этапа «${step.title}»` : ''"
              />
            </div>

            <div class="mt-10 grid w-full grid-cols-[3rem_1fr_3rem] items-center gap-4 nav:hidden" role="group" aria-label="Переключение этапов производства">
              <span class="col-start-2 row-start-1 text-center text-label font-extrabold text-subtle" aria-live="polite" aria-atomic="true">
                {{ processSteps[activeStepIndex].number }} / {{ processSteps.length.toString().padStart(2, '0') }}
              </span>
              <button
                v-for="control in processNavigation"
                :key="control.direction"
                type="button"
                class="row-start-1 rounded-full transition-opacity disabled:cursor-default disabled:opacity-30 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
                :class="control.direction === -1 ? 'col-start-1' : 'col-start-3'"
                :aria-label="control.label"
                aria-controls="production-step-description production-step-images"
                :disabled="activeStepIndex + control.direction < 0 || activeStepIndex + control.direction >= processSteps.length"
                @click="selectStep(activeStepIndex + control.direction)"
              >
                <CircleArrow :direction="control.direction === -1 ? 'left' : 'right'" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <section class="bg-foreground py-20 text-surface sm:py-24 wide:py-28" aria-labelledby="production-quality-title">
      <div class="site-container grid gap-12 site-grid nav:gap-6">
        <div class="nav:col-span-7">
          <h2 id="production-quality-title" class="max-w-4xl font-display text-h2 uppercase">
            За вкус отвечаем сами
          </h2>
          <p class="mt-6 max-w-2xl text-body-large font-medium text-surface/65">
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

      <div class="site-container mt-12 grid gap-4 sm:mt-16 site-grid">
        <ActionTile class="nav:col-span-6" :href="sitePath('/katalog/')" label="Попробовать результат" title="В каталог" />
        <ActionTile class="nav:col-span-6" :href="sitePath('/kontakty/')" label="Вопросы и сотрудничество" title="Связаться" tone="surface" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.production-process::before {
  /* Общий декор выступает на 128px ниже секции. Обрезаем только его,
     сохраняя выход иллюстраций этапов за пределы закреплённого блока. */
  clip-path: inset(0 0 128px 0);
}
</style>
