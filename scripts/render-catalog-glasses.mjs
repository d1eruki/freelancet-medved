import { copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { constants } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import sharp from 'sharp'
import { drinkPresets } from '../src/data/drink-presets.js'
import { renderProductBatch } from './render-products.mjs'

// Камера, свет и материалы берутся из сохранённого профиля card.
// Промежуточные файлы живут только во временном каталоге.
const directory = await mkdtemp(join(tmpdir(), 'medved-catalog-glasses-'))
const catalogProducts = Object.entries(drinkPresets).map(([product, recipe]) => ({
  product, name: basename(recipe.target, '.png'), target: recipe.target,
}))
const categoryProducts = ['mead', 'cider', 'perry'].flatMap(category => ['default', 'category'].map(kind => ({
  product: { mead: 'mead-light', cider: 'cider-antonovka', perry: 'perry-williams' }[category],
  name: `${category}-${kind}-glass`, target: `src/assets/products/${category}/${category}-${kind}-glass.png`,
})))
const legacyProducts = [
  { product: 'mead-berry', name: 'marion-berry-glass', target: 'src/assets/products/cider/marion-berry-glass.png' },
  { product: 'mead-blackcurrant', name: 'marion-blackcurrant-berry-glass', target: 'src/assets/products/cider/marion-blackcurrant-berry-glass.png' },
]
// Обычный запуск обновляет только стаканы карточек. Бокалы категорий
// и старые варианты запускаются отдельно через --remaining.
const products = process.argv.includes('--remaining') ? [...categoryProducts, ...legacyProducts] : catalogProducts
const backupDirectory = process.env.MEDVED_RENDER_BACKUP
if (backupDirectory) {
  for (const item of products) {
    const backup = join(backupDirectory, item.target)
    await mkdir(dirname(backup), { recursive: true })
    try { await copyFile(item.target, backup, constants.COPYFILE_EXCL) } catch (error) { if (error.code !== 'EEXIST') throw error }
  }
}
try {
for (const item of products) {
  const reference = backupDirectory ? join(backupDirectory, item.target) : item.target
  const { data, info } = await sharp(reference).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let top = info.height, bottom = -1
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] < 128) continue
    top = Math.min(top, y); bottom = Math.max(bottom, y)
  }
  await renderProductBatch({ preset: 'card', products: [item], directory,
    port: process.argv.includes('--remaining') ? 4192 : 4191,
    settings: { quality: { maxModelPixels: info.height > 2000 ? 2880 : 1440, maxPixelRatio: info.height > 2000 ? 6 : 3, maxFramePixels: info.height > 2000 ? 8192 : 4096 },
      output: { width: info.width, height: info.height, subjectHeight: bottom - top + 1 } } })
}
for (const item of products) await copyFile(join(directory, `${item.name}.png`), item.target)
} finally {
  await rm(directory, { recursive: true, force: true })
}
