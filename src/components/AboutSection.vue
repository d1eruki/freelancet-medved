<script setup>
import productionImageUrl from '../assets/hero-image-placeholder.png'

const awards = [
  'Лучшая продовольственная продукция «Интерфуд 2007» Золотая медаль',
  'Потребительский конкурс Народная дегустация «Медовуха Fest 2017»',
]
</script>

<template>
  <section class="overflow-hidden bg-foreground py-20 text-surface sm:py-24 wide:py-40" aria-labelledby="about-title">
    <div class="site-container">
      <h2 id="about-title" class="max-w-6xl font-display text-4xl leading-none uppercase sm:text-6xl wide:text-8xl">
        Слово о производителе
      </h2>

      <div class="mt-12 grid items-stretch gap-12 nav:grid-cols-2 wide:mt-24 wide:gap-24">
        <div class="about-frame min-h-112 rotate-0 bg-brand p-4 sm:min-h-144 sm:p-6 wide:min-h-176 wide:-rotate-1" aria-label="Место для изображения производства">
          <div class="about-image relative size-full min-h-104 overflow-hidden sm:min-h-132 wide:min-h-164">
            <img class="size-full object-cover" :src="productionImageUrl" alt="">
            <span class="absolute inset-0 grid place-items-center text-xs font-extrabold tracking-widest text-muted uppercase">
              Изображение
            </span>
          </div>
        </div>

        <div class="flex min-w-0 flex-col">
          <p class="max-w-3xl text-lg leading-relaxed font-medium text-surface sm:text-xl wide:text-2xl">
            В 2016 году Товарищество пиво-медоваренного завода «МЁДВЕДЬ» отметило 10-летний юбилей. Всё это время мы растём и развиваемся, увеличиваем ассортимент и экспериментируем с новыми вкусами. Высокое качество нашей продукции подтверждается дипломами престижных выставок и пока ещё нечастых фестивалей медовухи.
          </p>

          <p class="mt-6 max-w-3xl text-base leading-relaxed text-surface/70 sm:text-lg">
            Базовый ассортимент Товарищества пиво-медоваренного завода «МЁДВЕДЬ» (ООО «ФАРТ СПБ»): медовуха «МЁДВЕДЬ» 7 сортов, сидр «ДЖИНДЖЕР ХОРС», «КОРК СПИРИТ», «МЭРИОН», а также пуаре «ВАЛЕНТАЙН». Напитки поставляем оптом, в многооборотных кегах или одноразовой ПЭТ таре (по согласованию с покупателем).
          </p>

          <p class="mt-6 max-w-3xl text-base leading-relaxed text-surface/70 sm:text-lg">
            Доставляем оптовые заказы по Санкт-Петербургу и Ленобласти собственным автотранспортом, активно работаем с региональными дистрибьюторами.
          </p>

          <div class="mt-12 grid gap-6 sm:grid-cols-2 wide:mt-auto wide:pt-12" aria-label="Награды">
            <div v-for="(award, index) in awards" :key="award" class="flex gap-3 border-t border-surface/30 pt-5">
              <span class="w-12 shrink-0 font-display text-xs leading-relaxed text-brand" aria-hidden="true">
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <p class="text-sm leading-relaxed font-semibold text-surface">
                {{ award }}
              </p>
            </div>
          </div>

          <a class="mt-9 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-surface px-7 text-sm font-extrabold tracking-wide text-foreground uppercase transition duration-200 hover:-translate-y-1 hover:bg-brand hover:text-surface focus-visible:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface sm:w-max" href="/proizvodstvo/">
            Заглянуть на производство
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-frame {
  border-radius: 32px;
}

.about-image {
  border-radius: 999px 999px 16px 16px;
}
</style>
