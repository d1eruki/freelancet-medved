#!/usr/bin/env node

// Batch matte glasses rendered on white. The approved mead PNG supplies the
// glass silhouette and one neutral contact shadow for every output.
//
// Usage:
//   node scripts/glass-matting.mjs normalize-shadow src/assets/products/*/*glass*.png
//   node scripts/glass-matting.mjs file INPUT_IMAGE OUTPUT_PNG
//   node scripts/glass-matting.mjs batch INPUT_DIR OUTPUT_DIR
//
// The script needs only the project's existing sharp dependency. Batch input
// must match the reference canvas and glass placement; mismatches are rejected.

import { access, mkdir, readdir } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const referencePath = fileURLToPath(new URL('../src/assets/products/mead/mead-default-glass.png', import.meta.url))
const shadowRgb = 48
const supportedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])

async function readRgba(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

async function writeRgba(path, image) {
  await sharp(image.data, {
    raw: { width: image.width, height: image.height, channels: 4 },
  }).png().toFile(path)
}

async function assertOutputDoesNotExist(path) {
  try {
    await access(path)
  } catch (error) {
    if (error.code === 'ENOENT') return
    throw error
  }
  throw new Error(`Выходной файл уже существует: ${path}`)
}

function sameSize(a, b) {
  return a.width === b.width && a.height === b.height
}

function makeShadowMask(reference) {
  const { data, width, height } = reference
  const mask = new Uint8Array(width * height)
  const start = Math.round(height * (1060 / 1254))
  const glassBottom = Math.round(height * (1132 / 1254))

  for (let y = start; y < height; y += 1) {
    let glassLeft = width
    let glassRight = -1

    if (y < glassBottom) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] >= 230) {
          glassLeft = Math.min(glassLeft, x)
          glassRight = x
        }
      }
    }

    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x
      const alpha = data[pixel * 4 + 3]
      if (alpha === 0) continue
      if (y >= glassBottom || glassRight < 0 || x < glassLeft - 4 || x > glassRight + 4) {
        mask[pixel] = 1
      }
    }
  }

  return mask
}

function neutralReference(reference, shadowMask) {
  const data = Buffer.from(reference.data)
  for (let pixel = 0; pixel < shadowMask.length; pixel += 1) {
    if (!shadowMask[pixel]) continue
    const offset = pixel * 4
    data[offset] = shadowRgb
    data[offset + 1] = shadowRgb
    data[offset + 2] = shadowRgb
  }
  return { ...reference, data }
}

async function makeLiquidMask(reference) {
  const { data, width, height } = reference
  const mask = Buffer.alloc(width * height)
  const top = Math.round(height * (250 / 1254))
  const bottom = Math.round(height * (1135 / 1254))

  for (let y = top; y <= bottom; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x
      const offset = pixel * 4
      if (data[offset + 3] < 200) continue
      const red = data[offset] / 255
      const green = data[offset + 1] / 255
      const blue = data[offset + 2] / 255
      const high = Math.max(red, green, blue)
      const low = Math.min(red, green, blue)
      const range = high - low
      if (high === 0 || range / high < 45 / 255) continue

      let hue = 0
      if (high === red) hue = ((green - blue) / range) % 6
      else if (high === green) hue = (blue - red) / range + 2
      else hue = (red - green) / range + 4
      hue = (hue * 60 + 360) % 360
      if (hue >= 10 && hue <= 80) mask[pixel] = 255
    }
  }

  const softened = await sharp(mask, { raw: { width, height, channels: 1 } }).blur(2).extractChannel(0).raw().toBuffer()
  for (let pixel = 0; pixel < softened.length; pixel += 1) {
    if (data[pixel * 4 + 3] < 200) softened[pixel] = 0
  }
  return softened
}

function assertMatchingAlpha(image, reference) {
  if (!sameSize(image, reference)) throw new Error('Размер изображения не совпадает с шаблоном')
  for (let pixel = 0; pixel < reference.width * reference.height; pixel += 1) {
    const offset = pixel * 4 + 3
    if (image.data[offset] !== reference.data[offset]) {
      throw new Error('Альфа-маска отличается от шаблона; файл не изменён')
    }
  }
}

