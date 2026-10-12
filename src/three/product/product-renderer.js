import { productRenderSettings } from '../../data/product-render-settings.js'

// Экспорт также монтирует штатную сцену лабы, а не второй независимый рендерер.
export async function mountProductRender({ drink = 'cider-antonovka', label = '', canOnly = false, modelSource = '', shadow = 'contact', pair = false } = {}) {
  const [{ createApp, h }, { default: ProductScene }, { createProductScene, productSceneKey }, { drinkPresets }] = await Promise.all([
    import('vue'), import('../../components/product-scene/ProductScene.vue'),
    import('./product-scene.js'), import('../../data/drink-presets.js'),
  ])
  const recipe = drinkPresets[drink]
  if (!recipe) throw new Error(`Неизвестный напиток: ${drink}`)
  const section = document.createElement('section')
  section.style.cssText = `position:relative;width:1024px;height:768px;background:${pair ? '#000' : '#fff'};overflow:visible`
  const counter = document.createElement('div')
  counter.dataset.productCounter = ''
  counter.style.cssText = 'position:absolute;inset:0;pointer-events:none'
  section.append(counter)
  if (pair) {
    const background = document.createElement('img')
    background.src = new URL('../../assets/home/product-slider-background.png', import.meta.url).href
    background.dataset.productBackground = ''
    background.dataset.productPattern = 'sidr'
    background.style.cssText = 'position:absolute;inset:0 0 30%;width:100%;height:70%;object-fit:cover;opacity:.15'
    const wood = document.createElement('img')
    wood.src = new URL('../../assets/home/bar-counter-texture.png', import.meta.url).href
    wood.dataset.productCounter = ''
    wood.style.cssText = 'position:absolute;inset-inline:0;bottom:0;width:100%;height:30%;object-fit:fill'
    counter.replaceWith(wood)
    section.append(background)
    await Promise.all([background.decode(), wood.decode()])
  }
  const host = document.createElement('div')
  // Геометрия пары из лабы: квадрат 576 px, банка +128 px вправо и +68 px вверх.
  host.style.cssText = 'position:absolute;left:0;right:0;top:0;bottom:0;--product-model-height:576px;--product-model-bottom:12px;--product-can-offset:128px;--product-can-bottom:80px'
  if (!pair) host.style.cssText += ';--product-model-height:576px;--product-model-bottom:96px;--product-can-offset:0px;--product-can-bottom:96px'
  section.append(host)
  document.body.append(section)
  const owner = createProductScene({ loadGlassOptics: () => import('../glass-lab/glass-optics.js'), exportRender: true, modelSource, shadowStyle: shadow, glassOnly: !pair && !canOnly })
  const app = createApp({ render: () => h(ProductScene, { active: true, paused: true, canOnly,
    loadGlassOptics: () => import('../glass-lab/glass-optics.js'), drink, foam: recipe.foam, canLabel: label, patternSlug: 'sidr' }) })
  app.provide(productSceneKey, owner)
  try {
    app.mount(host)
    window.renderReady = false
    const started = performance.now()
    await new Promise((resolve, reject) => {
      const poll = () => {
        const root = host.querySelector('.product-scene')
        if (root?.classList.contains('has-error')) return reject(new Error(root.textContent))
        if (root && !root.classList.contains('is-loading')) return resolve()
        if (performance.now() - started > 60000) return reject(new Error('Не завершён экспорт сцены'))
        requestAnimationFrame(poll)
      }
      poll()
    })
    const layers = owner.exportLayers()
    window.exportLayers = () => layers
    window.renderInfo = { drink, foam: recipe.foam, bubbles: !canOnly, shadow, camera: productRenderSettings.camera, modelSource }
    const canvas = document.createElement('canvas')
    canvas.width = layers.width; canvas.height = layers.height
    const context = canvas.getContext('2d')
    const order = pair ? ['pair-shadow', 'pair'] : canOnly ? ['can-shadow', 'can'] : ['glass-shadow', 'glass']
    for (const key of order) context.drawImage(layers.canvases[key], 0, 0)
    const png = canvas.toDataURL('image/png')
    window.exportPng = () => png
    // Показываем сам итоговый статичный кадр с выбранной тенью, без живой сцены.
    const image = document.createElement('img')
    image.src = png
    image.alt = canOnly ? 'Рендер банки' : pair ? 'Стакан и банка' : recipe.name
    image.style.cssText = 'display:block;max-width:100%;height:auto'
    image.dataset.renderPreview = ''
    const output = document.querySelector('[data-render-output]') || document.body
    output.querySelector('[data-render-preview]')?.remove()
    output.append(image)
    window.renderReady = true
    return layers
  } finally {
    app.unmount()
    owner.dispose()
    section.remove()
  }
}
