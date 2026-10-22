import { test, expect } from './fixtures.mjs'

test('Браузер выбирает AVIF без параллельной загрузки WebP', async ({ page, openPage }) => {
  const requests = new Set()
  page.on('request', request => { if (request.resourceType() === 'image') requests.add(request.url()) })
  await openPage()
  const layers = page.locator('.hero-composition-plane img')
  await expect.poll(() => layers.evaluateAll(images => {
    const visible = images.filter(image => image.checkVisibility())
    return visible.length > 0 && visible.every(image => image.complete && image.naturalWidth > 0 && /\.avif$/.test(image.currentSrc))
  })).toBe(true)
  const fallbacks = await layers.evaluateAll(images => images.flatMap(image => [
    image.getAttribute('src'), ...(image.getAttribute('srcset') || '').split(',').map(candidate => candidate.trim().split(/\s+/)[0]),
  ]).filter(Boolean))
  for (const fallback of fallbacks) expect(requests.has(new URL(fallback, page.url()).href)).toBe(false)
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  // Обёртка выбора формата сохраняет позиционирование слоёв через scoped-стили родителя.
  const productImages = page.locator('.product-composition img.product-layer')
  expect(await productImages.count()).toBeGreaterThan(0)
  expect(await productImages.evaluateAll(images => images.every(image =>
    globalThis.getComputedStyle(image).position === 'absolute'))).toBe(true)
})

test('WebP остаётся рабочим запасным форматом без поддержки AVIF и JavaScript', async ({ page, baseURL }) => {
  await page.route(baseURL, async route => {
    const response = await route.fetch()
    const html = (await response.text()).replaceAll('type="image/avif"', 'type="image/x-unsupported"')
      .replace(/<script\b[^>]*\bsrc="[^"]+"[^>]*>[\s\S]*?<\/script>/g, '')
    await route.fulfill({ response, body: html })
  })
  await page.goto(baseURL)
  const images = page.locator('.hero-composition-plane img')
  await expect.poll(() => images.evaluateAll(nodes => {
    const visible = nodes.filter(image => image.checkVisibility())
    return visible.length > 0 && visible.every(image => image.complete && image.naturalWidth > 0 && /\.webp$/.test(image.currentSrc))
  })).toBe(true)
  expect(await page.locator('#app').evaluate(root => Boolean(root.__vue_app__))).toBe(false)
})

test('Параллакс применяет последнее движение за кадр и отменяет движение после ухода мыши', async ({ page, openPage, isMobile }) => {
  test.skip(isMobile, 'Параллакс предназначен для точного указателя')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openPage('katalog/')
  const result = await page.locator('.layered-hero-composition').evaluate(async composition => {
    const section = composition.parentElement
    const original = section.getBoundingClientRect.bind(section)
    const bounds = original()
    let reads = 0
    section.getBoundingClientRect = () => { reads++; return original() }
    const frame = () => new Promise(resolve => globalThis.requestAnimationFrame(resolve))
    // Даём завершиться стартовым наблюдателям и вычислению прокрутки.
    await frame(); await frame()
    reads = 0
    for (let index = 0; index < 20; index++) {
      section.dispatchEvent(new globalThis.PointerEvent('pointermove', {
        clientX: bounds.right - 1, clientY: bounds.bottom - 1, pointerType: 'mouse',
      }))
    }
    await frame()
    const layer = composition.querySelector('.hero-composition-layer-float')
    const moved = Number.parseFloat(layer.style.getPropertyValue('--hero-layer-parallax-x'))
    const movementReads = reads
    section.dispatchEvent(new globalThis.PointerEvent('pointermove', {
      clientX: bounds.left, clientY: bounds.top, pointerType: 'mouse',
    }))
    section.dispatchEvent(new globalThis.PointerEvent('pointerleave'))
    await frame()
    const reset = layer.style.getPropertyValue('--hero-layer-parallax-x')
    section.getBoundingClientRect = original
    return { moved, movementReads, reset }
  })
  expect(result.moved).toBeGreaterThan(0)
  expect(result.movementReads).toBe(1)
  expect(result.reset).toBe('0px')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => page.locator('.hero-composition-layer-float').first()
    .evaluate(layer => layer.style.getPropertyValue('--hero-layer-parallax-x'))).toBe('0px')
})

