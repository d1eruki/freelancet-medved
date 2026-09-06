<script setup>
import { sitePath } from '../utils/site-path'
import productionImageUrl from '../assets/production-meadery.png'

const stories = [
  {
    label: 'Производство',
    image: productionImageUrl,
    text: 'В 2016 году Товарищество пиво-медоваренного завода «МЁДВЕДЬ» отметило 10-летний юбилей. Всё это время мы растём и развиваемся, увеличиваем ассортимент и экспериментируем с новыми вкусами. Высокое качество нашей продукции подтверждается дипломами престижных выставок и пока ещё нечастых фестивалей медовухи.',
  },
  {
    label: 'Ассортимент',
    text: 'Базовый ассортимент Товарищества пиво-медоваренного завода «МЁДВЕДЬ» (ООО «ФАРТ СПБ»): медовуха «МЁДВЕДЬ» 7 сортов, сидр «ДЖИНДЖЕР ХОРС», «КОРК СПИРИТ», «МЭРИОН», а также пуаре «ВАЛЕНТАЙН». Напитки поставляем оптом, в многооборотных кегах или одноразовой ПЭТ таре (по согласованию с покупателем).',
  },
  {
    label: 'Поставки',
    text: 'Доставляем оптовые заказы по Санкт-Петербургу и Ленобласти собственным автотранспортом, активно работаем с региональными дистрибьюторами.',
  },
]

const awards = [
  'Лучшая продовольственная продукция «Интерфуд 2007» Золотая медаль',
  'Потребительский конкурс Народная дегустация «Медовуха Fest 2017»',
]
</script>

<template>
  <section
    class="min-h-svh overflow-hidden bg-foreground py-20 text-surface sm:py-24 wide:py-28"
    data-header-theme="light"
    aria-labelledby="about-title"
  >
    <div class="site-container">
      <h2 id="about-title" class="max-w-6xl whitespace-nowrap font-display text-h2 uppercase">
        О производителе
      </h2>

      <div class="story-grid mt-12 wide:mt-24">
        <article v-for="story in stories" :key="story.label" class="story-item">
          <div class="story-tile rounded-2xl">
            <img
              v-if="story.image"
              class="size-full object-cover"
              :src="story.image"
              alt=""
            >
            <span v-else class="story-placeholder" aria-hidden="true"></span>
            <span class="story-label font-display text-h4">{{ story.label }}</span>
          </div>

          <p class="story-copy mt-4 text-body font-medium">
            {{ story.text }}
          </p>
        </article>
      </div>

      <div class="mt-12 grid gap-6 sm:grid-cols-2 wide:mt-20" aria-label="Награды">
        <div
          v-for="(award, index) in awards"
          :key="award"
          class="flex gap-3 border-t border-surface/30 pt-5"
        >
          <span class="w-12 shrink-0 font-display text-caption text-brand" aria-hidden="true">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <p class="text-label font-semibold text-surface">
            {{ award }}
          </p>
        </div>
      </div>

      <a
        class="mt-9 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-surface px-7 text-label font-extrabold tracking-wide text-foreground uppercase transition duration-200 hover:-translate-y-1 hover:bg-brand hover:text-surface focus-visible:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface sm:w-max"
        :href="sitePath('/proizvodstvo/')"
      >
        Заглянуть на производство
      </a>
    </div>
  </section>
</template>

<style scoped>
.story-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

.story-tile {
  position: relative;
  aspect-ratio: 1.4;
  overflow: hidden;
  background: #242424;
  color: var(--color-surface);
  opacity: 0.86;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.story-tile::after {
  position: absolute;
  z-index: 1;
  inset: 0;
  background: rgb(0 0 0 / 38%);
  content: '';
  transition: opacity 0.3s ease;
}

.story-item:hover .story-tile {
  opacity: 1;
  transform: translateY(-0.35rem);
}

.story-item:hover .story-tile::after {
  opacity: 0;
}

.story-label {
  position: absolute;
  z-index: 2;
  inset: 50% 1rem auto;
  color: var(--color-surface);
  text-align: center;
  text-transform: uppercase;
  transform: translateY(-50%);
  transition: opacity 0.25s ease;
}

.story-item:hover .story-label {
  opacity: 0;
}

.story-placeholder {
  display: block;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(135deg, #303030 0 2px, #242424 2px 8px);
}

.story-copy {
  color: rgb(255 255 255 / 58%);
  transition: color 0.25s ease;
}

.story-item:hover .story-copy {
  color: var(--color-surface);
}

@media (min-width: 48rem) {
  .story-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .story-tile {
    aspect-ratio: 0.92;
  }
}
</style>
