<!-- Секция главной страницы о компании и её направлениях. -->
<script setup>
import SiteImage from '../../components/site-image.vue'
import productionImage from '../../assets/production-real.png?responsive'
import marionLogoUrl from '../../assets/home/marion-logo.png'
import marionWoman from '../../assets/home/marion-woman.png?responsive'
import { catalogCategories } from '../../data/catalog'
import SectionWatermark from '../../components/SectionWatermark.vue'
import { siteVariant } from '../../data/site-variants.js'
</script>

<template>
  <section
    class="relative isolate overflow-hidden bg-foreground py-20 text-surface sm:py-24 nav:min-h-svh wide:py-28"
    aria-labelledby="about-title"
  >
    <SectionWatermark text="Мёдведь" />

    <div class="site-container relative z-10">
      <h2 id="about-title" class="font-display text-h2 uppercase">
        О компании
      </h2>

      <div class="about-grid site-grid mt-12 grid gap-4 sm:mt-16">
        <figure class="about-feature group relative min-h-120 overflow-hidden rounded-3xl nav:min-h-160">
          <SiteImage width="1672" height="941"
            class="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
            :src="productionImage.src"
            :srcset="productionImage.srcset"
            sizes="(min-width: 80rem) 746px, (min-width: 54rem) max(calc(58.33vw - 48px), 507px), max(calc(100vw - 32px), 381px)"
            alt="Производственный цех с ёмкостями из нержавеющей стали"
          />
          <span class="absolute inset-0 bg-linear-to-t from-foreground via-foreground/5 to-transparent" aria-hidden="true" />

          <span class="absolute top-5 left-5 rounded-full bg-surface px-4 py-2 text-caption font-extrabold tracking-wider text-foreground uppercase sm:top-7 sm:left-7">
            Санкт-Петербург
          </span>

          <figcaption class="absolute right-6 bottom-6 left-6 sm:right-8 sm:bottom-8 sm:left-8">
            <p class="font-display text-h3 uppercase">
              {{ siteVariant.slogan }}
            </p>
          </figcaption>
        </figure>

        <article class="about-tenure relative isolate flex min-h-120 flex-col overflow-hidden rounded-3xl bg-brand p-6 sm:p-8 nav:min-h-160 wide:p-10">
          <svg class="pointer-events-none absolute inset-0 size-full text-surface/5" aria-hidden="true" focusable="false">
            <defs>
              <pattern id="about-honeycomb" width="96" height="84" patternUnits="userSpaceOnUse">
                <path
                  d="M24 0 48 14v28L24 56 0 42V14ZM72 0 96 14v28L72 56 48 42V14ZM48 42 72 56v28L48 98 24 84V56ZM0 42 24 56v28L0 98-24 84V56ZM96 42 120 56v28L96 98 72 84V56Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#about-honeycomb)" />
          </svg>

          <p class="relative z-10 text-label font-bold tracking-wider uppercase">Работаем</p>
          <p class="relative z-10 mt-6 font-display text-h2 uppercase">с 2006</p>

          <p class="relative z-10 mt-auto max-w-lg text-body-large font-medium text-surface/75">
            В 2016 году завод отметил первый десятилетний юбилей. Всё это время мы развиваем производство, увеличиваем ассортимент и экспериментируем с новыми вкусами.
          </p>
        </article>

        <article class="about-assortment rounded-3xl bg-surface p-6 text-foreground sm:p-8 wide:p-10">
          <div class="grid gap-8 sm:grid-cols-3 sm:items-end">
            <div>
              <p class="font-display text-h1 text-brand">{{ catalogCategories[0].items.length }}</p>
              <p class="mt-3 text-label font-extrabold tracking-wider uppercase">сортов медовухи</p>
            </div>

            <p class="text-body font-medium text-subtle sm:col-span-2">
              В каталоге — {{ catalogCategories[0].items.length }} сортов медовухи, {{ catalogCategories[1].items.length }} сортов сидра и пуаре «Мистер Вильямс». Поставляем напитки оптом в кегах и ПЭТ-таре.
            </p>
          </div>
        </article>

        <article class="about-delivery flex flex-col justify-between rounded-3xl border border-surface/20 bg-foreground p-6 sm:p-8 wide:p-10">
          <p class="font-display text-h4 text-surface uppercase">СПб → регионы</p>
          <p class="mt-10 text-body font-medium text-surface/60">
            Доставляем оптовые заказы по Санкт-Петербургу и Ленобласти собственным транспортом, работаем с региональными дистрибьюторами.
          </p>
        </article>
      </div>

      <article
        class="marion-promo relative isolate mt-10 grid gap-10 overflow-hidden rounded-3xl text-surface nav:grid-cols-2"
        aria-labelledby="marion-title"
      >
        <div class="relative z-10 p-6 pb-0 sm:p-8 sm:pb-0 nav:pb-8 wide:p-10">
          <h3 id="marion-title">
            <SiteImage
              class="h-auto w-full max-w-sm"
              :src="marionLogoUrl"
              alt="MARION"
              width="897"
              height="260"
            />
          </h3>
          <p class="mt-6 font-display text-h4 text-surface uppercase">
            Когда мёда становится мало — мы идём в дикие яблочные сады
          </p>
          <p class="mt-6 text-body text-surface">
            <strong class="font-extrabold">MARION CIDERS</strong> — наш сайд-проект, в котором мы исследуем чистую эстетику натурального сидроделия. 100% натуральные ингредиенты, устойчивая технология, баланс между классическими сидровыми традициями и смелыми крафтовыми релизами: от сухих охмелённых сортов до сочных ягодных профилей.
          </p>
        </div>

        <figure class="relative z-10 flex items-end pt-8 nav:pt-10">
          <SiteImage
            class="block h-auto w-full origin-bottom translate-x-10 scale-125 nav:-translate-x-28"
            :src="marionWoman.src"
            :srcset="marionWoman.srcset"
            sizes="(min-width: 54rem) calc((min(100vw, 1480px) - 72px) / 2), calc(100vw - 32px)"
            alt="Девушка с бокалом сидра MARION"
            width="1536"
            height="1024"
          />
        </figure>
        <a
          href="https://marionciders.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="absolute right-6 bottom-6 left-6 z-20 inline-block rounded-full bg-white px-6 py-3 text-center text-label font-extrabold text-foreground uppercase sm:right-8 sm:bottom-8 sm:left-8 nav:left-auto wide:right-10 wide:bottom-10"
        >
          Перейти на сайт
        </a>
      </article>
    </div>
  </section>
</template>

<style scoped>
.marion-promo {
  background:
    radial-gradient(ellipse at 65% 15%, #b52e32 0%, transparent 65%),
    linear-gradient(115deg, #83191d 0%, #a71f26 55%, #330e1a 100%);
}

.marion-promo::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  opacity: 0.55;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath fill='%23fff' filter='url(%23grain)' d='M0 0h180v180H0z'/%3E%3C/svg%3E");
}

@media (min-width: 54rem) {
  .about-feature {
    grid-column: 1 / span 7;
    grid-row: 1;
  }

  .about-tenure {
    grid-column: 8 / span 5;
    grid-row: 1;
  }

  .about-assortment {
    grid-column: 1 / span 5;
    grid-row: 2;
  }

  .about-delivery {
    grid-column: 6 / span 7;
    grid-row: 2;
  }

}
</style>
