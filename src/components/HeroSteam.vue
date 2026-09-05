<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

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
    uniforms: { time: { value: 0 } },
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
        vec2 p = vUv;
        vec2 flow = vec2(p.x * 5.0, p.y * 4.0 - time * 0.12);
        float curl = fbm(flow + vec2(0.0, time * 0.025));
        float cloud = fbm(flow * 2.0 + curl * 2.8);
        float center = 0.5 + sin(p.y * 6.0 - time * 0.18) * 0.07;
        float width = mix(0.08, 0.34, p.y);
        float plume = 1.0 - smoothstep(width * 0.25, width, abs(p.x - center + (curl - 0.5) * 0.22));
        float fade = smoothstep(0.0, 0.16, p.y) * (1.0 - smoothstep(0.5, 1.0, p.y));
        float alpha = smoothstep(0.23, 0.72, cloud) * plume * fade * 0.32;
        gl_FragColor = vec4(vec3(1.0), alpha);
      }
    `,
  })
  scene.add(new THREE.Mesh(geometry, material))

  let visible = false
  let frame = 0
  let lastTime = 0
  const render = (now) => {
    material.uniforms.time.value += Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    renderer.render(scene, camera)
    frame = requestAnimationFrame(render)
  }
  const sync = () => {
    cancelAnimationFrame(frame)
    host.value.hidden = motion.matches
    if (visible && !document.hidden && !motion.matches) {
      lastTime = performance.now()
      frame = requestAnimationFrame(render)
    }
  }
  const resize = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect
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
  inset: 12% 0 0;
  pointer-events: none;
}

.hero-steam :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
