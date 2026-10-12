import { chromium } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import sharp from 'sharp'

// Отдельные модели и тени из штатной сцены лабы. Никаких снимков страницы.
const port = 4186
const origin = `http://127.0.0.1:${port}`
const directory = new URL('../src/assets/home/product-renders/', import.meta.url)
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  env: { ...process.env, SITE_BASE: '/' }, stdio: 'ignore',
})
let browser
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error('Сервер экспорта не запустился')
    try { if ((await fetch(origin)).ok) break } catch { /* сервер ещё запускается */ }
    await delay(100)
  }
  browser = await chromium.launch({ channel: 'chromium' })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', deviceScaleFactor: 1.5 })
  page.on('pageerror', error => console.error(error.message))
  const products = [
    ['medovuha', 'mead-light'],
    ['sidr', 'cider-antonovka'],
    ['puare', 'perry-williams'],
  ]
  const renders = []
  let frame
  const workshop = `${origin}/materials/models/product-render-lab.html`
  for (const [slug, drink] of products) {
    await page.goto(`${workshop}?drink=${drink}&mode=pair&shadow=cast`)
    await page.waitForFunction(() => globalThis.renderReady || globalThis.renderError, null, { timeout: 60000 })
    const error = await page.evaluate(() => globalThis.renderError)
    if (error) throw new Error(error)
    const result = await page.evaluate(() => {
      const result = globalThis.exportLayers()
      return { frame: { width: result.width, height: result.height, heightScale: result.heightScale, topOffset: result.topOffset, center: result.center, origins: result.origins },
        layers: Object.fromEntries(Object.entries(result.canvases).map(([key, canvas]) => [key, canvas.toDataURL('image/png').split(',')[1]])) }
    })
    if (frame && JSON.stringify(frame) !== JSON.stringify(result.frame)) throw new Error('Несогласованные координаты слоёв')
    frame = result.frame
    for (const [layer, png] of Object.entries(result.layers)) {
      const bytes = await sharp(Buffer.from(png, 'base64')).webp({ lossless: true }).toBuffer()
      const stats = await sharp(bytes).stats()
      if (!stats.channels[3]?.max || stats.isOpaque) throw new Error(`Некорректный слой ${slug}-${layer}`)
      const metadata = await sharp(bytes).metadata()
      renders.push({ name: `${slug}-${layer}.webp`, bytes })
      console.info(`${slug}-${layer}: ${metadata.width}×${metadata.height}, ${bytes.length} bytes`)
    }
  }
  // Одиночные страницы тоже обязаны использовать сцену лабы и контактную тень.
  for (const path of ['?drink=cider-antonovka&mode=can&volume=450&shadow=contact', '?drink=cider-antonovka&mode=can&volume=330&shadow=contact', '?drink=mead-light&mode=glass&shadow=contact']) {
    await page.goto(`${workshop}${path}`)
    await page.waitForFunction(() => globalThis.renderReady || globalThis.renderError, null, { timeout: 60000 })
    const result = await page.evaluate(() => ({ error: globalThis.renderError, info: globalThis.renderInfo,
      png: globalThis.renderReady && globalThis.exportPng().split(',')[1] }))
    if (result.error) throw new Error(result.error)
    if (result.info.shadow !== 'contact') throw new Error('Не выбрана контактная тень')
    const stats = await sharp(Buffer.from(result.png, 'base64')).stats()
    if (!stats.channels[3]?.max || stats.isOpaque) throw new Error(`Некорректный одиночный рендер ${path}`)
    console.info(`single: ${path}, transparent, contact shadow`)
  }
  await mkdir(directory, { recursive: true })
  for (const { name, bytes } of renders) await writeFile(new URL(name, directory), bytes)
  const metadataFile = new URL('../src/data/product-slider-renders.js', import.meta.url)
  const metadata = await readFile(metadataFile, 'utf8')
  await writeFile(metadataFile, metadata.replace(/^export const productRenderFrame = .*$/m, `export const productRenderFrame = Object.freeze(${JSON.stringify(frame)})`))
  console.info('frame:', frame)
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}
