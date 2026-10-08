import { createLightPanel } from './product-light.js'

// Один владелец карты отражений, её источников и GPU-ресурсов.
export function createProductEnvironment({ THREE, RoomEnvironment, renderer, view, onChange }) {
  const generator = new THREE.PMREMGenerator(renderer)
  let target = null, disposed = false, revision = 0, frame = 0, signature = ''
  let background = null, counter = null
  const observer = new MutationObserver(schedule)
  const resizeObserver = new ResizeObserver(schedule)

  function imageSignature(image) {
    if (!image) return null
    const rect = image.getBoundingClientRect()
    const style = getComputedStyle(image)
    return [image.currentSrc || image.src, rect.width, rect.height, style.filter, style.opacity]
  }

  function key() {
    return JSON.stringify([imageSignature(background), imageSignature(counter)])
  }

  function textureFor(image, width, height, cover) {
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Не удалось подготовить текстуру отражений')
    const style = getComputedStyle(image)
    context.fillStyle = '#000'
    context.fillRect(0, 0, width, height)
    context.filter = style.filter
    context.globalAlpha = Number(style.opacity)
    let sourceWidth = image.naturalWidth, sourceHeight = image.naturalHeight
    if (cover) {
      const rect = image.getBoundingClientRect()
      const scale = Math.max(rect.width / sourceWidth, rect.height / sourceHeight)
      if (scale > 0) { sourceWidth = rect.width / scale; sourceHeight = rect.height / scale }
    }
    context.drawImage(image, (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2,
      sourceWidth, sourceHeight, 0, 0, width, height)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }

  function buildRoom(useImages) {
    const room = new RoomEnvironment()
    room.traverse(node => {
      if (node.isLight) node.intensity *= 0.65
      if (node.material?.color && Math.max(...node.material.color.toArray()) > 1) node.material.color.multiplyScalar(0.12)
    })
    if (useImages) {
      // Полупрозрачные поверхности добавляют оттенки, сохраняя студийные отражения.
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 10, 48, 1, true),
        new THREE.MeshBasicMaterial({ map: textureFor(background, 1024, 512, true), side: THREE.BackSide,
          transparent: true, opacity: 0.75, depthWrite: false }))
      wall.position.y = 3.7 - room.position.y
      room.add(wall)
      if (counter?.naturalWidth) {
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20),
          new THREE.MeshBasicMaterial({ map: textureFor(counter, 512, 512, false), side: THREE.DoubleSide,
            transparent: true, opacity: 0.65, depthWrite: false }))
        floor.rotation.x = -Math.PI / 2
        floor.position.y = -1.3 - room.position.y
        room.add(floor)
      }
    }
    const softbox = createLightPanel(THREE)
    // RoomEnvironment имеет собственный сдвиг; светильник задан в мировых координатах.
    softbox.position.sub(room.position)
    room.add(softbox)
    return room
  }

  function bake(room) {
    try {
      const next = generator.fromScene(room)
      const previous = target
      target = next
      onChange(target.texture)
      previous?.dispose()
    } finally {
      const resources = new Set()
      room.traverse(node => {
        if (node.geometry) resources.add(node.geometry)
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          if (!material) continue
          resources.add(material)
          for (const value of Object.values(material)) if (value?.isTexture) resources.add(value)
        }
      })
      resources.forEach(resource => resource.dispose())
    }
  }

  async function refresh() {
    const next = key()
    if (disposed || next === signature) return
    const version = ++revision
    try {
      if (background) {
        await Promise.all([background, counter].filter(Boolean).map(image => image.decode()))
      }
      if (disposed || version !== revision) return
      if (next !== key()) { schedule(); return }
      bake(buildRoom(Boolean(background)))
      signature = next
    } catch (error) {
      if (!disposed && version === revision) console.warn('Не удалось обновить окружение отражений банки', error)
    }
  }

  function schedule() {
    if (disposed || frame) return
    frame = requestAnimationFrame(() => { frame = 0; void refresh() })
  }

  function setView(nextView) {
    const nextBackground = nextView.background || null, nextCounter = nextView.counter || null
    if (nextBackground === background && nextCounter === counter) return
    for (const image of [background, counter]) image?.removeEventListener('load', schedule)
    observer.disconnect(); resizeObserver.disconnect()
    background = nextBackground; counter = nextCounter
    signature = ''; revision++
    if (background) {
      const ancestors = new Set()
      for (const image of [background, counter].filter(Boolean)) {
        image.addEventListener('load', schedule)
        observer.observe(image, { attributes: true, attributeFilter: ['src', 'srcset', 'sizes', 'class', 'style'] })
        resizeObserver.observe(image)
        for (let parent = image.parentElement; parent; parent = parent.parentElement) {
          ancestors.add(parent)
          if (parent === nextView.section) break
        }
      }
      for (const parent of ancestors) observer.observe(parent, { attributes: true, attributeFilter: ['class', 'style'] })
      schedule()
    }
  }

  bake(buildRoom(false))
  setView(view)
  return {
    get texture() { return target.texture },
    setView,
    dispose() {
      disposed = true; revision++
      cancelAnimationFrame(frame)
      observer.disconnect(); resizeObserver.disconnect()
      for (const image of [background, counter]) image?.removeEventListener('load', schedule)
      target?.dispose(); generator.dispose()
    },
  }
}
