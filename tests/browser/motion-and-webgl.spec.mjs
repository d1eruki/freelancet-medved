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
  await expect(panel).not.toHaveClass(/\bis-text-hidden\b/)
  await expect.poll(() => panel.getByRole('heading').evaluate(heading =>
    Number(globalThis.getComputedStyle(heading.parentElement).opacity))).toBe(1)
  return panel
}

async function expectComposition(panel) {
  const layers = panel.locator('.product-composition img')
  await expect(layers).toHaveCount(2)
  await expect.poll(() => layers.evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true)
}

test('Статичные слои загружаются, а анимация не блокирует переключение и переход в каталог', async ({ page, openPage, isMobile }) => {
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  await expectComposition(page.getByRole('tabpanel'))
  // Общая пара и её тень должны оставаться совмещёнными во время наклона.
  const current = page.getByRole('tabpanel')
  if (isMobile) await current.getByRole('button', { name: 'Следующий напиток' }).click()
  else { await page.getByRole('tab', { selected: true }).focus(); await page.keyboard.press('ArrowRight') }
  await expect(current).toHaveAttribute('aria-labelledby', 'home-product-tab-sidr')
  await expect.poll(() => current.locator('.product-model').evaluate(model =>
    model.getAnimations().some(animation => animation.playState === 'running'))).toBe(true)
  for (let sample = 0; sample < 6; sample++) {
    const offset = await current.evaluate(panel => {
      const model = panel.querySelector('.product-model.product-pair').getBoundingClientRect()
      const shadow = panel.querySelector('.product-shadow.product-pair').getBoundingClientRect()
      return Math.max(Math.abs(model.left - shadow.left), Math.abs(model.top - shadow.top))
    })
    expect(offset).toBeLessThan(1)
    await page.waitForTimeout(50)
  }
  await expect(current).not.toHaveClass(/is-text-hidden/)
  await expect.poll(() => current.locator('.product-model').evaluate(model =>
    model.getAnimations().some(animation => animation.playState === 'running'))).toBe(false)
  await expectComposition(await switchDrink(page, isMobile, 'next', 'puare'))
  const panel = await switchDrink(page, isMobile, 'previous', 'sidr')
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
  await page.mouse.up()
  await expect(panel).toHaveAttribute('aria-labelledby', 'home-product-tab-sidr')
  await expectComposition(panel)
  await expect(page).not.toHaveURL(/\/katalog\//)
})
