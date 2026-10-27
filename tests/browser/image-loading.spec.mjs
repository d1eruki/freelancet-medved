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

test('Одиночный первый экран производства загружается на мобильном и широком экране', async ({ page, openPage }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openPage('proizvodstvo/')
  const hero = page.locator('section[aria-labelledby="production-page-title"] img')
  await expect(hero).toHaveCount(1)
  await expect.poll(() => hero.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect.poll(() => hero.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
})

test('Фотографии коктейлей загружаются рядом с секцией и меняются вместе с рецептом', async ({ page, openPage, isMobile }) => {
  const requests = recordImages(page)
  await openPage('horeca/')
  const slides = page.locator('#horeca-cocktail-slides')
  const photo = isMobile ? slides.locator('svg image') : slides.locator('img').first()
  const source = await photo.getAttribute('data-src')
  expect(source).toBeTruthy()
  expect(requests.has(new URL(source, page.url()).href)).toBe(false)
  await slides.scrollIntoViewIfNeeded()
  if (isMobile) {
    await expect(photo).toHaveAttribute('href', new URL(source, page.url()).href)
    await expect.poll(() => requests.has(new URL(source, page.url()).href)).toBe(true)
  } else {
    await expect.poll(() => photo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
  }
  const next = page.getByRole('button', { name: 'Следующий рецепт', exact: true }).filter({ visible: true }).first()
  await next.click()
  await expect(slides.getByRole('heading', { name: 'Дикий Сауэр', exact: true })).toBeVisible()
  await expect(photo).not.toHaveAttribute('data-src', source)
  if (isMobile) await expect(photo).toHaveAttribute('href', /.+/)
  else await expect.poll(() => photo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
})
