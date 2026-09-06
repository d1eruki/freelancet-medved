<script setup>
import { sitePath } from '../utils/site-path'
import logoUrl from '../assets/brand-logo.svg'
import { navigation } from '../data/navigation'

const socialLinks = [
  {
    label: 'Telegram',
    href: 'https://t.me/',
    path: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  },
  {
    label: 'VK',
    href: 'https://vk.com/',
    path: 'm9.489.004.729-.003h3.564l.73.003.914.01.433.007.418.011.403.014.388.016.374.021.36.025.345.03.333.033c1.74.196 2.933.616 3.833 1.516.9.9 1.32 2.092 1.516 3.833l.034.333.029.346.025.36.02.373.025.588.012.41.013.644.009.915.004.98-.001 3.313-.003.73-.01.914-.007.433-.011.418-.014.403-.016.388-.021.374-.025.36-.03.345-.033.333c-.196 1.74-.616 2.933-1.516 3.833-.9.9-2.092 1.32-3.833 1.516l-.333.034-.346.029-.36.025-.373.02-.588.025-.41.012-.644.013-.915.009-.98.004-3.313-.001-.73-.003-.914-.01-.433-.007-.418-.011-.403-.014-.388-.016-.374-.021-.36-.025-.345-.03-.333-.033c-1.74-.196-2.933-.616-3.833-1.516-.9-.9-1.32-2.092-1.516-3.833l-.034-.333-.029-.346-.025-.36-.02-.373-.025-.588-.012-.41-.013-.644-.009-.915-.004-.98.001-3.313.003-.73.01-.914.007-.433.011-.418.014-.403.016-.388.021-.374.025-.36.03-.345.033-.333c.196-1.74.616-2.933 1.516-3.833.9-.9 2.092-1.32 3.833-1.516l.333-.034.346-.029.36-.025.373-.02.588-.025.41-.012.644-.013.915-.009.98-.004ZM6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z',
  },
  {
    label: 'MAX',
    href: 'https://max.ru/',
    path: 'M1.769 0A1.77 1.77 0 0 0 0 1.769V22.23A1.77 1.77 0 0 0 1.769 24H22.23A1.77 1.77 0 0 0 24 22.231V1.77A1.77 1.77 0 0 0 22.231 0zm12.485 3.28a4.301 4.301 0 0 1 4.3 4.302 4.301 4.301 0 0 1-1.993 3.63 6.085 6.085 0 0 1 1.054 3.422 6.085 6.085 0 0 1-6.085 6.085 6.085 6.085 0 0 1-6.085-6.085 6.085 6.085 0 0 1 4.66-5.916 4.301 4.301 0 0 1-.152-1.136 4.301 4.301 0 0 1 4.301-4.301zm0 1.849a2.453 2.453 0 0 0-2.453 2.453 2.453 2.453 0 0 0 2.453 2.453 2.453 2.453 0 0 0 2.453-2.453 2.453 2.453 0 0 0-2.453-2.453zm-2.724 5.268a4.237 4.237 0 0 0-4.237 4.237 4.237 4.237 0 0 0 4.237 4.237 4.237 4.237 0 0 0 4.237-4.237 4.237 4.237 0 0 0-4.237-4.237zm.032 2.54a1.781 1.781 0 1 1 0 3.562 1.781 1.781 0 0 1 0-3.562Z',
  },
]
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
          <ul class="mt-6 flex items-center gap-3" aria-label="Социальные сети">
            <li v-for="social in socialLinks" :key="social.label">
              <a
                class="grid size-11 place-items-center transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
                :href="social.href"
                target="_blank"
                rel="nofollow noopener noreferrer"
                :aria-label="social.label"
              >
                <svg class="size-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                  <path :d="social.path" />
                </svg>
              </a>
            </li>
          </ul>
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
