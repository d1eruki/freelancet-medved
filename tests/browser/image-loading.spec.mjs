import { test, expect } from './fixtures.mjs'

function recordImages(page) {
  const requests = new Set()
  page.on('request', request => {
    if (request.resourceType() === 'image') requests.add(request.url())
  })
  return requests
}

test('Нижние изображения не запрашиваются до приближения к экрану', async ({ page, openPage }) => {
  const requests = recordImages(page)
  await openPage('proizvodstvo/')
  const step = page.locator('#production-step-images img').first()
  const source = await step.getAttribute('data-src')
  expect(source).toBeTruthy()
  await expect(step).not.toHaveAttribute('src')
  expect(requests.has(new URL(source, page.url()).href)).toBe(false)
  await step.scrollIntoViewIfNeeded()
  await expect.poll(() => step.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
  expect(requests.has(new URL(source, page.url()).href)).toBe(true)
})

test('Скрытые hero-слои не загружаются на мобильном и загружаются после смены ширины', async ({ page, openPage }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const requests = recordImages(page)
  await openPage('proizvodstvo/')
  const layers = page.locator('.hero-composition-plane img')
  const hidden = await layers.evaluateAll(images => images
    .filter(image => !image.checkVisibility())
    .map(image => image.dataset.src))
  expect(hidden).toHaveLength(2)
  for (const source of hidden) expect(requests.has(new URL(source, page.url()).href)).toBe(false)
  await page.setViewportSize({ width: 1440, height: 900 })
  for (const source of hidden) {
    await expect.poll(() => requests.has(new URL(source, page.url()).href)).toBe(true)
  }
})

test('Книга HoReCa загружается рядом с секцией вместе с нужным SVG-изображением', async ({ page, openPage }) => {
  const requests = recordImages(page)
  await openPage('horeca/')
  const book = page.locator('.cocktail-book')
  const cover = book.locator('.cocktail-binding img')
  const source = await cover.getAttribute('data-src')
  await expect(cover).not.toHaveAttribute('src')
  expect(requests.has(new URL(source, page.url()).href)).toBe(false)
  await book.scrollIntoViewIfNeeded()
  await expect.poll(() => cover.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
  const visibleImage = book.locator('svg image').filter({ visible: true }).first()
  await expect(visibleImage).toHaveAttribute('href', /.+/)
  expect(await visibleImage.evaluate(image => image.namespaceURI)).toBe('http://www.w3.org/2000/svg')
})

test('Текстура меню загружается при открытии и сохраняется при повторном открытии', async ({ page, openPage }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const requests = recordImages(page)
  await openPage()
  const surface = page.locator('.mobile-menu-surface')
  const source = await surface.getAttribute('data-src')
  const url = new URL(source, page.url()).href
  expect(requests.has(url)).toBe(false)
  await page.getByRole('button', { name: 'Открыть меню', exact: true }).click()
  await expect.poll(() => requests.has(url)).toBe(true)
  await page.getByRole('button', { name: 'Закрыть меню', exact: true }).click()
  await page.getByRole('button', { name: 'Открыть меню', exact: true }).click()
  await expect.poll(() => surface.evaluate(element => globalThis.getComputedStyle(element).backgroundImage)).toContain('mobile-menu-paper')
})
