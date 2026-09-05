<script setup>
import { sitePath } from '../utils/site-path'
import logoUrl from '../assets/brand-logo.svg'
import { navigation } from '../data/navigation'
</script>

<template>
  <footer class="bg-brand pt-20 pb-6 text-surface sm:pt-24 wide:pt-28">
    <div class="site-container">
      <div class="grid gap-12 border-b border-surface/40 pb-12 nav:grid-cols-2 wide:gap-24 wide:pb-20">
        <a class="inline-flex w-max" :href="sitePath('/')" aria-label="МЁДВЕДЬ — на главную">
          <img class="h-auto w-48 object-contain brightness-0 invert sm:w-64" :src="logoUrl" alt="МЁДВЕДЬ">
        </a>

        <nav aria-label="Навигация в подвале">
          <ul class="grid gap-3 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-4">
            <li v-for="item in navigation" :key="item.href">
              <a class="footer-link relative inline-flex py-1 font-display text-body-large uppercase" :href="item.href">
                {{ item.label }}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="grid gap-8 py-12 nav:grid-cols-3 wide:gap-20 wide:py-16">
        <div>
          <span class="mb-4 block text-caption font-extrabold tracking-widest uppercase">Наш адрес</span>
          <address class="max-w-xl text-body-large font-semibold not-italic">
            г. Санкт-Петербург, Курляндская улица, д. 28Г, пом. 75
          </address>
        </div>

        <div>
          <span class="mb-4 block text-caption font-extrabold tracking-widest uppercase">Телефон</span>
          <a class="border-b border-surface/60 text-body-large font-semibold" href="tel:+78129408427">
            +7 (812) 940-84-27
          </a>
        </div>

        <div>
          <span class="mb-4 block text-caption font-extrabold tracking-widest uppercase">Пишите нам</span>
          <a class="border-b border-surface/60 text-body-large font-semibold" href="mailto:info@medved.beer">
            info@medved.beer
          </a>
        </div>
      </div>

      <div class="border-t border-surface/40 pt-6 text-label">
        <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8">
          <p>© 2017 ООО «ФАРТ СПБ».</p>
          <a class="hover:underline hover:underline-offset-4" :href="sitePath('/disclaimer/')">
            Ограничение ответственности
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-link::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  content: '';
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 180ms ease;
}

.footer-link:hover::after,
.footer-link:focus-visible::after {
  transform: scaleX(1);
  transform-origin: left;
}
</style>
