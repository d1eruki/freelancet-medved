export const heroAnimationTiming = {
  slide: 1000,
  rise: 1000,
  layeredRise: 1000,
  text: 500,
  delay: 0,
  hoverDelay: -250,
}

export const heroEntranceScenarios = {
  'rise-together': [{ middle: 'rise', delay: 'hoverDelay', middle2: 'rise', delay2: 'hoverDelay', foreground: 'rise', delay3: 'hoverDelay', title: 'text', delay4: 'hoverDelay', description: 'text' }],
  'foreground-rise-middle-slide-together': [{ foreground: 'rise', delay: 'hoverDelay', middle: 'slide', delay2: 'delay', middle2: 'slide', delay3: 'delay', title: 'text', delay4: 'delay', description: 'text' }],
  'middle-rise-foreground-slide-together': [{ middle: 'rise', delay: 'delay', middle2: 'rise', delay2: 'delay', foreground: 'slide', delay3: 'delay', title: 'text', delay4: 'delay', description: 'text' }],
  'foreground-slide-then-middle-slide': [{ foreground: 'slide' }, { delay: 'delay', middle: 'slide', delay2: 'delay', middle2: 'slide', delay3: 'delay', title: 'text', delay4: 'delay', description: 'text' }],
  'middle-split-slide-together': [{ middle: 'slide-left', delay: 'delay', middle2: 'slide', delay2: 'delay', title: 'text', delay3: 'delay', description: 'text' }],
  'image-copy': [{ title: 'text', delay: 'delay', description: 'text' }],
}

export function resolveHeroEntrance(scenario, layers = {}) {
  if (!Object.hasOwn(heroEntranceScenarios, scenario)) {
    throw new Error(`Укажите существующий сценарий появления слоёв хиро: ${scenario}`)
  }

  const animations = {}
  const copyTiming = { '--hero-copy-duration': `${heroAnimationTiming.text}ms` }
  let elapsed = 0
  let delayKey
  let hasAnimation = false
  let hasConfiguredAnimation = false

  for (const stage of heroEntranceScenarios[scenario]) {
    for (const [name, value] of Object.entries(stage)) {
      if (/^delay\d*$/.test(name)) {
        if (!['delay', 'hoverDelay'].includes(value)) {
          throw new Error(`Неизвестный параметр задержки в ${scenario}: ${value}`)
        }
        delayKey = value
        continue
      }
      if (hasConfiguredAnimation && !delayKey) {
        throw new Error(`Перед ${name} в ${scenario} явно выберите delay или hoverDelay`)
      }
      const selectedDelay = delayKey
      delayKey = undefined
      hasConfiguredAnimation = true

      const isCopy = name === 'title' || name === 'description'
      if (!isCopy && !layers[name]) continue

      const duration = isCopy
        ? heroAnimationTiming.text
        : heroAnimationTiming[value === 'slide-left' ? 'slide' : value]
      if (!Number.isFinite(duration)) {
        throw new Error(`Неизвестная анимация в ${scenario}: ${value}`)
      }
      const start = hasAnimation ? Math.max(0, elapsed + heroAnimationTiming[selectedDelay]) : 0
      if (isCopy) {
        copyTiming[`--hero-${name}-delay`] = `${start}ms`
      } else {
        animations[name] = {
          className: `hero-composition-plane-${value === 'layeredRise' ? 'rise' : value}`,
          style: {
            '--hero-layer-duration': `${duration}ms`,
            '--hero-layer-delay': `${start}ms`,
          },
        }
      }
      elapsed = start + duration
      hasAnimation = true
    }
  }

  return { animations, copyTiming }
}
