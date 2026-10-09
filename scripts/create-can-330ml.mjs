import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { BufferGeometry, CylinderGeometry, Float32BufferAttribute, LatheGeometry, Vector2 } from 'three'

// Официальны только общие габариты аналога. Профиль восстановлен по изображению
// CrownSleek, не по инженерному чертежу. Поставщик банки «Вудсток» неизвестен.
const specification = Object.freeze({
  heightMeters: 0.1454,
  diameterMeters: 0.058,
  source: 'https://www.crowncork.com/beverage-packaging/products/beverage-cans/113oz-330ml-crownsleek',
  product: 'CrownSleek 330ml',
})
const root = new URL('../', import.meta.url)
const outputPath = new URL('src/assets/models/can-330ml.glb', root)
const labelPath = new URL('materials/customer-design/labels/cans-330ml-500ml/woodstock-330ml.png', root)
const source = readFileSync(new URL('src/assets/models/can-450ml.glb', root))
const jsonLength = source.readUInt32LE(12)
const original = JSON.parse(source.subarray(20, 20 + jsonLength).toString())
const sourceBinary = source.subarray(28 + jsonLength)

// Независимая поверхность вращения: радиус и высота в миллиметрах.
// Прямые стенки начинаются у основания и доходят почти до крышки.
const profileMm = [
  [0, 2.5], [10, 2.5], [20, 2.1], [24.8, 1.1], [25.8, 0.2],
  [26.3, 0], [26.8, 0.25], [27, 0.8], [27.1, 1.7], [27.3, 2.7],
  [28, 3.8], [28.6, 4.8], [28.9, 5.7], [28.995, 6.5],
  [28.995, 136.8], [28.97, 137.5], [28.8, 138.2], [28.4, 139],
  [27.8, 139.8], [27.2, 140.6], [26.8, 141.4], [26.65, 142.2], [26.65, 143],
]
const body = new LatheGeometry(profileMm.map(([radius, y]) => new Vector2(radius / 1000, y / 1000)), 192)
body.normalizeNormals()
const labelBottom = 0.0065, labelTop = 0.1368
const label = new CylinderGeometry(specification.diameterMeters / 2, specification.diameterMeters / 2, labelTop - labelBottom, 192, 1, true)
label.translate(0, (labelTop + labelBottom) / 2, 0)
// glTF: верх изображения расположен у v=0, без flipY текстуры.
for (let i = 0; i < label.attributes.uv.count; i++) {
  label.attributes.uv.setY(i, 1 - label.attributes.uv.getY(i))
}

// Из исходной банки берём только крышку и язычок, исключая корпус и плечики.
const lidPrimitive = original.meshes[0].primitives.find(primitive => original.materials[primitive.material].name === 'aluminium')
const positions = original.accessors[lidPrimitive.attributes.POSITION]
const normals = original.accessors[lidPrimitive.attributes.NORMAL]
const indices = original.accessors[lidPrimitive.indices]
function vector(accessor, index) {
  const view = original.bufferViews[accessor.bufferView]
  const start = (view.byteOffset || 0) + (accessor.byteOffset || 0) + index * (view.byteStride || 12)
  return [0, 1, 2].map(axis => sourceBinary.readFloatLE(start + axis * 4))
}
function sourceIndex(index) {
  const view = original.bufferViews[indices.bufferView]
  const bytes = indices.componentType === 5125 ? 4 : 2
  const offset = (view.byteOffset || 0) + (indices.byteOffset || 0) + index * bytes
  return bytes === 4 ? sourceBinary.readUInt32LE(offset) : sourceBinary.readUInt16LE(offset)
}
const cutoff = 18.7
const lidTriangles = []
for (let i = 0; i < indices.count; i += 3) {
  const ids = [0, 1, 2].map(offset => sourceIndex(i + offset))
  if (ids.every(index => vector(positions, index)[1] >= cutoff)) lidTriangles.push(...ids)
}
if (!lidTriangles.length) throw new Error('Не найдена геометрия крышки')
const centerX = (positions.min[0] + positions.max[0]) / 2
const centerZ = (positions.min[2] + positions.max[2]) / 2
const radius = Math.max(...lidTriangles.map(index => {
  const [x, , z] = vector(positions, index)
  return Math.hypot(x - centerX, z - centerZ)
}))
const radialScale = 0.027 / radius
const lidMinimumY = Math.min(...lidTriangles.map(index => vector(positions, index)[1]))
const verticalScale = (specification.heightMeters - 0.143) / (positions.max[1] - lidMinimumY)
const lidPositions = [], lidNormals = []
for (const index of lidTriangles) {
  const [x, y, z] = vector(positions, index)
  lidPositions.push((x - centerX) * radialScale, 0.143 + (y - lidMinimumY) * verticalScale, (z - centerZ) * radialScale)
  const [nx, ny, nz] = vector(normals, index)
  const normal = [nx / radialScale, ny / verticalScale, nz / radialScale]
  const length = Math.hypot(...normal)
  lidNormals.push(...normal.map(value => value / length))
}
const lid = new BufferGeometry()
lid.setAttribute('position', new Float32BufferAttribute(lidPositions, 3))
lid.setAttribute('normal', new Float32BufferAttribute(lidNormals, 3))

