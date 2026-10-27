<!-- Подвал сайта с контактами, формой обратной связи и ссылками. -->
<script setup>
import { contacts } from '../data/contacts.js'
import { sitePath } from '../utils/site-path'
import logoUrl from '../assets/branding/brand-logo-wordmark.svg'
import ContactForm from './ContactForm.vue'

const showSocialLinks = false

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
  <footer id="contact-form" class="scroll-mt-20 bg-brand text-surface" aria-label="Связь и контакты">
    <div class="site-container py-20 sm:py-24 wide:py-28">

      <div class="grid items-start gap-12 sm:gap-16 nav:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div class="min-w-0">
          <a class="block w-80 max-w-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface" :href="sitePath('/')" aria-label="МЁДВЕДЬ — на главную">
            <span
              class="block aspect-321/133 w-full bg-surface"
              :style="{ mask: `url('${logoUrl}') center / contain no-repeat` }"
              aria-hidden="true"
            />
          </a>
          <div class="mt-10 grid gap-10">
            <div>
              <p class="font-display text-label uppercase text-panel">Контакты</p>
              <ul class="mt-4 grid gap-3 text-body-large font-semibold">
                <li><a class="footer-link" :href="contacts.general.phoneHref">{{ contacts.general.phone }}</a></li>
                <li><a class="footer-link" :href="contacts.general.emailHref">{{ contacts.general.email }}</a></li>
              </ul>
            </div>

            <div>
              <p class="font-display text-label uppercase text-panel">Адрес</p>
              <address class="mt-4 max-w-md text-body-large font-semibold not-italic">
                <a class="footer-link" :href="contacts.addressMapUrl" target="_blank" rel="noopener noreferrer">{{ contacts.footerAddress }}</a>
              </address>
            </div>
          </div>
          <ul v-if="showSocialLinks" class="mt-6 flex items-center gap-3" aria-label="Социальные сети">
            <li v-for="social in socialLinks" :key="social.label">
              <a
                class="grid size-11 place-items-center rounded-full transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
                :href="social.href"
                target="_blank"
                rel="nofollow noopener noreferrer"
                :aria-label="social.label"
              >
                <svg class="size-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path :d="social.path" /></svg>
              </a>
            </li>
          </ul>
        </div>

        <div class="min-w-0">
          <h2 id="footer-contact-title" class="font-display text-h3 uppercase">Напишите нам</h2>
          <ContactForm
            class="mt-10"
            aria-labelledby="footer-contact-title"
            compact
            source="footer-contact"
            id-prefix="footer-contact"
            tone="dark"
            submit-variant="surface"
          />
        </div>
      </div>

      <div class="mt-12 flex flex-col items-start gap-6 border-t border-surface/30 pt-6 text-label sm:mt-16 wide:flex-row wide:items-center wide:justify-between">
        <p class="shrink-0 text-surface/65">© 2017 ООО «ФАРТ СПБ».</p>
        <nav aria-label="Юридическая информация">
          <ul class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-8">
            <li><a class="footer-link" :href="sitePath('/disclaimer/')">Ограничение ответственности</a></li>
            <li><a class="footer-link" :href="sitePath('/politika-konfidencialnosti/')">Политика конфиденциальности</a></li>
            <li><a class="footer-link" href="https://medved.beer/files/requisites_ooo_fart_spb_jan2018.pdf" target="_blank" rel="noopener noreferrer">Реквизиты ООО «ФАРТ СПБ»</a></li>
          </ul>
        </nav>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  text-underline-offset: 4px;
}

.footer-link:hover {
  text-decoration: underline;
}

.footer-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
</style>