test('Hero останавливает расчёты вне экрана и в скрытой вкладке, затем возобновляет', async ({ page, openPage }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openPage('katalog/')
  const composition = page.locator('.layered-hero-composition')
  const layer = composition.locator('.hero-composition-layer-float').first()
  await expect.poll(() => layer.evaluate(image => image.style.animationPlayState)).toBe('running')
  await composition.evaluate(element => {
    const section = element.parentElement
    const original = section.getBoundingClientRect.bind(section)
    section.runtimeReads = 0
    section.getBoundingClientRect = () => { section.runtimeReads++; return original() }
  })
  await page.locator('footer').scrollIntoViewIfNeeded()
  await expect.poll(() => layer.evaluate(image => image.style.animationPlayState)).toBe('paused')
  const idleReads = () => composition.evaluate(async element => {
    const section = element.parentElement
    section.runtimeReads = 0
    globalThis.dispatchEvent(new globalThis.Event('scroll'))
    globalThis.dispatchEvent(new globalThis.Event('resize'))
    await new Promise(resolve => globalThis.requestAnimationFrame(() => globalThis.requestAnimationFrame(resolve)))
    return section.runtimeReads
  })
  expect(await idleReads()).toBe(0)
  await page.evaluate(() => globalThis.scrollTo({ top: 0, behavior: 'instant' }))
  await expect.poll(() => layer.evaluate(image => image.style.animationPlayState)).toBe('running')
  await expect.poll(() => layer.evaluate(image => image.style.getPropertyValue('--hero-layer-scroll-y'))).toBe('0px')
  await page.evaluate(() => globalThis.scrollTo({ top: 120, behavior: 'instant' }))
  await expect.poll(() => layer.evaluate(image => Number.parseFloat(image.style.getPropertyValue('--hero-layer-scroll-y')))).toBeLessThan(0)
  await page.evaluate(() => {
    Object.defineProperty(globalThis.document, 'hidden', { configurable: true, value: true })
    globalThis.document.dispatchEvent(new globalThis.Event('visibilitychange'))
  })
  const hiddenOffset = await layer.evaluate(image => Number.parseFloat(image.style.getPropertyValue('--hero-layer-scroll-y')))
  await page.evaluate(() => globalThis.scrollTo({ top: 240, behavior: 'instant' }))
  await expect.poll(() => page.evaluate(() => globalThis.scrollY)).toBeGreaterThan(120)
  expect(await idleReads()).toBe(0)
  await page.evaluate(() => {
    delete globalThis.document.hidden
    globalThis.document.dispatchEvent(new globalThis.Event('visibilitychange'))
  })
  await expect.poll(() => layer.evaluate(image => image.style.animationPlayState)).toBe('running')
  await expect.poll(() => layer.evaluate(image => Number.parseFloat(image.style.getPropertyValue('--hero-layer-scroll-y')))).toBeLessThan(hiddenOffset)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => layer.evaluate(image => image.style.getPropertyValue('--hero-layer-scroll-y'))).toBe('0px')
  expect(await idleReads()).toBe(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect.poll(() => layer.evaluate(image => Number.parseFloat(image.style.getPropertyValue('--hero-layer-scroll-y')))).toBeLessThan(0)
})

test('Hero получает стартовую геометрию без синхронного запроса и сохраняет прокрутку после перезагрузки', async ({ page, openPage }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.addInitScript(() => {
    globalThis.heroGeometryReads = 0
    const original = globalThis.Element.prototype.getBoundingClientRect
    globalThis.Element.prototype.getBoundingClientRect = function () {
      if (this.matches('section[aria-labelledby="hero-title"], section[aria-labelledby="catalog-title"]')) {
        globalThis.heroGeometryReads++
      }
      return original.call(this)
    }
  })
  for (const path of ['', 'katalog/']) {
    await openPage(path)
    const layer = page.locator('.hero-composition-layer-float').first()
    await expect.poll(() => layer.evaluate(image => image.style.animationPlayState)).toBe('running')
    await page.evaluate(() => new Promise(resolve => globalThis.requestAnimationFrame(() => globalThis.requestAnimationFrame(resolve))))
    expect(await page.evaluate(() => globalThis.heroGeometryReads)).toBe(0)
    await page.evaluate(() => globalThis.scrollTo({ top: 160, behavior: 'instant' }))
    await expect.poll(() => layer.evaluate(image => Number.parseFloat(image.style.getPropertyValue('--hero-layer-scroll-y')))).toBeLessThan(0)
    await page.reload()
    await expect.poll(() => page.evaluate(() => globalThis.scrollY)).toBeGreaterThan(0)
    await expect.poll(() => layer.evaluate(image => Number.parseFloat(image.style.getPropertyValue('--hero-layer-scroll-y')))).toBeLessThan(0)
  }
})

