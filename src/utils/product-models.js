// Метры: высота стакана — по Nonic 570 мл, форма остаётся нашей;
// банка — стандартные размеры 0,5 л. Стакан задаёт общий масштаб сцены.
const modelDimensions = Object.freeze({ glass: { height: 0.1495 }, can: { height: 0.168, diameter: 0.066 } })

export function disposeProductModel(model) {
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

export async function loadProductModels(loader, slots, glassModelUrl) {
  const results = await Promise.allSettled(slots.map(slot => loader.loadAsync(slot.props.bank ? slot.props.source : glassModelUrl)))
  const rejected = results.find(result => result.status === 'rejected')
  if (rejected) {
    for (const result of results) if (result.status === 'fulfilled') disposeProductModel(result.value.scene)
    throw rejected.reason
  }
  return results.map(result => result.value)
}

export function prepareProductModels(THREE, models, slots) {
  return slots.map((slot, index) => {
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
}
