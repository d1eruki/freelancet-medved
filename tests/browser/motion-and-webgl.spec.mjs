import { test, expect } from './fixtures.mjs'
import { readFile } from 'node:fs/promises'

const buildInfo = JSON.parse(await readFile(new URL('../../dist/site-variant.json', import.meta.url), 'utf8'))

test.use({ reducedMotion: 'no-preference' })

async function switchDrink(page, isMobile, direction, slug) {
  if (isMobile) {
    await page.getByRole('tabpanel').getByRole('button', {
      name: direction === 'next' ? 'Следующий напиток' : 'Предыдущий напиток',
    }).click()
  } else {
    await page.getByRole('tab', { selected: true }).focus()
    await page.keyboard.press(direction === 'next' ? 'ArrowRight' : 'ArrowLeft')
  }
  const panel = page.getByRole('tabpanel')
  await expect(panel).toHaveAttribute('aria-labelledby', `home-product-tab-${slug}`)
  await expect(panel).not.toHaveClass(/\bis-text-hidden\b/)
  await expect.poll(() => panel.getByRole('heading').evaluate(heading =>
    Number(globalThis.getComputedStyle(heading.parentElement).opacity))).toBe(1)
  return panel
}

async function expectComposition(panel) {
  const image = panel.locator('img.product-glass')
  await expect(image).toHaveCount(1)
  await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true)
  await expect(panel.getByRole('heading')).toBeVisible()
}

async function expectTracksAligned(page) {
  const tracks = page.locator('section[aria-labelledby="products-title"] .product-track')
  await expect(tracks).toHaveCount(2)
  const offsets = await tracks.evaluateAll(nodes => nodes.map(node =>
    new globalThis.DOMMatrix(globalThis.getComputedStyle(node).transform).m41))
  expect(Math.abs(offsets[0] - offsets[1])).toBeLessThan(1)
}

test('Изображения и тексты переключаются вместе с паттерном, ссылки ведут в каталог', async ({ page, openPage, isMobile }) => {
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  await expect(page.locator('html')).toHaveAttribute('data-site-variant', buildInfo.variant)
  await expect(page.getByRole('link', { name: 'Перейти на сайт', exact: true })).toHaveAttribute('href', 'https://marionciders.com/')
  await expectComposition(page.getByRole('tabpanel'))
  for (const slug of ['sidr', 'puare']) {
    await expectComposition(await switchDrink(page, isMobile, 'next', slug))
    await expectTracksAligned(page)
  }
  const panel = await switchDrink(page, isMobile, 'previous', 'sidr')
  await expectTracksAligned(page)
  await panel.getByRole('link', { name: 'Подробнее', exact: true }).click()
  await expect(page).toHaveURL(/\/katalog\/sidr\/$/)
})

test('Слайдер работает без WebGL и не пытается запускать его', async ({ page, openPage, isMobile }) => {
  await page.addInitScript(() => {
    const original = globalThis.HTMLCanvasElement.prototype.getContext
    globalThis.HTMLCanvasElement.prototype.getContext = function(type, ...options) {
      if (/^(webgl2?|experimental-webgl)$/.test(type)) {
        globalThis.__webglAttempts = (globalThis.__webglAttempts || 0) + 1
        return null
      }
      return original.call(this, type, ...options)
    }
  })
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  await expectComposition(await switchDrink(page, isMobile, 'next', 'sidr'))
  await expect(page.locator('.product-scene-canvas')).toHaveCount(0)
  expect(await page.evaluate(() => globalThis.__webglAttempts || 0)).toBe(0)
  await expect(page.getByRole('button', { name: /Картинки вместо 3D/ })).toHaveCount(0)
})

test('Reduced motion сохраняет переключение статичных композиций', async ({ page, openPage, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  await expectComposition(await switchDrink(page, isMobile, 'next', 'sidr'))
  await expectComposition(await switchDrink(page, isMobile, 'previous', 'medovuha'))
})

test('Перетаскивание переключает композицию и подавляет случайный переход по ссылке', async ({ page, openPage }) => {
  await openPage()
  const notice = page.getByRole('button', { name: 'Понятно', exact: true })
  if (await notice.isVisible()) await notice.click()
  const heading = page.getByRole('heading', { name: 'Продукция', exact: true })
  await heading.scrollIntoViewIfNeeded()
  const panel = page.getByRole('tabpanel')
  await panel.locator('.product-visual').scrollIntoViewIfNeeded()
  const box = await panel.locator('.product-visual').boundingBox()
  const viewport = page.viewportSize()
  const start = { x: viewport.width * 0.7, y: Math.max(80, Math.min(box.y + box.height * 0.5, viewport.height - 80)) }
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x - viewport.width * 0.35, start.y, { steps: 8 })
  await expectTracksAligned(page)
  await page.mouse.up()
  await expect(panel).toHaveAttribute('aria-labelledby', 'home-product-tab-sidr')
  await expectComposition(panel)
  await expect(page).not.toHaveURL(/\/katalog\//)
})
