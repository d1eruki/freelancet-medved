import { chromium } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { resolve, join } from 'node:path'
import sharp from 'sharp'
import { drinkPresets } from '../src/data/drink-presets.js'
import { resolveProductRender } from '../src/data/product-render-settings.js'

// Этот экспорт вызывает ту же функцию, что кнопка в мастерской.
// Без --directory файлы сайта не заменяются: результат идёт в output/renders/products.
export async function renderProductBatch({ preset = 'card', products = Object.keys(drinkPresets).map(product => ({ product, name: product })), settings = {}, directory = 'output/renders/products', format = 'png', origin = '', port = 4191, consistentFrame = false } = {}) {
  if (!['png','webp'].includes(format)) throw new Error('Формат должен быть png или webp')
  // Проверяем конфигурацию до запуска браузера и записи файлов.
  const jobs = products.map(item => ({ ...item, config: resolveProductRender({product:item.product,preset,settings}) }))
  for (const item of jobs) {
    if (!Object.hasOwn(drinkPresets,item.product)) throw new Error(`Неизвестный сорт: ${item.product}`)
    if (!/^[a-z0-9-]+$/.test(item.name)) throw new Error('Имя результата должно содержать только латиницу, цифры и дефисы')
  }
  let server, browser
  const endpoint = origin || `http://127.0.0.1:${port}`
  const renders = []
  try {
    if (!origin) {
      server = spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:fileURLToPath(new URL('..',import.meta.url)),env:{...process.env,SITE_BASE:'/'},stdio:'ignore'})
      let ready = false
      for (let attempt = 0; attempt < 100; attempt++) {
        if (server.exitCode !== null) throw new Error('Сервер экспорта не запустился')
        try { if ((await fetch(endpoint)).ok) { ready = true; break } } catch { /* ждём запуск */ }
        await delay(100)
      }
      if (!ready) throw new Error('Сервер экспорта не ответил')
    }
    browser = await chromium.launch({channel:'chromium'})
    for (const {config,name} of jobs) {
      const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'})
      try {
        await page.goto(`${endpoint}/materials/models/product-render-lab.html?manual`)
        await page.waitForFunction(() => typeof globalThis.runProductRender === 'function')
        const result = await page.evaluate(async config => {
          await globalThis.runProductRender(config)
          const layers = globalThis.exportLayers()
          return {metadata:globalThis.renderInfo,png:globalThis.exportPng(),layers:Object.fromEntries(Object.entries(layers.canvases).map(([key,canvas]) => [key,canvas.toDataURL('image/png')]))}
        },config)
        const files = []
        const encode = async data => { const bytes = Buffer.from(data.split(',')[1],'base64'); return format === 'webp' ? sharp(bytes).webp({lossless:true}).toBuffer() : bytes }
        files.push({name:`${name}.${format}`,bytes:await encode(result.png)})
        for (const [key,data] of Object.entries(result.layers)) files.push({name:`${name}-${key}.${format}`,bytes:await encode(data)})
        files.push({name:`${name}.json`,bytes:JSON.stringify(result.metadata,null,2)+'\n'})
        renders.push({name,metadata:result.metadata,files})
        console.info(`${name}: ${result.metadata.frame.width} × ${result.metadata.frame.height}`)
      } finally { await page.close() }
    }
    if (consistentFrame && renders.length) {
      const geometry = metadata => {const frame=metadata.frame; return JSON.stringify([frame.width,frame.height,frame.heightScale,frame.topOffset,frame.center,frame.origins])}
      for (const render of renders) if (geometry(render.metadata) !== geometry(renders[0].metadata)) throw new Error('Несогласованные координаты слоёв')
    }
    await mkdir(directory,{recursive:true})
    for (const render of renders) for (const file of render.files) await writeFile(join(directory,file.name),file.bytes)
    return renders
  } finally {
    await browser?.close()
    server?.kill('SIGTERM')
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2), value = name => {const index=args.indexOf(name); return index < 0 ? undefined : args[index+1]}
  const imported = value('--settings') ? JSON.parse(await readFile(value('--settings'),'utf8')) : null
  const product = value('--product') || imported?.product
  await renderProductBatch({preset:value('--preset') || imported?.preset || 'card',settings:imported?.settings || {},
    ...(product ? {products:[{product,name:product}]} : {}),directory:value('--directory') || 'output/renders/products',format:value('--format') || 'png',origin:value('--origin') || ''})
}
