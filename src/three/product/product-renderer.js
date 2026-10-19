import { canLabelPresets, resolveProductRender } from '../../data/product-render-settings.js'
import { catalogCategoryDefinitions } from '../../data/catalog-categories.js'
import { bottlePrototype } from './product-models.js'

const sliderBackground = new URL('../../assets/home/product-slider-background.png', import.meta.url).href
const counterTexture = new URL('../../assets/home/bar-counter-texture.png', import.meta.url).href
function backgroundSource(type, custom, product) {
  if (type === 'white' || type === 'studio') return ''
  if (type === 'slider') return sliderBackground
  if (type === 'custom') {
    if (!custom) throw new Error('Укажите изображение своего фона')
    return custom
  }
  const slug = product.startsWith('mead-') ? 'medovuha' : product.startsWith('cider-') ? 'sidr' : 'puare'
  return catalogCategoryDefinitions.find(category => category.slug === slug).heroBackground
}
function coverImage(context, image, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  context.drawImage(image, (width - image.naturalWidth * scale) / 2, (height - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale)
}

// Единственный вход экспорта: тот же профиль для формы, URL и пакетного рендера.
export async function mountProductRender(options = {}) {
  const configuration = resolveProductRender(options)
  const { product, preset, settings } = configuration
  const { objects, composition, background, quality, shadow, glassPrint } = settings
  const separateLayers = objects === 'pair' && settings.layers === 'separate'
  const pair = objects === 'pair', canOnly = objects === 'can', bottle = objects === 'bottle'
  const [{ createApp, h }, { default: ProductScene }, { createProductScene, productSceneKey }, { drinkPresets }] = await Promise.all([
    import('vue'), import('../../components/product-scene/ProductScene.vue'),
    import('./product-scene.js'), import('../../data/drink-presets.js'),
  ])
  const recipe = drinkPresets[product]
  if (!recipe) throw new Error(`Неизвестный напиток: ${product}`)
  const labelPreset = Object.values(canLabelPresets).find(item => item.drink === product)
  if (objects !== 'glass' && !bottle && !labelPreset) throw new Error('Для этого сорта нет этикетки банки')
  const modelSource = new URL(`../../assets/models/can-${bottle ? '450' : settings.volume}ml.glb`, import.meta.url).href
  const label = labelPreset ? new URL(`../../../materials/customer-design/labels/cans-330ml-500ml/${labelPreset.label}.png`, import.meta.url).href : ''
  // Пробная этикетка именно с изображения бутылки 0,75 л, не с другой упаковки.
  const bottleLabelPhoto = bottle && product === 'perry-williams'
    ? new URL('../../assets/products/standalone/perry/bottles/mister-williams-750ml.png', import.meta.url).href : ''
  let bottleLabelSource = ''
  if (bottleLabelPhoto) {
    const photo = new Image()
    photo.src = bottleLabelPhoto
    await photo.decode()
    const crop = document.createElement('canvas')
    crop.width = Math.round(photo.naturalWidth * 0.92)
    crop.height = Math.round(photo.naturalHeight * 0.326)
    crop.getContext('2d').drawImage(photo, photo.naturalWidth * 0.04, photo.naturalHeight * 0.616,
      photo.naturalWidth * 0.92, photo.naturalHeight * 0.326, 0, 0, crop.width, crop.height)
    bottleLabelSource = crop.toDataURL('image/png')
  }
  const refractionSource = backgroundSource(background.type, background.source, product)
  const reflectionSource = backgroundSource(background.reflections, background.source, product)
  const section = document.createElement('section')
  section.style.cssText = `position:relative;width:${composition.width}px;height:${composition.height}px;background:#fff;overflow:visible`
  const counter = document.createElement(background.counter ? 'img' : 'div')
  counter.dataset.productCounter = ''
  counter.style.cssText = background.counter
    ? `position:absolute;inset-inline:0;bottom:0;width:100%;height:${background.counterHeight * 100}%;object-fit:fill`
    : 'position:absolute;inset:0;pointer-events:none'
  if (background.counter) counter.src = counterTexture
  section.append(counter)
  const resources = background.counter ? [counter.decode()] : []
  if (reflectionSource) {
    const image = document.createElement('img')
    image.src = reflectionSource
    image.dataset.productBackground = ''
    image.dataset.productPattern = 'render'
    image.style.cssText = `position:absolute;inset:0 0 auto;width:100%;height:${(1 - (background.counter ? background.counterHeight : 0)) * 100}%;object-fit:cover;opacity:${background.opacity}`
    section.append(image)
    resources.push(image.decode())
  }
  if (background.type !== 'slider' || background.reflections !== 'slider') {
    // Преломление всегда получает выбранный фон целиком. Светлое окружение
    // отражений задаётся отдельно; оно не меняет выбор фона за стеклом.
    const refraction = document.createElement('img')
    const canvas = document.createElement('canvas')
    const backdropScale = Math.min(quality.backdropScale, quality.backdropPixels / Math.max(composition.width, composition.height))
    canvas.width = Math.round(composition.width * backdropScale)
    canvas.height = Math.round(composition.height * backdropScale)
    const context = canvas.getContext('2d')
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height)
    if (refractionSource || background.refractionSource) {
      const image = new Image()
      image.src = background.refractionSource || refractionSource
      await image.decode()
      coverImage(context, image, canvas.width, canvas.height)
    }
    refraction.src = canvas.toDataURL('image/png')
    refraction.dataset.productRefractionBackground = ''
    refraction.style.cssText = 'display:none'
    section.append(refraction)
    resources.push(refraction.decode())
  }
  await Promise.all(resources)
  const host = document.createElement('div')
  host.style.cssText = `position:absolute;inset:0;--composition-offset:${composition.offset}px;--product-model-height:${composition.modelHeight}px;--product-model-bottom:${composition.modelBottom}px;--product-can-offset:${composition.canOffset}px;--product-can-bottom:${composition.canBottom}px`
  section.append(host)
  document.body.append(section)
  const owner = createProductScene({ loadGlassOptics: () => import('../glass-lab/glass-optics.js'), exportRender: true, separateLayers, modelSource,
    glassPrint: glassPrint.enabled ? glassPrint : null,
    shadowStyle: shadow.type, shadowSettings: shadow, glassOnly: objects === 'glass' || bottle, vessel: bottle ? 'bottle' : 'glass', bottleLabelSource, quality,
    cameraSettings: settings.camera, lightSettings: settings.light })
  const app = createApp({ render: () => h(ProductScene, { active: true, paused: true, canOnly,
    loadGlassOptics: () => import('../glass-lab/glass-optics.js'), drink: product, foam: bottle ? false : recipe.foam, canLabel: label, patternSlug: 'render' }) })
  app.provide(productSceneKey, owner)
  window.renderReady = false
  try {
    app.mount(host)
    const started = performance.now()
    await new Promise((resolve, reject) => {
      const poll = () => {
        const root = host.querySelector('.product-scene')
        if (root?.classList.contains('has-error')) return reject(new Error(root.textContent))
        if (root && !root.classList.contains('is-loading')) return resolve()
        if (performance.now() - started > 180000) return reject(new Error('Не завершён экспорт сцены'))
        requestAnimationFrame(poll)
      }
      poll()
    })
    const raw = owner.exportLayers()
    // Центрируем одиночный продукт по его силуэту, не по полям буфера
    // или вытянутой тени. Камера и масштаб сцены остаются прежними.
    const name = pair ? 'pair' : canOnly ? 'can' : 'glass'
    let offsetX = 0, offsetY = 0, subjectHeight = 0
    if (!pair) {
      const pixels = raw.canvases[name].getContext('2d').getImageData(0, 0, raw.width, raw.height).data
      let left = raw.width, right = -1, top = raw.height, bottom = -1
      for (let y = 0; y < raw.height; y++) for (let x = 0; x < raw.width; x++) {
        if (pixels[(y * raw.width + x) * 4 + 3] < 128) continue
        left = Math.min(left, x); right = Math.max(right, x)
        top = Math.min(top, y); bottom = Math.max(bottom, y)
      }
      if (right >= left) {
        subjectHeight = bottom - top + 1
        offsetX = Math.round((raw.width - left - right - 1) / 2)
        offsetY = Math.round((raw.height - top - bottom - 1) / 2)
      }
    }
    const frame = settings.output
    const scale = frame.subjectHeight && subjectHeight ? frame.subjectHeight / subjectHeight : frame.width ? Math.min(frame.width / raw.width, frame.height / raw.height) : 1
    const width = frame.width || raw.width, height = frame.height || raw.height
    const canvases = Object.fromEntries(Object.entries(raw.canvases).map(([key, original]) => {
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(original, (width - raw.width * scale) / 2 + offsetX * scale, (height - raw.height * scale) / 2 + offsetY * scale, raw.width * scale, raw.height * scale)
      return [key, canvas]
    }))
    const frameX = (width - raw.width * scale) / 2 + offsetX * scale
    const frameY = (height - raw.height * scale) / 2 + offsetY * scale
    const center = (frameX + raw.center / 100 * raw.width * scale) / width * 100
    const origins = Object.fromEntries(Object.entries(raw.origins).map(([key, value]) => {
      const [x, y] = value.split(' ').map(Number.parseFloat)
      return [key, `${(frameX + x / 100 * raw.width * scale) / width * 100}% ${(frameY + y / 100 * raw.height * scale) / height * 100}%`]
    }))
    const layers = { ...raw, width, height, center, origins, canvases }
    const metadata = { ...configuration, ...(bottle ? { model: bottlePrototype } : {}), recipe: { foam: bottle ? false : recipe.foam, absorption: recipe.absorption, scattering: recipe.scattering, scatteringColor: recipe.scatteringColor },
      sources: { model: bottle ? 'procedural:antonovka-750ml' : modelSource, label: bottle ? bottleLabelPhoto : label,
        ...(bottleLabelPhoto ? { labelCrop: { x: 0.04, y: 0.616, width: 0.92, height: 0.326, method: 'Front photograph crop; low resolution and perspective retained' } } : {}),
        refraction: background.refractionSource || refractionSource, reflections: reflectionSource, counter: background.counter ? counterTexture : '' },
      frame: { width, height, sourceWidth: raw.width, sourceHeight: raw.height, scale, heightScale: raw.heightScale, topOffset: raw.topOffset, center, origins, centering: { x: offsetX, y: offsetY } } }
    window.exportLayers = () => layers
    window.renderInfo = metadata
    window.exportSettings = () => JSON.stringify(metadata, null, 2)
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
    const context = canvas.getContext('2d')
    const order = separateLayers ? ['glass-shadow', 'can-shadow', 'glass', 'can'] : [`${name}-shadow`, name]
    for (const key of order) context.drawImage(canvases[key], 0, 0)
    const png = canvas.toDataURL('image/png')
    window.exportPng = () => png
    const image = new Image(); image.src = png; image.alt = recipe.name
    image.style.cssText = 'display:block;max-width:100%;height:auto'; image.dataset.renderPreview = ''
    const output = document.querySelector('[data-render-output]') || document.body
    output.querySelector('[data-render-preview]')?.remove()
    output.style.background = settings.preview.background || ''
    output.append(image)
    window.renderReady = true
    return { ...layers, metadata }
  } finally {
    app.unmount(); owner.dispose(); section.remove()
  }
}
