export const canLabelPresets = Object.freeze({
  valentine: { label: 'valentine-450ml', drink: 'cider-valentine' },
  antonovka: { label: 'vetka-antonovki-450ml', drink: 'cider-antonovka' },
  berry: { label: 'marion-berry-450ml-v2', drink: 'mead-berry' },
  khmelyar: { label: 'khmelyar-330ml', drink: 'cider-khmelyar' },
  woodstock: { label: 'woodstock-330ml', drink: 'cider-woodstock' },
  'sweet-cherry': { label: 'sweet-cherry-330ml', drink: 'cider-cherry' },
  'poiret-pear': { label: 'poiret-pear-330ml', drink: 'perry-williams' },
  mango: { label: 'marion-mango-450ml-v2', drink: 'mead-mango' },
  'light-mead': { label: 'medved-light-mead-450ml', drink: 'mead-light' },
  'dark-mead': { label: 'medved-dark-mead-450ml', drink: 'mead-dark' },
  'blackcurrant-and-berry': { label: 'marion-blackcurrant-and-berry-450ml-v2', drink: 'mead-blackcurrant' },
})

// Общие значения сцены и сохранённые профили экспорта.
export const productLightSettings = Object.freeze({
  position: [-1.2, 3.8, 2], target: [0, -0.15, 0],
  width: 1.5, height: 2.5, radiance: 0, intensity: 48,
})
// Общий фронтальный свет слайдера: упаковка, оптика бокала и тени.
const sliderLightSettings = { ...productLightSettings, position: [0.6, 3, 5], target: [0.6, -0.15, 0],
  width: 2.5, height: 2.5, radiance: 1, intensity: 80 }
const opticalQuality = { bodySamples: 4, baseSamples: 8, traceSteps: 18, reflectionSteps: 6, backdropScale: 1.5, backdropPixels: 2048 }
const contactShadow = {
  type: 'contact', position: [0, 8, 0], mapSize: 1024, extent: 1.2,
  bias: -0.00008, normalBias: 0.002, radius: 18, blurSamples: 16,
  opacity: 0.2, blurSigma: 8, referenceHeight: 1118,
}
const castShadow = {
  type: 'cast', position: [...productLightSettings.position], target: [...productLightSettings.target],
  mapSize: 1024, bias: -0.0001, normalBias: 0.015, opacity: 0.25, softness: 1,
}
export const productRenderSettings = Object.freeze({
  camera: { position: [0, 0.88, 5], target: [0, 0, 0], halfHeight: 1.28, near: 0.1, far: 20 },
  quality: { maxModelPixels: 720, maxPixelRatio: 1.5, maxFramePixels: 2048, samples: 4, ...opticalQuality },
  heroQuality: { maxModelPixels: 2880, maxPixelRatio: 6, maxFramePixels: 8192, samples: 4, ...opticalQuality },
  shadows: { contact: contactShadow, cast: castShadow },
})
const baseProfile = {
  objects: 'glass', volume: '450', layers: 'combined',
  glassPrint: { enabled: false, color: '#754023', roughness: 0.4 },
  camera: productRenderSettings.camera, light: productLightSettings,
  quality: productRenderSettings.quality,
  shadow: { ...contactShadow, ...Object.fromEntries(Object.entries(castShadow).filter(([key]) => !(key in contactShadow))) },
  background: { type: 'white', source: '', refractionSource: '', reflections: 'studio', opacity: 0.15, counter: false, counterHeight: 0.3 },
  preview: { background: '#ffffff' },
  composition: { width: 1024, height: 768, modelHeight: 576, modelBottom: 96, canOffset: 0, canBottom: 96, offset: 0 },
  output: { width: 0, height: 0, subjectHeight: 0 },
}
export const productRenderProfiles = Object.freeze({
  card: { label: 'Карточки товаров', settings: baseProfile },
  slider: { label: 'Слайдер: отдельные объекты', settings: { ...baseProfile, objects: 'pair', layers: 'separate',
    // Видимая высота бокала и основание передней банки в квадрате композиции.
    presentation: { glassHeight: 0.651, baseline: 0.89 },
    glassPrint: { ...baseProfile.glassPrint, enabled: true },
    light: sliderLightSettings,
    shadow: { ...baseProfile.shadow, ...castShadow, position: sliderLightSettings.position, target: sliderLightSettings.target },
    background: { ...baseProfile.background, type: 'slider', reflections: 'slider', counter: true },
    composition: { ...baseProfile.composition, modelBottom: 80, canOffset: 128, canBottom: 12 } } },
  'slider-combined': { label: 'Слайдер: цельная композиция', settings: { ...baseProfile, objects: 'pair', layers: 'combined',
    shadow: { ...baseProfile.shadow, ...castShadow },
    background: { ...baseProfile.background, type: 'slider', reflections: 'slider', counter: true },
    composition: { ...baseProfile.composition, modelBottom: 12, canOffset: 128, canBottom: 80 } } },
  hero: { label: 'Хиро категорий', settings: { ...baseProfile,
    quality: productRenderSettings.heroQuality,
    background: { ...baseProfile.background, type: 'hero', reflections: 'hero', counter: true },
    output: { width: 2508, height: 2508, subjectHeight: 0 } } },
})

