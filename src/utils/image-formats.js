// Метаданные форматов добавляются модулями изображений при сборке.
const avifSources = new Map()

export function registerImageFormats(webp, avif) {
  avifSources.set(webp, avif)
}

export function getAvifSource(source) {
  return avifSources.get(source)
}

export function getAvifSrcset(srcset) {
  if (!srcset) return undefined
  const candidates = srcset.split(',').map(candidate => {
    const [source, descriptor] = candidate.trim().split(/\s+/)
    const avif = getAvifSource(source)
    return avif ? `${avif}${descriptor ? ` ${descriptor}` : ''}` : undefined
  })
  return candidates.every(Boolean) ? candidates.join(', ') : undefined
}

export function getImageBackground(source, background) {
  if (background) {
    // Сохраняем плотности существующего адаптивного image-set.
    if (!background.startsWith('image-set(')) return background
    return background.replace(/url\("([^"\n]+)"\)(\s+[\d.]+x)/g, (candidate, url, density) => {
      const avif = getAvifSource(url)
      return avif
        ? `url(${JSON.stringify(avif)})${density} type("image/avif"), ${candidate} type("image/webp")`
        : candidate
    })
  }
  if (!source) return undefined
  const webp = `url(${JSON.stringify(source)})`
  const avif = getAvifSource(source)
  return avif ? `image-set(url(${JSON.stringify(avif)}) type("image/avif"), ${webp} type("image/webp"))` : webp
}
