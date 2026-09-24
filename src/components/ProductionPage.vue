<script setup>
import { onMounted, ref, watch } from 'vue'
import Snap from 'lenis/snap'
import { sitePath } from '../utils/site-path'
import brewingImageUrl from '../assets/production-brewing.png'
import fermentationImageUrl from '../assets/production-fermentation.png'
import conditioningImageUrl from '../assets/production-conditioning.png'
import bottlingImageUrl from '../assets/production-bottling.png'
import ActionTile from './ActionTile.vue'
import NumberedInfoCard from './NumberedInfoCard.vue'
import PageHero from './PageHero.vue'
import ProductionProcessStep from './ProductionProcessStep.vue'
import SectionWatermark from './SectionWatermark.vue'

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
const processScrollSection = ref(null)
let touchStartY = null
const desktopProcess = window.matchMedia('(min-width: 54rem)')

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
      <div class="site-container grid gap-12 site-grid nav:gap-6">
        <div class="nav:col-span-4">
          <p class="font-display text-h1 text-brand">1874</p>
          <p class="mt-3 font-display text-h4 text-brand">1880</p>
          <p class="mt-4 text-label font-extrabold tracking-widest uppercase">Годы строительства</p>
        </div>

        <div class="nav:col-span-8">
          <h2 id="production-history-title" class="max-w-5xl font-display text-h2 uppercase">
            Завод с историей
          </h2>
          <p class="mt-6 max-w-4xl text-body-large font-medium text-subtle">
            Производство расположено в бывшей солодовне завода Ивана Дурдина. На её восьмигранных трубах из красного кирпича сохранились медные инициалы «И. Д.» и даты строительства.
          </p>
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden bg-brand py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="production-ingredients-title">
      <SectionWatermark text="Натурально" />

      <div class="site-container relative z-10">
        <div class="grid items-end gap-6 site-grid nav:gap-8">
          <h2 id="production-ingredients-title" class="font-display text-h2 uppercase nav:col-span-8">
            Честный состав
          </h2>
          <p class="max-w-md text-body-large font-medium text-surface/75 nav:col-span-4">
            Медовуха и сидр проходят естественное брожение без добавления спирта.
          </p>
        </div>

        <ul class="mt-12 grid gap-4 sm:mt-16 site-grid">
          <NumberedInfoCard
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
    </section>

    <div ref="processScrollSection" class="nav:h-[400svh]">
      <div class="nav:sticky nav:top-0 nav:h-svh">
        <section
          class="bg-panel overflow-hidden py-20 text-foreground sm:py-24 nav:h-full nav:py-8"
          data-header-theme="dark"
          aria-labelledby="production-process-title"
          @keydown="handleProcessKeydown"
        >
          <div class="site-container nav:grid nav:h-full nav:grid-cols-2 nav:gap-10">
            <div class="flex flex-col nav:justify-center">
              <h2 id="production-process-title" class="font-display text-h2 uppercase">
                Четыре этапа
              </h2>

              <ol class="mt-12 flex flex-col gap-6 nav:mt-8 nav:gap-8">
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
      </div>
    </div>

    <section class="bg-foreground py-20 text-surface sm:py-24 wide:py-28" data-header-theme="light" aria-labelledby="production-quality-title">
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