const document = {
  asset: { version: '2.0', generator: 'Medved CrownSleek profile builder; source lid from can-450ml.glb' },
  scene: 0,
  scenes: [{ name: 'can-330ml', nodes: [0, 1, 2] }],
  nodes: [{ name: 'can-330ml-body', mesh: 0 }, { name: 'can-330ml-lid-and-tab', mesh: 1 }, { name: 'can-330ml-label', mesh: 2 }],
  meshes: [], accessors: [], bufferViews: [],
  materials: [
    { name: 'aluminium', pbrMetallicRoughness: { baseColorFactor: [0.8, 0.8, 0.8, 1], metallicFactor: 1, roughnessFactor: 0.38 } },
    { name: 'woodstock-330ml-printed-label', pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicFactor: 0, roughnessFactor: 0.55 } },
  ],
  textures: [{ source: 0, sampler: 0 }],
  samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 33071 }],
  extras: {
    nominalVolumeMl: 330,
    dimensionsSource: specification.source,
    referenceProduct: specification.product,
    referenceDimensionsVerified: true,
    actualProductDimensionsVerified: false,
    dimensionsStatus: 'Official reference overall dimensions; body profile reconstructed from Crown image; detailed lid reused and approximate',
    heightMeters: specification.heightMeters, diameterMeters: specification.diameterMeters,
    bodyProfileMm: profileMm, labelBottomMeters: labelBottom, labelTopMeters: labelTop,
    lidSource: 'can-450ml.glb',
  },
}
const chunks = []
let byteOffset = 0
function bufferView(data, target) {
  const index = document.bufferViews.length
  document.bufferViews.push({ buffer: 0, byteOffset, byteLength: data.length, ...(target ? { target } : {}) })
  const padding = Buffer.alloc((4 - data.length % 4) % 4)
  chunks.push(data, padding)
  byteOffset += data.length + padding.length
  return index
}
function attributeAccessor(attribute, semantic) {
  const index = document.accessors.length
  const array = attribute.array
  const accessor = {
    bufferView: bufferView(Buffer.from(array.buffer, array.byteOffset, array.byteLength), semantic === 'indices' ? 34963 : 34962),
    componentType: array instanceof Float32Array ? 5126 : array instanceof Uint32Array ? 5125 : 5123,
    count: attribute.count, type: attribute.itemSize === 1 ? 'SCALAR' : attribute.itemSize === 2 ? 'VEC2' : 'VEC3',
  }
  if (semantic === 'POSITION') {
    accessor.min = Array(attribute.itemSize).fill(Infinity)
    accessor.max = Array(attribute.itemSize).fill(-Infinity)
    for (let i = 0; i < attribute.count; i++) {
      for (let axis = 0; axis < attribute.itemSize; axis++) {
        const value = array[i * attribute.itemSize + axis]
        accessor.min[axis] = Math.min(accessor.min[axis], value)
        accessor.max[axis] = Math.max(accessor.max[axis], value)
      }
    }
  }
  document.accessors.push(accessor)
  return index
}
for (const [name, geometry, material] of [['sleek-body', body, 0], ['lid-and-tab', lid, 0], ['printed-label', label, 1]]) {
  const attributes = { POSITION: attributeAccessor(geometry.attributes.position, 'POSITION'), NORMAL: attributeAccessor(geometry.attributes.normal, 'NORMAL') }
  if (geometry.attributes.uv) attributes.TEXCOORD_0 = attributeAccessor(geometry.attributes.uv, 'TEXCOORD_0')
  const primitive = { attributes, material }
  if (geometry.index) primitive.indices = attributeAccessor(geometry.index, 'indices')
  document.meshes.push({ name, primitives: [primitive] })
}
// Полная этикетка занимает всю окружность; поля от старой UV-развёртки не нужны.
document.images = [{ name: 'woodstock-330ml-label', mimeType: 'image/png', bufferView: bufferView(readFileSync(labelPath)) }]
const outputBinary = Buffer.concat(chunks)
document.buffers = [{ byteLength: outputBinary.length }]
const json = Buffer.from(JSON.stringify(document))
const outputJson = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 0x20)])
const header = Buffer.alloc(12), jsonHeader = Buffer.alloc(8), binaryHeader = Buffer.alloc(8)
header.writeUInt32LE(0x46546c67, 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(12 + 8 + outputJson.length + 8 + outputBinary.length, 8)
jsonHeader.writeUInt32LE(outputJson.length, 0)
jsonHeader.writeUInt32LE(0x4e4f534a, 4)
binaryHeader.writeUInt32LE(outputBinary.length, 0)
binaryHeader.writeUInt32LE(0x004e4942, 4)
writeFileSync(outputPath, Buffer.concat([header, jsonHeader, outputJson, binaryHeader, outputBinary]))
console.log(JSON.stringify({ file: fileURLToPath(outputPath), ...specification, bytes: header.readUInt32LE(8), body: 'independent lathe profile', lidTriangles: lidTriangles.length / 3 }))
