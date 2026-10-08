import { test, expect, fillContactForm } from './fixtures.mjs'

test.beforeEach(async ({ openPage }) => {
  await openPage('kontakty/')
})

test('Успешная отправка передаёт нормализованный телефон и очищает форму', async ({ page }) => {
  let payload
  await page.route('**/api/contact.php', route => {
    payload = route.request().postDataJSON()
    return route.fulfill({ json: { ok: true } })
  })
  await fillContactForm(page)
  await page.getByRole('button', { name: 'Отправить', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Спасибо! Сообщение отправлено.')
  expect(payload).toMatchObject({ name: 'Тестовый посетитель', phone: '79991234567', email: 'test@example.com', consent: true, website: '' })
  await expect(page.getByLabel('Ваше имя *', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('Телефон *', { exact: true })).toHaveValue('')
  await expect(page.getByRole('checkbox')).not.toBeChecked()
})

test('Неполный телефон не отправляется, поле получает фокус', async ({ page }) => {
  let requests = 0
  await page.route('**/api/contact.php', route => { requests++; return route.abort() })
  await fillContactForm(page)
  await page.getByLabel('Телефон *', { exact: true }).fill('123')
  await page.getByRole('button', { name: 'Отправить', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('Введите 10 цифр после +7.')
  await expect(page.getByLabel('Телефон *', { exact: true })).toBeFocused()
  expect(requests).toBe(0)
})

test('Без согласия браузер не отправляет форму', async ({ page }) => {
  let requests = 0
  await page.route('**/api/contact.php', route => { requests++; return route.abort() })
  await fillContactForm(page)
  await page.getByRole('checkbox').uncheck()
  await page.getByRole('button', { name: 'Отправить', exact: true }).click()
  await expect(page.getByRole('checkbox')).toBeFocused()
  expect(requests).toBe(0)
})

for (const status of [422, 429, 500]) {
  test(`Ошибка сервера ${status} сохраняет данные и разрешает повторную отправку`, async ({ page }) => {
    await page.route('**/api/contact.php', route => route.fulfill({ status, json: { message: 'Тестовая ошибка сервера' } }))
    await fillContactForm(page)
    await page.getByRole('button', { name: 'Отправить', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Тестовая ошибка сервера')
    await expect(page.getByLabel('Ваше имя *', { exact: true })).toHaveValue('Тестовый посетитель')
    await expect(page.getByRole('button', { name: 'Отправить', exact: true })).toBeEnabled()
  })
}

for (const failure of ['network', 'invalid-json']) {
  test(`Некорректный ответ (${failure}) показывает понятную ошибку`, async ({ page }) => {
    await page.route('**/api/contact.php', route => failure === 'network'
      ? route.abort('connectionfailed')
      : route.fulfill({ contentType: 'text/html', body: '<html>Ошибка сервера</html>' }))
    await fillContactForm(page)
    await page.getByRole('button', { name: 'Отправить', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Проверьте соединение')
    await expect(page.getByRole('button', { name: 'Отправить', exact: true })).toBeEnabled()
  })
}

test('Зависший запрос блокирует повторный клик и освобождает форму через 15 секунд', async ({ page }) => {
  let requests = 0
  await page.route('**/api/contact.php', () => { requests++ })
  await fillContactForm(page)
  await page.clock.install()
  await page.getByRole('button', { name: 'Отправить', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Отправляем…', exact: true })).toBeDisabled()
  await expect.poll(() => requests).toBe(1)
  await page.clock.fastForward(15001)
  await expect(page.getByRole('status')).toContainText('Сообщение могло быть отправлено')
  await expect(page.getByRole('button', { name: 'Отправить', exact: true })).toBeEnabled()
  await expect(page.getByLabel('Ваше имя *', { exact: true })).toHaveValue('Тестовый посетитель')
  expect(requests).toBe(1)
  await page.route('**/api/contact.php', route => route.fulfill({ json: { ok: true } }))
  await page.getByRole('button', { name: 'Отправить', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Спасибо! Сообщение отправлено.')
})
