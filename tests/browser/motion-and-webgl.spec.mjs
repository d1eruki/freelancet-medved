import { test, expect } from './fixtures.mjs'
import { readFile } from 'node:fs/promises'

const buildInfo = JSON.parse(await readFile(new URL('../../dist/site-variant.json', import.meta.url), 'utf8'))
const client = buildInfo.variant === 'client'
const kinds = client ? ['pair'] : ['can', 'glass']

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
  if (client) await expect(layers).not.toHaveCount(0)
  else await expect(layers).toHaveCount(4)
  await expect.poll(() => layers.evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true)
}

function modelIsMoving(model, isClient) {
  // Клиентский бокал и кисть получают общий угол из расчёта инерции.
  if (isClient) return Math.abs(Number.parseFloat(globalThis.getComputedStyle(model).rotate) || 0) > 0.1
  return model.getAnimations().some(animation => animation.playState === 'running')
}

test('Статичные слои загружаются, а анимация не блокирует переключение и переход в каталог', async ({ page, openPage, isMobile }) => {
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  await expect(page.locator('html')).toHaveAttribute('data-site-variant', buildInfo.variant)
  await expect(page.getByRole('link', { name: 'Перейти на сайт', exact: true })).toHaveAttribute('href', 'https://marionciders.com/')
  await expectComposition(page.getByRole('tabpanel'))
  // Обрезанные модели и полноразмерные тени имеют разные прямоугольники,
  // но их обёртки должны двигаться одинаково, а наклон — оставаться синхронным.
  const current = page.getByRole('tabpanel')
  if (isMobile) await current.getByRole('button', { name: 'Следующий напиток' }).click()
  else { await page.getByRole('tab', { selected: true }).focus(); await page.keyboard.press('ArrowRight') }
  await expect(current).toHaveAttribute('aria-labelledby', 'home-product-tab-sidr')
  await expect.poll(() => current.locator(client ? '.product-model.product-pair' : '.product-model.product-can').evaluate(modelIsMoving, client)).toBe(true)
  const motion = await current.evaluate((panel, kinds) => Object.fromEntries(kinds.map(kind => {
    const model = panel.querySelector(`.product-model.product-${kind}`)
    const wrapper = model.closest('.product-motion-layer')
    return [kind, { delay: globalThis.getComputedStyle(wrapper).transitionDelay, tiltDelay: globalThis.getComputedStyle(model).animationDelay }]
  })), kinds)
  if (client) expect(motion.pair).toEqual({ delay: '0s', tiltDelay: '0s' })
  else {
    expect(motion.can).toEqual({ delay: '0s', tiltDelay: '0s' })
    expect(motion.glass).toEqual({ delay: '0.1s', tiltDelay: '0.1s' })
  }
  for (let sample = 0; sample < 6; sample++) {
    const layers = await current.evaluate((panel, kinds) => kinds.map(kind => {
      const model = panel.querySelector(`.product-model.product-${kind}`)
      const shadow = panel.querySelector(`.product-shadow.product-${kind}`)
      return {
        modelMotion: globalThis.getComputedStyle(model.closest('.product-motion-layer')).transform,
        shadowMotion: globalThis.getComputedStyle(shadow.closest('.product-motion-layer')).transform,
        modelTilt: Number.parseFloat(globalThis.getComputedStyle(model).rotate) || 0,
        shadowTilt: Number.parseFloat(globalThis.getComputedStyle(shadow).rotate) || 0,
      }
    }), kinds)
    for (const layer of layers) {
      expect(layer.modelMotion).toBe(layer.shadowMotion)
      expect(Math.abs(layer.modelTilt - layer.shadowTilt)).toBeLessThan(0.1)
    }
    await page.waitForTimeout(50)
  }
  if (client) {
    // При ловле бокал и видимая кисть должны отклоняться вместе.
    await expect.poll(() => current.locator('.product-model.product-pair').evaluate(model =>
      Number.parseFloat(globalThis.getComputedStyle(model).rotate) || 0)).toBeLessThan(-0.5)
    for (let sample = 0; sample < 4; sample++) {
      const contact = await current.evaluate(panel => {
        const style = element => globalThis.getComputedStyle(element)
        const matrix = element => new globalThis.DOMMatrix(style(element).transform)
        const model = panel.querySelector('.product-model.product-pair')
        const fingers = [...panel.querySelectorAll('.paw-fingers .product-grip')].find(image =>
          Math.abs(matrix(image.closest('.product-layer-content')).m42) < 0.1)
        if (!fingers) return null
        return {
          positionDifference: matrix(model.closest('.product-motion-layer')).m41
            - matrix(fingers.closest('.paw-hand')).m41
            - matrix(fingers.closest('.product-layer-content')).m41,
          angleDifference: (Number.parseFloat(style(model).rotate) || 0)
            - (Number.parseFloat(style(fingers).rotate) || 0),
        }
      })
      expect(contact).not.toBeNull()
      expect(Math.abs(contact.positionDifference)).toBeLessThan(0.1)
      expect(Math.abs(contact.angleDifference)).toBeLessThan(0.1)
      await page.waitForTimeout(50)
    }
  }
  await expect(current).not.toHaveClass(/is-text-hidden/)
  await expect.poll(() => current.locator(client ? '.product-model.product-pair' : '.product-model.product-can').evaluate(modelIsMoving, client)).toBe(false)
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