export function normalizeShadow(image, reference, shadowMask) {
  assertMatchingAlpha(image, reference)
  const data = Buffer.from(image.data)
  for (let pixel = 0; pixel < shadowMask.length; pixel += 1) {
    if (!shadowMask[pixel]) continue
    const offset = pixel * 4
    data[offset] = shadowRgb
    data[offset + 1] = shadowRgb
    data[offset + 2] = shadowRgb
  }
  return { ...image, data }
}

function rimBounds(image, compositeWhite = false) {
  const { data, width, height } = image
  const top = Math.round(height * (35 / 1254))
  const bottom = Math.round(height * (220 / 1254))
  let left = width
  let right = -1
  let first = height
  let last = -1

  for (let y = top; y < bottom; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4
      const alpha = compositeWhite ? data[offset + 3] / 255 : 1
      const darkest = Math.min(...[0, 1, 2].map((channel) => (
        data[offset + channel] * alpha + 255 * (1 - alpha)
      )))
      if (darkest >= 170) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
      first = Math.min(first, y)
      last = Math.max(last, y)
    }
  }

  if (right < 0) throw new Error('Не удалось определить ободок бокала')
  return { left, right, top: first, bottom: last }
}

function assertWhiteBackground(image) {
  const { data, width, height } = image
  for (const [x, y] of [[5, 5], [width - 6, 5], [5, height - 6], [width - 6, height - 6]]) {
    const offset = (y * width + x) * 4
    if (data[offset + 3] < 250 || Math.min(data[offset], data[offset + 1], data[offset + 2]) < 235) {
      throw new Error('Фон в углах не выглядит ровным белым')
    }
  }
}

function alignmentShift(source, reference) {
  const expected = rimBounds(reference, true)
  const actual = rimBounds(source)
  const expectedWidth = expected.right - expected.left
  const actualWidth = actual.right - actual.left
  const sizeTolerance = Math.round(reference.width * (6 / 1254))
  if (Math.abs(expectedWidth - actualWidth) > sizeTolerance) {
    throw new Error('Размер или силуэт бокала отличается от шаблона')
  }

  const x = Math.round((expected.left + expected.right - actual.left - actual.right) / 2)
  const y = expected.top - actual.top
  const shiftLimit = Math.round(reference.width * (32 / 1254))
  if (Math.abs(x) > shiftLimit || Math.abs(y) > shiftLimit) throw new Error('Бокал смещён слишком сильно')

  // The box can be off by a pixel at antialiased edges. Match the empty upper
  // glass against its white composite to refine translation without using the
  // beverage color or the source's variable shadow.
  let best = { x, y, score: Number.POSITIVE_INFINITY }
  const top = Math.round(reference.height * (50 / 1254))
  const bottom = Math.round(reference.height * (220 / 1254))
  const left = Math.round(reference.width * (290 / 1254))
  const right = Math.round(reference.width * (965 / 1254))
  for (let candidateY = y - 3; candidateY <= y + 3; candidateY += 1) {
    for (let candidateX = x - 3; candidateX <= x + 3; candidateX += 1) {
      let score = 0
      for (let row = top; row < bottom; row += 4) {
        for (let column = left; column < right; column += 4) {
          const fromX = column - candidateX
          const fromY = row - candidateY
          if (fromX < 0 || fromY < 0 || fromX >= source.width || fromY >= source.height) continue
          const refOffset = (row * reference.width + column) * 4
          const sourceOffset = (fromY * source.width + fromX) * 4
          const alpha = reference.data[refOffset + 3] / 255
          const refDark = Math.min(
            reference.data[refOffset] * alpha + 255 * (1 - alpha),
            reference.data[refOffset + 1] * alpha + 255 * (1 - alpha),
            reference.data[refOffset + 2] * alpha + 255 * (1 - alpha),
          )
          const sourceDark = Math.min(source.data[sourceOffset], source.data[sourceOffset + 1], source.data[sourceOffset + 2])
          score += Math.abs(refDark - sourceDark)
        }
      }
      if (score < best.score) best = { x: candidateX, y: candidateY, score }
    }
  }
  return { x: best.x, y: best.y }
}

