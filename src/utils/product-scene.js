import { createProductEnvironment } from './product-environment.js'
import { createProductLight } from './product-light.js'

// Подготовка сменных этикеток не должна начинаться только по нажатию стрелки.
const preloadLabelUrls = Object.values(import.meta.glob([
  '../../materials/customer-design/labels/cans-330ml-500ml/light-mead.png',
  '../../materials/customer-design/labels/cans-330ml-500ml/antonovka.png',
  '../../materials/customer-design/labels/cans-330ml-500ml/poiret-pear.png',
], { eager: true, query: '?url', import: 'default' }))

export const productSceneKey = Symbol('product-scene')

// Один контекст WebGL на слайдер. Смена владельца DOM сохраняет модели и оптику.
export function createProductScene({ loadGlassOptics } = {}) {
  let currentView = null, closed = false, failed = false
  let bankOptics = null
  const sceneSettings = { camera: [0, 0.88, 5] }

  function canvasToScreen(THREE, element, canvas, rotationOverride) {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(canvas)
    const origin = style.transformOrigin.split(' ').map(Number.parseFloat)
    const angle = Number.parseFloat(style.rotate) || 0
    const radians = rotationOverride === undefined
      ? angle * (style.rotate.includes('rad') ? 1 : Math.PI / 180)
      : rotationOverride * Math.PI / 180
    const c = Math.cos(radians), s = Math.sin(radians)
    const x = origin[0] || 0, y = origin[1] || 0
    // UV снизу вверх → CSS-пиксели с вращением вокруг существующего основания.
    return new THREE.Matrix3().set(
      c * rect.width, s * rect.height, rect.left + x - c * x - s * (rect.height - y),
      s * rect.width, -c * rect.height, rect.top + y - s * x + c * (rect.height - y),
      0, 0, 1,
    )
  }

  // Один владелец WebGL, камеры, света, качества и цикла для обеих моделей.
  let sharedScene = null
  let sceneStarting = false
  const sceneQuality = Object.freeze({ maxModelPixels: 720, maxPixelRatio: 1.5, samples: 4 })
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
      if (hasGlass && !loadGlassOptics) throw new Error('Для стакана требуется загрузчик оптики лаборатории')
      const glassOptics = hasGlass
        ? (await loadGlassOptics()).createGlassOptics({
          getView: () => currentView,
          getBankOptics: () => bankOptics,
          canvasToScreen,
        })
        : null
      if (closed || !currentView) return
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
      let onEnvironmentReady = () => {}, lightSource = null
      const environment = createProductEnvironment({
        THREE, RoomEnvironment, renderer, view: currentView,
        onChange(texture) {
          scene.environment = texture
          scene.traverse(node => {
            for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
              if (material?.envMap) material.envMap = texture
            }
          })
          onEnvironmentReady()
        },
      })
      cleanup = () => { aborted = true; lightSource?.dispose(); environment.dispose(); renderer.dispose(); renderer.domElement.remove(); sharedScene = null }
      sharedScene.dispose = cleanup
      scene.environment = environment.texture
      scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 0.65))
      const loader = new GLTFLoader()
      const slots = hasGlass ? [glassSlot, canSlot] : [canSlot]
      const results = await Promise.allSettled(slots.map(slot => loader.loadAsync(slot.props.bank ? slot.props.source : glassOptics.glassModelUrl)))
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
        return { slot, model, product, productBounds, compositionBounds }
      })
      const glassItem = hasGlass ? items[0] : null, canItem = items[items.length - 1]
      const canPlacement = new THREE.Group()
      canPlacement.matrixAutoUpdate = false
      canPlacement.add(canItem.product)
      if (glassItem) scene.add(glassItem.product)
      scene.add(canPlacement)
      const groundY = glassItem?.productBounds.min.y ?? canItem.productBounds.min.y
      lightSource = createProductLight(THREE, renderer, scene, groundY)
      canItem.model.traverse(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true } })
      // Стакан рисуется трассировщиком; отдельная копия геометрии отбрасывает упрощённую тень.
      const glassShadowPlacement = glassItem ? new THREE.Group() : null
      const glassShadowMaterial = glassItem ? new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }) : null
      if (glassItem) {
        const caster = glassItem.product.clone(true)
        caster.traverse(node => { if (node.isMesh) { node.material = glassShadowMaterial; node.castShadow = true; node.receiveShadow = false } })
        glassShadowPlacement.matrixAutoUpdate = false
        glassShadowPlacement.add(caster)
        scene.add(glassShadowPlacement)
      }
      const profile = hasGlass ? glassOptics.createBankProfile(THREE, canItem.product, canItem.productBounds) : null
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
            lightSource.patchShadow(shader)
            shader.uniforms.labDisplayPass = bankDisplay
            shader.uniforms.labExposure = bankExposure
            shader.fragmentShader = 'uniform bool labDisplayPass;uniform float labExposure;\n#define saturate(a) clamp(a,0.0,1.0)\n' + bankTone + '\n' + shader.fragmentShader
              .replace('#include <tonemapping_fragment>', 'if(labDisplayPass){vec3 c=ACESFilmicToneMapping(gl_FragColor.rgb);gl_FragColor.rgb=mix(12.92*c,1.055*pow(max(c,vec3(0)),vec3(1./2.4))-0.055,step(vec3(0.0031308),c));}')
          }
          material.customProgramCacheKey = () => 'lab-shared-bank-pcss-v1'
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
        lightSource.setCounterClip(currentView.counter.getBoundingClientRect(), capture ? glassRect : unionRect)
      }
      function placementMatrix(slot, capture, depth, rotationOverride) {
        const glassUV = capture ? canvasToScreen(THREE, glassSlot.host, glassSlot.proxy, rotationOverride === undefined ? undefined : 0).invert()
          : new THREE.Matrix3().set(1 / glassRect.width, 0, -glassRect.left / glassRect.width, 0, -1 / glassRect.height, 1 + glassRect.top / glassRect.height, 0, 0, 1)
        const e = glassUV.multiply(canvasToScreen(THREE, slot.host, slot.proxy, rotationOverride)).elements
        const screenMap = new THREE.Matrix4().set(e[0], e[3], 0, e[0] + e[3] + 2 * e[6] - 1,
          e[1], e[4], 0, e[1] + e[4] + 2 * e[7] - 1, 0, 0, 1, depth, 0, 0, 0, 1)
        return camera.matrixWorld.clone().multiply(referenceProjection.clone().invert()).multiply(screenMap)
          .multiply(referenceProjection).multiply(camera.matrixWorldInverse)
      }
      function restOnCounter(matrix, bounds) {
        // Сдвиг вдоль луча ортокамеры сохраняет экранное положение основания.
        const base = new THREE.Vector3(0, bounds.min.y, 0).applyMatrix4(matrix)
        const direction = camera.getWorldDirection(new THREE.Vector3())
        if (Math.abs(direction.y) > 0.00001) {
          const offset = direction.multiplyScalar((groundY - base.y) / direction.y)
          matrix.premultiply(new THREE.Matrix4().makeTranslation(offset.x, offset.y, offset.z))
        }
        return matrix
      }
      function placeBank(capture) {
        canPlacement.matrix.copy(restOnCounter(placementMatrix(canSlot, capture, 0.18), canItem.productBounds))
        canPlacement.matrixWorldNeedsUpdate = true
        if (glassShadowPlacement) {
          glassShadowPlacement.matrix.copy(restOnCounter(placementMatrix(glassSlot, capture, 0), glassItem.productBounds))
          glassShadowPlacement.matrixWorldNeedsUpdate = true
        }
        lightSource.invalidate()
      }
      function updateSlot(item) {
        const slot = item.slot
        const productBounds = item.productBounds
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
      }
      function renderBounds() {
        setView(true)
        const bounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
        const include = point => {
          const projected = point.clone().project(camera)
          const x = glassRect.left + (projected.x + 1) * glassRect.width / 2
          const y = glassRect.top + (1 - projected.y) * glassRect.height / 2
          bounds.left = Math.min(bounds.left, x); bounds.right = Math.max(bounds.right, x)
          bounds.top = Math.min(bounds.top, y); bounds.bottom = Math.max(bounds.bottom, y)
        }
        const light = lightSource.spotlight.getWorldPosition(new THREE.Vector3())
        for (const item of items) {
          const rect = item.slot.host.getBoundingClientRect()
          bounds.left = Math.min(bounds.left, rect.left); bounds.right = Math.max(bounds.right, rect.right)
          bounds.top = Math.min(bounds.top, rect.top); bounds.bottom = Math.max(bounds.bottom, rect.bottom)
          const box = item.productBounds
          // Запас на полный оборот модели вокруг вертикальной оси.
          const radius = Math.hypot(Math.max(Math.abs(box.min.x), Math.abs(box.max.x)),
            Math.max(Math.abs(box.min.z), Math.abs(box.max.z)))
          // Размер буфера охватывает всю анимацию, а не её текущий кадр.
          for (const tilt of [-4, 0, 4]) {
            const matrix = restOnCounter(placementMatrix(item.slot, true, item.slot.props.bank ? 0.18 : 0, tilt), box)
            for (const x of [-radius, radius]) for (const y of [box.min.y, box.max.y]) for (const z of [-radius, radius]) {
              const point = new THREE.Vector3(x, y, z).applyMatrix4(matrix)
              include(point)
              const denominator = point.y - light.y
              if (Math.abs(denominator) < 0.00001) continue
              const distance = (groundY - light.y) / denominator
              if (distance > 0) include(point.clone().sub(light).multiplyScalar(distance).add(light))
            }
          }
        }
        // Поле для фильтрации тени и сглаживания краёв; границы следуют за моделью.
        bounds.left -= 32; bounds.top -= 32; bounds.right += 32; bounds.bottom += 32
        bounds.width = bounds.right - bounds.left; bounds.height = bounds.bottom - bounds.top
        return bounds
      }
      function resize() {
        if (disposed) return
        const articleRect = article.getBoundingClientRect()
        const measuredGlass = glassSlot.host.getBoundingClientRect()
        const measuredCan = canSlot.host.getBoundingClientRect()
        if (!measuredGlass.width || !measuredGlass.height || !measuredCan.width || !measuredCan.height) return
        if (layoutKey(articleRect, measuredGlass, measuredCan) === layoutSignature) {
          // Общий сдвиг не меняет геометрию и размеры буферов.
          const dx = measuredGlass.left - glassRect.left, dy = measuredGlass.top - glassRect.top
          glassRect = measuredGlass
          unionRect.left += dx; unionRect.right += dx
          unionRect.top += dy; unionRect.bottom += dy
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
        // Стойка задаёт только отсечение, а размеры холста — модель и проекция её тени.
        unionRect = renderBounds()
        pixelRatio = Math.min(window.devicePixelRatio, sceneQuality.maxPixelRatio, sceneQuality.maxModelPixels / Math.max(glassRect.width, glassRect.height, canRect.width, canRect.height), 2048 / Math.max(unionRect.width, unionRect.height))
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
      onEnvironmentReady = () => { optics?.invalidate?.(); sync(true) }
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
        optics?.dispose(); profile?.tree.texture.dispose(); finalTarget.dispose(); fxaa.dispose(); lightSource.dispose(); environment.dispose()
        if (glassShadowPlacement) scene.remove(glassShadowPlacement)
        glassShadowMaterial?.dispose()
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
        optics = await glassOptics.createGlassRenderer(THREE, renderer, scene, camera, glassSlot.host, sync,
          onFrameReady, {
            canPlacement, bankDisplay, setView, placeBank, lightSource,
            foamEnabled: () => glassSlot.props.foam,
            drinkPreset: () => glassOptics.drinkPreset(glassSlot.props.drink),
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
              lightSource.receiver.visible = false
              try { renderer.render(scene, camera) } finally { lightSource.receiver.visible = true }
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
          resize()
          optics.render()
          const snapshot = currentView.snapshot
          snapshot.width = renderer.domElement.width; snapshot.height = renderer.domElement.height
          snapshot.getContext('2d')?.drawImage(renderer.domElement, 0, 0)
          snapshot.style.cssText = renderer.domElement.style.cssText
          snapshot.hidden = false
        },
        retarget() {
          environment.setView(currentView)
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
