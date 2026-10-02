<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  source: { type: String, required: true },
  fallback: { type: String, required: true },
  active: { type: Boolean, default: false },
  paused: { type: Boolean, default: false },
})

const host = ref(null)
const ready = ref(false)
const shadowStyle = ref({})
let unmounted = false
let visible = false
let started = false
let intersection
let dispose = () => {}
let syncAnimation = () => {}

function disposeModel(model) {
  const resources = new Set()
  model.traverse((node) => {
    if (node.geometry) resources.add(node.geometry)
    const materials = Array.isArray(node.material) ? node.material : [node.material]
    for (const material of materials) {
      if (!material) continue
      resources.add(material)
      for (const value of Object.values(material)) {
        if (value?.isTexture) resources.add(value)
      }
    }
  })
  for (const resource of resources) resource.dispose()
}

async function loadModel() {
  if (started || !visible || !props.active || unmounted) return
  started = true
  try {
    const [THREE, { GLTFLoader }, { RoomEnvironment }] = await Promise.all([
      import('three'),
      import('three/addons/loaders/GLTFLoader.js'),
      import('three/addons/environments/RoomEnvironment.js'),
    ])
    if (unmounted) return

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let model
    let environment
    let resize
    let disposed = false
    let frame = 0
    let lastTime = null
    const contextLost = (event) => {
      event.preventDefault()
      ready.value = false
      dispose()
    }
    dispose = () => {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      syncAnimation = () => {}
      motion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      resize?.disconnect()
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      if (model) disposeModel(model)
      environment?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.toneMapping = THREE.ACESFilmicToneMapping

    const gltf = await new GLTFLoader().loadAsync(props.source)
    if (unmounted || disposed) {
      disposeModel(gltf.scene)
      return
    }
    model = gltf.scene
    const bounds = new THREE.Box3().setFromObject(model)
    const size = bounds.getSize(new THREE.Vector3())
    const longestSide = Math.max(size.x, size.y, size.z)
    if (!Number.isFinite(longestSide) || longestSide <= 0) throw new Error('Invalid model bounds')
    const center = bounds.getCenter(new THREE.Vector3())
    const product = new THREE.Group()
    product.add(model)
    product.scale.setScalar(2 / longestSide)
    model.position.sub(center)
    product.rotation.y = 0.35

    const scene = new THREE.Scene()
    scene.add(product)
    const room = new RoomEnvironment()
    const generator = new THREE.PMREMGenerator(renderer)
    try {
      environment = generator.fromScene(room)
      scene.environment = environment.texture
    } finally {
      room.dispose()
      generator.dispose()
    }
    scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2))
    const light = new THREE.DirectionalLight(0xffffff, 3)
    light.position.set(3, 4, 5)
    scene.add(light)

    const productBounds = new THREE.Box3().setFromObject(product)
    const baseWidth = Math.max(size.x, size.z) * product.scale.x

    const camera = new THREE.OrthographicCamera(-1.3, 1.3, 1.3, -1.3, 0.1, 20)
    camera.position.set(0, 0.35, 5)
    camera.lookAt(0, -0.035, 0)
    const radius = productBounds.getBoundingSphere(new THREE.Sphere()).radius * 1.08 / 1.26
    const canAnimate = () => !disposed && !unmounted && visible && props.active
      && !props.paused && !document.hidden && !motion.matches
    const animate = (time) => {
      frame = 0
      if (!canAnimate()) {
        lastTime = null
        return
      }
      if (lastTime !== null) {
        const elapsed = Math.min(time - lastTime, 100)
        product.rotation.y = (product.rotation.y + elapsed * Math.PI / 10000) % (Math.PI * 2)
      }
      lastTime = time
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    function sync() {
      cancelAnimationFrame(frame)
      frame = 0
      lastTime = null
      if (canAnimate()) frame = requestAnimationFrame(animate)
    }
    syncAnimation = sync
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    const render = () => {
      const { width, height } = host.value.getBoundingClientRect()
      if (width <= 0 || height <= 0) return
      const aspect = width / height
      const halfHeight = radius / Math.min(aspect, 1)
      camera.left = -halfHeight * aspect
      camera.right = halfHeight * aspect
      camera.top = halfHeight
      camera.bottom = -halfHeight
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      renderer.render(scene, camera)
      // Keep the compact oval attached to the projected base at every size.
      const base = new THREE.Vector3(0, productBounds.min.y, 0).project(camera)
      const baseX = (base.x + 1) * width / 2
      const baseY = (1 - base.y) * height / 2
      host.value.style.setProperty('--model-origin', `${baseX}px ${baseY}px`)
      const shadowWidth = baseWidth * 1.75 / (camera.right - camera.left) * width
      shadowStyle.value = {
        left: `${baseX}px`,
        top: `${baseY + shadowWidth * 0.025}px`,
        width: `${shadowWidth}px`,
        height: `${shadowWidth * 0.215}px`,
      }
      ready.value = true
    }
    host.value.appendChild(renderer.domElement)
    resize = new ResizeObserver(render)
    resize.observe(host.value)
    render()
    sync()
  } catch {
    ready.value = false
    dispose()
  }
}

onMounted(() => {
  intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    loadModel()
    syncAnimation()
  })
  intersection.observe(host.value)
})

watch(() => [props.active, props.paused], () => {
  loadModel()
  syncAnimation()
})

onBeforeUnmount(() => {
  unmounted = true
  intersection?.disconnect()
  dispose()
})
</script>

<template>
  <span ref="host" class="product-model block relative size-full pointer-events-none" aria-hidden="true">
    <span v-show="ready" class="product-model-shadow" :style="shadowStyle" />
    <img v-show="!ready" class="absolute inset-0 size-full object-contain" :src="fallback" alt="" draggable="false">
  </span>
</template>

<style scoped>
.product-model-shadow {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background:
    radial-gradient(ellipse 42% 19% at 50% 43%, rgb(0 0 0 / 0.82) 0%, rgb(0 0 0 / 0.68) 40%, rgb(0 0 0 / 0.25) 72%, transparent 100%),
    radial-gradient(ellipse closest-side at center, rgb(0 0 0 / 0.2) 0%, rgb(0 0 0 / 0.12) 50%, rgb(0 0 0 / 0.04) 75%, transparent 100%);
}

.product-model :deep(canvas) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
</style>
