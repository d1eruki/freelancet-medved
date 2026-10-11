// Контекст остаётся живым до создания основного renderer: драйвер уже подготовлен.
self.onmessage = () => {
  try {
    const gl = new OffscreenCanvas(1, 1).getContext('webgl2', {
      alpha: true, antialias: true, powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: true,
    })
    if (!gl) { self.postMessage({ supported: false }); return }
    const debug = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : ''
    const software = /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(renderer)
    gl.getSupportedExtensions()
    self.postMessage({ supported: !software })
  } catch {
    self.postMessage({ unavailable: true })
  }
}