export function matteWhiteImage(source, reference, shadowMask, liquidMask) {
  if (!sameSize(source, reference)) throw new Error('Размер изображения не совпадает с шаблоном')
  assertWhiteBackground(source)
  const shift = alignmentShift(source, reference)

  const data = Buffer.from(reference.data)
  for (let pixel = 0; pixel < shadowMask.length; pixel += 1) {
    const offset = pixel * 4
    const alpha = reference.data[offset + 3]
    const blend = liquidMask[pixel] / 255
    if (alpha < 200 || shadowMask[pixel] || blend === 0) continue

    const sourceX = pixel % reference.width - shift.x
    const sourceY = Math.floor(pixel / reference.width) - shift.y
    const sourceOffset = sourceY >= 0 && sourceY < source.height && sourceX >= 0 && sourceX < source.width
      ? (sourceY * source.width + sourceX) * 4
      : -1
    for (let channel = 0; channel < 3; channel += 1) {
      const whiteComposited = sourceOffset < 0 ? 255 : source.data[sourceOffset + channel]
      const foreground = (whiteComposited * 255 - 255 * (255 - alpha)) / alpha
      const mapped = Math.max(0, Math.min(255, foreground))
      data[offset + channel] = Math.round(reference.data[offset + channel] * (1 - blend) + mapped * blend)
    }
  }

  return { ...reference, data }
}

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (!['normalize-shadow', 'file', 'batch'].includes(command)) {
    throw new Error('Использование: normalize-shadow FILE..., file INPUT_IMAGE OUTPUT_PNG или batch INPUT_DIR OUTPUT_DIR')
  }

  const originalReference = await readRgba(referencePath)
  const shadowMask = makeShadowMask(originalReference)
  const reference = neutralReference(originalReference, shadowMask)
  const liquidMask = await makeLiquidMask(reference)

  if (command === 'normalize-shadow') {
    if (args.length === 0) throw new Error('Укажите PNG-файлы для нормализации тени')
    const targets = await Promise.all(args.map(async (path) => ({ path, image: await readRgba(path) })))
    for (const target of targets) assertMatchingAlpha(target.image, reference)
    for (const target of targets) {
      await writeRgba(target.path, normalizeShadow(target.image, reference, shadowMask))
      process.stdout.write(`Тень нормализована: ${target.path}\n`)
    }
    return
  }

  if (command === 'file') {
    if (args.length !== 2) throw new Error('Укажите входное изображение и выходной PNG')
    const [inputPath, outputPath] = args.map((path) => resolve(path))
    if (inputPath === outputPath) throw new Error('Входной и выходной файл должны различаться')
    const source = await readRgba(inputPath)
    const image = matteWhiteImage(source, reference, shadowMask, liquidMask)
    await assertOutputDoesNotExist(outputPath)
    await mkdir(dirname(outputPath), { recursive: true })
    await writeRgba(outputPath, image)
    process.stdout.write(`Готово: ${outputPath}\n`)
    return
  }

  if (args.length !== 2) throw new Error('Укажите входную и выходную папки')
  const [inputDir, outputDir] = args.map((path) => resolve(path))
  if (inputDir === outputDir) throw new Error('Входная и выходная папки должны различаться')
  const files = (await readdir(inputDir)).filter((name) => supportedExtensions.has(extname(name).toLowerCase()))
  if (files.length === 0) throw new Error('Во входной папке нет изображений PNG, JPG или WebP')
  for (const name of files) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(basename(name, extname(name)))) {
      throw new Error(`Назовите файл по-английски в формате kebab-case: ${name}`)
    }
  }

  const results = []
  for (const name of files) {
    try {
      const source = await readRgba(join(inputDir, name))
      const image = matteWhiteImage(source, reference, shadowMask, liquidMask)
      results.push({ name, image })
    } catch (error) {
      throw new Error(`${name}: ${error.message}`)
    }
  }

  const outputs = results.map(({ name, image }) => ({
    path: join(outputDir, `${basename(name, extname(name))}-cutout.png`),
    image,
  }))
  if (new Set(outputs.map(({ path }) => path)).size !== outputs.length) {
    throw new Error('У входных файлов совпадают имена без расширения')
  }
  await mkdir(outputDir, { recursive: true })
  for (const output of outputs) {
    await assertOutputDoesNotExist(output.path)
  }
  for (const output of outputs) {
    await writeRgba(output.path, output.image)
    process.stdout.write(`Готово: ${output.path}\n`)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
}

export { alignmentShift, makeLiquidMask, makeShadowMask, neutralReference, readRgba }
