<script setup>
import heroImageUrl from '../assets/hero-bear-antonovka.png'
</script>

<template>
  <section class="min-h-svh bg-brand text-surface" aria-labelledby="hero-title">
    <div class="site-container grid min-h-svh items-center gap-12 pt-32 pb-8 nav:grid-cols-2 nav:gap-16 nav:pt-40 nav:pb-12 wide:gap-24 wide:pt-44 wide:pb-16">
      <div class="z-1 min-w-0 max-w-3xl">
        <p class="mb-5 text-caption font-bold tracking-widest uppercase sm:mb-7">
          Товарищество пиво-медоваренного завода «МЁДВЕДЬ»
        </p>

        <h1 id="hero-title" class="font-display text-h1 uppercase">
          Русские хмельные напитки
        </h1>

        <p class="mt-6 max-w-xl text-body-large sm:mt-8">
          Производим медовуху, сидр и пуаре в Санкт-Петербурге с 2006 года.
        </p>

        <div class="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7 wide:mt-10">
          <a
            class="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-surface px-7 text-label font-extrabold tracking-wide text-foreground uppercase transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:shadow-xl sm:w-auto"
            href="/katalog/"
          >
            Смотреть продукцию
          </a>

          <a class="border-b border-surface/80 py-3 text-label font-extrabold tracking-wide uppercase" href="/partnery/">
            Где купить
          </a>
        </div>
      </div>

      <div class="flex self-end justify-center nav:justify-end" aria-label="Медведь с бутылкой сидра «Антоновка»">
        <img
          class="h-120 w-full max-w-120 object-contain sm:h-144 sm:max-w-144 nav:h-160 wide:h-184"
          :src="heroImageUrl"
          alt=""
        >
      </div>
    </div>
  </section>
</template>
