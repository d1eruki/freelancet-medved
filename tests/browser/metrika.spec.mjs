import { test, expect, fillContactForm } from './fixtures.mjs'

test.beforeEach(async ({ page }) => {
  // Никакие тестовые события и данные формы не отправляются в настоящий счётчик.
  await page.route('https://mc.yandex.ru/**', route => route.abort())
  await page.addInitScript(() => {
    globalThis.metrikaCalls = []
    globalThis.ym = (...args) => globalThis.metrikaCalls.push(args)
  })
})

test('Ссылки телефона и почты отправляют по одной цели без контактных данных', async ({ page, openPage }) => {
  await openPage('kontakty/')
  // Сохраняем реальный клик, но не открываем системные приложения телефона и почты.
  await page.evaluate(() => globalThis.document.addEventListener('click', (event) => {
    if (event.target.closest('a[href^="tel:"], a[href^="mailto:"]')) event.preventDefault()
  }))
  await page.locator('main a[href^="tel:"]').first().click()
  await page.locator('main a[href^="mailto:"]').first().click()
  expect(await page.evaluate(() => globalThis.metrikaCalls)).toEqual([
    [113558843, 'reachGoal', 'contact_phone_click'],
    [113558843, 'reachGoal', 'contact_email_click'],
  ])
})

test('Подтверждённая заявка учитывается один раз без содержимого формы', async ({ page, openPage }) => {
  await openPage('kontakty/')
  let pendingRequest
  await page.route('**/api/contact.php', route => { pendingRequest = route })
  await fillContactForm(page)
  await page.getByRole('button', { name: 'Отправить', exact: true }).click()
  await expect.poll(() => Boolean(pendingRequest)).toBe(true)
  expect(await page.evaluate(() => globalThis.metrikaCalls)).toEqual([])
  await pendingRequest.fulfill({ json: { ok: true } })
  await expect(page.getByRole('status')).toHaveText('Спасибо! Сообщение отправлено.')
  expect(await page.evaluate(() => globalThis.metrikaCalls)).toEqual([
    [113558843, 'reachGoal', 'contact_form_success'],
  ])
})

for (const failure of ['server', 'request', 'invalid-json', 'timeout']) {
  test(`Ошибка ${failure} учитывается отдельно от успешной заявки`, async ({ page, openPage }) => {
    await openPage('kontakty/')
    await page.route('**/api/contact.php', route => {
      if (failure === 'timeout') return
      if (failure === 'request') return route.abort('connectionfailed')
      if (failure === 'invalid-json') return route.fulfill({ contentType: 'text/html', body: '<html>Ошибка</html>' })
      return route.fulfill({ status: 500, json: { ok: false, message: 'Ошибка отправки' } })
    })
    await fillContactForm(page)
    if (failure === 'timeout') await page.clock.install()
    await page.getByRole('button', { name: 'Отправить', exact: true }).click()
    if (failure === 'timeout') {
      await expect(page.getByRole('button', { name: 'Отправляем…', exact: true })).toBeDisabled()
      await page.clock.fastForward(15001)
    }
    await expect(page.getByRole('status')).not.toBeEmpty()
    expect(await page.evaluate(() => globalThis.metrikaCalls)).toEqual([
      [113558843, 'reachGoal', 'contact_form_error', { reason: failure === 'invalid-json' ? 'request' : failure }],
    ])
  })
}

test('Неверный телефон не отправляет запрос и не считается технической ошибкой', async ({ page, openPage }) => {
  await openPage('kontakty/')
  await fillContactForm(page)
  await page.getByLabel('Телефон *', { exact: true }).fill('123')
  await page.getByRole('button', { name: 'Отправить', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('Введите 10 цифр после +7.')
  expect(await page.evaluate(() => globalThis.metrikaCalls)).toEqual([])
})

for (const availability of ['blocked', 'throws']) {
  test(`Недоступная аналитика (${availability}) не мешает отправить форму`, async ({ page, openPage }) => {
    await openPage('kontakty/')
    await page.evaluate((state) => {
      globalThis.ym = state === 'blocked' ? undefined : () => { throw new Error('Счётчик недоступен') }
    }, availability)
    await page.route('**/api/contact.php', route => route.fulfill({ json: { ok: true } }))
    await fillContactForm(page)
    await page.getByRole('button', { name: 'Отправить', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Спасибо! Сообщение отправлено.')
    await expect(page.getByLabel('Ваше имя *', { exact: true })).toHaveValue('')
  })
}
