<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({ source: { type: Object, default: null } })
const host = ref(null)
let dispose = () => {}
let unmounted = false

onMounted(async () => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  // Load the renderer separately so it does not delay the page content.
  const THREE = await import('three')
  if (unmounted) return

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
  } catch {
    return // The illustration remains usable without WebGL.
  }
  renderer.setClearColor(0x000000, 0)
  host.value.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(1, 1) },
      mouth: { value: new THREE.Vector2() },
      breathScale: { value: 1 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      uniform vec2 mouth;
      uniform float breathScale;
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
                   mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float value = 0.0, amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p = p * 2.03 + vec2(3.1, 7.4);
          amplitude *= 0.5;
        }
        return value;
      }
      void main() {
        // A short exhale starts as the bear settles after its inhale.
        float phase = mod(time + 4.0, 8.0);
        vec2 p = (vUv * resolution - mouth) / breathScale;
        float alpha = 0.0;
        for (int i = 0; i < 6; i++) {
          float seed = float(i);
          float age = phase - seed * 0.085;
          float life = clamp(age / 2.15, 0.0, 1.0);
          vec2 center = vec2(-age * 105.0, age * 12.0 + age * age * 6.0);
          center += vec2(sin(seed * 2.4) * 12.0, cos(seed * 1.7) * 8.0) * life;
          vec2 radius = vec2(38.0 + life * 255.0, 24.0 + life * 155.0);
          vec2 q = (p - center) / radius;
          float variation = mix(0.82, 1.0, fbm(q * 1.35 + vec2(seed, -age * 0.18)));
          float mist = exp(-dot(q, q) * 1.65) * variation;
          float envelope = smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.7, 2.15, age));
          alpha += mist * envelope * 0.04;
        }
        alpha = min(alpha, 0.16);
        gl_FragColor = vec4(0.92, 0.97, 1.0, alpha);
      }
    `,
  })
  scene.add(new THREE.Mesh(geometry, material))

  let visible = false
  let frame = 0
  const render = () => {
    const source = props.source
    if (source?.naturalWidth) {
      const bounds = source.getBoundingClientRect()
      const container = host.value.parentElement.getBoundingClientRect()
      // object-contain + object-bottom: map the mouth from image coordinates.
      const imageScale = Math.min(bounds.width / source.naturalWidth, bounds.height / source.naturalHeight)
      const width = source.naturalWidth * imageScale
      const height = source.naturalHeight * imageScale
      const scale = width / 700
      const x = bounds.left - container.left + (bounds.width - width) / 2 + width * 0.66
      const y = bounds.bottom - container.top - height + height * 0.445
      host.value.style.transform = `translate(${x - 520 * scale}px, ${y - 280 * scale}px) scale(${scale})`
      material.uniforms.mouth.value.set(520, 140)
      const breathing = source.getAnimations().find(animation => animation.animationName?.startsWith('hero-layer-float'))
      material.uniforms.time.value = Number(breathing?.currentTime ?? 0) / 1000
      renderer.render(scene, camera)
    }
    frame = requestAnimationFrame(render)
  }
  const sync = () => {
    cancelAnimationFrame(frame)
    host.value.hidden = motion.matches
    if (visible && !document.hidden && !motion.matches) {
      frame = requestAnimationFrame(render)
    }
  }
  const resize = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect
    material.uniforms.resolution.value.set(Math.max(1, width), Math.max(1, height))
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(Math.max(1, width), Math.max(1, height))
  })
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    sync()
  })
  resize.observe(host.value)
  intersection.observe(host.value.parentElement)
  motion.addEventListener('change', sync)
  document.addEventListener('visibilitychange', sync)
  sync()

  dispose = () => {
    cancelAnimationFrame(frame)
    resize.disconnect()
    intersection.disconnect()
    motion.removeEventListener('change', sync)
    document.removeEventListener('visibilitychange', sync)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
})

onBeforeUnmount(() => {
  unmounted = true
  dispose()
})
</script>

<template>
  <div ref="host" class="hero-steam" aria-hidden="true" />
</template>

<style scoped>
.hero-steam {
  position: absolute;
  top: 0;
  left: 0;
  width: 700px;
  height: 420px;
  transform-origin: top left;
  pointer-events: none;
}

.hero-steam :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
