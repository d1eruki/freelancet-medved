import { drinkPresets } from '../data/drink-presets.js'

// Подготовка сменных этикеток не должна начинаться только по нажатию стрелки.
const preloadLabelUrls = Object.values(import.meta.glob([
  '../../materials/customer-design/labels/cans-330ml-500ml/antonovka.png',
  '../../materials/customer-design/labels/cans-330ml-500ml/poiret-pear.png',
], { eager: true, query: '?url', import: 'default' }))

export const productSceneKey = Symbol('product-scene')

// Один контекст WebGL на слайдер. Смена владельца DOM сохраняет модели и оптику.
export function createProductScene() {
  let currentView = null, closed = false, failed = false
  function profile(THREE, mesh) {
    const position = mesh.geometry.attributes.position
    const normal = mesh.geometry.attributes.normal
    const index = mesh.geometry.index
    const points = [], ids = [], edges = []
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i), y = position.getY(i), z = position.getZ(i)
      const r = Math.hypot(x, z)
      let id = points.findIndex(p => Math.abs(p.r - r) < 0.000002 && Math.abs(p.y - y) < 0.000002)
      if (id < 0) { id = points.length; points.push({ r, y, nr: 0, ny: 0, count: 0 }); edges.push(new Set()) }
      const p = points[id]
      p.nr += r > 0.000001 ? (normal.getX(i) * x + normal.getZ(i) * z) / r : 0
      p.ny += normal.getY(i); p.count++
      ids.push(id)
    }
    for (let i = 0; i < index.count; i += 3) {
      const triangle = [...new Set([ids[index.getX(i)], ids[index.getX(i + 1)], ids[index.getX(i + 2)]])]
      if (triangle.length === 2) { edges[triangle[0]].add(triangle[1]); edges[triangle[1]].add(triangle[0]) }
    }
    const start = edges.findIndex(e => e.size === 1)
    if (start < 0 || edges.some(e => e.size > 2)) throw new Error('Профиль сетки неоднозначен')
    const chain = []
    let current = start, previous = -1
    while (current !== undefined) {
      chain.push(points[current])
      const next = [...edges[current]].find(id => id !== previous)
      previous = current; current = next
    }
    if (chain.length !== points.length) throw new Error('Профиль не замкнут по сетке')
    for (const point of points) {
      if (point.r < 0.000001 && Math.hypot(point.nr, point.ny) / point.count < 0.5) {
        const cap = points.find(p => p.r > 0.000001 && Math.abs(p.y - point.y) < 0.000002 && Math.abs(p.ny) > 0.01)
        if (!cap) throw new Error('Не определена нормаль центральной вершины')
        point.ny = Math.sign(cap.ny) * point.count
      }
    }
    return chain.map(p => new THREE.Vector4(p.r * 10, (p.y - 0.0014) * 10, p.nr / p.count, p.ny / p.count))
  }

  function opticalNormals(points) {
    const angles = points.map(point => Math.atan2(point.w, point.z))
    const difference = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a))
    return points.map((point, i) => {
      let slope = 0
      if (i > 0 && i < points.length - 1) {
        const left = point.y - points[i - 1].y, right = points[i + 1].y - point.y
        if (Math.abs(left) >= 0.000001 && Math.abs(right) >= 0.000001 && left * right > 0) {
          const a = difference(angles[i - 1], angles[i]) / left
          const b = difference(angles[i], angles[i + 1]) / right
          if (a * b > 0) {
            const wa = 2 * Math.abs(right) + Math.abs(left)
            const wb = Math.abs(right) + 2 * Math.abs(left)
            const mean = (wa + wb) / (wa / a + wb / b)
            slope = Math.sign(mean) * Math.min(Math.abs(mean), 1.5 * Math.abs(a), 1.5 * Math.abs(b))
          }
        }
      }
      return { angle: angles[i], slope }
    })
  }

  // Исходные сегменты в дереве границ; геометрия не упрощается.
  function profileTree(THREE, glass, liquid) {
    const glassNormals = opticalNormals(glass), liquidNormals = opticalNormals(liquid)
    // Смоченная стенка — одна граница двух сред. У обеих сторон должны
    // совпадать не только позиции, но и производные оптических нормалей.
    liquid.forEach((point, i) => {
      const shared = glass.findIndex(other => Math.abs(other.x - point.x) < 1e-8 && Math.abs(other.y - point.y) < 1e-8 && other.z * point.z + other.w * point.w < 0)
      if (shared >= 0) {
        liquidNormals[i] = { angle: Math.atan2(-glass[shared].w, -glass[shared].z), slope: glassNormals[shared].slope }
        return
      }
      // У уровня напитка сегмент стенки обрезан. Нормаль и её производная
      // здесь берутся из того же поля, а не пересчитываются по мениску.
      for (let j = 0; j < glass.length - 1; j++) {
        const a = glass[j], b = glass[j + 1], dy = b.y - a.y
        if (Math.abs(dy) < 0.000001) continue
        const u = (point.y - a.y) / dy
        if (u <= 0 || u >= 1 || Math.abs(point.x - (a.x + u * (b.x - a.x))) >= 1e-8 || a.z * point.z + a.w * point.w >= 0) continue
        const na = glassNormals[j], nb = glassNormals[j + 1], u2 = u * u, u3 = u2 * u
        const delta = Math.atan2(Math.sin(nb.angle - na.angle), Math.cos(nb.angle - na.angle))
        const angle = na.angle + (-2 * u3 + 3 * u2) * delta + (u3 - 2 * u2 + u) * dy * na.slope + (u3 - u2) * dy * nb.slope
        const slope = (-6 * u2 + 6 * u) * delta / dy + (3 * u2 - 4 * u + 1) * na.slope + (3 * u2 - 2 * u) * nb.slope
        liquidNormals[i] = { angle: Math.atan2(-Math.sin(angle), -Math.cos(angle)), slope }
        break
      }
    })
    const segments = []
    for (const [points, normals, object] of [[glass, glassNormals, 1], [liquid, liquidNormals, 2]]) {
      for (let i = 0; i < points.length; i++) {
        const a = points[i], b = points[(i + 1) % points.length]
        // segment() допускает выход на 1e-6 по высоте. У почти плоского
        // кольца этому соответствует заметный радиальный запас.
        const dy = Math.abs(b.y - a.y)
        const radialMargin = 0.000002 * (1 + (dy >= 0.000001 ? Math.abs(b.x - a.x) / dy : 0))
        segments.push({ a, b, normalA: normals[i], normalB: normals[(i + 1) % points.length], object, closing: i === points.length - 1, radialMargin })
      }
    }
    const nodes = []
    function append(items) {
      const node = {
        minY: Math.min(...items.map(({ a, b }) => Math.min(a.y, b.y))) - 0.000002,
        maxY: Math.max(...items.map(({ a, b }) => Math.max(a.y, b.y))) + 0.000002,
        minR: Math.max(0, Math.min(...items.map(({ a, b, radialMargin }) => Math.min(a.x, b.x) - radialMargin))),
        maxR: Math.max(...items.map(({ a, b, radialMargin }) => Math.max(a.x, b.x) + radialMargin)),
        object: items.every(item => item.object === items[0].object) ? items[0].object : 0,
        leaf: items.length === 1,
      }
      nodes.push(node)
      if (node.leaf) Object.assign(node, items[0])
      else {
        const sorted = items.slice().sort((a, b) => (a.a.y + a.b.y) - (b.a.y + b.b.y))
        const middle = Math.floor(sorted.length / 2)
        append(sorted.slice(0, middle))
        append(sorted.slice(middle))
      }
      node.escape = nodes.length
    }
    append(segments)
    const data = new Float32Array(nodes.length * 16)
    nodes.forEach((node, index) => {
      const offset = index * 16
      // Запас на округление Float32 и касательные лучи.
      data.set([node.minY, node.maxY, node.minR, node.maxR], offset)
      data.set([node.escape, node.object, Number(node.leaf), Number(Boolean(node.closing))], offset + 4)
      if (node.leaf) {
        data.set([node.a.x, node.a.y, node.normalA.angle, node.normalA.slope], offset + 8)
        data.set([node.b.x, node.b.y, node.normalB.angle, node.normalB.slope], offset + 12)
      }
    })
    const texture = new THREE.DataTexture(data, 4, nodes.length, THREE.RGBAFormat, THREE.FloatType)
    texture.needsUpdate = true
    return { texture, count: nodes.length }
  }

  // Оптика банки использует её объём и развёртку этикетки, а не снимок фона.
  function createBankProfile(THREE, product, bounds) {
    const height = bounds.max.y - bounds.min.y, center = bounds.getCenter(new THREE.Vector3())
    const rings = Array.from({ length: 129 }, (_, i) => ({ y: bounds.min.y + height * i / 128, r: 0, nr: 1, ny: 0 }))
    product.updateMatrixWorld(true)
    product.traverse(mesh => {
      if (!mesh.isMesh) return
      const geometry = mesh.geometry, normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)
      const positions = [], normals = []
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        positions.push(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i).applyMatrix4(mesh.matrixWorld))
        normals.push(new THREE.Vector3().fromBufferAttribute(geometry.attributes.normal, i).applyMatrix3(normalMatrix).normalize())
      }
      const index = geometry.index, count = index?.count ?? positions.length
      for (let i = 0; i < count; i += 3) for (let edge = 0; edge < 3; edge++) {
        const a = index ? index.getX(i + edge) : i + edge, b = index ? index.getX(i + (edge + 1) % 3) : i + (edge + 1) % 3
        const p = positions[a], q = positions[b], dy = q.y - p.y
        const first = Math.max(0, Math.ceil((Math.min(p.y, q.y) - bounds.min.y) / height * 128 - 1e-7))
        const last = Math.min(128, Math.floor((Math.max(p.y, q.y) - bounds.min.y) / height * 128 + 1e-7))
        for (let row = first; row <= last; row++) {
          const ring = rings[row], u = Math.abs(dy) < 1e-10 ? 0 : THREE.MathUtils.clamp((ring.y - p.y) / dy, 0, 1)
          const point = p.clone().lerp(q, u), x = point.x - center.x, z = point.z - center.z, r = Math.hypot(x, z)
          if (r < ring.r) continue
          const n = normals[a].clone().lerp(normals[b], u).normalize()
          Object.assign(ring, { r, nr: r > 1e-8 ? (n.x * x + n.z * z) / r : 0, ny: n.y })
        }
      }
    })
    if (rings.some(ring => ring.r <= 0)) throw new Error('Не восстановлен внешний профиль банки')
    const points = rings.map(p => new THREE.Vector4(p.r / height, (p.y - center.y) / height, p.nr, p.ny))
    // Сохраняем шейку и основание; прямые участки не требуют отдельных узлов.
    const retained = new Set([0, points.length - 1])
    function simplify(first, last) {
      let best = -1, error = 1
      for (let i = first + 1; i < last; i++) {
        const u = (points[i].y - points[first].y) / (points[last].y - points[first].y)
        const r = THREE.MathUtils.lerp(points[first].x, points[last].x, u)
        const angle = Math.atan2(points[i].w, points[i].z)
        const expected = THREE.MathUtils.lerp(Math.atan2(points[first].w, points[first].z), Math.atan2(points[last].w, points[last].z), u)
        const current = Math.max(Math.abs(points[i].x - r) / 0.0001, Math.abs(angle - expected) / 0.01)
        if (current > error) { best = i; error = current }
      }
      if (best >= 0) { retained.add(best); simplify(first, best); simplify(best, last) }
    }
    simplify(0, points.length - 1)
    const profile = [new THREE.Vector4(0, -0.5, 0, -1), ...[...retained].sort((a, b) => a - b).map(i => points[i]), new THREE.Vector4(0, 0.5, 0, 1)]
    return { tree: profileTree(THREE, profile, []), points: profile, samples: points }
  }

  function fittedLiquidProfile(THREE, glass, liquid) {
    const rim = glass.reduce((best, point, i) => point.y > glass[best].y ? i : best, 0)
    const inner = glass.slice(rim + 1).reverse()
    const level = liquid.at(-1).y
    const surfaceStart = liquid.findIndex(point => point.y > level - 0.02 && point.w > 0.5)
    if (surfaceStart < 0) throw new Error('Не найден мениск напитка')
    const surface = liquid.slice(surfaceStart)
    const contactY = surface[0].y
    const fitted = []
    for (let i = 0; i < inner.length - 1; i++) {
      const a = inner[i], b = inner[i + 1]
      if (a.y > contactY) break
      fitted.push(new THREE.Vector4(a.x, a.y, -a.z, -a.w))
      if (a.y <= contactY && b.y > contactY) {
        const t = (contactY - a.y) / (b.y - a.y)
        fitted.push(new THREE.Vector4(THREE.MathUtils.lerp(a.x, b.x, t), contactY, -THREE.MathUtils.lerp(a.z, b.z, t), -THREE.MathUtils.lerp(a.w, b.w, t)))
        break
      }
    }
    if (fitted.length < 3) throw new Error('Не определён контакт напитка со стеклом')
    return [...fitted, ...surface]
  }

  // Только числовая диагностика: ?optics-diagnostics=1, затем в консоли
  // glassOpticsDiagnostics.scan() или .trace(x, y), координаты от низа холста.
  // Не запускается автоматически и не создаёт GPU-ресурсов. CPU использует
  // Float32-профиль шейдера, но арифметику JS (не доказывает точность GPU).
  // Банка передаёт геометрию, материалы и текущую ориентацию, а не снимок canvas.
  let bankOptics = null
  const sceneSettings = { camera: [0, 0.88, 5], light: [-1.8, 2.5, 1.2] }

  function canvasToScreen(THREE, element, canvas) {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(canvas)
    const origin = style.transformOrigin.split(' ').map(Number.parseFloat)
    const angle = Number.parseFloat(style.rotate) || 0
    const radians = angle * (style.rotate.includes('rad') ? 1 : Math.PI / 180)
    const c = Math.cos(radians), s = Math.sin(radians)
    const x = origin[0] || 0, y = origin[1] || 0
    // UV снизу вверх → CSS-пиксели с вращением вокруг существующего основания.
    return new THREE.Matrix3().set(
      c * rect.width, s * rect.height, rect.left + x - c * x - s * (rect.height - y),
      s * rect.width, -c * rect.height, rect.top + y - s * x + c * (rect.height - y),
      0, 0, 1,
    )
  }

  async function createGlassRenderer(THREE, renderer, scene, camera, element, onBackgroundReady, onFrameReady, shared) {
    const section = currentView.section
    const counter = currentView.counter
    let pattern = currentView.pattern
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not create the refraction backdrop')
    let texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const dimensions = new THREE.Vector2()
    const targetOptions = { type: THREE.HalfFloatType, minFilter: THREE.LinearMipmapLinearFilter, generateMipmaps: true, depthBuffer: true }
    const backdrop = new THREE.WebGLRenderTarget(1, 1, targetOptions)
    const backgroundScene = scene
    const screenToBackdrop = new THREE.Matrix3()
    const backgroundMaterial = new THREE.ShaderMaterial({
      uniforms: { map: { value: texture }, screenToBackdrop: { value: screenToBackdrop } },
      vertexShader: 'varying vec2 screenUV; void main() { screenUV = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }',
      fragmentShader: 'uniform sampler2D map; uniform mat3 screenToBackdrop; varying vec2 screenUV; void main() { vec2 uv = (screenToBackdrop * vec3(screenUV, 1.0)).xy; gl_FragColor = texture2D(map, clamp(uv, vec2(0.001), vec2(0.999))); }',
      depthWrite: false,
    })
    const background = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backgroundMaterial)
    background.frustumCulled = false
    background.renderOrder = -1000
    backgroundScene.add(background)
    let glass, liquid
    scene.traverse(node => {
      if (node.material?.name === 'clear-glass') glass = node
      if (node.material?.name === 'golden-mead') liquid = node
    })
    if (!glass || !liquid) throw new Error('Glass and drink meshes are required')
    const glassProfile = profile(THREE, glass)
    const liquidProfile = fittedLiquidProfile(THREE, glassProfile, profile(THREE, liquid))
    const tree = profileTree(THREE, glassProfile, liquidProfile)
    // Координаты пузырьков локальны для стакана: общий наклон слайдера
    // применяется к готовому изображению через product-scene-transform/canvasToScreen.
    const liquidBottom = Math.min(...liquidProfile.map(point => point.y)) + 0.015
    const liquidTop = liquidProfile.at(-1).y - 0.018
    const liquidHeight = liquidTop - liquidBottom
    function profileRadiusAt(points, y) {
      let radius = Infinity
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i], b = points[i + 1]
        if (Math.abs(b.y - a.y) < 0.000001 || y < Math.min(a.y, b.y) || y > Math.max(a.y, b.y)) continue
        const r = THREE.MathUtils.lerp(a.x, b.x, (y - a.y) / (b.y - a.y))
        if (r > 0) radius = Math.min(radius, r)
      }
      if (!Number.isFinite(radius)) throw new Error('Не определена стенка напитка на высоте пузырька')
      return radius
    }
    const liquidRadiusAt = y => profileRadiusAt(liquidProfile, y)
    // Край пены на уровне ободка, небольшой плавный подъём только к центру.
    const foamBottom = liquidProfile.at(-1).y - 0.004
    const foamTop = Math.max(...glassProfile.map(point => point.y)) - 0.002
    if (!(foamTop > foamBottom)) throw new Error('Нет места для слоя пены')
    const foamWall = Array.from({ length: 8 }, (_, i) => {
      const y = THREE.MathUtils.lerp(foamBottom - 0.01, foamTop, i / 7)
      return new THREE.Vector2(y, profileRadiusAt(glassProfile, y) - 0.0005)
    })
    const foamShape = new THREE.Vector4(foamBottom, foamTop, Math.max(...foamWall.map(point => point.y)), 0.08)
    if (!(liquidHeight > 0)) throw new Error('Не определён объём для пузырьков')
    const bubbleCount = 288
    const bubbles = Array.from({ length: bubbleCount }, () => new THREE.Vector4())
    // Текстура снимает ограничение uniform-массива при увеличении плотности.
    const bubbleData = new Float32Array(bubbleCount * 4)
    const bubblePositions = new THREE.DataTexture(bubbleData, bubbleCount, 1, THREE.RGBAFormat, THREE.FloatType)
    bubblePositions.minFilter = THREE.NearestFilter
    bubblePositions.magFilter = THREE.NearestFilter
    const randomBubble = (index, salt) => {
      const value = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453
      return value - Math.floor(value)
    }
    // Большинство пузырьков растёт на стенках; отдельные отрываются.
    // Источники собраны в неровные пятна, без общих фаз и шага цепочки.
    const bubbleSites = Array.from({ length: bubbleCount }, (_, i) => {
      const attached = i < 216
      const cluster = Math.floor(i / 12)
      const clusterAngle = cluster * 2.399963 + randomBubble(cluster, 1) * 0.4
      const clusterHeight = 0.07 + randomBubble(cluster, 2) * 0.82
      return {
        attached,
        angle: attached ? clusterAngle + (randomBubble(i, 3) - 0.5) * 0.38 : randomBubble(i, 3) * Math.PI * 2,
        startY: liquidBottom + liquidHeight * (attached
          ? THREE.MathUtils.clamp(clusterHeight + (randomBubble(i, 4) - 0.5) * 0.12, 0.025, 0.94)
          : randomBubble(i, 4) * 0.20),
        spread: Math.sqrt(randomBubble(i, 5)) * 0.93,
        phase: randomBubble(i, 6),
        period: attached ? 18 + randomBubble(i, 7) * 24 : 7 + randomBubble(i, 7) * 8,
        hold: attached ? 0.72 + randomBubble(i, 8) * 0.16 : 0,
        maxRadius: 0.006 + Math.pow(randomBubble(i, 9), 2) * 0.006,
        wobblePhase: randomBubble(i, 10) * Math.PI * 2,
      }
    })
    let bubbleTime = 0
    function updateBubbles(elapsed = 0) {
      bubbleTime += elapsed
      for (let i = 0; i < bubbleCount; i++) {
        const site = bubbleSites[i]
        const phase = (bubbleTime / site.period + site.phase) % 1
        const rising = phase >= site.hold
        const progress = rising ? (phase - site.hold) / (1 - site.hold) : 0
        const ascent = progress * (0.65 + 0.35 * progress)
        const y = THREE.MathUtils.lerp(site.startY, liquidTop, ascent)
        const growth = rising ? 1 + progress * 0.15 : THREE.MathUtils.lerp(0.65, 1, phase / site.hold)
        const fade = rising ? Math.min(1, (1 - progress) / 0.04, site.attached ? 1 : progress / 0.04) : 1
        const radius = Math.max(0, Math.min(site.maxRadius * growth * fade, y - liquidBottom, liquidTop - y))
        // Учитываем весь диаметр сферы на сужениях стенки.
        const wallRadius = Math.min(liquidRadiusAt(y), liquidRadiusAt(y - radius), liquidRadiusAt(y + radius))
        const wallDistance = Math.max(0, wallRadius - radius - 0.0005)
        const wobble = rising ? Math.sin(progress * 9 + site.wobblePhase) * 0.008 * progress : 0
        const spread = site.attached ? 1 - ascent * 0.10 : site.spread
        const distance = Math.max(0, Math.min(wallDistance, wallDistance * spread + wobble))
        const angle = site.angle + (rising ? Math.sin(progress * 7 + site.wobblePhase) * 0.025 * progress : 0)
        bubbles[i].set(Math.cos(angle) * distance, y, Math.sin(angle) * distance, radius)
        bubbles[i].toArray(bubbleData, i * 4)
      }
      bubblePositions.needsUpdate = true
    }
    updateBubbles()
    scene.updateMatrixWorld(true)
    const modelScale = glass.getWorldScale(new THREE.Vector3()).x
    const modelOrigin = glass.getWorldPosition(new THREE.Vector3())
    modelOrigin.y += 0.0014 * modelScale
    const labToWorld = new THREE.Matrix4().compose(modelOrigin, new THREE.Quaternion(), new THREE.Vector3().setScalar(modelScale / 10))
    const worldToLab = labToWorld.clone().invert()
    const emptyBankTree = new THREE.DataTexture(new Float32Array(16), 4, 1, THREE.RGBAFormat, THREE.FloatType)
    emptyBankTree.needsUpdate = true
    const uniforms = {
      profileTree: { value: tree.texture }, treeCount: { value: tree.count },
      traceSteps: { value: sceneQuality.traceSteps }, reflectionSteps: { value: sceneQuality.reflectionSteps },
      bodySamples: { value: sceneQuality.bodySamples }, baseSamples: { value: sceneQuality.baseSamples },
      bankProfileTree: { value: emptyBankTree }, bankTreeCount: { value: 0 },
      bankInverse: { value: new THREE.Matrix4() }, bankSize: { value: new THREE.Vector3() },
      bankFrame: { value: backdrop.texture }, bankExposure: { value: 1 },
      backdropTexture: { value: texture }, screenToBackdrop: { value: screenToBackdrop },
      liquidAbsorption: { value: new THREE.Vector3(...drinkPresets.cider.absorption) },
      liquidScattering: { value: drinkPresets.cider.scattering },
      liquidScatteringColor: { value: new THREE.Vector3(...drinkPresets.cider.scatteringColor) },
      foamShape: { value: foamShape }, foamWall: { value: foamWall }, foamEnabled: { value: false },
      wallDepth: { value: -2 }, hasLiquid: { value: true }, perspective: { value: false },
      keyLight: { value: new THREE.Vector3(...sceneSettings.light).add(new THREE.Vector3(0, 0.9, 0)) },
      resolution: { value: dimensions }, labProjection: { value: new THREE.Matrix4() },
      halfSize: { value: new THREE.Vector2() }, rayOrigin: { value: new THREE.Vector3() },
      rayRight: { value: new THREE.Vector3() }, rayUp: { value: new THREE.Vector3() }, rayDirection: { value: new THREE.Vector3() },
    }
    const toneChunk = THREE.ShaderChunk.tonemapping_pars_fragment
    const bankToneMapping = toneChunk.slice(toneChunk.indexOf('vec3 RRTAndODTFit'), toneChunk.indexOf('const mat3 LINEAR_REC2020_TO_LINEAR_SRGB')).replaceAll('toneMappingExposure', 'bankExposure')
    const optics = /* glsl */ `    precision highp float;
      uniform sampler2D profileTree;
      uniform int treeCount,traceSteps,reflectionSteps,bodySamples,baseSamples;
      uniform bool hasLiquid, perspective, foamEnabled;
      uniform vec3 liquidAbsorption, liquidScatteringColor;
      uniform float liquidScattering;
      uniform vec4 foamShape;
      uniform vec2 foamWall[8];
      uniform vec2 resolution;
      uniform sampler2D backdropTexture;
      uniform mat4 labProjection;
      uniform vec3 rayOrigin, rayRight, rayUp, rayDirection;
      uniform vec2 halfSize, backdropScale, backdropOffset;
      uniform vec3 keyLight, bankSize;
      uniform float wallDepth;
      uniform mat4 bankInverse;
      uniform sampler2D bankFrame;
      uniform mat3 screenToBackdrop;
      uniform sampler2D bankProfileTree;
      uniform int bankTreeCount;
      uniform float bankExposure;
      #define saturate(a) clamp(a,0.0,1.0)
      ${bankToneMapping}
      vec2 backdropUV(vec3 p){
        vec4 clip=labProjection*vec4(p,1.0);
        return clamp((screenToBackdrop*vec3(clip.xy/clip.w*0.5+0.5,1.0)).xy,vec2(0.001),vec2(0.999));
      }
      struct Hit{float t;vec3 n;vec3 geometricNormal;int object;};
      void segment(vec4 a,vec4 b,vec3 o,vec3 d,int object,inout Hit h){
        float dy=b.y-a.y;
        if(abs(dy)<0.000001){
          if(abs(d.y)<0.000001)return;
          float t=(a.y-o.y)/d.y;vec3 p=o+d*t;float r=length(p.xz);
          if(t>0.00005&&t<h.t&&r>=min(a.x,b.x)-0.000001&&r<=max(a.x,b.x)+0.000001){
            vec3 n=vec3(0.0,sign(sin(a.z)+sin(b.z)),0.0);
            h=Hit(t,n,n,object);
          }return;
        }
        // У почти плоских колец dr/dy достигает 660: большие коэффициенты
        // теряют точность при вычитании в дискриминанте Float32.
        // Не делим на dy и переносим начало луча к оси стакана.
        float radialDirection=dot(d.xz,d.xz);
        float reference=radialDirection>0.00000001?-dot(o.xz,d.xz)/radialDirection:0.0;
        vec3 localOrigin=o+d*reference;
        vec2 slope=normalize(vec2(dy,b.x-a.x));
        float verticalSquared=slope.x*slope.x;
        float r=a.x*slope.x+slope.y*(localOrigin.y-a.y);
        float aa=verticalSquared*radialDirection-slope.y*slope.y*d.y*d.y;
        float bb=2.0*(verticalSquared*dot(localOrigin.xz,d.xz)-r*slope.y*d.y);
        float cc=verticalSquared*dot(localOrigin.xz,localOrigin.xz)-r*r;
        // Факторизация не вычитает почти равные bb² и 4*aa*cc у плоских
        // колец: такой дискриминант терял малую положительную величину.
        vec2 projected=r*d.xz-slope.y*d.y*localOrigin.xz;
        float crossRadial=localOrigin.x*d.z-localOrigin.z*d.x;
        float discriminant=4.0*verticalSquared*(dot(projected,projected)-verticalSquared*crossRadial*crossRadial);
        if(discriminant<0.0)return;
        vec2 roots;
        if(abs(aa)<0.00000001){if(abs(bb)<0.00000001)return;roots=vec2(-cc/bb);}
        else {
          float sq=sqrt(max(0.0,discriminant));
          // Форма q предотвращает потерю малого корня при bb≈sqrt(D).
          float q=-0.5*(bb+(bb>=0.0?sq:-sq));
          roots=abs(q)>0.0000000001?vec2(q/aa,cc/q):vec2(-bb/(2.0*aa));
        }
        for(int j=0;j<2;j++){
          float t=roots[j]+reference;vec3 p=localOrigin+d*roots[j];
          if(t<=0.00005||t>=h.t||p.y<min(a.y,b.y)-0.000001||p.y>max(a.y,b.y)+0.000001)continue;
          // Общая производная в узлах убирает оптический излом между
          // кольцами. Линейные нормали давали отдельную полосу под выпуклостью.
          float u=clamp((p.y-a.y)/dy,0.0,1.0),u2=u*u,u3=u2*u;
          float angleDelta=atan(sin(b.z-a.z),cos(b.z-a.z));
          float angle=a.z+(-2.0*u3+3.0*u2)*angleDelta+
            (u3-2.0*u2+u)*dy*a.w+(u3-u2)*dy*b.w;
          vec2 smoothNormal=vec2(cos(angle),sin(angle));
          vec2 radial=p.xz/max(length(p.xz),0.000001);
          vec3 n=normalize(vec3(radial.x*smoothNormal.x,smoothNormal.y,radial.y*smoothNormal.x));
          vec3 geometricNormal=normalize(vec3(radial.x*dy,a.x-b.x,radial.y*dy));
          if(dot(geometricNormal,n)<0.0)geometricNormal=-geometricNormal;
          h=Hit(t,n,geometricNormal,object);
        }
      }
      bool inVolume(vec3 p,int object){
        vec2 q=vec2(length(p.xz),p.y);bool inside=false;
        int i=0;
        while(i<treeCount){
          vec4 bounds=texelFetch(profileTree,ivec2(0,i),0);
          vec4 meta=texelFetch(profileTree,ivec2(1,i),0);
          if(q.y<bounds.x||q.y>bounds.y||q.x>bounds.w||(meta.y>0.0&&int(meta.y)!=object)){
            i=int(meta.x);continue;
          }
          if(meta.z<0.5){i++;continue;}
          vec2 a=texelFetch(profileTree,ivec2(2,i),0).xy;
          vec2 b=texelFetch(profileTree,ivec2(3,i),0).xy;
          if((a.y>q.y)!=(b.y>q.y)){
            float r=a.x+(q.y-a.y)*(b.x-a.x)/(b.y-a.y);
            if(q.x<r)inside=!inside;
          }
          i++;
        }return inside;
      }
      bool inLiquid(vec3 p){return hasLiquid&&inVolume(p,2);}
      void plane(vec3 o,vec3 d,vec3 center,vec3 normal,vec3 extent,int object,inout Hit h){
        float denominator=dot(d,normal);if(abs(denominator)<0.000001)return;
        float t=dot(center-o,normal)/denominator;vec3 local=abs(o+d*t-center);
        if(t>0.00005&&t<h.t&&all(lessThanEqual(local,extent)))h=Hit(t,normal,normal,object);
      }
      bool meetsGlass(vec3 o,vec3 d){
        vec3 inverse=1.0/max(abs(d),vec3(0.00000001))*mix(vec3(-1.0),vec3(1.0),step(vec3(0.0),d));
        vec3 a=(vec3(-0.53,-0.002,-0.53)-o)*inverse,b=(vec3(0.53,1.80,0.53)-o)*inverse;
        vec3 lo=min(a,b),hi=max(a,b);
        return min(hi.x,min(hi.y,hi.z))>=max(0.00005,max(lo.x,max(lo.y,lo.z)));
      }
      bool meetsNode(vec4 bounds,vec3 o,vec3 d,float limit){
        float near=0.0,far=limit;
        if(abs(d.y)>0.000000001){
          vec2 t=(bounds.xy-o.y)/d.y;
          near=max(near,min(t.x,t.y));far=min(far,max(t.x,t.y));
        }else if(o.y<bounds.x||o.y>bounds.y)return false;
        if(far<near)return false;
        float radial=dot(d.xz,d.xz);
        float closest=radial>0.000000000001?clamp(-dot(o.xz,d.xz)/radial,near,far):near;
        vec2 nearest=o.xz+d.xz*closest,first=o.xz+d.xz*near,last=o.xz+d.xz*far;
        float low=dot(nearest,nearest),high=max(dot(first,first),dot(last,last));
        return low<=bounds.w*bounds.w&&high>=bounds.z*bounds.z;
      }
      void intersectBank(vec3 o,vec3 d,inout Hit h){
        if(bankSize.y<=0.0||bankTreeCount==0)return;
        float scale=2.0*bankSize.y;
        vec3 local=(bankInverse*vec4(o,1.0)).xyz/scale;
        vec3 direction=(bankInverse*vec4(d,0.0)).xyz/scale;
        int i=0;
        while(i<bankTreeCount){
          vec4 bounds=texelFetch(bankProfileTree,ivec2(0,i),0);
          vec4 meta=texelFetch(bankProfileTree,ivec2(1,i),0);
          if(!meetsNode(bounds,local,direction,h.t)){i=int(meta.x);continue;}
          if(meta.z>0.5&&meta.w<0.5){
            Hit bank=h;
            segment(texelFetch(bankProfileTree,ivec2(2,i),0),texelFetch(bankProfileTree,ivec2(3,i),0),local,direction,7,bank);
            if(bank.t<h.t){
              bank.n=normalize(transpose(mat3(bankInverse))*bank.n);
              bank.geometricNormal=normalize(transpose(mat3(bankInverse))*bank.geometricNormal);
              h=bank;
            }
          }
          i++;
        }
      }
      Hit intersect(vec3 o,vec3 d,int medium){
        Hit h=Hit(10000.0,vec3(0),vec3(0),-1);
        if(meetsGlass(o,d)){
          int i=0;
          while(i<treeCount){
            vec4 bounds=texelFetch(profileTree,ivec2(0,i),0);
            vec4 meta=texelFetch(profileTree,ivec2(1,i),0);
            if((int(meta.y)==2&&(!hasLiquid||medium==1))||!meetsNode(bounds,o,d,h.t)){
              i=int(meta.x);continue;
            }
            if(meta.z>0.5&&meta.w<0.5){
              segment(texelFetch(profileTree,ivec2(2,i),0),texelFetch(profileTree,ivec2(3,i),0),o,d,int(meta.y),h);
            }
            i++;
          }
        }
        plane(o,d,vec3(0,-0.015,0),vec3(0,1,0),vec3(20,0.001,20),3,h);
        plane(o,d,vec3(0,1,wallDepth),vec3(0,0,1),vec3(24,24,0.001),4,h);
        plane(o,d,keyLight,vec3(1,0,0),vec3(0.001,1.8,0.75),5,h);
        plane(o,d,vec3(1.8,1.8,0.2),vec3(-1,0,0),vec3(0.001,1.9,0.4),5,h);
        plane(o,d,vec3(-1.3,1.2,0.65),vec3(1,0,0),vec3(0.001,2,0.08),6,h);
        plane(o,d,vec3(1.3,1.2,0.65),vec3(-1,0,0),vec3(0.001,2,0.06),6,h);
        return h;
      }
      vec3 environment(vec3 d){return mix(vec3(0.35),vec3(0.85),clamp(d.y*0.5+0.5,0.0,1.0));}
      float ior(int medium){return medium==1?1.52:(medium==2?1.333:1.0);}
      float fresnel(float c,float from,float to){
        float sinT2=(from/to)*(from/to)*(1.0-c*c);if(sinT2>=1.0)return 1.0;
        float ct=sqrt(1.0-sinT2);
        float rs=(from*c-to*ct)/(from*c+to*ct);
        float rp=(to*c-from*ct)/(to*c+from*ct);
        return 0.5*(rs*rs+rp*rp);
      }
      vec3 absorption(int medium,float distance){
        if(medium==2)return exp(-(liquidAbsorption+vec3(liquidScattering))*distance);
        if(medium==1)return exp(-vec3(0.012,0.007,0.004)*distance);
        return vec3(1.0);
      }
      // Приближение рассеянного света в мутной жидкости по длине сегмента.
      vec3 scattering(int medium,float distance){
        if(medium!=2||liquidScattering<=0.0)return vec3(0);
        vec3 extinction=liquidAbsorption+vec3(liquidScattering);
        return liquidScatteringColor*(vec3(liquidScattering)/max(extinction,vec3(0.000001)))
          *(vec3(1)-absorption(medium,distance));
      }
      bool inGlass(vec3 p){
        return inVolume(p,1);
      }
      int nextMedium(Hit h,vec3 p,vec3 d){
        bool entering=dot(d,h.geometricNormal)<0.0;
        vec3 beyond=p+h.geometricNormal*(entering?-0.0001:0.0001);
        if(h.object==1)return entering?1:(inLiquid(beyond)?2:0);
        // Напиток слегка перекрывает стенку: выход может вести в стекло.
        // Переход в воздух здесь давал неверные IOR и полное отражение.
        return entering?2:(inGlass(beyond)?1:0);
      }
      vec3 interfaceNormal(Hit h,vec3 d,float eta){
        bool entering=dot(d,h.geometricNormal)<0.0;
        vec3 geometric=entering?h.geometricNormal:-h.geometricNormal;
        vec3 optical=entering?h.n:-h.n;
        vec3 reflected=reflect(d,optical),transmitted=refract(d,optical,eta);
        // Сглаживание сохраняется, пока лучи остаются на физических сторонах
        // границы. Иначе оно направляло луч обратно в ту же грань.
        if(dot(d,optical)>=0.0||dot(reflected,geometric)<=0.0||
           (dot(transmitted,transmitted)>0.0&&dot(transmitted,geometric)>=0.0))return geometric;
        return optical;
      }
      vec3 offsetOrigin(vec3 p,Hit h,vec3 outgoing){
        float side=dot(outgoing,h.geometricNormal)<0.0?-1.0:1.0;
        return p+h.geometricNormal*(side*0.00008);
      }
      // Слабые плавные перепады снизу согласованы с геометрией и затенением.
      float foamLowerHeight(vec2 position){
        vec2 q=position/foamShape.z;
        return foamShape.x+0.006*sin(q.x*4.8+q.y*2.1+0.9)
          +0.003*sin(q.y*7.3-q.x*3.4-0.5);
      }
      // Единый объём внутри стакана с низкой выпуклостью над уровнем ободка.
      float foamDistance(vec3 p){
        float radius=foamWall[7].y;
        for(int i=0;i<7;i++){
          if(p.y<=foamWall[i+1].x){
            float t=clamp((p.y-foamWall[i].x)/(foamWall[i+1].x-foamWall[i].x),0.0,1.0);
            radius=mix(foamWall[i].y,foamWall[i+1].y,t);break;
          }
        }
        // Высота плавно убывает от центра до нуля у внутреннего края.
        // Поэтому над ободком нет ни цилиндрического бортика, ни перелива.
        float radial=clamp(length(p.xz)/foamWall[7].y,0.0,1.0);
        float dome=foamShape.w*(1.0-radial*radial);
        float wall=length(p.xz)-radius;
        float upper=p.y-foamShape.y-dome;
        return max(max(wall,upper),foamLowerHeight(p.xz)-p.y);
      }
      float intersectFoam(vec3 o,vec3 d,float limit){
        if(!foamEnabled)return -1.0;
        float lower=foamShape.x-0.01;
        float nearY=0.0,farY=limit;
        if(abs(d.y)<0.000001){if(o.y<lower||o.y>foamShape.y+foamShape.w)return -1.0;}
        else{
          float a=(lower-o.y)/d.y,b=(foamShape.y+foamShape.w-o.y)/d.y;
          nearY=max(nearY,min(a,b));farY=min(farY,max(a,b));
        }
        float boundRadius=foamShape.z;
        float a=dot(d.xz,d.xz),b=dot(o.xz,d.xz),c=dot(o.xz,o.xz)-boundRadius*boundRadius;
        if(a<0.000001){if(c>0.0)return -1.0;}
        else{
          float discriminant=b*b-a*c;if(discriminant<0.0)return -1.0;
          float root=sqrt(discriminant);
          nearY=max(nearY,(-b-root)/a);farY=min(farY,(-b+root)/a);
        }
        if(farY<=nearY)return -1.0;
        float t=max(0.00001,nearY);
        for(int i=0;i<40;i++){
          if(t>farY)return -1.0;
          float distanceToFoam=foamDistance(o+d*t);
          if(distanceToFoam<0.00012)return t;
          t+=max(0.00008,distanceToFoam*0.75);
        }
        // Скользящий луч может медленно сходиться над неровным верхом.
        // Ограниченный запасной поиск уточняет первое пересечение.
        float start=t,previous=t;
        for(int i=1;i<=32;i++){
          float next=mix(start,farY,float(i)/32.0);
          if(foamDistance(o+d*next)<0.00012){
            float low=previous,high=next;
            for(int j=0;j<8;j++){
              float middle=(low+high)*0.5;
              if(foamDistance(o+d*middle)<0.00012)high=middle;else low=middle;
            }
            return high;
          }
          previous=next;
        }
        return -1.0;
      }
      vec2 foamHash(vec2 p){
        return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
      }
      float foamCells(vec2 uv,float frequency,float pixelSize,float density){
        vec2 p=uv*frequency,cell=floor(p),local=fract(p),delta=vec2(0);
        float nearest=10.0,radius=1.0;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 offset=vec2(float(x),float(y)),random=foamHash(cell+offset);
          if(random.x>density)continue;
          float r=0.16+random.y*0.34;
          vec2 v=offset+0.15+random*0.7-local;
          float distanceToCell=length(v)/r;
          if(distanceToCell<nearest){nearest=distanceToCell;delta=v/r;radius=r;}
        }
        // Фильтрация задаётся размером пикселя, без производных в ветках луча.
        float aa=clamp(pixelSize*frequency/radius,0.025,1.5);
        float mask=1.0-smoothstep(1.0-aa,1.0+aa,nearest);
        float edge=smoothstep(0.48-aa,0.90+aa,nearest)*mask;
        float side=dot(delta,normalize(vec2(-0.6,0.8)));
        float shadow=mask*(0.04+0.08*max(side,0.0))+edge*0.04;
        float highlight=edge*max(-side,0.0)*0.10;
        float resolved=1.0-smoothstep(0.5,1.5,pixelSize*frequency);
        return (highlight-shadow)*resolved;
      }
      vec3 foamSurfaceColor(vec3 p){
        float e=0.0006;
        vec3 gradient=vec3(
          foamDistance(p+vec3(e,0,0))-foamDistance(p-vec3(e,0,0)),
          foamDistance(p+vec3(0,e,0))-foamDistance(p-vec3(0,e,0)),
          foamDistance(p+vec3(0,0,e))-foamDistance(p-vec3(0,0,e)));
        vec3 normal=gradient/max(length(gradient),0.000001);
        float top=smoothstep(0.3,0.8,normal.y);
        vec2 side=vec2((length(p.xz)>0.000001?atan(p.z,p.x):0.0)*foamShape.z,p.y);
        // Раздельные проекции не растягивают поры на переходе верх/стенка.
        float pixelSize=max(halfSize.y*2.0/resolution.y,0.0001);
        // Редкие крупные ячейки и слабая мелкая фактура не создают сетку.
        float sidePores=foamCells(side,34.0,pixelSize,0.28)+0.14*foamCells(side,145.0,pixelSize,0.65);
        float topPores=foamCells(p.xz,34.0,pixelSize,0.28)+0.14*foamCells(p.xz,145.0,pixelSize,0.65);
        float pores=mix(sidePores,topPores,top);
        float light=max(dot(normal,normalize(keyLight-p)),0.0);
        float bottom=foamLowerHeight(p.xz);
        float lower=1.0-smoothstep(bottom,bottom+0.025,p.y);
        vec3 cream=mix(vec3(0.93,0.875,0.74),vec3(0.995,0.975,0.90),0.50+0.50*top);
        cream*=0.90+0.10*light;
        return max(vec3(0),cream*(1.0+pores-0.05*lower));
      }
      // Детерминированное приближение углового рассеяния, без шума по кадрам.
      float scatteringVariance(int medium,float distance){
        return medium==2?liquidScattering*distance*0.0064:0.0;
      }
      vec3 spreadDirection(vec3 direction,float variance,int sampleIndex){
        vec3 axis=abs(direction.y)<0.9?vec3(0,1,0):vec3(1,0,0);
        vec3 tangent=normalize(cross(direction,axis)),bitangent=cross(direction,tangent);
        float angle=float(sampleIndex)*2.39996323;
        float radius=sqrt((float(sampleIndex)+0.5)/8.0)*min(sqrt(max(variance,0.0)),0.18);
        return normalize(direction+radius*(cos(angle)*tangent+sin(angle)*bitangent));
      }
      vec3 cachedOrigin[3],cachedDirection[3],cachedWeight[3];
      float cachedVariance[3];
      vec3 pathWeight,discardedColor;
      vec3 staticRayColor(vec3 o,vec3 d);
      vec3 filteredStaticRayColor(vec3 origin,vec3 direction,float variance){
        if(variance<0.000001)return staticRayColor(origin,direction);
        vec3 color=vec3(0);
        for(int i=0;i<8;i++)color+=staticRayColor(origin,spreadDirection(direction,variance,i));
        return color/8.0;
      }
      void recordRay(vec3 origin,vec3 direction,vec3 weight,float variance){
        vec4 clip=labProjection*vec4(origin,1.0);vec2 uv=clip.xy/clip.w;
        for(int i=0;i<3;i++){
          vec4 previous=labProjection*vec4(cachedOrigin[i],1.0);
          if(dot(cachedWeight[i],vec3(1))>0.0&&distance(previous.xy/previous.w,uv)<0.006&&dot(cachedDirection[i],direction)>0.99999
            &&abs(cachedVariance[i]-variance)<0.00001){
            float a=dot(cachedWeight[i],vec3(1)),b=dot(weight,vec3(1));
            cachedOrigin[i]=(cachedOrigin[i]*a+origin*b)/max(a+b,0.000001);
            cachedDirection[i]=normalize(cachedDirection[i]*a+direction*b);
            cachedVariance[i]=(cachedVariance[i]*a+variance*b)/max(a+b,0.000001);
            cachedWeight[i]+=weight;return;
          }
        }
        int slot=0;float weakest=dot(cachedWeight[0],vec3(1));
        for(int i=1;i<3;i++){float w=dot(cachedWeight[i],vec3(1));if(w<weakest){weakest=w;slot=i;}}
        if(dot(weight,vec3(1))>weakest){
          if(weakest>0.0)discardedColor+=cachedWeight[slot]*filteredStaticRayColor(cachedOrigin[slot],cachedDirection[slot],cachedVariance[slot]);
          cachedOrigin[slot]=origin;cachedDirection[slot]=direction;cachedWeight[slot]=weight;cachedVariance[slot]=variance;
        }else discardedColor+=weight*filteredStaticRayColor(origin,direction,variance);
      }
      vec3 bankColor(Hit h,vec3 p,vec3 d){return vec3(0);}
      vec3 backdropColor(Hit h,vec3 p,vec3 d){
        if(h.object==-1)return environment(d);
        if(h.object==7)return bankColor(h,p,d);
        return textureLod(backdropTexture,backdropUV(p),0.0).rgb;
      }
      vec3 panelBackdrop(vec3 p,vec3 d){
        // За мягким краем панели продолжается тот же луч к сцене.
        // Постоянный серый цвет создавал отдельный контур в стекле.
        vec3 o=p+d*0.0001;
        Hit behind=Hit(10000.0,vec3(0),vec3(0),-1);
        plane(o,d,vec3(0,-0.015,0),vec3(0,1,0),vec3(20,0.001,20),3,behind);
        plane(o,d,vec3(0,1,wallDepth),vec3(0,0,1),vec3(24,24,0.001),4,behind);
        return backdropColor(behind,o+d*behind.t,d);
      }
      vec3 surfaceColor(Hit h,vec3 p,vec3 d){
        if(h.object==6){
          vec3 center=p.x<0.0?vec3(-1.3,1.2,0.65):vec3(1.3,1.2,0.65);
          vec2 edge=vec2(2.0,p.x<0.0?0.08:0.06)-abs(p.yz-center.yz);
          float softness=smoothstep(0.0,0.2,edge.x)*smoothstep(0.0,0.025,edge.y);
          pathWeight*=1.0-softness;return mix(panelBackdrop(p,d),vec3(0.08),softness);
        }
        if(h.object==5){
          // Мягкие края софтбоксов вместо жёстких белых полос в отражениях дна.
          vec3 center=p.x<0.0?keyLight:vec3(1.8,1.8,0.2);
          vec2 extent=p.x<0.0?vec2(1.8,0.75):vec2(1.9,0.4);
          vec2 edge=extent-abs(p.yz-center.yz);
          float softness=smoothstep(0.0,0.2,edge.x)*smoothstep(0.0,0.12,edge.y);
          pathWeight*=1.0-softness;return mix(panelBackdrop(p,d),vec3(p.x<0.0?4.0:0.6),softness);
        }
        // Фон сайта уже освещён: повторная диффузная трассировка не нужна.
        // Рабочие соседи — разные лучи, а не соседние пиксели изображения.
        // Неявные производные texture() давали полосы при выборе mip-уровня.
        return backdropColor(h,p,d);
      }
  `

    const fragmentShader = optics + /* glsl */ `
      vec3 staticRayColor(vec3 o,vec3 d){
        Hit h=Hit(10000.0,vec3(0),vec3(0),-1);
        plane(o,d,vec3(0,-0.015,0),vec3(0,1,0),vec3(20,0.001,20),3,h);
        plane(o,d,vec3(0,1,wallDepth),vec3(0,0,1),vec3(24,24,0.001),4,h);
        plane(o,d,keyLight,vec3(1,0,0),vec3(0.001,1.8,0.75),5,h);
        plane(o,d,vec3(1.8,1.8,0.2),vec3(-1,0,0),vec3(0.001,1.9,0.4),5,h);
        plane(o,d,vec3(-1.3,1.2,0.65),vec3(1,0,0),vec3(0.001,2,0.08),6,h);
        plane(o,d,vec3(1.3,1.2,0.65),vec3(-1,0,0),vec3(0.001,2,0.06),6,h);
        return surfaceColor(h,o+d*h.t,d);
      }
      layout(location=0) out vec4 staticColor;
      layout(location=1) out vec4 bankUV0;
      layout(location=2) out vec4 bankWeight0;
      layout(location=3) out vec4 bankUV1;
      layout(location=4) out vec4 bankWeight1;
      layout(location=5) out vec4 bankUV2;
      layout(location=6) out vec4 bankWeight2;
      layout(location=7) out vec4 rayVariance;
      void primaryRay(vec2 pixel,out vec3 o,out vec3 d){
        vec2 uv=pixel/resolution;
        vec3 offset=(uv.x*2.0-1.0)*halfSize.x*rayRight+(uv.y*2.0-1.0)*halfSize.y*rayUp;
        o=rayOrigin+offset;d=rayDirection;
      }
      // Небольшая отражённая ветвь без случайной выборки и накопления кадров.
      vec3 reflectionPath(vec3 o,vec3 d,int medium,vec3 weight,float variance){
        vec3 color=vec3(0);
        for(int step=0;step<reflectionSteps;step++){
          Hit h=intersect(o,d,medium);vec3 p=o+d*h.t;
          // Непрозрачная пена завершает эту ветвь: луч к банке за ней
          // не попадает в кэш. Отражённые ветви стекла считаются отдельно.
          if(medium!=1){
            float foamT=intersectFoam(o,d,h.t);
            if(foamT>0.0)return color+weight*(scattering(medium,foamT)+absorption(medium,foamT)*foamSurfaceColor(o+d*foamT));
          }
          if(h.object==-1){recordRay(o,d,weight,variance);return color;}
          variance+=scatteringVariance(medium,h.t);
          color+=weight*scattering(medium,h.t);
          weight*=absorption(medium,h.t);
          if(h.object!=1&&h.object!=2){recordRay(o,d,weight,variance);return color;}
          int next=nextMedium(h,p,d);float from=ior(medium),to=ior(next);
          vec3 n=interfaceNormal(h,d,from/to);
          float f=fresnel(clamp(dot(-d,n),0.0,1.0),from,to);
          if(f>=0.9999)d=reflect(d,n);
          else{weight*=1.0-f;d=refract(d,n,from/to);medium=next;}
          o=offsetOrigin(p,h,d);
        }
        return color;
      }
      vec3 trace(vec3 o,vec3 d,float sampleWeight){
        int medium=0;vec3 color=vec3(0),weight=vec3(sampleWeight);float variance=0.0;
        for(int step=0;step<traceSteps;step++){
          Hit h=intersect(o,d,medium);vec3 p=o+d*h.t;
          // Непрозрачная пена завершает эту ветвь: луч к банке за ней
          // не попадает в кэш. Отражённые ветви стекла считаются отдельно.
          if(medium!=1){
            float foamT=intersectFoam(o,d,h.t);
            if(foamT>0.0)return color+weight*(scattering(medium,foamT)+absorption(medium,foamT)*foamSurfaceColor(o+d*foamT));
          }
          if(h.object==-1){recordRay(o,d,weight,variance);return color;}
          variance+=scatteringVariance(medium,h.t);
          color+=weight*scattering(medium,h.t);
          weight*=absorption(medium,h.t);
          if(h.object!=1&&h.object!=2){recordRay(o,d,weight,variance);return color;}
          int next=nextMedium(h,p,d);float from=ior(medium),to=ior(next);
          vec3 n=interfaceNormal(h,d,from/to);
          float f=fresnel(clamp(dot(-d,n),0.0,1.0),from,to);
          vec3 reflected=reflect(d,n);
          if(f>=0.9999)d=reflected;
          else{
            if(f>0.001)color+=reflectionPath(offsetOrigin(p,h,reflected),reflected,medium,weight*f,variance);
            weight*=1.0-f;d=refract(d,n,from/to);medium=next;
          }
          o=offsetOrigin(p,h,d);
          if(max(weight.r,max(weight.g,weight.b))<0.001)break;
        }
        return color;
      }
      vec3 toSRGB(vec3 c){return mix(12.92*c,1.055*pow(max(c,vec3(0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
      vec2 encodeDirection(vec3 direction){
        vec3 n=direction/(abs(direction.x)+abs(direction.y)+abs(direction.z));
        vec2 signs=mix(vec2(-1),vec2(1),step(vec2(0),n.xy));
        return n.z>=0.0?n.xy:(1.0-abs(n.yx))*signs;
      }
      void main(){
        for(int i=0;i<3;i++){cachedOrigin[i]=vec3(0);cachedDirection[i]=vec3(0,0,-1);cachedWeight[i]=vec3(0);cachedVariance[i]=0.0;}
        discardedColor=vec3(0);
        vec3 centerOrigin,centerDirection;primaryRay(gl_FragCoord.xy,centerOrigin,centerDirection);
        Hit center=intersect(centerOrigin,centerDirection,0);
        bool base=(center.object==1||center.object==2)&&(centerOrigin+centerDirection*center.t).y<0.2;
        int samples=base?baseSamples:bodySamples;
        vec3 color=vec3(0);float coverage=0.0;
        for(int sampleIndex=0;sampleIndex<samples;sampleIndex++){
          vec2 offset=base?vec2((float(sampleIndex%4)+0.5)/4.0-0.5,(float(sampleIndex/4)+0.5)/2.0-0.5)
            :vec2(float(sampleIndex%2)*0.5-0.25,float(sampleIndex/2)*0.5-0.25);
          vec3 o,d;primaryRay(gl_FragCoord.xy+offset,o,d);
          Hit first=intersect(o,d,0);
          if(first.object==1||first.object==2){coverage+=1.0/float(samples);color+=trace(o,d,1.0/float(samples));}
        }
        staticColor=vec4(color+discardedColor,coverage);
        vec2 direction0=encodeDirection(cachedDirection[0]),direction1=encodeDirection(cachedDirection[1]),direction2=encodeDirection(cachedDirection[2]);
        bankUV0=vec4(cachedOrigin[0],direction0.x);bankWeight0=vec4(direction0.y,cachedWeight[0]);
        bankUV1=vec4(cachedOrigin[1],direction1.x);bankWeight1=vec4(direction1.y,cachedWeight[1]);
        bankUV2=vec4(cachedOrigin[2],direction2.x);bankWeight2=vec4(direction2.y,cachedWeight[2]);
        rayVariance=vec4(cachedVariance[0],cachedVariance[1],cachedVariance[2],0);
      }
    `
    // Метки GLSL не должны зависеть от отступов JS после переноса кода.
    const cacheDefinitions = optics.indexOf('vec3 cachedOrigin[')
    const backdropFunctions = optics.indexOf('vec3 backdropColor(')
    if (cacheDefinitions < 0 || backdropFunctions < 0) throw new Error('Не найдены секции оптического шейдера')
    const screenScene = scene
    const opticsMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms, fragmentShader,
      vertexShader: 'void main(){gl_Position=vec4(position.xy,0.0,1.0);}',
      toneMapped: false, depthTest: false, depthWrite: false,
    })
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), opticsMaterial)
    screenMesh.frustumCulled = false
    screenScene.add(screenMesh)
    // Кэшируются начало, направление, цветовой вес и ширина рассеяния каждого луча.
    // Фон, металл банки и её положение проверяются в общем финальном проходе.
    const opticsCache = new THREE.WebGLRenderTarget(1, 1, {
      count: 8, type: THREE.HalfFloatType, depthBuffer: false,
      minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    })
    // Кэш только прямой преломлённой ветви внутри напитка. Пузырьки —
    // приближение с контуром и бликом, без вторичной трассировки каждой сферы.
    const bubbleCache = new THREE.WebGLRenderTarget(1, 1, {
      count: 2, type: THREE.FloatType, depthBuffer: false,
      minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    })
    const bubblePathMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms, toneMapped: false, depthTest: false, depthWrite: false,
      vertexShader: 'void main(){gl_Position=vec4(position.xy,0.0,1.0);}',
      fragmentShader: optics.slice(0, cacheDefinitions) + /* glsl */ `
        layout(location=0) out vec4 liquidEntry;
        layout(location=1) out vec4 liquidDirection;
        void main(){
          liquidEntry=vec4(0);liquidDirection=vec4(0);
          vec2 uv=gl_FragCoord.xy/resolution;
          vec3 o=rayOrigin+(uv.x*2.0-1.0)*halfSize.x*rayRight+(uv.y*2.0-1.0)*halfSize.y*rayUp;
          vec3 d=rayDirection;int medium=0;float visibility=1.0;
          for(int step=0;step<traceSteps;step++){
            Hit h=intersect(o,d,medium);
            float foamT=medium!=1?intersectFoam(o,d,h.t):-1.0;
            if(h.object!=1&&h.object!=2)return;
            if(medium==2){
              liquidEntry=vec4(o,foamT>0.0?foamT:h.t);liquidDirection=vec4(d,visibility);return;
            }
            // Пузырьки позади шапки не рисуются поверх неё.
            if(foamT>0.0)return;
            vec3 p=o+d*h.t;int next=nextMedium(h,p,d);
            float eta=ior(medium)/ior(next);vec3 n=interfaceNormal(h,d,eta);
            float f=fresnel(clamp(dot(-d,n),0.0,1.0),ior(medium),ior(next));
            if(f>=0.9999)return;
            visibility*=1.0-f;d=refract(d,n,eta);medium=next;o=offsetOrigin(p,h,d);
          }
        }
      `,
    })
    const displayUniforms = {
      bubbleEntry: { value: bubbleCache.textures[0] }, bubbleDirection: { value: bubbleCache.textures[1] },
      bubblePositions: { value: bubblePositions },
      bankFrame: { value: backdrop.texture }, bankExposure: { value: 1 }, resolution: { value: dimensions },
      glassToCanvas: { value: new THREE.Matrix3() },
    }
    opticsCache.textures.forEach((map, index) => { displayUniforms['cache' + index] = { value: map } })
    const terminalOptics = optics.slice(0, cacheDefinitions) + /* glsl */ `
      vec3 bankColor(Hit h,vec3 p,vec3 d){
        vec4 clip=labProjection*vec4(p,1.0);
        return ACESFilmicToneMapping(textureLod(bankFrame,clamp(clip.xy/clip.w*0.5+0.5,vec2(0.001),vec2(0.999)),0.0).rgb);
      }
    ` + optics.slice(backdropFunctions).replaceAll('pathWeight*=1.0-softness;', '').replace('return backdropColor(behind,o+d*behind.t,d);', 'intersectBank(o,d,behind);return backdropColor(behind,o+d*behind.t,d);')
    const displayMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms: { ...uniforms, ...displayUniforms }, toneMapped: false, depthTest: false, depthWrite: false,
      vertexShader: 'uniform mat3 glassToCanvas; varying vec2 cacheUV; void main(){cacheUV=uv;vec2 p=(glassToCanvas*vec3(uv,1.)).xy;gl_Position=vec4(p*2.-1.,0.,1.);}',
      transparent: true, premultipliedAlpha: true,
      fragmentShader: terminalOptics + /* glsl */ `
        varying vec2 cacheUV;
        uniform sampler2D cache0,cache1,cache2,cache3,cache4,cache5,cache6,cache7;
        uniform sampler2D bubbleEntry,bubbleDirection;
        uniform sampler2D bubblePositions;
        vec3 bubbleColor(vec3 color){
          vec4 entry=texture(bubbleEntry,cacheUV),ray=texture(bubbleDirection,cacheUV);
          if(entry.w<=0.0||ray.w<=0.0)return color;
          float nearest=entry.w;vec3 result=color;
          float footprint=max(halfSize.y*2.0/resolution.y,0.0001);
          for(int i=0;i<${bubbleCount};i++){
            vec4 bubble=texelFetch(bubblePositions,ivec2(i,0),0);if(bubble.w<=0.00001)continue;
            vec3 offset=bubble.xyz-entry.xyz;
            float along=dot(offset,ray.xyz);
            if(along<=0.0||along>=entry.w)continue;
            vec3 radial=ray.xyz*along-offset;
            float distanceToRay=length(radial);
            float coverage=1.0-smoothstep(bubble.w-footprint*0.5,bubble.w+footprint*0.5,distanceToRay);
            if(coverage<=0.0)continue;
            float depth=sqrt(max(0.0,bubble.w*bubble.w-distanceToRay*distanceToRay));
            if(along-depth>=nearest)continue;
            nearest=along-depth;
            vec3 normal=normalize(radial-ray.xyz*max(depth,0.00001));
            // Сглаживаем внешнюю и внутреннюю границы кольца отдельно:
            // тонкий край сохраняет вклад, даже когда он меньше пикселя.
            float innerRadius=bubble.w*0.66;
            float interior=1.0-smoothstep(innerRadius-footprint*0.5,innerRadius+footprint*0.5,distanceToRay);
            float rim=clamp((coverage-interior)/max(coverage,0.0001),0.0,1.0);
            vec3 lightDirection=normalize(keyLight-bubble.xyz);
            vec3 halfway=normalize(lightDirection-ray.xyz);
            float highlight=pow(max(dot(normal,halfway),0.0),32.0);
            float litEdge=max(dot(normal,lightDirection),0.0);
            vec3 tint=absorption(2,along);
            vec3 shaded=color*(1.0-0.52*rim)+tint*(0.22*rim*litEdge+1.2*highlight);
            float pixelCoverage=min(1.0,bubble.w/footprint);
            result=mix(color,shaded,coverage*ray.w*pixelCoverage);
          }
          return result;
        }
        out vec4 fragmentColor;
        vec3 decodeDirection(vec2 encoded){
          vec3 n=vec3(encoded,1.0-abs(encoded.x)-abs(encoded.y));
          vec2 signs=mix(vec2(-1),vec2(1),step(vec2(0),n.xy));
          if(n.z<0.0)n.xy=(1.0-abs(n.yx))*signs;
          return normalize(n);
        }
        vec3 terminalRayColor(vec3 o,vec3 d){
          Hit h=Hit(10000.0,vec3(0),vec3(0),-1);
          plane(o,d,vec3(0,-0.015,0),vec3(0,1,0),vec3(20,0.001,20),3,h);
          plane(o,d,vec3(0,1,wallDepth),vec3(0,0,1),vec3(24,24,0.001),4,h);
          plane(o,d,keyLight,vec3(1,0,0),vec3(0.001,1.8,0.75),5,h);
          plane(o,d,vec3(1.8,1.8,0.2),vec3(-1,0,0),vec3(0.001,1.9,0.4),5,h);
          plane(o,d,vec3(-1.3,1.2,0.65),vec3(1,0,0),vec3(0.001,2,0.08),6,h);
          plane(o,d,vec3(1.3,1.2,0.65),vec3(-1,0,0),vec3(0.001,2,0.06),6,h);
          intersectBank(o,d,h);
          return surfaceColor(h,o+d*h.t,d);
        }
        vec3 rayColor(vec4 origin,vec4 data,float variance){
          vec3 weight=data.yzw;if(max(weight.r,max(weight.g,weight.b))<0.00001)return vec3(0);
          vec3 o=origin.xyz,d=decodeDirection(vec2(origin.w,data.x));
          // Наружное отражение и прозрачные пресеты сохраняют одну чёткую выборку.
          if(variance<0.000001)return weight*terminalRayColor(o,d);
          vec3 color=vec3(0);
          for(int i=0;i<8;i++)color+=terminalRayColor(o,spreadDirection(d,variance,i));
          return weight*color/8.0;
        }
        vec3 toSRGB(vec3 c){return mix(12.92*c,1.055*pow(max(c,vec3(0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
        void main(){
          vec4 base=texture(cache0,cacheUV);if(base.a<0.00001){fragmentColor=vec4(0);return;}
          vec3 variance=texture(cache7,cacheUV).xyz;
          vec3 color=base.rgb+rayColor(texture(cache1,cacheUV),texture(cache2,cacheUV),variance.x)
            +rayColor(texture(cache3,cacheUV),texture(cache4,cacheUV),variance.y)
            +rayColor(texture(cache5,cacheUV),texture(cache6,cacheUV),variance.z);
          fragmentColor=vec4(toSRGB(bubbleColor(color/base.a))*base.a,base.a);
        }
      `,
    })
    let opticsSignature = ''

    let patternImage, patternSize = '', signature = '', patternVersion = 0, requestVersion = 0
    let disposed = false, source
    async function preparePattern() {
      const nextPattern = currentView.pattern
      if (nextPattern !== pattern) {
        pattern = nextPattern; patternSize = ''; patternImage = null; patternVersion++; requestVersion++
      }
      if (!pattern || disposed) return
      const rect = pattern.getBoundingClientRect()
      const size = `${rect.width}:${rect.height}`
      if (size === patternSize || rect.width <= 0 || rect.height <= 0) return
      patternSize = size
      const version = ++requestVersion
      const svg = pattern.cloneNode(true)
      svg.removeAttribute('class')
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      svg.setAttribute('width', rect.width)
      svg.setAttribute('height', rect.height)
      svg.style.color = getComputedStyle(pattern).color
      const image = new Image()
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`
      try {
        await image.decode()
        if (disposed || version !== requestVersion) return
        patternImage = image
        patternVersion++
        signature = ''
        onBackgroundReady()
      } catch { if (version === requestVersion) patternSize = '' }
    }
    function updateBackground() {
      element = currentView.glass.host
      void preparePattern()
      const rect = section.getBoundingClientRect()
      const patternRect = pattern?.getBoundingClientRect()
      const counterRect = counter?.getBoundingClientRect()
      const next = JSON.stringify([rect.width, rect.height, patternRect?.width, patternRect?.height, patternRect?.left - rect.left, patternRect?.top - rect.top, counterRect?.top - rect.top, counterRect?.height, counter?.complete, patternVersion])
      if (next !== signature) {
        signature = next
        const scale = Math.min(1.5, 2048 / Math.max(rect.width, rect.height))
        const width = Math.max(1, Math.round(rect.width * scale)), height = Math.max(1, Math.round(rect.height * scale))
        if (canvas.width !== width || canvas.height !== height) {
          texture.dispose()
          canvas.width = width; canvas.height = height
          texture = new THREE.CanvasTexture(canvas)
          texture.colorSpace = THREE.SRGBColorSpace
          backgroundMaterial.uniforms.map.value = texture
          uniforms.backdropTexture.value = texture
        }
        context.setTransform(scale, 0, 0, scale, 0, 0)
        context.fillStyle = getComputedStyle(section).backgroundColor
        context.fillRect(0, 0, rect.width, rect.height)
        if (counter?.complete && counter.naturalWidth) context.drawImage(counter, counterRect.left - rect.left, counterRect.top - rect.top, counterRect.width, counterRect.height)
        if (patternImage && patternRect) {
          context.globalAlpha = Number(getComputedStyle(pattern).opacity)
          context.drawImage(patternImage, patternRect.left - rect.left, patternRect.top - rect.top, patternRect.width, patternRect.height)
          context.globalAlpha = 1
        }
        texture.needsUpdate = true
      }
      screenToBackdrop.copy(new THREE.Matrix3().set(1 / rect.width, 0, -rect.left / rect.width, 0, -1 / rect.height, 1 + rect.top / rect.height, 0, 0, 1))
        .multiply(canvasToScreen(THREE, element, currentView.glass.proxy))
      source = bankOptics
      if (!source) return
      uniforms.bankProfileTree.value = source.profile.tree.texture
      uniforms.bankTreeCount.value = source.profile.tree.count
      uniforms.bankSize.value.set(1, 0.5, 1)
      source.product.updateMatrix()
      shared.placeBank(true)
      uniforms.bankInverse.value.copy(worldToLab).multiply(source.placement.matrix)
        .multiply(new THREE.Matrix4().makeTranslation(...source.center.toArray()))
        .multiply(new THREE.Matrix4().makeScale(source.height, source.height, source.height)).invert()
    }
    function resize() {
      const next = shared.glassBufferSize()
      if (!dimensions.equals(next)) {
        dimensions.copy(next)
        backdrop.setSize(dimensions.x, dimensions.y)
        opticsCache.setSize(dimensions.x, dimensions.y)
        bubbleCache.setSize(dimensions.x, dimensions.y)
        opticsSignature = ''
      }
      void preparePattern()
    }
    function draw() {
      const target = renderer.getRenderTarget()
      const toneMapping = renderer.toneMapping
      try {
        shared.setView(true)
        const drink = shared.drinkPreset()
        uniforms.liquidAbsorption.value.fromArray(drink.absorption)
        uniforms.liquidScattering.value = drink.scattering
        uniforms.liquidScatteringColor.value.fromArray(drink.scatteringColor)
        uniforms.foamEnabled.value = drink.foamAllowed && shared.foamEnabled()
        camera.updateMatrixWorld(true)
        updateBackground()
        uniforms.labProjection.value.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse).multiply(labToWorld)
        const rect = element.getBoundingClientRect(), counterRect = counter?.getBoundingClientRect()
        if (counterRect) {
          const edge = new THREE.Vector3(0, 1 - (counterRect.top - rect.top) / rect.height * 2, -1).unproject(camera).applyMatrix4(worldToLab)
          const direction = new THREE.Vector3(0, 0, -1).transformDirection(camera.matrixWorld)
          edge.addScaledVector(direction, (-0.015 - edge.y) / direction.y)
          uniforms.wallDepth.value = Math.min(-0.55, edge.z)
        }
        uniforms.rayOrigin.value.copy(camera.position).applyMatrix4(worldToLab)
        uniforms.rayRight.value.setFromMatrixColumn(camera.matrixWorld, 0).normalize()
        uniforms.rayUp.value.setFromMatrixColumn(camera.matrixWorld, 1).normalize()
        uniforms.rayDirection.value.setFromMatrixColumn(camera.matrixWorld, 2).negate().normalize()
        uniforms.halfSize.value.set(camera.right * 10 / modelScale, camera.top * 10 / modelScale)
        renderer.toneMapping = THREE.NoToneMapping
        shared.bankDisplay.value = false
        shared.canPlacement.visible = true
        background.visible = true
        screenMesh.visible = false
        renderer.setRenderTarget(backdrop)
        renderer.render(backgroundScene, camera)
        shared.canPlacement.visible = false
        background.visible = false
        screenMesh.visible = true
        const nextSignature = JSON.stringify([
          uniforms.foamEnabled.value, uniforms.liquidAbsorption.value.toArray(),
          uniforms.liquidScattering.value, uniforms.liquidScatteringColor.value.toArray(), patternVersion, counter?.complete, dimensions.toArray(), uniforms.labProjection.value.toArray(), uniforms.rayOrigin.value.toArray(),
          uniforms.rayDirection.value.toArray(), uniforms.halfSize.value.toArray(),
        ].flat(2).map(value => typeof value === 'number' ? Math.round(value * 100000) : value))
        if (nextSignature !== opticsSignature) {
          screenMesh.material = opticsMaterial
          renderer.setRenderTarget(opticsCache)
          renderer.render(screenScene, camera)
          screenMesh.material = bubblePathMaterial
          renderer.setRenderTarget(bubbleCache)
          renderer.render(screenScene, camera)
          opticsSignature = nextSignature
        }
        screenMesh.material = displayMaterial
        screenMesh.renderOrder = 100
        shared.beginFinal(displayUniforms.glassToCanvas.value)
        renderer.render(scene, camera)
        shared.finishFinal(screenMesh)
        screenMesh.renderOrder = 0
        onFrameReady()
      } finally {
        renderer.toneMapping = toneMapping
        renderer.setRenderTarget(target)
      }
    }
    const backgroundReady = () => { signature = ''; onBackgroundReady() }
    counter?.addEventListener('load', backgroundReady)
    return {
      resize,
      render: draw,
      invalidate() { opticsSignature = '' },
      updateBubbles,
      dispose() {
        disposed = true
        counter?.removeEventListener('load', backgroundReady)
        requestVersion++
        backdrop.dispose(); texture.dispose(); tree.texture.dispose(); emptyBankTree.dispose()
        screenMesh.geometry.dispose(); opticsMaterial.dispose(); displayMaterial.dispose(); opticsCache.dispose()
        bubbleCache.dispose(); bubblePathMaterial.dispose(); bubblePositions.dispose()
        background.geometry.dispose(); backgroundMaterial.dispose()
        scene.remove(background, screenMesh)
      },
    }
  }

  // Один владелец WebGL, камеры, света, качества и цикла для обеих моделей.
  let sharedScene = null
  let sceneStarting = false
  const sceneQuality = Object.freeze({ maxModelPixels: 720, maxPixelRatio: 1.5, samples: 4, bodySamples: 4, baseSamples: 8, traceSteps: 18, reflectionSteps: 6 })
  // Метры: высота стакана — по Nonic 570 мл, форма остаётся нашей;
  // банка — стандартные размеры 0,5 л. Стакан задаёт общий масштаб сцены.
  const modelDimensions = Object.freeze({ glass: { height: 0.1495 }, can: { height: 0.168, diameter: 0.066 } })

  function disposeModel(model) {
    const resources = new Set()
    model.traverse(node => {
      if (node.geometry) resources.add(node.geometry)
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        if (!material) continue
        resources.add(material)
        for (const value of Object.values(material)) if (value?.isTexture) resources.add(value)
      }
    })
    for (const resource of resources) resource.dispose()
  }

  async function startSharedScene() {
    if (closed || failed || sharedScene || sceneStarting || !currentView) return
    sceneStarting = true
    let cleanup = () => {}
    try {
      const [THREE, { GLTFLoader }, { RoomEnvironment }, { FXAAShader }] = await Promise.all([
        import('three'), import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/environments/RoomEnvironment.js'), import('three/addons/shaders/FXAAShader.js'),
      ])
      if (closed || !currentView) return
      const hasGlass = Boolean(currentView.glass)
      let glassSlot = currentView.glass || currentView.can, canSlot = currentView.can
      let article = currentView.root
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
      let aborted = false
      cleanup = () => { aborted = true; renderer.dispose(); renderer.domElement.remove(); sharedScene = null }
      sharedScene = { dispose: cleanup, sync: () => {} }
      if (hasGlass && renderer.getContext().getParameter(renderer.getContext().MAX_DRAW_BUFFERS) < 8) throw new Error('Eight optical cache attachments are required')
      renderer.domElement.className = 'product-scene-canvas'
      renderer.setClearColor(0, 0)
      renderer.toneMapping = THREE.NoToneMapping
      article.appendChild(renderer.domElement)
      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1.28, 1.28, 1.28, -1.28, 0.1, 20)
      camera.position.set(...sceneSettings.camera)
      camera.lookAt(0, 0, 0)
      camera.updateMatrixWorld(true)
      const environmentRoom = new RoomEnvironment()
      environmentRoom.traverse(node => {
        if (node.isLight) node.intensity *= 0.65
        if (node.material?.color && Math.max(...node.material.color.toArray()) > 1) node.material.color.multiplyScalar(0.12)
      })
      const softbox = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4, 4), side: THREE.DoubleSide }))
      softbox.position.copy(new THREE.Vector3(...sceneSettings.light).normalize().multiplyScalar(5))
      softbox.lookAt(0, 0, 0)
      environmentRoom.add(softbox)
      const generator = new THREE.PMREMGenerator(renderer)
      const environment = generator.fromScene(environmentRoom)
      environmentRoom.dispose(); generator.dispose()
      cleanup = () => { aborted = true; environment.dispose(); renderer.dispose(); renderer.domElement.remove(); sharedScene = null }
      sharedScene.dispose = cleanup
      scene.environment = environment.texture
      scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 0.65))
      const light = new THREE.DirectionalLight(0xffffff, 1.5)
      light.position.set(...sceneSettings.light)
      scene.add(light)
      const loader = new GLTFLoader()
      const slots = hasGlass ? [glassSlot, canSlot] : [canSlot]
      const results = await Promise.allSettled(slots.map(slot => loader.loadAsync(slot.props.source)))
      if (results.some(result => result.status === 'rejected')) {
        for (const result of results) if (result.status === 'fulfilled') disposeModel(result.value.scene)
        throw results.find(result => result.status === 'rejected').reason
      }
      const models = results.map(result => result.value)
      canSlot = currentView?.can || canSlot; glassSlot = currentView?.glass || canSlot
      article = currentView?.root || article
      article.appendChild(renderer.domElement)
      if (aborted || closed || !currentView) { models.forEach(model => disposeModel(model.scene)); cleanup(); return }
      let optics, disposed = false, frame = 0, lastTime = null, interactionUntil = 0, visible = true, renderedSize = ''
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
      const finalTarget = new THREE.WebGLRenderTarget(1, 1, { samples: sceneQuality.samples, depthBuffer: true })
      const fxaaUniforms = THREE.UniformsUtils.clone(FXAAShader.uniforms)
      fxaaUniforms.tDiffuse.value = finalTarget.texture
      const fxaa = new THREE.ShaderMaterial({ uniforms: fxaaUniforms,
        vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
        fragmentShader: FXAAShader.fragmentShader, toneMapped: false, depthWrite: false, depthTest: false,
      })
      const bankDisplay = { value: false }
      const toneChunk = THREE.ShaderChunk.tonemapping_pars_fragment
      const bankTone = toneChunk.slice(toneChunk.indexOf('vec3 RRTAndODTFit'), toneChunk.indexOf('const mat3 LINEAR_REC2020_TO_LINEAR_SRGB')).replaceAll('toneMappingExposure', 'labExposure')
      const bankExposure = { value: 1 }
      const items = (hasGlass ? [glassSlot, canSlot] : [canSlot]).map((slot, index) => {
        const model = models[index].scene
        const bounds = new THREE.Box3().setFromObject(model)
        const size = bounds.getSize(new THREE.Vector3())
        const product = new THREE.Group()
        product.add(model)
        const dimensions = slot.props.bank ? modelDimensions.can : modelDimensions.glass
        const unitsPerMeter = 2 / modelDimensions.glass.height
        const height = dimensions.height * unitsPerMeter
        const radialScale = dimensions.diameter
          ? dimensions.diameter * unitsPerMeter / Math.max(size.x, size.z)
          : height / size.y
        product.scale.set(radialScale, height / size.y, radialScale)
        model.position.sub(bounds.getCenter(new THREE.Vector3()))
        // При изменении высоты основание остаётся на прежнем уровне.
        product.position.y = (height - 2) / 2
        product.rotation.y = 0.35
        product.updateMatrixWorld(true)
        const productBounds = new THREE.Box3().setFromObject(product)
        // Фиксируем границы реальной геометрии: вращение и наведение
        // не должны постоянно менять положение всей композиции.
        const compositionBounds = new THREE.Box3().setFromObject(product, true)
        return { slot, model, product, productBounds, compositionBounds, baseWidth: Math.max(size.x, size.z) * product.scale.x }
      })
      const glassItem = hasGlass ? items[0] : null, canItem = items[items.length - 1]
      const canPlacement = new THREE.Group()
      canPlacement.matrixAutoUpdate = false
      canPlacement.add(canItem.product)
      if (glassItem) scene.add(glassItem.product)
      scene.add(canPlacement)
      const profile = hasGlass ? createBankProfile(THREE, canItem.product, canItem.productBounds) : null
      bankOptics = hasGlass ? { product: canItem.product, placement: canPlacement, profile,
        height: canItem.productBounds.max.y - canItem.productBounds.min.y,
        center: canItem.productBounds.getCenter(new THREE.Vector3()),
      } : null
      const labelMaterials = new Map(), labelTextures = new Map()
      let labelUrl = null, labelVersion = 0, labelPending = false
      let preloadHandle = null
      const schedulePreload = window.requestIdleCallback
        ? callback => window.requestIdleCallback(callback)
        : callback => window.setTimeout(callback, 100)
      const cancelPreload = window.cancelIdleCallback
        ? handle => window.cancelIdleCallback(handle)
        : handle => window.clearTimeout(handle)
      canItem.model.traverse(node => {
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          if (!material) continue
          if (material.name.endsWith('-printed-label')) {
            labelMaterials.set(material, material.map)
            material.envMap = environment.texture
            material.envMapIntensity = 0.25
          }
          material.toneMapped = false
          material.onBeforeCompile = shader => {
            shader.uniforms.labDisplayPass = bankDisplay
            shader.uniforms.labExposure = bankExposure
            shader.fragmentShader = 'uniform bool labDisplayPass;uniform float labExposure;\n#define saturate(a) clamp(a,0.0,1.0)\n' + bankTone + '\n' + shader.fragmentShader
              .replace('#include <tonemapping_fragment>', 'if(labDisplayPass){vec3 c=ACESFilmicToneMapping(gl_FragColor.rgb);gl_FragColor.rgb=mix(12.92*c,1.055*pow(max(c,vec3(0)),vec3(1./2.4))-0.055,step(vec3(0.0031308),c));}')
          }
          material.customProgramCacheKey = () => 'lab-shared-bank-v1'
          material.needsUpdate = true
        }
      })
      function loadLabel(url) {
        if (labelTextures.has(url)) return labelTextures.get(url).promise
        const entry = { texture: null, promise: null }
        entry.promise = new THREE.ImageLoader().loadAsync(url).then(image => {
          if (disposed) return null
          const original = labelMaterials.values().next().value
          if (!original) throw new Error('Не найден материал печатной этикетки банки')
          const canvas = document.createElement('canvas')
          canvas.width = original.image.width; canvas.height = original.image.height
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Не удалось подготовить текстуру этикетки')
          // Та же печатная область, что у встроенного макета: 2376 из 2696 px.
          const scale = Math.min(canvas.width * 2376 / 2696 / image.width, canvas.height / image.height)
          const width = image.width * scale, height = image.height * scale
          context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
          const texture = original.clone()
          // Texture.clone разделяет Source; новый Source сохраняет встроенный макет.
          texture.source = new THREE.Source(canvas)
          texture.needsUpdate = true
          entry.texture = texture
          renderer.initTexture(texture)
          return texture
        }).catch(error => {
          // Фоновая ошибка не блокирует текущий слайд; выбор повторит загрузку.
          labelTextures.delete(url)
          throw error
        })
        labelTextures.set(url, entry)
        return entry.promise
      }
      function preloadLabels(index = 0) {
        if (disposed || index >= preloadLabelUrls.length) return
        preloadHandle = schedulePreload(() => {
          preloadHandle = null
          if (disposed) return
          void loadLabel(preloadLabelUrls[index]).catch(() => {}).finally(() => preloadLabels(index + 1))
        })
      }
      function updateLabel() {
        const url = canSlot.props.label || ''
        if (url === labelUrl) return
        labelUrl = url
        const version = ++labelVersion
        labelPending = true
        items.forEach(item => { item.slot.ready.value = false })
        const apply = texture => {
          if (disposed || version !== labelVersion) return
          for (const [material, original] of labelMaterials) {
            material.map = texture || original
            material.needsUpdate = true
          }
          labelPending = false
          sync(true)
        }
        if (!url) { apply(null); return }
        void loadLabel(url).then(apply).catch(error => {
          if (disposed || version !== labelVersion) return
          failed = true
          console.error('Сцена продукции: загрузка этикетки', error)
          items.forEach(item => item.slot.emit('error', 'Не удалось загрузить этикетку. Обновите страницу.'))
          cleanup()
        })
      }
      let glassRect, unionRect, pixelRatio = 1, compositionOffset = 0, layoutSignature = ''
      function layoutKey(articleRect, glassRect, canRect) {
        return JSON.stringify([
          articleRect.width, articleRect.height, window.devicePixelRatio,
          ...[glassRect, canRect].flatMap(rect => [
            rect.left - articleRect.left, rect.top - articleRect.top, rect.width, rect.height,
          ]),
        ].map(value => Math.round(value * 1000)))
      }
      const referenceProjection = new THREE.Matrix4()
      const sizeBuffer = new THREE.Vector2()
      function setView(capture) {
        const aspect = glassRect.width / glassRect.height
        const halfHeight = 1.28 / Math.min(aspect, 1)
        const halfWidth = halfHeight * aspect
        referenceProjection.makeOrthographic(-halfWidth, halfWidth, halfHeight, -halfHeight, camera.near, camera.far)
        if (capture) {
          camera.left = -halfWidth; camera.right = halfWidth
          camera.top = halfHeight; camera.bottom = -halfHeight
        } else {
          camera.left = ((unionRect.left - glassRect.left) / glassRect.width * 2 - 1) * halfWidth
          camera.right = ((unionRect.right - glassRect.left) / glassRect.width * 2 - 1) * halfWidth
          camera.top = (1 - (unionRect.top - glassRect.top) / glassRect.height * 2) * halfHeight
          camera.bottom = (1 - (unionRect.bottom - glassRect.top) / glassRect.height * 2) * halfHeight
        }
        camera.updateProjectionMatrix()
        camera.updateMatrixWorld(true)
      }
      function placeBank(capture) {
        const glassUV = capture ? canvasToScreen(THREE, glassSlot.host, glassSlot.proxy).invert()
          : new THREE.Matrix3().set(1 / glassRect.width, 0, -glassRect.left / glassRect.width, 0, -1 / glassRect.height, 1 + glassRect.top / glassRect.height, 0, 0, 1)
        const e = glassUV.multiply(canvasToScreen(THREE, canSlot.host, canSlot.proxy)).elements
        const screenMap = new THREE.Matrix4().set(e[0], e[3], 0, e[0] + e[3] + 2 * e[6] - 1,
          e[1], e[4], 0, e[1] + e[4] + 2 * e[7] - 1, 0, 0, 1, 0.18, 0, 0, 0, 1)
        canPlacement.matrix.copy(camera.matrixWorld).multiply(referenceProjection.clone().invert()).multiply(screenMap)
          .multiply(referenceProjection).multiply(camera.matrixWorldInverse)
        canPlacement.matrixWorldNeedsUpdate = true
      }
      function updateSlot(item) {
        const slot = item.slot, hasGlass = !slot.props.bank
        const productBounds = item.productBounds, baseWidth = item.baseWidth
        const { width, height } = slot.host.getBoundingClientRect()
        const aspect = width / height, halfHeight = 1.28 / Math.min(aspect, 1)
        const left = -halfHeight * aspect, right = halfHeight * aspect
        const viewProjection = new THREE.Matrix4().makeOrthographic(left, right, halfHeight, -halfHeight, camera.near, camera.far).multiply(camera.matrixWorldInverse)
        // Контактная тень остаётся под проекцией основания при любом размере.
        const base = new THREE.Vector3(0, productBounds.min.y, 0).applyMatrix4(viewProjection)
        const baseX = (base.x + 1) * width / 2
        const baseY = (1 - base.y) * height / 2
        slot.host.style.setProperty('--model-origin', `${baseX}px ${baseY}px`)
        const projected = []
        for (const x of [productBounds.min.x, productBounds.max.x]) for (const y of [productBounds.min.y, productBounds.max.y]) for (const z of [productBounds.min.z, productBounds.max.z]) {
          const point = new THREE.Vector3(x, y, z).applyMatrix4(viewProjection)
          projected.push({ x: (point.x + 1) * width / 2, y: (1 - point.y) * height / 2 })
        }
        const hitLeft = Math.min(...projected.map(p => p.x)), hitTop = Math.min(...projected.map(p => p.y))
        slot.hitStyle.value = { left: `${hitLeft}px`, top: `${hitTop}px`, width: `${Math.max(...projected.map(p => p.x)) - hitLeft}px`, height: `${Math.max(...projected.map(p => p.y)) - hitTop}px` }
        const projectionWidth = right - left
        const shadowWidth = baseWidth / projectionWidth * width
        const heightWorld = productBounds.max.y - productBounds.min.y
        const [lx, ly, lz] = sceneSettings.light
        const tip = new THREE.Vector3(-lx / ly * heightWorld, productBounds.min.y, -lz / ly * heightWorld).applyMatrix4(viewProjection)
        const dx = (tip.x - base.x) * width / 2
        const dy = (base.y - tip.y) * height / 2
        const length = Math.hypot(dx, dy)
        // Небольшое перекрытие с основанием связывает падающую и контактную тени.
        const castLength = length + shadowWidth * 0.8
        const castOffset = castLength / 2 - shadowWidth * 0.2
        const shadowAngle = Math.atan2(dy, dx)
        item.shadowGeometry = {
          baseX, baseY,
          castX: baseX + Math.cos(shadowAngle) * castOffset,
          castY: baseY + Math.sin(shadowAngle) * castOffset,
        }
        item.shadowPlacementKey = ''
        slot.shadowStyle.value = {
          width: `${castLength}px`, height: `${shadowWidth * 0.6}px`,
          transform: `translate(-50%, -50%) rotate(${shadowAngle}rad)`,
          background: hasGlass
            ? 'radial-gradient(ellipse closest-side, rgb(0 0 0 / 0.45), rgb(0 0 0 / 0.22) 60%, transparent)'
            : 'radial-gradient(ellipse closest-side, rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.25) 60%, transparent)',
        }
        slot.contactStyle.value = {
          width: `${shadowWidth * 1.12}px`, height: `${shadowWidth * 0.16}px`,
          background: hasGlass
            ? 'radial-gradient(ellipse closest-side, rgb(0 0 0 / 0.72), rgb(0 0 0 / 0.36) 45%, transparent)'
            : 'radial-gradient(ellipse closest-side, rgb(0 0 0 / 0.82), rgb(0 0 0 / 0.42) 45%, transparent)',
        }
        updateShadowPlacement(item, slot.host.getBoundingClientRect(), currentView.counter.getBoundingClientRect())
      }
      function updateShadowPlacement(item, modelRect, counterRect) {
        const { slot, shadowGeometry } = item
        if (!shadowGeometry) return
        const offsetX = modelRect.left - counterRect.left, offsetY = modelRect.top - counterRect.top
        const next = JSON.stringify([offsetX, offsetY, modelRect.width, modelRect.height, counterRect.width, counterRect.height])
        if (next === item.shadowPlacementKey) return
        item.shadowPlacementKey = next
        const hasGlass = !slot.props.bank
        // Геометрия тени неизменна, но отсечение стойкой зависит от движения ленты.
        slot.shadowClipStyle.value = hasGlass ? {
          left: '0', top: '0', width: '100%', height: '100%', overflow: 'visible',
          clipPath: `inset(${counterRect.top - modelRect.top}px ${modelRect.right - counterRect.right}px ${modelRect.bottom - counterRect.bottom}px ${counterRect.left - modelRect.left}px)`,
        } : { left: `${-offsetX}px`, top: `${-offsetY}px`, width: `${counterRect.width}px`, height: `${counterRect.height}px` }
        const originX = hasGlass ? 0 : offsetX, originY = hasGlass ? 0 : offsetY
        slot.shadowStyle.value = { ...slot.shadowStyle.value,
          left: `${shadowGeometry.castX + originX}px`, top: `${shadowGeometry.castY + originY}px`,
        }
        slot.contactStyle.value = { ...slot.contactStyle.value,
          left: `${shadowGeometry.baseX + originX}px`, top: `${shadowGeometry.baseY + originY}px`,
        }
      }
      function resize() {
        if (disposed) return
        const articleRect = article.getBoundingClientRect()
        const measuredGlass = glassSlot.host.getBoundingClientRect()
        const measuredCan = canSlot.host.getBoundingClientRect()
        if (!measuredGlass.width || !measuredGlass.height || !measuredCan.width || !measuredCan.height) return
        if (layoutKey(articleRect, measuredGlass, measuredCan) === layoutSignature) {
          // Общий сдвиг не меняет геометрию и буферы, но меняет отсечение теней.
          const dx = measuredGlass.left - glassRect.left, dy = measuredGlass.top - glassRect.top
          glassRect = measuredGlass
          unionRect.left += dx; unionRect.right += dx
          unionRect.top += dy; unionRect.bottom += dy
          const counterRect = currentView.counter.getBoundingClientRect()
          if (glassItem) updateShadowPlacement(glassItem, measuredGlass, counterRect)
          updateShadowPlacement(canItem, measuredCan, counterRect)
          return
        }
        let compositionLeft = Infinity, compositionRight = -Infinity
        for (const { slot, compositionBounds } of items) {
          const rect = slot.host.getBoundingClientRect()
          if (!rect.width || !rect.height) return
          const aspect = rect.width / rect.height
          const halfWidth = 1.28 / Math.min(aspect, 1) * aspect
          for (const x of [compositionBounds.min.x, compositionBounds.max.x])
            for (const y of [compositionBounds.min.y, compositionBounds.max.y])
              for (const z of [compositionBounds.min.z, compositionBounds.max.z]) {
                const point = new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse)
                const screenX = rect.left + (point.x / halfWidth + 1) * rect.width / 2
                compositionLeft = Math.min(compositionLeft, screenX)
                compositionRight = Math.max(compositionRight, screenX)
              }
        }
        const nextOffset = compositionOffset + articleRect.left + articleRect.width / 2
          - (compositionLeft + compositionRight) / 2
        if (Math.abs(nextOffset - compositionOffset) > 0.001) {
          compositionOffset = nextOffset
          article.style.setProperty('--composition-offset', `${compositionOffset}px`)
        }
        glassRect = glassSlot.host.getBoundingClientRect()
        const canRect = canSlot.host.getBoundingClientRect()
        if (!glassRect.width || !canRect.width) return
        layoutSignature = layoutKey(articleRect, glassRect, canRect)
        // Запас сохраняет края при наклоне; масштаб пикселей одинаков у моделей.
        unionRect = { left: Math.min(glassRect.left, canRect.left) - 32, top: Math.min(glassRect.top, canRect.top) - 32,
          right: Math.max(glassRect.right, canRect.right) + 32, bottom: Math.max(glassRect.bottom, canRect.bottom) + 32 }
        unionRect.width = unionRect.right - unionRect.left; unionRect.height = unionRect.bottom - unionRect.top
        pixelRatio = Math.min(window.devicePixelRatio, sceneQuality.maxPixelRatio, sceneQuality.maxModelPixels / Math.max(glassRect.width, glassRect.height, canRect.width, canRect.height))
        const next = JSON.stringify([glassRect.left, glassRect.top, glassRect.width, glassRect.height, canRect.left, canRect.top, canRect.width, canRect.height, pixelRatio])
        if (next !== renderedSize) {
          renderedSize = next
          const articleRect = article.getBoundingClientRect()
          Object.assign(renderer.domElement.style, { left: `${unionRect.left - articleRect.left}px`, top: `${unionRect.top - articleRect.top}px`, width: `${unionRect.width}px`, height: `${unionRect.height}px` })
          const bufferWidth = Math.floor(unionRect.width * pixelRatio), bufferHeight = Math.floor(unionRect.height * pixelRatio)
          if (renderer.domElement.width !== bufferWidth || renderer.domElement.height !== bufferHeight) {
            renderer.setPixelRatio(pixelRatio); renderer.setSize(unionRect.width, unionRect.height, false)
            renderer.getDrawingBufferSize(sizeBuffer)
            finalTarget.setSize(sizeBuffer.x, sizeBuffer.y)
            fxaaUniforms.resolution.value.set(1 / sizeBuffer.x, 1 / sizeBuffer.y)
          }
          setView(true)
          items.forEach(updateSlot)
          optics?.resize()
        }
      }
      function tick(time) {
        frame = 0
        if (disposed || labelPending || !visible || document.hidden) { lastTime = null; return }
        try {
          resize()
          const canMoving = !motion.matches && canSlot.props.active && !canSlot.props.paused
          const bubblesMoving = hasGlass && !motion.matches && glassSlot.props.active && !glassSlot.props.paused
          const elapsed = lastTime === null ? 0 : Math.min(time - lastTime, 100)
          if (canMoving) canItem.product.rotation.y = (canItem.product.rotation.y + elapsed * Math.PI / 10000) % (Math.PI * 2)
          if (bubblesMoving) optics.updateBubbles(elapsed / 1000)
          lastTime = time
          optics.render()
          if (canMoving || bubblesMoving || performance.now() < interactionUntil) frame = requestAnimationFrame(tick)
          else lastTime = null
        } catch (error) {
          failed = true
          console.error('Сцена продукции: общая сцена', error)
          items.forEach(item => item.slot.emit('error', 'Не удалось отрисовать сцену. Обновите страницу.'))
          cleanup()
        }
      }
      function sync(interaction) {
        if (!disposed && optics) updateLabel()
        if (document.hidden) lastTime = null
        if (interaction === true) interactionUntil = performance.now() + 900
        if (!disposed && !frame && visible && !document.hidden && optics) frame = requestAnimationFrame(tick)
      }
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) lastTime = null; sync() })
      observer.observe(renderer.domElement)
      const resizeObserver = new ResizeObserver(() => { resize(); sync(true) })
      items.forEach(item => resizeObserver.observe(item.slot.host))
      cleanup = () => {
        if (disposed) return
        disposed = true
        cancelAnimationFrame(frame)
        if (preloadHandle !== null) cancelPreload(preloadHandle)
        observer.disconnect(); resizeObserver.disconnect()
        document.removeEventListener('visibilitychange', sync)
        window.removeEventListener('scroll', onLayout)
        window.removeEventListener('resize', onLayout)
        article.removeEventListener('pointermove', onInteraction)
        article.removeEventListener('pointerleave', onInteraction)
        motion.removeEventListener('change', sync)
        renderer.domElement.removeEventListener('webglcontextlost', lost)
        optics?.dispose(); profile?.tree.texture.dispose(); finalTarget.dispose(); fxaa.dispose(); environment.dispose()
        for (const [material, original] of labelMaterials) material.map = original
        for (const entry of labelTextures.values()) entry.texture?.dispose()
        labelTextures.clear()
        items.forEach(item => disposeModel(item.model))
        renderer.dispose(); renderer.domElement.remove()
        bankOptics = null
        sharedScene = null
      }
      const onLayout = () => { resize(); sync(true) }
      const onInteraction = () => sync(true)
      const lost = event => { failed = true; event.preventDefault(); items.forEach(item => { item.slot.ready.value = false; item.slot.emit('error', 'Контекст 3D потерян. Обновите страницу.') }); cleanup() }
      renderer.domElement.addEventListener('webglcontextlost', lost)
      document.addEventListener('visibilitychange', sync)
      window.addEventListener('scroll', onLayout, { passive: true })
      window.addEventListener('resize', onLayout)
      article.addEventListener('pointermove', onInteraction)
      article.addEventListener('pointerleave', onInteraction)
      motion.addEventListener('change', sync)
      resize()
      const onFrameReady = () => items.forEach(item => { item.slot.ready.value = true })
      if (hasGlass) {
        optics = await createGlassRenderer(THREE, renderer, scene, camera, glassSlot.host, sync,
          onFrameReady, {
            canPlacement, bankDisplay, setView, placeBank,
            foamEnabled: () => glassSlot.props.foam,
            drinkPreset: () => drinkPresets[glassSlot.props.drink] || drinkPresets.cider,
            glassBufferSize: () => new THREE.Vector2(Math.max(1, Math.round(glassRect.width * pixelRatio)), Math.max(1, Math.round(glassRect.height * pixelRatio))),
            beginFinal(matrix) {
              setView(false); placeBank(false)
              canPlacement.visible = true
              bankDisplay.value = true
              matrix.copy(new THREE.Matrix3().set(1 / unionRect.width, 0, -unionRect.left / unionRect.width,
                0, -1 / unionRect.height, 1 + unionRect.top / unionRect.height, 0, 0, 1)).multiply(canvasToScreen(THREE, glassSlot.host, glassSlot.proxy))
              renderer.setRenderTarget(finalTarget)
            },
            finishFinal(mesh) {
              canPlacement.visible = false
              mesh.material = fxaa
              renderer.setRenderTarget(null)
              renderer.render(scene, camera)
            },
          })
        if (disposed || closed) { optics.dispose(); return }
        glassItem.product.visible = false
      } else {
        // Обычный рендер банки: без GLB стакана, оптических буферов и пузырьков.
        const outputScene = new THREE.Scene()
        const outputQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fxaa)
        outputQuad.frustumCulled = false
        outputScene.add(outputQuad)
        optics = {
          resize() {},
          render() {
            setView(false); placeBank(false)
            canPlacement.visible = true
            bankDisplay.value = true
            try {
              renderer.setRenderTarget(finalTarget)
              renderer.render(scene, camera)
              renderer.setRenderTarget(null)
              renderer.render(outputScene, camera)
              onFrameReady()
            } finally { renderer.setRenderTarget(null) }
          },
          dispose() { outputQuad.geometry.dispose() },
        }
      }
      optics.resize()
      sharedScene = { dispose: cleanup, sync,
        capture() {
          if (!currentView.can.ready.value || (currentView.glass && !currentView.glass.ready.value) || disposed) return
          optics.render()
          const snapshot = currentView.snapshot
          snapshot.width = renderer.domElement.width; snapshot.height = renderer.domElement.height
          snapshot.getContext('2d')?.drawImage(renderer.domElement, 0, 0)
          snapshot.style.cssText = renderer.domElement.style.cssText
          snapshot.hidden = false
        },
        retarget() {
          article.removeEventListener('pointermove', onInteraction)
          article.removeEventListener('pointerleave', onInteraction)
          resizeObserver.disconnect()
          canSlot = currentView.can; glassSlot = currentView.glass || canSlot
          article = currentView.root
          compositionOffset = 0; renderedSize = ''; layoutSignature = ''
          article.style.setProperty('--composition-offset', '0px')
          if (glassItem) glassItem.slot = glassSlot
          canItem.slot = canSlot
          article.appendChild(renderer.domElement)
          article.addEventListener('pointermove', onInteraction)
          article.addEventListener('pointerleave', onInteraction)
          items.forEach(item => resizeObserver.observe(item.slot.host))
          currentView.snapshot.hidden = true
          lastTime = null
          resize()
          const rect = renderer.domElement.getBoundingClientRect()
          visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
          sync(true)
        },
      }
      sharedScene.retarget()
      preloadLabels()
    } catch (error) {
      console.error('Сцена продукции: инициализация общей сцены', error)
      failed = true
      if (!closed && currentView) currentView.can.emit('error', 'Не удалось загрузить модели. Обновите страницу.')
      cleanup()
    } finally { sceneStarting = false }
  }


  return {
    activate(view) {
      if (closed || currentView === view) return
      try { sharedScene?.capture?.() } catch (error) {
        console.error('Сцена продукции: сохранение кадра', error)
        sharedScene?.dispose()
        failed = true
      }
      currentView = view
      if (failed) { view.can.emit('error', '3D-сцена недоступна. Обновите страницу.'); return }
      if (sharedScene?.retarget) sharedScene.retarget()
      else void startSharedScene()
    },
    refresh(view) {
      if (view === currentView) sharedScene?.sync(true)
    },
    release(view) {
      if (view === currentView) { sharedScene?.dispose(); currentView = null }
    },
    dispose() {
      closed = true
      sharedScene?.dispose()
      currentView = null
    },
  }
}