test('Декоративная надпись измеряется один раз рядом с секцией и подгоняется при изменении ширины', async ({ page, openPage }) => {
  await page.addInitScript(() => {
    globalThis.watermarkMeasurements = 0
    const original = globalThis.SVGTextContentElement.prototype.getComputedTextLength
    globalThis.SVGTextContentElement.prototype.getComputedTextLength = function () {
      if (/^(МЁДВЕДЬ|ДУРДИН)$/.test(this.textContent.trim())) globalThis.watermarkMeasurements++
      return original.call(this)
    }
  })
  for (const path of ['', 'o-kompanii/']) {
    await openPage(path)
    await page.evaluate(() => globalThis.document.fonts.ready)
    const text = page.locator('svg text').filter({ hasText: /^(МЁДВЕДЬ|ДУРДИН)$/ })
    expect(await page.evaluate(() => globalThis.watermarkMeasurements)).toBe(0)
    expect(await text.evaluate(element => element.closest('span').style.fontSize)).toBe('')
    await text.evaluate(element => element.closest('section').scrollIntoView({ block: 'start', behavior: 'instant' }))
    await expect.poll(() => page.evaluate(() => globalThis.watermarkMeasurements)).toBe(1)
    await expect.poll(() => text.evaluate(element => Number.parseFloat(element.closest('span').style.fontSize))).toBeGreaterThan(0)
    const initial = await text.evaluate(element => element.closest('span').style.fontSize)
    const viewport = page.viewportSize()
    await page.setViewportSize({ ...viewport, width: viewport.width + 60 })
    await expect.poll(() => text.evaluate(element => element.closest('span').style.fontSize)).not.toBe(initial)
    expect(await page.evaluate(() => globalThis.watermarkMeasurements)).toBe(1)
    await page.setViewportSize(viewport)
  }
})

test('Типографика сохраняет динамический текст, адреса и исключённые фрагменты', async ({ page, openPage }) => {
  await openPage('katalog/')
  await page.locator('#app > div').first().evaluate(root => {
    const host = globalThis.document.createElement('div')
    host.id = 'runtime-typography'
    root.append(host)
    const nested = globalThis.document.createElement('div')
    host.append(nested)
    nested.innerHTML = '<p>В Санкт-Петербурге и за городом</p><code>В Санкт-Петербурге</code><span data-typography-ignore>В Санкт-Петербурге</span><a>https://example.com/a-b и на сайте</a>'
    nested.querySelector('p').firstChild.nodeValue = 'Для Санкт-Петербурга и за городом'
    const removed = globalThis.document.createElement('p')
    removed.textContent = 'На удалённой странице'
    host.append(removed)
    removed.remove()
  })
  const host = page.locator('#runtime-typography')
  await expect.poll(() => host.locator('p').textContent()).toBe('Для\u00a0Санкт‑Петербурга и\u00a0за\u00a0городом')
  expect(await host.locator('code').textContent()).toBe('В Санкт-Петербурге')
  expect(await host.locator('[data-typography-ignore]').textContent()).toBe('В Санкт-Петербурге')
  expect(await host.locator('a').textContent()).toBe('https://example.com/a-b и\u00a0на\u00a0сайте')
  await host.locator('p').evaluate(element => { element.firstChild.nodeValue = 'На Санкт-Петербург и в город' })
  await expect.poll(() => host.locator('p').textContent()).toBe('На\u00a0Санкт‑Петербург и\u00a0в\u00a0город')
})

test('Gabin загружается через WOFF2 без второй загрузки TTF', async ({ page, openPage }) => {
  const fonts = []
  page.on('request', request => {
    if (request.resourceType() === 'font') fonts.push(request.url())
  })
  await openPage()
  const loaded = await page.evaluate(async () => {
    await globalThis.document.fonts.ready
    return [...globalThis.document.fonts].filter(font => font.family === 'Gabin').map(font => font.status)
  })
  expect(loaded).toEqual(['loaded'])
  expect(fonts.filter(url => /gabin-.*\.woff2$/.test(url))).toHaveLength(1)
  expect(fonts.some(url => /\.ttf(?:\?|$)/.test(url))).toBe(false)
})