function mergeSettings(base, overrides, path = '') {
  const result = structuredClone(base)
  for (const [key, value] of Object.entries(overrides)) {
    if (!Object.hasOwn(base, key)) throw new Error(`Неизвестная настройка: ${path}${key}`)
    const previous = base[key]
    if (previous && typeof previous === 'object' && !Array.isArray(previous)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Неверная настройка: ${path}${key}`)
      result[key] = mergeSettings(previous, value, `${path}${key}.`)
    } else {
      if (typeof value !== typeof previous || (Array.isArray(previous) && (!Array.isArray(value) || value.length !== previous.length))) throw new Error(`Неверная настройка: ${path}${key}`)
      if (typeof value === 'number' && !Number.isFinite(value)) throw new Error(`Неверное число: ${path}${key}`)
      if (Array.isArray(value) && value.some(item => typeof item !== 'number' || !Number.isFinite(item))) throw new Error(`Неверный вектор: ${path}${key}`)
      result[key] = structuredClone(value)
    }
  }
  return result
}
export function resolveProductRender({ product = 'cider-antonovka', preset = 'card', settings = {} } = {}) {
  if (!Object.hasOwn(productRenderProfiles, preset)) throw new Error(`Неизвестный профиль: ${preset}`)
  const resolved = mergeSettings(productRenderProfiles[preset].settings, settings)
  for (const [value, choices, name] of [
    [resolved.objects, ['glass', 'can', 'pair', 'bottle'], 'Объекты'],
    [resolved.layers, ['combined', 'separate'], 'Слои'],
    [resolved.volume, ['330', '450', '750'], 'Объём'],
    [resolved.shadow.type, ['contact', 'cast', 'none'], 'Тень'],
    [resolved.background.type, ['white', 'slider', 'hero', 'custom'], 'Фон'],
    [resolved.background.reflections, ['studio', 'slider', 'hero', 'custom'], 'Отражения'],
  ]) if (!choices.includes(value)) throw new Error(`${name}: неизвестное значение ${value}`)
  if ((resolved.objects === 'bottle') !== (resolved.volume === '750')) throw new Error('Бутылка доступна только в объёме 0,75 л; банки — 0,33 и 0,45 л')
  for (const group of ['composition', 'quality']) for (const [key, value] of Object.entries(resolved[group])) {
    if (!['modelBottom', 'canBottom', 'canOffset', 'offset'].includes(key) && (value <= 0 || value > 8192)) throw new Error(`Недопустимое значение ${group}.${key}`)
  }
  for (const key of ['width','height']) if (resolved.output[key] < 0 || resolved.output[key] > 8192) throw new Error('Размер экспорта должен быть от 0 до 8192')
  if (Boolean(resolved.output.width) !== Boolean(resolved.output.height)) throw new Error('Укажите оба размера экспорта или оставьте оба автоматическими')
  if (resolved.output.subjectHeight < 0 || resolved.output.subjectHeight > resolved.output.height || (resolved.objects === 'pair' && resolved.output.subjectHeight)) throw new Error('Высота продукта задаётся только для одиночного объекта внутри готового кадра')
  if (resolved.camera.halfHeight <= 0 || resolved.camera.near <= 0 || resolved.camera.far <= resolved.camera.near) throw new Error('Неверные границы камеры')
  if (resolved.camera.position.every((value, index) => value === resolved.camera.target[index])) throw new Error('Положение камеры совпало с её целью')
  if (resolved.shadow.opacity < 0 || resolved.shadow.opacity > 1 || resolved.background.opacity < 0 || resolved.background.opacity > 1) throw new Error('Прозрачность должна быть от 0 до 1')
  if (resolved.shadow.softness <= 0 || resolved.shadow.blurSigma <= 0 || resolved.shadow.mapSize < 64 || resolved.shadow.mapSize > 4096 || resolved.light.width <= 0 || resolved.light.height <= 0) throw new Error('Неверные размеры света или тени')
  if (resolved.background.counterHeight <= 0 || resolved.background.counterHeight >= 1) throw new Error('Высота стойки должна быть между 0 и 1')
  if (resolved.light.intensity < 0 || resolved.light.radiance < 0 || resolved.shadow.extent <= 0 || resolved.shadow.radius < 0) throw new Error('Неверные параметры света или тени')
  for (const [key, max] of [['samples',4],['bodySamples',4],['baseSamples',8],['traceSteps',32],['reflectionSteps',12]]) {
    if (!Number.isInteger(resolved.quality[key]) || resolved.quality[key] > max) throw new Error(`Недопустимое качество: ${key}`)
  }
  for (const value of [resolved.composition.width,resolved.composition.height,resolved.output.width,resolved.output.height,resolved.shadow.mapSize,resolved.shadow.blurSamples]) if (!Number.isInteger(value)) throw new Error('Размеры кадра и карты тени должны быть целыми')
  if (resolved.shadow.blurSamples < 1 || resolved.shadow.blurSamples > 32) throw new Error('Выборки тени должны быть от 1 до 32')
  return { version: 1, product, preset, settings: resolved }
}
