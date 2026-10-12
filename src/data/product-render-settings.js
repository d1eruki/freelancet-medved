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

// Камера и качество лабы. Свет, материалы, масштаб и отражения остаются
// у владельцев в src/three/product; все страницы экспорта используют эту сцену.
export const productRenderSettings = Object.freeze({
  camera: Object.freeze({ position: [0, 0.88, 5], target: [0, 0, 0], halfHeight: 1.28, near: 0.1, far: 20 }),
  quality: Object.freeze({ maxModelPixels: 720, maxPixelRatio: 1.5, samples: 4 }),
  shadows: Object.freeze({ contact: [0, 8, 0] }),
})
