<script setup>
import { sitePath } from '../utils/site-path'
import productionImageUrl from '../assets/production-meadery.png'
import CircleArrow from './CircleArrow.vue'
</script>

<template>
  <section
    class="relative isolate overflow-hidden bg-foreground py-20 text-surface sm:py-24 wide:py-28"
    data-header-theme="light"
    aria-labelledby="about-title"
  >
    <span
      class="about-watermark pointer-events-none absolute -right-12 -z-1 font-display uppercase"
      aria-hidden="true"
    >
      Мёдведь
    </span>

    <div class="site-container">
      <h2 id="about-title" class="font-display text-h2 uppercase">
        О производителе
      </h2>

      <div class="about-grid mt-12 grid gap-4 wide:mt-20">
        <figure class="about-feature group relative min-h-120 overflow-hidden rounded-3xl nav:min-h-160">
          <img
            class="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
            :src="productionImageUrl"
            alt="Производство напитков на пиво-медоваренном заводе «Мёдведь»"
          >
          <span class="absolute inset-0 bg-linear-to-t from-foreground via-foreground/5 to-transparent" aria-hidden="true" />

          <span class="absolute top-5 left-5 rounded-full bg-surface px-4 py-2 text-caption font-extrabold tracking-wider text-foreground uppercase sm:top-7 sm:left-7">
            Санкт-Петербург
          </span>

          <figcaption class="absolute right-6 bottom-6 left-6 sm:right-8 sm:bottom-8 sm:left-8">
            <p class="font-display text-h3 uppercase">
              Варим с характером
            </p>
          </figcaption>
        </figure>

        <article class="about-tenure flex min-h-120 flex-col rounded-3xl bg-brand p-6 sm:p-8 nav:min-h-160 wide:p-10">
          <p class="text-label font-bold tracking-wider uppercase">Работаем</p>
          <p class="mt-3 font-display text-h2 uppercase">с 2006</p>

          <p class="mt-auto max-w-lg text-body-large font-medium text-surface/75">
            В 2016 году завод отметил первый десятилетний юбилей. Всё это время мы развиваем производство, увеличиваем ассортимент и экспериментируем с новыми вкусами.
          </p>

          <a
            class="group mt-8 flex w-full items-end justify-between gap-5 text-label font-extrabold tracking-wide uppercase focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface"
            :href="sitePath('/proizvodstvo/')"
          >
            <span class="inline-flex min-h-14 items-center rounded-full bg-surface px-6 text-foreground transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl">
              Заглянуть на производство
            </span>
            <CircleArrow hover="detail" size="action" tone="surface" />
          </a>
        </article>

        <article class="about-assortment rounded-3xl bg-surface p-6 text-foreground sm:p-8 wide:p-10">
          <div class="grid gap-8 sm:grid-cols-3 sm:items-end">
            <div>
              <p class="font-display text-h1 text-brand">7</p>
              <p class="mt-2 text-label font-extrabold tracking-wider uppercase">сортов медовухи</p>
            </div>

            <p class="text-body font-medium text-subtle sm:col-span-2">
              В базовом ассортименте — медовуха «Мёдведь», сидры «Джинджер Хорс», «Корк Спирит» и «Мэрион», а также пуаре «Валентайн». Поставляем напитки оптом в кегах и ПЭТ-таре.
            </p>
          </div>
        </article>

        <article class="about-delivery flex flex-col justify-between rounded-3xl border border-surface/20 bg-foreground p-6 sm:p-8 wide:p-10">
          <p class="font-display text-h4 text-brand uppercase">СПб → регионы</p>
          <p class="mt-10 text-body font-medium text-surface/60">
            Доставляем оптовые заказы по Санкт-Петербургу и Ленобласти собственным транспортом, работаем с региональными дистрибьюторами.
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-watermark {
  bottom: -0.18em;
  color: rgb(255 255 255 / 3%);
  font-size: clamp(7rem, 16vw, 15rem);
  line-height: 0.8;
}

@media (min-width: 54rem) {
  .about-grid {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  }

  .about-feature {
    grid-column: 1;
    grid-row: 1;
  }

  .about-tenure {
    grid-column: 2;
    grid-row: 1;
  }

  .about-assortment {
    grid-column: 1;
    grid-row: 2;
  }

  .about-delivery {
    grid-column: 2;
    grid-row: 2;
  }

}
</style>
