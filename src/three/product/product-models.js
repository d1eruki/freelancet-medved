// Метры: высота стакана — по Nonic 570 мл, форма остаётся нашей;
// банка — стандартные размеры 0,5 л. Стакан задаёт общий масштаб сцены.
const modelDimensions = Object.freeze({ glass: { height: 0.1495 }, can: { height: 0.168, diameter: 0.066 }, bottle: { height: 0.3 } })

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

export async function loadProductModels(loader, slots, glassModelUrl, vessel = 'glass') {
  const results = await Promise.allSettled(slots.map(slot => !slot.props.bank && vessel === 'bottle'
    ? import('three').then(THREE => ({ scene: createBottleModel(THREE).group, userData: {} }))
    : loader.loadAsync(slot.props.bank ? slot.props.source : glassModelUrl)))
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
    const dimensions = slot.props.bank ? modelDimensions.can : model.userData.bottlePrototype ? modelDimensions.bottle : modelDimensions.glass
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

// Форма по изображению Антоновки 0,75 л в каталоге.
// Высота 300 мм — масштаб прототипа, а не подтверждённый размер изделия.
// Профиль задаёт внешнюю стенку, венчик, внутреннюю стенку и дно.
// Материалы маркируют среды для общего трассировщика стекла.
export const bottlePrototype = Object.freeze({
  reference: 'src/assets/products/cider/antonovka-750ml.png',
  nominalVolumeMl: 750,
  dimensionsVerified: false,
  heightMeters: 0.3,
  diameterMeters: 0.087,
  wallMeters: 0.0028,
  bottomMeters: 0.007,
  unitsPerMeter: 2 / 0.1495,
  radialSegments: 128,
  glass: { absorption: [18, 2.5, 23], ior: 1.52 },
  liquid: { preset: 'cider-antonovka', ior: 1.333 },
})

export function createBottleModel(THREE, { filled = true } = {}) {
  const settings = bottlePrototype
  const scale = 1
  const group = new THREE.Group()
  group.name = 'antonovka-750ml-prototype'
  const outer = [
    [0, 0.003], [0.022, 0.001], [0.035, 0.001], [0.04, 0.003],
    [0.0425, 0.008], [0.0435, 0.016], [0.0435, 0.033],
    [0.043, 0.115], [0.0425, 0.155], [0.0415, 0.171],
    [0.0395, 0.182], [0.036, 0.196], [0.032, 0.209],
    [0.0275, 0.221], [0.023, 0.232], [0.019, 0.244],
    [0.0175, 0.255], [0.0175, 0.278], [0.0195, 0.279],
    [0.020, 0.282], [0.019, 0.285], [0.0175, 0.286],
    [0.0175, 0.294], [0.0185, 0.295], [0.0185, 0.297],
  ]
  const inner = [
    [0.0147, 0.297], [0.0147, 0.255], [0.0162, 0.244],
    [0.0202, 0.232], [0.0247, 0.221], [0.0292, 0.209],
    [0.0332, 0.196], [0.0367, 0.182], [0.0387, 0.171],
    [0.0397, 0.155], [0.0402, 0.115], [0.0407, 0.033],
    [0.0407, 0.018], [0.039, 0.012], [0.035, 0.008],
    [0.024, 0.008], [0, 0.012],
  ]
  function lathe(name, profile, material, segments = settings.radialSegments) {
    const geometry = new THREE.LatheGeometry(profile.map(([radius, y]) => new THREE.Vector2(radius * scale, y * scale)), segments)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = name
    group.add(mesh)
    return mesh
  }
  const glassMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  glassMaterial.name = 'clear-glass'
  const shell = lathe('green-glass-shell', [...outer, ...inner], glassMaterial)
  // Видимое стекло рисует трассировщик; тень создаёт общая копия геометрии сцены.
  shell.castShadow = false
  shell.userData.glassAbsorption = settings.glass.absorption
  const liquidMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  liquidMaterial.name = 'golden-mead'
  const liquidProfile = [
    [0, 0.014], [0.023, 0.01], [0.034, 0.01], [0.037, 0.013],
    [0.0397, 0.02], [0.0397, 0.033], [0.0392, 0.115],
    [0.0387, 0.155], [0.0377, 0.171], [0.0357, 0.182],
    [0.0322, 0.196], [0.0282, 0.209], [0.0237, 0.221],
    [0.0192, 0.232], [0.0152, 0.244], [0.0137, 0.254],
    [0.0137, 0.263], [0.013, 0.2635], [0, 0.2635],
  ]
  const liquid = lathe('cider-liquid', liquidProfile, liquidMaterial)
  liquid.visible = filled
  const capMaterial = new THREE.MeshStandardMaterial({ color: '#dfad35', metalness: 0.88,
    roughness: 0.27, envMapIntensity: 1 })
  const cap = lathe('gold-crown-cap', [
    [0, 0.300], [0.014, 0.300], [0.018, 0.2998],
    [0.0198, 0.2985], [0.0205, 0.294], [0.0205, 0.2905],
    [0.0187, 0.2905], [0.0177, 0.296], [0, 0.296], [0, 0.300],
  ], capMaterial, 168)
  const positions = cap.geometry.attributes.position
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index), y = positions.getY(index), z = positions.getZ(index)
    const radius = Math.hypot(x, z)
    const skirt = THREE.MathUtils.clamp((0.299 * scale - y) / (0.006 * scale), 0, 1)
    if (radius > 0.018 * scale) {
      const multiplier = 1 + 0.045 * skirt * Math.cos(21 * Math.atan2(x, z))
      positions.setXYZ(index, x * multiplier, y, z * multiplier)
    }
  }
  cap.geometry.computeVertexNormals()
  cap.castShadow = true
  cap.userData.opticalAccessory = true
  group.userData.bottlePrototype = settings
  const resources = [shell, liquid, cap]
  return {
    group,
    setFilled(value) { liquid.visible = Boolean(value) },
    dispose() { resources.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose() }) },
  }
}
