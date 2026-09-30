const sequencedEntranceTiming = {
  '--hero-rise-duration': '600ms',
  '--hero-slide-delay': '0ms',
  '--hero-slide-duration': '800ms',
  '--hero-title-delay': '850ms',
  '--hero-description-delay': '990ms',
}
export const layerEntranceTimings = {
  rise: {
    '--hero-rise-duration': '1000ms',
    '--hero-secondary-rise-delay': '120ms',
    '--hero-title-delay': '820ms',
    '--hero-description-delay': '960ms',
  },
  'foreground-first': sequencedEntranceTiming,
  'middle-first': sequencedEntranceTiming,
  'foreground-then-middle': {
    ...sequencedEntranceTiming,
    '--hero-secondary-slide-delay': '800ms',
    '--hero-title-delay': '1650ms',
    '--hero-description-delay': '1790ms',
  },
  'split-slide': sequencedEntranceTiming,
}
export const imageCopyTiming = {
  '--hero-title-delay': '120ms',
  '--hero-description-delay': '260ms',
}

export const entranceMotions = {
  rise: { middle: 'hero-composition-plane-rise', middle2: 'hero-composition-plane-rise', foreground: 'hero-composition-plane-rise-delayed' },
  'foreground-first': { middle: 'hero-composition-plane-slide', middle2: 'hero-composition-plane-slide', foreground: 'hero-composition-plane-rise' },
  'middle-first': { middle: 'hero-composition-plane-rise', middle2: 'hero-composition-plane-rise', foreground: 'hero-composition-plane-slide' },
  'foreground-then-middle': { middle: 'hero-composition-plane-slide-delayed', middle2: 'hero-composition-plane-slide-delayed', foreground: 'hero-composition-plane-slide' },
  'split-slide': { middle: 'hero-composition-plane-slide-left', middle2: 'hero-composition-plane-slide' },
}
