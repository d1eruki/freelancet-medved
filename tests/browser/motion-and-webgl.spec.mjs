import { test, expect } from './fixtures.mjs'

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
  // Текст должен вернуться после анимации, а следующий переход снова быть доступен.
  await expect.poll(() => panel.getByRole('heading').evaluate((heading) =>
    Number(globalThis.getComputedStyle(heading.parentElement).opacity))).toBe(1)
  return panel
}

test('Обычная анимация завершается и позволяет переключать напитки и переходить в каталог', async ({ page, openPage, isMobile }) => {
  await openPage()
  await expect.poll(() => page.evaluate(() => globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false)
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  await switchDrink(page, isMobile, 'next', 'sidr')
  const panel = await switchDrink(page, isMobile, 'previous', 'medovuha')
  await panel.getByRole('link', { name: 'Подробнее', exact: true }).click()
  await expect(page).toHaveURL(/\/katalog\/medovuha\/$/)
  await expect(page.locator('main h1')).toContainText('Медовуха')
})

test('При недоступном WebGL показывается изображение и сохраняются управление и переходы', async ({ page, openPage, isMobile }) => {
  await page.addInitScript(() => {
    const getContext = globalThis.HTMLCanvasElement.prototype.getContext
    globalThis.HTMLCanvasElement.prototype.getContext = function (type, ...options) {
      if (/^(webgl2?|experimental-webgl)$/.test(type)) {
        globalThis.__webglAttempts = (globalThis.__webglAttempts || 0) + 1
        return null
      }
      return getContext.call(this, type, ...options)
    }
  })
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  const fallback = page.getByRole('tabpanel').locator('img')
  await expect(fallback).toBeVisible()
  await expect.poll(() => fallback.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true)
  await expect.poll(() => page.evaluate(() => globalThis.__webglAttempts || 0)).toBeGreaterThan(0)
  const panel = await switchDrink(page, isMobile, 'next', 'sidr')
  const nextFallback = panel.locator('img')
  await expect(nextFallback).toBeVisible()
  await expect.poll(() => nextFallback.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true)
  await panel.getByRole('link', { name: 'Подробнее', exact: true }).click()
  await expect(page).toHaveURL(/\/katalog\/sidr\/$/)
  await expect(page.locator('main h1')).toContainText('Сидр')
})
