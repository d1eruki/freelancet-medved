import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

// Исправление прозрачных полей существующих рендеров без изменения
// камеры, масштаба, этикетки и пикселей продукта.
for (const category of ['mead', 'cider', 'perry']) {
  const directory = `src/assets/products/${category}`
  for (const name of await readdir(directory)) {
    if (!name.endsWith('.png') || name.endsWith('-glass.png')) continue
    const file = join(directory, name)
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    let left = info.width, right = -1, top = info.height, bottom = -1
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] < 128) continue
      left = Math.min(left, x); right = Math.max(right, x)
      top = Math.min(top, y); bottom = Math.max(bottom, y)
    }
    if (right < left) continue
    let dx = Math.round((info.width - left - right - 1) / 2)
    let dy = Math.round((info.height - top - bottom - 1) / 2)
    if (Math.max(Math.abs(dx), Math.abs(dy)) <= 4) continue
    // При необходимости добавляем прозрачное поле, сохраняя даже край тени.
    let width = info.width, height = info.height
    let alphaLeft = width, alphaRight = -1, alphaTop = height, alphaBottom = -1
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      if (!data[(y * info.width + x) * 4 + 3]) continue
      alphaLeft = Math.min(alphaLeft, x); alphaRight = Math.max(alphaRight, x)
      alphaTop = Math.min(alphaTop, y); alphaBottom = Math.max(alphaBottom, y)
    }
    if (alphaLeft + dx < 0 || alphaRight + dx >= width) {
      const center = (left + right + 1) / 2
      width = Math.ceil(2 * Math.max(center - alphaLeft, alphaRight + 1 - center)) + 2
      dx = Math.round(width / 2 - center)
    }
    if (alphaTop + dy < 0 || alphaBottom + dy >= height) {
      const center = (top + bottom + 1) / 2
      height = Math.ceil(2 * Math.max(center - alphaTop, alphaBottom + 1 - center)) + 2
      dy = Math.round(height / 2 - center)
    }
    const centered = Buffer.alloc(width * height * 4)
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      const source = (y * info.width + x) * 4
      const targetX = x + dx, targetY = y + dy
      if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
        if (data[source + 3]) throw new Error(`Сдвиг обрежет изображение: ${file}`)
        continue
      }
      data.copy(centered, (targetY * width + targetX) * 4, source, source + 4)
    }
    if (process.env.MEDVED_RENDER_BACKUP) {
      const backup = join(process.env.MEDVED_RENDER_BACKUP, file)
      await mkdir(dirname(backup), { recursive: true })
      try { await copyFile(file, backup, constants.COPYFILE_EXCL) } catch (error) { if (error.code !== 'EEXIST') throw error }
    }
    await writeFile(file, await sharp(centered, { raw: { width, height, channels: 4 } }).png().toBuffer())
    console.info(`${file}: сдвиг ${dx}, ${dy}; холст ${width}×${height}; пиксели продукта сохранены`)
  }
}
