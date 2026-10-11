import { test as baseTest, expect as baseExpect } from './fixtures.mjs'

const test = baseTest.extend({
  sceneDiagnostics: [async ({ page }, use, testInfo) => {
    const stages = []
    const prefix = '[product-scene-diagnostic] '
    const capture = message => {
      if (!message.text().startsWith(prefix) || stages.length >= 150) return
      stages.push(JSON.parse(message.text().slice(prefix.length)))
    }
    page.on('console', capture)
    try {
      await use()
    } finally {
      page.off('console', capture)
      if (testInfo.status !== testInfo.expectedStatus) {
        console.info('[product-scene-failure] ' + JSON.stringify({
          test: testInfo.title, project: testInfo.project.name, stages,
        }))
      }
    }
  }, { auto: true }],
})

const expect = baseExpect.configure({ timeout: 13000 })

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
  // При задержанном кадре opacity может ещё показывать прежнее значение.
  // Сначала ждём снятия состояния перехода, которое блокирует следующий выбор.
  await expect(panel).not.toHaveClass(/\bis-text-hidden\b/)
  await expect.poll(() => panel.getByRole('heading').evaluate((heading) =>
    Number(globalThis.getComputedStyle(heading.parentElement).opacity))).toBe(1)
  return panel
}

async function allowSoftwareWebGL(page) {
  // CI использует программный GPU. Разрешаем его только в этом тесте,
  // чтобы проверять настоящую сцену отдельно от производственного выбора режима.
  await page.route(/webgl-warmup\.worker[^/]*\.js/, async route => {
    const response = await route.fetch()
    let source = await response.text()
    source = source.replace(/failIfMajorPerformanceCaveat\s*:\s*(?:true|!0)/g, 'failIfMajorPerformanceCaveat:false')
      .replace(/supported\s*:\s*!\w+/g, 'supported:true')
    await route.fulfill({ response, body: source })
  })
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
    // Worker недоступен: проверка должна перейти к обычному контексту,
    // который здесь намеренно заблокирован.
    globalThis.Worker = undefined
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

test('После прогрева работает 3D, а потеря контекста переключает на изображение', async ({ page, openPage }) => {
  await allowSoftwareWebGL(page)
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  await page.getByRole('tabpanel').getByRole('link').first().focus()
  const scene = page.getByRole('tabpanel').locator('.product-scene')
  await expect(scene).not.toHaveClass(/is-loading|has-error/)
  const canvas = scene.locator('.product-scene-canvas')
  await expect(canvas).toBeVisible()
  await canvas.evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext())
  await expect(scene.locator('img')).toBeVisible()
  await expect.poll(() => scene.locator('img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
})

test('Запрет анимации выбирает статичную банку без запуска 3D', async ({ page, openPage }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  const scene = page.getByRole('tabpanel').locator('.product-scene')
  await expect(scene.locator('img')).toBeVisible()
  await expect.poll(() => scene.locator('img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
  await expect(scene.locator('.product-scene-canvas')).toHaveCount(0)
})

test('Зависший прогрев завершается статичным изображением', async ({ page, openPage }) => {
  await page.addInitScript(() => {
    globalThis.Worker = class {
      postMessage() {}
      terminate() { globalThis.__warmupTerminated = true }
    }
  })
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  const scene = page.getByRole('tabpanel').locator('.product-scene')
  await expect(scene.locator('img')).toBeVisible()
  await expect.poll(() => page.evaluate(() => globalThis.__warmupTerminated)).toBe(true)
  await expect(scene.locator('.product-scene-canvas')).toHaveCount(0)
})

test('При недоступном Worker сохраняется обычный запуск 3D', async ({ page, openPage }) => {
  await page.addInitScript(() => {
    globalThis.Worker = undefined
    const getContext = globalThis.HTMLCanvasElement.prototype.getContext
    globalThis.HTMLCanvasElement.prototype.getContext = function(type, options) {
      const probe = type === 'webgl2' && options?.failIfMajorPerformanceCaveat
      const gl = getContext.call(this, type, probe ? { ...options, failIfMajorPerformanceCaveat: false } : options)
      if (probe && gl) {
        globalThis.__ordinaryProbe = true
        const getParameter = gl.getParameter.bind(gl)
        const debug = gl.getExtension('WEBGL_debug_renderer_info')
        gl.getParameter = parameter => parameter === debug?.UNMASKED_RENDERER_WEBGL
          ? 'Test hardware renderer' : getParameter(parameter)
      }
      return gl
    }
  })
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  await page.getByRole('tabpanel').getByRole('link').first().focus()
  const scene = page.getByRole('tabpanel').locator('.product-scene')
  await expect(scene).not.toHaveClass(/is-loading|has-error/)
  await expect.poll(() => page.evaluate(() => globalThis.__ordinaryProbe)).toBe(true)
  await expect(scene.locator('.product-scene-canvas')).toBeVisible()
})

test('Программный графический драйвер выбирает изображение вместо 3D', async ({ page, openPage }) => {
  await page.route(/webgl-warmup\.worker[^/]*\.js/, async route => {
    const response = await route.fetch()
    const probe = `
      const originalContext = OffscreenCanvas.prototype.getContext;
      OffscreenCanvas.prototype.getContext = function(type, options) {
        const gl = originalContext.call(this, type, {...options, failIfMajorPerformanceCaveat:false});
        if (gl) {
          const debug = gl.getExtension('WEBGL_debug_renderer_info');
          const originalParameter = gl.getParameter.bind(gl);
          gl.getParameter = parameter => parameter === debug?.UNMASKED_RENDERER_WEBGL
            ? 'SwiftShader' : originalParameter(parameter);
        }
        return gl;
      };
    `
    await route.fulfill({ response, body: probe + await response.text() })
  })
  await openPage()
  await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
  const scene = page.getByRole('tabpanel').locator('.product-scene')
  await expect(scene.locator('img')).toBeVisible()
  await expect(scene.locator('.product-scene-canvas')).toHaveCount(0)
})

test('Локальная кнопка включает картинки и возвращает обычный режим после переключения слайда', async ({ page, openPage, isMobile }) => {
  await allowSoftwareWebGL(page)
  await openPage()
  const button = page.getByRole('button', { name: /Картинки вместо 3D:/ })
  await expect(button).toBeVisible()
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  const scene = () => page.getByRole('tabpanel').locator('.product-scene')
  await expect(scene().locator('img')).toBeVisible()
  await expect(scene().locator('.product-scene-canvas')).toHaveCount(0)
  await switchDrink(page, isMobile, 'next', 'sidr')
  await expect(scene().locator('img')).toBeVisible()
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('tabpanel').locator('.product-visual').scrollIntoViewIfNeeded()
  await expect(scene()).not.toHaveClass(/is-loading|has-error/)
  await expect(scene().locator('.product-scene-canvas')).toBeVisible()
  await expect(scene().locator('img')).toHaveCount(0)
})

test('Кнопка доступна на тестовом домене только в staging и отсутствует на основном', async ({ page, baseURL }) => {
  await page.route('https://mc.yandex.ru/**', route => route.abort())
  await page.route(/^http:\/\/(?:test\.)?medved\.beer\//, async route => {
    const target = new URL(route.request().url())
    const local = new URL(baseURL)
    target.host = local.host
    const response = await route.fetch({ url: target.href })
    await route.fulfill({ response })
  })
  await page.addInitScript(() => localStorage.setItem('medved-age-confirmed', 'true'))
  for (const hostname of ['medved.beer', 'test.medved.beer']) {
    await page.goto(`http://${hostname}${new URL(baseURL).pathname}`)
    await page.waitForLoadState('networkidle')
    await expect.poll(() => page.evaluate(() => Boolean(globalThis.document.querySelector('#app')?.__vue_app__))).toBe(true)
    await expect(page.getByRole('heading', { name: 'Продукция', exact: true })).toBeAttached()
    await expect(page.getByRole('button', { name: /Картинки вместо 3D:/ })).toHaveCount(
      hostname === 'test.medved.beer' && process.env.SITE_ENV === 'staging' ? 1 : 0)
  }
})
