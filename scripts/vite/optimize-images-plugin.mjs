import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const rasterExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const assetsRoot = fileURLToPath(new URL('../../src/assets/', import.meta.url))

function responsiveModule(resourcePath, originalWidth, explicitOptimization) {
  const widths = [...[320, 480, 640, 960, 1440].filter((width) => width < originalWidth), originalWidth]
  const imports = []
  const candidates = widths.map((width, index) => {
    const query = [explicitOptimization ? 'optimize' : '', width === originalWidth ? '' : `width=${width}`].filter(Boolean).join('&')
    const name = `image${index}`
    imports.push(`import ${name} from ${JSON.stringify(`${resourcePath}${query ? `?${query}` : ''}`)};`)
    return `${name} + ${JSON.stringify(` ${width}w`)}`
  })
  return `${imports.join('\n')}
export default {
  src: image${widths.length - 1},
  srcset: [${candidates.join(', ')}].join(', '),
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
      const params = new URLSearchParams(query)
      const lossless = params.has('lossless')

      if ((!resourcePath.startsWith(assetsRoot) && !lossless && !params.has('optimize')) || !rasterExtensions.has(extension)) {
        return null
      }
      // Existing WebP assets stay untouched unless a conversion is requested.
      if (extension === '.webp' && !['responsive', 'width', 'lossless', 'optimize'].some(param => params.has(param))) {
        return null
      }

      if (lossless && (params.has('responsive') || params.has('width'))) {
        this.error('Lossless textures cannot be resized or converted to a lossy format')
      }
      if (params.has('responsive')) {
        this.addWatchFile(resourcePath)
        const { width } = await sharp(resourcePath).metadata()
        return responsiveModule(resourcePath, width, params.has('optimize'))
      }

      if (!isBuild) return null

      const widthParam = params.get('width')
      const width = widthParam === null ? null : Number(widthParam)
      if (widthParam !== null && (!Number.isInteger(width) || width < 1)) {
        this.error(`Invalid image width: ${widthParam}`)
      }
      const original = await readFile(resourcePath)
      const image = sharp(original)
      if (width !== null) image.resize({ width, withoutEnlargement: true })
      // Keep existing WebP pixels unless a resize or lossless encoding was requested.
      const optimized = extension === '.webp' && width === null && !lossless
        ? original
        : await image.webp(lossless
          ? { lossless: true, effort: 6 }
          : { quality: 82, effort: 4, alphaQuality: 100 }).toBuffer()
      const referenceId = this.emitFile({
        type: 'asset',
        name: `${path.basename(resourcePath, extension)}${width === null ? '' : `-${width}w`}.webp`,
        source: optimized,
      })

      return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`
    },
  }
}
