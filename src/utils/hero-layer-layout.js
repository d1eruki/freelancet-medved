const defaultLayout = { scale: 1, x: 0, y: 0 }

export function heroLayerStyle(layout, parallaxX = 0, parallaxY = 0) {
  const mobile = layout?.mobile ?? defaultLayout
  const desktop = layout?.desktop ?? mobile

  return {
    '--hero-layer-mobile-scale': mobile.scale,
    '--hero-layer-mobile-x': `${mobile.x}px`,
    '--hero-layer-mobile-y': `${mobile.y}px`,
    '--hero-layer-desktop-scale': desktop.scale,
    '--hero-layer-desktop-x': `${desktop.x}px`,
    '--hero-layer-desktop-y': `${desktop.y}px`,
    '--hero-layer-parallax-x': `${parallaxX}px`,
    '--hero-layer-parallax-y': `${parallaxY}px`,
  }
}
