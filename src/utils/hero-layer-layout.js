const defaultLayout = { enabled: true, scale: 1, x: 0, y: 0 }
const horizontalAnchors = { left: '0%', center: '50%', right: '100%' }
const verticalAnchors = {
  top: { position: '0%', top: '0px', bottom: 'auto', shift: '0%' },
  center: { position: '50%', top: '50%', bottom: 'auto', shift: '-50%' },
  bottom: { position: '100%', top: 'auto', bottom: '0px', shift: '0%' },
}

function cssLength(value) {
  return typeof value === 'string' ? value : `${value ?? 0}px`
}

function constraintStyle(layout, device) {
  const horizontal = horizontalAnchors[layout.constraints?.horizontal] ?? horizontalAnchors.center
  const vertical = verticalAnchors[layout.constraints?.vertical] ?? verticalAnchors.bottom
  return {
    [`--hero-layer-${device}-anchor-x`]: horizontal,
    [`--hero-layer-${device}-anchor-y`]: vertical.position,
    [`--hero-layer-${device}-top`]: vertical.top,
    [`--hero-layer-${device}-bottom`]: vertical.bottom,
    [`--hero-layer-${device}-anchor-shift-y`]: vertical.shift,
  }
}

function layerLayouts(layout, name) {
  const mobile = layout?.mobile?.[name] ?? defaultLayout
  const tablet = layout?.tablet?.[name] ?? layout?.desktop?.[name] ?? mobile
  const desktop = layout?.desktop?.[name] ?? tablet
  return { mobile, tablet, desktop }
}

export function heroLayerVisibilityStyle(layout, name) {
  return Object.fromEntries(Object.entries(layerLayouts(layout, name)).map(([device, settings]) => [
    `--hero-layer-${device}-display`, settings.enabled === false ? 'none' : 'block',
  ]))
}

export function heroLayerStyle(layout, name, parallaxX = 0, parallaxY = 0) {
  const { mobile, tablet, desktop } = layerLayouts(layout, name)

  return {
    '--hero-layer-mobile-scale': mobile.scale,
    '--hero-layer-mobile-x': cssLength(mobile.x),
    '--hero-layer-mobile-y': cssLength(mobile.y),
    '--hero-layer-tablet-scale': tablet.scale,
    '--hero-layer-tablet-x': cssLength(tablet.x),
    '--hero-layer-tablet-y': cssLength(tablet.y),
    '--hero-layer-desktop-scale': desktop.scale,
    '--hero-layer-desktop-x': cssLength(desktop.x),
    '--hero-layer-desktop-y': cssLength(desktop.y),
    ...constraintStyle(mobile, 'mobile'),
    ...constraintStyle(tablet, 'tablet'),
    ...constraintStyle(desktop, 'desktop'),
    '--hero-layer-parallax-x': `${parallaxX}px`,
    '--hero-layer-parallax-y': `${parallaxY}px`,
  }
}
