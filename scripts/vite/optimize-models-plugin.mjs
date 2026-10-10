import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const jsonChunk = 0x4e4f534a
const binaryChunk = 0x004e4942
const webpExtension = 'EXT_texture_webp'
const align = length => Math.ceil(length / 4) * 4

export function parseGlb(source) {
  if (source.length < 28 || source.readUInt32LE(0) !== 0x46546c67
    || source.readUInt32LE(4) !== 2 || source.readUInt32LE(8) !== source.length) {
    throw new Error('Expected a valid GLB 2.0 file')
  }
  const jsonLength = source.readUInt32LE(12)
  const binaryHeader = 20 + jsonLength
  if (source.readUInt32LE(16) !== jsonChunk || binaryHeader + 8 > source.length
    || source.readUInt32LE(binaryHeader + 4) !== binaryChunk
    || binaryHeader + 8 + source.readUInt32LE(binaryHeader) !== source.length) {
    throw new Error('Expected JSON and BIN chunks in GLB')
  }
  const json = JSON.parse(source.subarray(20, binaryHeader).toString())
  if (json.buffers?.length !== 1 || json.buffers[0].uri) {
    throw new Error('Expected one embedded GLB buffer')
  }
  return { json, binary: source.subarray(binaryHeader + 8) }
}

function encodeGlb(json, binary) {
  const content = Buffer.from(JSON.stringify(json))
  const jsonData = Buffer.alloc(align(content.length), 0x20)
  content.copy(jsonData)
  const header = Buffer.alloc(20)
  header.writeUInt32LE(0x46546c67, 0)
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(28 + jsonData.length + binary.length, 8)
  header.writeUInt32LE(jsonData.length, 12)
  header.writeUInt32LE(jsonChunk, 16)
  const binaryHeader = Buffer.alloc(8)
  binaryHeader.writeUInt32LE(binary.length, 0)
  binaryHeader.writeUInt32LE(binaryChunk, 4)
  return Buffer.concat([header, jsonData, binaryHeader, binary])
}

export async function optimizeGlb(source) {
  const { json, binary } = parseGlb(source)
  const replacements = new Map()
  const converted = new Set()
  for (const [index, image] of (json.images || []).entries()) {
    if (image.mimeType !== 'image/png' || image.bufferView === undefined) continue
    const view = json.bufferViews[image.bufferView]
    const original = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)
    const optimized = await sharp(original).webp({ lossless: true, effort: 6 }).toBuffer()
    if (optimized.length >= original.length) continue
    replacements.set(image.bufferView, optimized)
    image.mimeType = 'image/webp'
    converted.add(index)
  }
  if (!converted.size) return source
  for (const texture of json.textures || []) {
    if (!converted.has(texture.source)) continue
    texture.extensions = { ...texture.extensions, [webpExtension]: { source: texture.source } }
    delete texture.source
  }
  json.extensionsUsed = [...new Set([...(json.extensionsUsed || []), webpExtension])]
  json.extensionsRequired = [...new Set([...(json.extensionsRequired || []), webpExtension])]

  // Меняем только изображения; остальные байты и относительные смещения accessors сохраняются.
  const parts = []
  let offset = 0
  for (const [index, view] of json.bufferViews.entries()) {
    if (view.buffer !== 0) throw new Error('Unexpected external buffer view')
    const data = replacements.get(index)
      || binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)
    view.byteOffset = offset
    view.byteLength = data.length
    parts.push(data, Buffer.alloc(align(data.length) - data.length))
    offset += align(data.length)
  }
  json.buffers[0].byteLength = offset
  const optimized = encodeGlb(json, Buffer.concat(parts))
  return optimized.length < source.length ? optimized : source
}

export function optimizeModelsPlugin() {
  let isBuild = false
  return {
    name: 'optimize-models',
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    async load(id) {
      const [resourcePath, query = ''] = id.split('?', 2)
      if (!isBuild || path.extname(resourcePath).toLowerCase() !== '.glb'
        || !new URLSearchParams(query).has('optimize')) return null
      this.addWatchFile(resourcePath)
      const referenceId = this.emitFile({
        type: 'asset', name: path.basename(resourcePath),
        source: await optimizeGlb(await readFile(resourcePath)),
      })
      return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`
    },
  }
}
