export function createProductLabels({ THREE, renderer, labelMaterials, preloadLabelUrls, onPending, onReady, onError }) {
  let disposed = false, labelUrl = null, labelVersion = 0, labelPending = false
  const labelTextures = new Map()
  let preloadHandle = null
  const schedulePreload = window.requestIdleCallback
    ? callback => window.requestIdleCallback(callback)
    : callback => window.setTimeout(callback, 100)
  const cancelPreload = window.cancelIdleCallback
    ? handle => window.cancelIdleCallback(handle)
    : handle => window.clearTimeout(handle)
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
  function update(url = '') {
    if (url === labelUrl) return
    labelUrl = url
    const version = ++labelVersion
    labelPending = true
    onPending()
    const apply = texture => {
      if (disposed || version !== labelVersion) return
      for (const [material, original] of labelMaterials) {
        material.map = texture || original
        material.needsUpdate = true
      }
      labelPending = false
      onReady()
    }
    if (!url) { apply(null); return }
    void loadLabel(url).then(apply).catch(error => {
      if (disposed || version !== labelVersion) return
      onError(error)
    })
  }

  return {
    get pending() { return labelPending },
    update,
    preload: preloadLabels,
    dispose() {
      if (disposed) return
      disposed = true
      if (preloadHandle !== null) cancelPreload(preloadHandle)
      for (const [material, original] of labelMaterials) material.map = original
      for (const entry of labelTextures.values()) entry.texture?.dispose()
      labelTextures.clear()
    },
  }
}
