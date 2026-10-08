import { test as base, expect } from '@playwright/test'

export const test = base.extend({
  // Все браузерные POST перехватываются, включая тесты, не настраивающие ответ формы.
  page: async ({ page }, use) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (['warning', 'error'].includes(message.type()) && /hydration/i.test(message.text())) {
        errors.push(message.text())
      }
    })
    await page.route('**/api/contact.php', route => route.abort())
    await page.route('https://yandex.ru/**', route => route.abort())
    await use(page)
    expect(errors, 'Не должно быть ошибок JavaScript или гидратации').toEqual([])
  },
  openPage: async ({ page }, use) => {
    await use(async (path = '', { confirmed = true } = {}) => {
      if (confirmed) {
        await page.addInitScript(() => {
          // Подтверждаем возраст только на странице сайта, не в сторонних iframe.
          if (globalThis === globalThis.top) localStorage.setItem('medved-age-confirmed', 'true')
        })
      }
      await page.goto(`./${path.replace(/^\/+/, '')}`)
      // Ждём подключения Vue, чтобы клик не пришёлся на ещё не интерактивный SSR HTML.
      await expect.poll(() => page.locator('#app').evaluate(root => Boolean(root.__vue_app__))).toBe(true)
      if (confirmed) await expect(page.getByRole('dialog')).toHaveCount(0)
    })
  },
})

export { expect }

export async function fillContactForm(page) {
  await page.getByLabel('Ваше имя *', { exact: true }).fill('Тестовый посетитель')
  await page.getByLabel('Телефон *', { exact: true }).fill('9991234567')
  await page.getByLabel('Электронная почта', { exact: true }).fill('test@example.com')
  await page.getByLabel('Сообщение', { exact: true }).fill('Автоматическая проверка без отправки письма')
  await page.getByRole('checkbox').check()
}
