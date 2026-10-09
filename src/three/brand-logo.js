import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import logoSvg from '../assets/branding/brand-logo-mark.svg?raw'

// Одна сцена для шапки и отдельного HTML-рендера.
export function createBrandLogoRenderer({ width, height, pixelRatio = 1 }) {
  const source = 'src/assets/branding/brand-logo-mark.svg'
  const depth = 5
  const pitch = -8, yaw = 17, roll = 0
  const geometries = [], materials = []
  const renderer = new THREE.WebGLRenderer({
    alpha: true, antialias: true, preserveDrawingBuffer: true,
  })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping

  function dispose() {
    geometries.forEach(geometry => geometry.dispose())
    materials.forEach(material => material.dispose())
    renderer.dispose()
  }

  try {
    // В исходном SVG inline-стиль Display P3 перекрывает обычный fill.
    // Three.js не читает color(display-p3 ...); используем исходный sRGB fill.
    const svgDocument = new DOMParser().parseFromString(logoSvg, 'image/svg+xml')
    for (const node of svgDocument.querySelectorAll('[fill]')) {
      node.style.fill = node.getAttribute('fill')
    }
    const data = new SVGLoader().parse(new XMLSerializer().serializeToString(svgDocument))
    const [originX, originY, svgWidth, svgHeight] = data.xml.getAttribute('viewBox')
      .trim().split(/[\s,]+/).map(Number)
    const scene = new THREE.Scene()
    const logo = new THREE.Group()
    let shapeCount = 0, triangleCount = 0

    for (const path of data.paths) {
      if (path.userData.style.fill === 'none') continue
      // Лицевая сторона сохраняет исходный цвет; свет моделирует торцы.
      const face = new THREE.MeshBasicMaterial({ color: path.color })
      const edge = new THREE.MeshStandardMaterial({
        color: path.color, roughness: 0.6, metalness: 0,
      })
      materials.push(face, edge)
      for (const shape of path.toShapes()) {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth, steps: 1, curveSegments: 12,
          bevelEnabled: true, bevelThickness: 0.3,
          bevelSize: 0.3, bevelSegments: 2,
        })
        geometries.push(geometry)
        geometry.translate(-originX - svgWidth / 2, -originY - svgHeight / 2, -depth / 2)
        const mesh = new THREE.Mesh(geometry, [face, edge])
        // SVG использует направленную вниз ось Y.
        mesh.scale.y = -1
        logo.add(mesh)
        shapeCount++
        triangleCount += (geometry.index?.count ?? geometry.attributes.position.count) / 3
      }
    }
    if (!shapeCount) throw new Error('В исходном логотипе не найдены заполненные контуры')

    logo.rotation.set(
      THREE.MathUtils.degToRad(pitch), THREE.MathUtils.degToRad(yaw),
      THREE.MathUtils.degToRad(roll), 'YXZ',
    )
    scene.add(logo)
    const ambient = new THREE.HemisphereLight(0xffffff, 0x806442, 1)
    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(-120, 180, 200)
    scene.add(ambient, key)

    logo.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(logo)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
    camera.position.set(center.x, center.y, center.z + 400)
    camera.lookAt(center)
    camera.updateMatrixWorld(true)
    const info = {
      width, height, source, depth, pitch, yaw, roll, shapeCount, triangleCount,
      sourceDimensions: [svgWidth, svgHeight],
      colors: data.paths.filter(path => path.userData.style.fill !== 'none')
        .map(path => `#${path.color.getHexString(THREE.SRGBColorSpace)}`),
    }

    function render() {
      const aspect = info.width / info.height
      const frameHeight = Math.max(size.y, size.x / aspect) * 1.25
      camera.left = -frameHeight * aspect / 2
      camera.right = frameHeight * aspect / 2
      camera.top = frameHeight / 2
      camera.bottom = -frameHeight / 2
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    }

    function resize(nextWidth, nextHeight, nextPixelRatio = pixelRatio) {
      info.width = nextWidth
      info.height = nextHeight
      renderer.setPixelRatio(nextPixelRatio)
      renderer.setSize(nextWidth, nextHeight, false)
      render()
    }

    function setRotation(rotation) {
      const next = {
        pitch: rotation.pitch ?? info.pitch,
        yaw: rotation.yaw ?? info.yaw,
        roll: rotation.roll ?? info.roll,
      }
      if (!Object.values(next).every(Number.isFinite)) throw new Error('Углы должны быть числами')
      Object.assign(info, next)
      logo.rotation.set(
        THREE.MathUtils.degToRad(next.pitch), THREE.MathUtils.degToRad(next.yaw),
        THREE.MathUtils.degToRad(next.roll), 'YXZ',
      )
      logo.updateMatrixWorld(true)
      bounds.setFromObject(logo)
      bounds.getSize(size)
      bounds.getCenter(center)
      camera.position.set(center.x, center.y, center.z + 400)
      camera.lookAt(center)
      camera.updateMatrixWorld(true)
      render()
    }

    resize(width, height, pixelRatio)
    return {
      canvas: renderer.domElement, info, resize, setRotation, dispose,
      exportPng: () => renderer.domElement.toDataURL('image/png'),
    }
  } catch (error) {
    dispose()
    throw error
  }
}
