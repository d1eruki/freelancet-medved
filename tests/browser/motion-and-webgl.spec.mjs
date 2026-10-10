import { test, expect } from './fixtures.mjs'

test.use({ reducedMotion: 'no-preference' })

async function runWithDiagnostics(page, openPage, testInfo, scenario) {
  const started = Date.now()
  const events = []
  const resources = new Map()
  const prefix = '[hydration-diagnostic] '
  const record = (event) => events.push({ elapsedMs: Date.now() - started, ...event })
  const resourcePath = (url) => new URL(url).pathname
  const onRequest = (request) => {
    resources.set(request, { path: resourcePath(request.url()), type: request.resourceType(), startedMs: Date.now() - started })
    if (['script', 'stylesheet'].includes(request.resourceType())) {
      record({ event: 'request', path: resourcePath(request.url()) })
    }
  }
  const onFinished = (request) => {
    const resource = resources.get(request)
    if (!resource) return
    resource.durationMs = Date.now() - started - resource.startedMs
    if (['script', 'stylesheet'].includes(resource.type)) record({ event: 'loaded', ...resource })
  }
  const onFailed = (request) => {
    const resource = resources.get(request)
    if (resource) resource.failure = request.failure()?.errorText
    record({ event: 'request-failed', path: resourcePath(request.url()), error: request.failure()?.errorText })
  }
  const onConsole = (message) => {
    if (message.text().startsWith(prefix)) record({ browser: JSON.parse(message.text().slice(prefix.length)) })
    else if (message.type() === 'error') record({ event: 'console-error', message: message.text().slice(0, 500) })
  }
  const onError = (error) => record({ event: 'page-error', message: error.message })
  page.on('request', onRequest)
  page.on('requestfinished', onFinished)
  page.on('requestfailed', onFailed)
  page.on('console', onConsole)
  page.on('pageerror', onError)
  await page.addInitScript(({ prefix }) => {
    if (globalThis !== globalThis.top) return
    const emit = (event, details = {}) => console.info(prefix + JSON.stringify({
      event, browserMs: Math.round(performance.now()), ...details,
    }))
    // Оборачиваем нативные вызовы только внутри тестового браузера.
    // Начало первого вызова видно даже тогда, когда сам вызов зависает.
    const contexts = new WeakMap()
    let nextContext = 0, slowWebglCalls = 0
    const describeContext = (gl) => {
      const canvas = gl.canvas
      const scene = canvas?.classList?.contains('product-scene-canvas') ? 'product-scene' : 'unassigned'
      return { scene, canvasWidth: canvas?.width, canvasHeight: canvas?.height }
    }
    const operations = new Set([
      'compileShader', 'linkProgram', 'getProgramInfoLog', 'getShaderInfoLog', 'getProgramParameter',
      'getShaderParameter', 'getActiveUniform', 'getUniformLocation', 'getActiveAttrib', 'getAttribLocation',
      'getParameter', 'getError',
      'texImage2D', 'texSubImage2D', 'texStorage2D', 'generateMipmap', 'checkFramebufferStatus',
      'drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced',
      'readPixels', 'finish', 'flush',
    ])
    const prototypes = [globalThis.WebGLRenderingContext?.prototype, globalThis.WebGL2RenderingContext?.prototype]
    for (const prototype of prototypes.filter(Boolean)) {
      for (const operation of Object.getOwnPropertyNames(prototype)) {
        if (operation === 'constructor') continue
        const descriptor = Object.getOwnPropertyDescriptor(prototype, operation)
        if (typeof descriptor?.value !== 'function') continue
        const original = descriptor.value
        Object.defineProperty(prototype, operation, {
          ...descriptor,
          value: function (...args) {
            let context = contexts.get(this)
            if (!context) {
              context = { id: ++nextContext, started: new Set() }
              contexts.set(this, context)
            }
            const first = operations.has(operation) && !context.started.has(operation)
            if (first) {
              context.started.add(operation)
              emit('webgl-call-start', {
                context: context.id, operation, ...describeContext(this),
                stack: new Error().stack?.split('\n').slice(2, 7).join('\n'),
              })
            }
            const startMs = performance.now()
            try {
              return Reflect.apply(original, this, args)
            } finally {
              const durationMs = Math.round(performance.now() - startMs)
              if (first || (durationMs >= 50 && slowWebglCalls < 40)) {
                if (durationMs >= 50) slowWebglCalls++
                emit('webgl-call-end', {
                  context: context.id, operation, ...describeContext(this), startMs: Math.round(startMs), durationMs,
                  ...(durationMs >= 50 ? { stack: new Error().stack?.split('\n').slice(2, 7).join('\n') } : {}),
                })
              }
            }
          },
        })
      }
    }
    emit('document-start', { motion: globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference' })
    globalThis.addEventListener('DOMContentLoaded', () => emit('dom-ready'), { once: true })
    globalThis.addEventListener('load', () => emit('window-load'), { once: true })
    let longTasks = 0
    const productState = () => {
      const panel = globalThis.document.querySelector('[role=tabpanel][aria-hidden=false]')
      const scene = panel?.querySelector('.product-scene')
      return {
        panel: panel?.getAttribute('aria-labelledby') ?? null,
        panelClass: panel?.className ?? null,
        sceneClass: scene?.className ?? null,
      }
    }
    let previousState
    const products = new globalThis.MutationObserver(() => {
      const state = productState()
      const signature = JSON.stringify(state)
      if (signature === previousState) return
      previousState = signature
      emit('product-state', state)
    })
    products.observe(globalThis.document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-labelledby', 'aria-hidden'] })
    const observeInput = (event) => {
      if (!event.target.closest?.('[role=tablist], [role=tabpanel]')) return
      if (event.type === 'keydown' && !['ArrowRight', 'ArrowLeft'].includes(event.key)) return
      const startMs = performance.now()
      emit('product-input', { type: event.type, key: event.key, ...productState() })
      // Независимый таймер показывает блокировку потока, не меняя таймеры приложения.
      globalThis.setTimeout(() => emit('product-timer-probe', {
        delayMs: Math.round(performance.now() - startMs), expectedMs: 360, ...productState(),
      }), 360)
    }
    globalThis.document.addEventListener('keydown', observeInput, true)
    globalThis.document.addEventListener('click', observeInput, true)
    const observer = new PerformanceObserver((list) => {
      for (const task of list.getEntries()) {
        if (longTasks++ < 80) emit('long-task', { startMs: Math.round(task.startTime), durationMs: Math.round(task.duration) })
      }
    })
    observer.observe({ type: 'longtask', buffered: true })
    // Наблюдаем готовность, не перехватывая внутренние свойства Vue и не меняя приложение.
    let reported = false
    const checkVue = () => {
      if (reported) return
      if (!globalThis.document.querySelector('#app')?.__vue_app__) return
      reported = true
      emit('vue-observed')
      globalThis.clearInterval(timer)
      mutations.disconnect()
    }
    const timer = globalThis.setInterval(checkVue, 100)
    const mutations = new globalThis.MutationObserver(checkVue)
    mutations.observe(globalThis.document, { childList: true, subtree: true, attributes: true })
  }, { prefix })
  // Профиль отличает тяжёлый JavaScript от ожидания ресурсов или рендеринга.
  let session
  let cpuHotspots = []
  try {
    session = await page.context().newCDPSession(page)
    await session.send('Profiler.enable')
    await session.send('Profiler.start')
  } catch (error) {
    record({ event: 'profiler-unavailable', message: error.message })
  }
  let outcome = 'failed'
  try {
    await openPage()
    record({ event: 'fixture-ready' })
    await scenario(record)
    outcome = 'passed'
  } finally {
    if (session) {
      let timer
      try {
        const { profile } = await Promise.race([
          session.send('Profiler.stop'),
          new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Profiler response exceeded 1500ms')), 1500) }),
        ])
        const totals = new Map()
        for (const [index, id] of (profile.samples || []).entries()) {
          totals.set(id, (totals.get(id) || 0) + (profile.timeDeltas?.[index] || 0))
        }
        cpuHotspots = profile.nodes.map(({ id, callFrame }) => ({
          function: callFrame.functionName || '(anonymous)',
          path: callFrame.url ? resourcePath(callFrame.url) : null,
          line: callFrame.lineNumber + 1,
          selfMs: Math.round((totals.get(id) || 0) / 1000),
        })).filter((node) => node.selfMs > 0).sort((a, b) => b.selfMs - a.selfMs).slice(0, 10)
      } catch (error) {
        record({ event: 'profiler-unavailable', message: error.message })
      } finally {
        clearTimeout(timer)
        // Не ждём ответа зависшего renderer; это не должно скрыть исходный сбой теста.
        void session.detach().catch(() => {})
      }
    }
    const entries = [...resources.values()]
    console.info(prefix + JSON.stringify({
      test: testInfo.title, project: testInfo.project.name, outcome, events, cpuHotspots,
      pending: entries.filter((resource) => resource.durationMs === undefined && !resource.failure),
      slowest: entries.filter((resource) => resource.durationMs !== undefined)
        .sort((a, b) => b.durationMs - a.durationMs).slice(0, 10),
    }))
    page.off('request', onRequest)
    page.off('requestfinished', onFinished)
    page.off('requestfailed', onFailed)
    page.off('console', onConsole)
    page.off('pageerror', onError)
  }
}

async function switchDrink(page, isMobile, direction, slug, record) {
  record({ event: 'switch-start', direction, slug })
  if (isMobile) {
    await page.getByRole('tabpanel').getByRole('button', {
      name: direction === 'next' ? 'Следующий напиток' : 'Предыдущий напиток',
    }).click()
  } else {
    await page.getByRole('tab', { selected: true }).focus()
    await page.keyboard.press(direction === 'next' ? 'ArrowRight' : 'ArrowLeft')
  }
  record({ event: 'switch-input-sent', direction, slug })
  const panel = page.getByRole('tabpanel')
  await expect(panel).toHaveAttribute('aria-labelledby', `home-product-tab-${slug}`)
  record({ event: 'switch-panel-updated', direction, slug })
  // Текст должен вернуться после анимации, а следующий переход снова быть доступен.
  await expect.poll(() => panel.getByRole('heading').evaluate((heading) =>
    Number(globalThis.getComputedStyle(heading.parentElement).opacity))).toBe(1)
  record({ event: 'switch-text-visible', direction, slug })
  return panel
}

test('Обычная анимация завершается и позволяет переключать напитки и переходить в каталог', async ({ page, openPage, isMobile }, testInfo) => {
  await runWithDiagnostics(page, openPage, testInfo, async (record) => {
    await expect.poll(() => page.evaluate(() => globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false)
    await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
    await switchDrink(page, isMobile, 'next', 'sidr', record)
    const panel = await switchDrink(page, isMobile, 'previous', 'medovuha', record)
    await panel.getByRole('link', { name: 'Подробнее', exact: true }).click()
    await expect(page).toHaveURL(/\/katalog\/medovuha\/$/)
    await expect(page.locator('main h1')).toContainText('Медовуха')
  })
})

test('При недоступном WebGL показывается изображение и сохраняются управление и переходы', async ({ page, openPage, isMobile }, testInfo) => {
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
  await runWithDiagnostics(page, openPage, testInfo, async (record) => {
    await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
    const fallback = page.getByRole('tabpanel').locator('img')
    await expect(fallback).toBeVisible()
    await expect.poll(() => fallback.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true)
    await expect.poll(() => page.evaluate(() => globalThis.__webglAttempts || 0)).toBeGreaterThan(0)
    const panel = await switchDrink(page, isMobile, 'next', 'sidr', record)
    const nextFallback = panel.locator('img')
    await expect(nextFallback).toBeVisible()
    await expect.poll(() => nextFallback.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true)
    await panel.getByRole('link', { name: 'Подробнее', exact: true }).click()
    await expect(page).toHaveURL(/\/katalog\/sidr\/$/)
    await expect(page.locator('main h1')).toContainText('Сидр')
  })
})
