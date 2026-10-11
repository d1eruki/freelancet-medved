function probeWebGL() {
  let gl
  try {
    gl = document.createElement('canvas').getContext('webgl2', {
      alpha: true, antialias: true, powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: true,
    })
    if (!gl) return false
    const debug = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : ''
    return !/swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(renderer)
  } catch {
    return false
  } finally {
    try { gl?.getExtension('WEBGL_lose_context')?.loseContext() } catch { /* контекст уже потерян */ }
  }
}

export function warmupWebGL() {
  let worker, timer, settle
  const release = () => {
    clearTimeout(timer)
    worker?.terminate()
    worker = null
  }
  const cancel = () => { release(); settle?.(false) }
  const ready = new Promise(resolve => {
    settle = resolve
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { resolve(false); return }
    const ordinary = () => { release(); resolve(probeWebGL()) }
    if (!globalThis.Worker || !globalThis.OffscreenCanvas) { ordinary(); return }
    try {
      worker = new Worker(new URL('./webgl-warmup.worker.js', import.meta.url), { type: 'module' })
      worker.onmessage = ({ data }) => {
        clearTimeout(timer)
        if (data.unavailable) ordinary()
        else { if (!data.supported) release(); resolve(Boolean(data.supported)) }
      }
      worker.onerror = ordinary
      // Зависший прогрев не должен задерживать появление статичной банки.
      timer = setTimeout(() => { release(); resolve(false) }, 8000)
      worker.postMessage(null)
    } catch { ordinary() }
  })
  return { ready, release, cancel }
}
