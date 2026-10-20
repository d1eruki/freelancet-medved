import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderProductBatch } from './render-products.mjs'
import sharp from 'sharp'
import { productRenderProfiles } from '../src/data/product-render-settings.js'

const args = process.argv.slice(2)
const directoryIndex = args.indexOf('--directory')
if (directoryIndex >= 0 && !args[directoryIndex + 1]) throw new Error('Укажите каталог после --directory')
const presetIndex = args.indexOf('--preset')
const preset = presetIndex < 0 ? 'slider' : args[presetIndex + 1]
if (!['slider', 'slider-combined'].includes(preset)) throw new Error('Выберите --preset slider или slider-combined')
if (preset === 'slider-combined' && directoryIndex < 0) throw new Error('Для цельной композиции укажите --directory: картинки сайта не заменяются')
const separate = preset === 'slider'
const target = fileURLToPath(new URL('../src/assets/home/product-renders/', import.meta.url))
const directory = directoryIndex < 0 ? target : resolve(args[directoryIndex + 1])
if (!separate && directory === resolve(target)) throw new Error('Цельную композицию сохраняйте вне каталога изображений сайта')
const temporary = await mkdtemp(join(tmpdir(), 'medved-slider-layers-'))
try {
  const renders = await renderProductBatch({ preset, format: 'webp', consistentFrame: true,
    directory: temporary,
    products: [{ name: 'medovuha', product: 'mead-light' }, { name: 'sidr', product: 'cider-antonovka' }, { name: 'puare', product: 'perry-williams' }] })
  const { frame: first } = renders[0].metadata
  const frame = { width: first.width, height: first.height, heightScale: first.heightScale, topOffset: first.topOffset, center: first.center, origins: first.origins }
  if (separate) {
    const bounds = async layer => {
      const file = renders[0].files.find(file => file.name === `medovuha-${layer}.webp`)
      const { data, info } = await sharp(file.bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      let top = info.height, bottom = -1
      for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
        if (data[(y * info.width + x) * info.channels + 3] < 128) continue
        top = Math.min(top, y); bottom = Math.max(bottom, y)
      }
      if (bottom < top) throw new Error(`Пустой слой ${layer}`)
      return { height: bottom - top + 1, bottom: bottom + 1 }
    }
    const glass = await bounds('glass'), can = await bounds('can')
    const { glassHeight, baseline } = productRenderProfiles.slider.settings.presentation
    const displayScale = glassHeight / glass.height
    // Размер задаёт силуэт, а не прозрачные поля и длина отбрасываемой тени.
    frame.heightScale = frame.height * displayScale
    frame.topOffset = (baseline - can.bottom * displayScale) * 100
  }
  await mkdir(directory, { recursive: true })
  for (const render of renders) {
    for (const layer of separate ? ['glass', 'can', 'glass-shadow', 'can-shadow'] : ['pair', 'pair-shadow']) {
      const name = `${render.name}-${layer}.webp`
      const file = render.files.find(file => file.name === name)
      if (!file) throw new Error(`Не получен слой ${name}`)
      await writeFile(join(directory, name), file.bytes)
    }
  }
  if (directory === target && separate) {
    const metadataFile = new URL('../src/data/product-slider-renders.js', import.meta.url)
    const metadata = await readFile(metadataFile, 'utf8')
    await writeFile(metadataFile, metadata.replace(/^export const productRenderFrame = .*$/m, `export const productRenderFrame = Object.freeze(${JSON.stringify(frame)})`))
  } else {
    // Отдельный каталог позволяет сверить рендеры до замены изображений сайта.
    await writeFile(join(directory, 'frame.json'), JSON.stringify(frame, null, 2) + '\n')
  }
  console.info('frame:', frame)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
