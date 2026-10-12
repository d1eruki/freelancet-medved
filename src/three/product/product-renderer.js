import { canLabelPresets, resolveProductRender } from '../../data/product-render-settings.js'
import { catalogCategoryDefinitions } from '../../data/catalog-categories.js'

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
  const { objects, composition, background, quality, shadow } = settings
  const pair = objects === 'pair', canOnly = objects === 'can'
  const [{ createApp, h }, { default: ProductScene }, { createProductScene, productSceneKey }, { drinkPresets }] = await Promise.all([
    import('vue'), import('../../components/product-scene/ProductScene.vue'),
    import('./product-scene.js'), import('../../data/drink-presets.js'),
  ])
  const recipe = drinkPresets[product]
  if (!recipe) throw new Error(`Неизвестный напиток: ${product}`)
  const labelPreset = Object.values(canLabelPresets).find(item => item.drink === product)
  if (objects !== 'glass' && !labelPreset) throw new Error('Для этого сорта нет этикетки банки')
  const modelSource = new URL(`../../assets/models/can-${settings.volume}ml.glb`, import.meta.url).href
  const label = labelPreset ? new URL(`../../../materials/customer-design/labels/cans-330ml-500ml/${labelPreset.label}.png`, import.meta.url).href : ''
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
  const owner = createProductScene({ loadGlassOptics: () => import('../glass-lab/glass-optics.js'), exportRender: true, modelSource,
    shadowStyle: shadow.type, shadowSettings: shadow, glassOnly: objects === 'glass', quality,
    cameraSettings: settings.camera, lightSettings: settings.light })
  const app = createApp({ render: () => h(ProductScene, { active: true, paused: true, canOnly,
    loadGlassOptics: () => import('../glass-lab/glass-optics.js'), drink: product, foam: recipe.foam, canLabel: label, patternSlug: 'render' }) })
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
    const frame = settings.output
    const scale = frame.width ? Math.min(frame.width / raw.width, frame.height / raw.height) : 1
    const width = frame.width || raw.width, height = frame.height || raw.height
    const canvases = Object.fromEntries(Object.entries(raw.canvases).map(([key, original]) => {
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(original, (width - raw.width * scale) / 2, (height - raw.height * scale) / 2, raw.width * scale, raw.height * scale)
      return [key, canvas]
    }))
    const layers = { ...raw, width, height, canvases }
    const metadata = { ...configuration, recipe: { foam: recipe.foam, absorption: recipe.absorption, scattering: recipe.scattering, scatteringColor: recipe.scatteringColor },
      sources: { model: modelSource, label, refraction: background.refractionSource || refractionSource, reflections: reflectionSource, counter: background.counter ? counterTexture : '' },
      frame: { width, height, sourceWidth: raw.width, sourceHeight: raw.height, scale, heightScale: raw.heightScale, topOffset: raw.topOffset, center: raw.center, origins: raw.origins } }
    window.exportLayers = () => layers
    window.renderInfo = metadata
    window.exportSettings = () => JSON.stringify(metadata, null, 2)
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
    const context = canvas.getContext('2d')
    const name = pair ? 'pair' : canOnly ? 'can' : 'glass'
    for (const key of [`${name}-shadow`, name]) context.drawImage(canvases[key], 0, 0)
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
