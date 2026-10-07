import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const rasterExtensions = new Set(['.png', '.jpg', '.jpeg'])
const assetsRoot = fileURLToPath(new URL('../../src/assets/', import.meta.url))

function responsiveModule(resourcePath, originalWidth) {
  const widths = [...[640, 960].filter((width) => width < originalWidth), originalWidth]
  const imports = []
  const srcsets = []
  for (const [prefix, formatQuery] of [['image', ''], ['avif', 'format=avif']]) {
    const candidates = widths.map((width, index) => {
      const query = [formatQuery, width === originalWidth ? '' : `width=${width}`].filter(Boolean).join('&')
      const name = `${prefix}${index}`
      imports.push(`import ${name} from ${JSON.stringify(`${resourcePath}${query ? `?${query}` : ''}`)};`)
      return `${name} + ${JSON.stringify(` ${width}w`)}`
    })
    srcsets.push(`[${candidates.join(', ')}].join(', ')`)
  }
  return `${imports.join('\n')}
export default {
  src: image${widths.length - 1},
  avifSrc: avif${widths.length - 1},
  srcset: ${srcsets[0]},
  avifSrcset: ${srcsets[1]},
};`
}

export function optimizeImagesPlugin() {
  let isBuild = false
  return {
    name: 'optimize-images',
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    async load(id) {
      const [resourcePath, query = ''] = id.split('?', 2)
      const extension = path.extname(resourcePath).toLowerCase()

      if (!resourcePath.startsWith(assetsRoot) || !rasterExtensions.has(extension)) {
        return null
      }

      const params = new URLSearchParams(query)
      if (params.has('responsive')) {
        this.addWatchFile(resourcePath)
        const { width } = await sharp(resourcePath).metadata()
        return responsiveModule(resourcePath, width)
      }

      if (!isBuild) return null

      const widthParam = params.get('width')
      const width = widthParam === null ? null : Number(widthParam)
      if (widthParam !== null && (!Number.isInteger(width) || width < 1)) {
        this.error(`Invalid image width: ${widthParam}`)
      }
      const format = params.get('format')
      if (format !== null && format !== 'avif') {
        this.error(`Invalid image format: ${format}`)
      }

      const original = await readFile(resourcePath)
      const image = sharp(original)
      if (width !== null) image.resize({ width, withoutEnlargement: true })
      const optimized = format === 'avif'
        ? await image.avif({ quality: 65, effort: 4 }).toBuffer()
        : await image.webp({ quality: 82, effort: 4, alphaQuality: 100 }).toBuffer()
      const useOptimized = format === 'avif' || width !== null || optimized.length < original.length
      const outputExtension = useOptimized ? (format === 'avif' ? '.avif' : '.webp') : extension
      const referenceId = this.emitFile({
        type: 'asset',
        name: `${path.basename(resourcePath, extension)}${width === null ? '' : `-${width}w`}${outputExtension}`,
        source: useOptimized ? optimized : original,
      })

      return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`
    },
  }
}
