import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import sharp from 'sharp'

// Экспорт текущей сцены слайдера, включая её контактную тень, без фона страницы.
const port = 4186
const url = `http://127.0.0.1:${port}/`
const directory = new URL('../src/assets/home/product-fallbacks/', import.meta.url)
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  env: { ...process.env, SITE_BASE: '/' }, stdio: 'ignore',
})
let browser
const renders = []
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error('Сервер экспорта не запустился')
    try { if ((await fetch(url)).ok) break } catch { /* сервер ещё запускается */ }
    await delay(100)
  }
  browser = await chromium.launch({ channel: 'chromium' })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', deviceScaleFactor: 1.5 })
  page.on('pageerror', error => console.error(error.message))
  let selectedIndex = 0
  // Каждый кадр получает свежую сцену с нужной этикеткой сразу при запуске.
  // Это исключает анимацию перехода и сохраняет исходный угол банки.
  await page.route('**/HomeProductsSection.vue*', async route => {
    const response = await route.fetch()
    const source = (await response.text()).replace('const activeIndex = ref(0)', `const activeIndex = ref(${selectedIndex})`)
    await route.fulfill({ response, body: source })
  })
  await page.route('https://yandex.ru/**', route => route.abort())
  // Экспорт разрешает программный рендеринг; это не меняет выбор режима на сайте.
  await page.route('**/webgl-warmup.worker.js*', route => route.fulfill({
    contentType: 'application/javascript', body: 'self.onmessage=()=>self.postMessage({supported:true})',
  }))
  // Отключаем вращение и переходы только при экспорте. Проверку GPU
  // оставляем в production без изменений, здесь разрешаем статичную 3D-сцену.
  await page.route('**/webgl-warmup.js*', async route => {
    const response = await route.fetch()
    const source = (await response.text()).replace(
      "if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)", 'if (false)')
    await route.fulfill({ response, body: source })
  })
  await page.addInitScript(() => {
    localStorage.setItem('medved-age-confirmed', 'true')
    const getContext = globalThis.HTMLCanvasElement.prototype.getContext
    globalThis.HTMLCanvasElement.prototype.getContext = function(type, options) {
      return getContext.call(this, type, /^webgl/.test(type)
        ? { ...options, preserveDrawingBuffer: true, failIfMajorPerformanceCaveat: false } : options)
    }
  })
  await mkdir(directory, { recursive: true })
  for (const [index, slug] of ['medovuha', 'sidr', 'puare'].entries()) {
    selectedIndex = index
    await page.goto(url)
    await page.getByRole('heading', { name: 'Продукция', exact: true }).scrollIntoViewIfNeeded()
    await page.getByRole('tabpanel').locator('.product-visual').scrollIntoViewIfNeeded()
    await page.waitForFunction(slug => {
      const panel = globalThis.document.querySelector(`[aria-labelledby="home-product-tab-${slug}"]`)
      return panel?.getAttribute('aria-hidden') === 'false' && !panel.classList.contains('is-text-hidden')
        && panel.querySelector('.product-scene:not(.is-loading):not(.has-error)')
    }, slug, { timeout: 30000 })
    await page.waitForTimeout(1000)
    const png = await page.getByRole('tabpanel').locator('.product-scene').evaluate(root => {
      const source = root.querySelector('.product-scene-canvas')
      const frame = source.getBoundingClientRect(), target = root.getBoundingClientRect()
      const output = globalThis.document.createElement('canvas')
      // Тень выходит вправо за квадрат модели. Сохраняем её целиком,
      // не уменьшая саму банку; изображение в компоненте имеет ту же пропорцию.
      output.width = 2048
      output.height = 1024
      output.getContext('2d').drawImage(source,
        (frame.left - target.left) / target.width * 1024,
        (frame.top - target.top) / target.height * 1024,
        frame.width / target.width * 1024, frame.height / target.height * 1024)
      return output.toDataURL('image/png').split(',')[1]
    })
    const bytes = await sharp(Buffer.from(png, 'base64')).webp({ lossless: true }).toBuffer()
    const stats = await sharp(bytes).stats()
    if (stats.channels[3]?.max === 0 || stats.isOpaque) throw new Error(`Некорректная прозрачность рендера ${slug}`)
    // Запись импортируемого файла вызывает Vite HMR и сбрасывает слайдер.
    // Сохраняем все результаты только после завершения трёх кадров.
    renders.push({ slug, bytes })
    console.info(`${slug}: ${bytes.length} bytes, 2048×1024, transparent`)
  }
  for (const { slug, bytes } of renders) await writeFile(new URL(`${slug}.webp`, directory), bytes)
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}
