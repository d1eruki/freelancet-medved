import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const rasterExtensions = new Set(['.png', '.jpg', '.jpeg'])
const assetsRoot = fileURLToPath(new URL('../../src/assets/', import.meta.url))

export function optimizeImagesPlugin() {
  return {
    name: 'optimize-images',
    apply: 'build',
    enforce: 'pre',
    async load(id) {
      const [resourcePath, query = ''] = id.split('?', 2)
      const extension = path.extname(resourcePath).toLowerCase()

      if (!resourcePath.startsWith(assetsRoot) || !rasterExtensions.has(extension)) {
        return null
      }

      const widthParam = new URLSearchParams(query).get('width')
      const width = widthParam === null ? null : Number(widthParam)
      if (widthParam !== null && (!Number.isInteger(width) || width < 1)) {
        this.error(`Invalid image width: ${widthParam}`)
      }

      const original = await readFile(resourcePath)
      const image = sharp(original)
      if (width !== null) image.resize({ width, withoutEnlargement: true })
      const webp = await image.webp({ quality: 82, effort: 4, alphaQuality: 100 }).toBuffer()
      const useWebp = width !== null || webp.length < original.length
      const outputExtension = useWebp ? '.webp' : extension
      const referenceId = this.emitFile({
        type: 'asset',
        name: `${path.basename(resourcePath, extension)}${width === null ? '' : `-${width}w`}${outputExtension}`,
        source: useWebp ? webp : original,
      })

      return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`
    },
  }
}
