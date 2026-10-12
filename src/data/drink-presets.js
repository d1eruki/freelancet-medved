// Общие рецепты жидкости. Поглощение и рассеяние — на единицу длины луча.
// scatteringColor — линейный RGB (не CSS-цвет); пузырьки есть у всех напитков.
const recipes = {
  "mead-berry": {
    "name": "Медовуха «Мэрион» Берри",
    "target": "src/assets/products/mead/marion-pomegranate-berry-glass.png",
    "foam": true,
    "absorption": [
      0.35,
      3.2,
      1.8
    ],
    "scattering": 1.5,
    "scatteringColor": [
      0.42,
      0.018,
      0.065
    ],
    "foamAllowed": true
  },
  "mead-mango": {
    "name": "Медовуха «Мэрион» Манго",
    "target": "src/assets/products/mead/marion-mango-glass.png",
    "foam": true,
    "absorption": [
      0.1,
      0.9,
      3.4
    ],
    "scattering": 2.4,
    "scatteringColor": [
      0.7,
      0.3,
      0.02
    ],
    "foamAllowed": true
  },
  "mead-cranberry": {
    "name": "Медовуха «Мёдведь» Клюквенная",
    "target": "src/assets/products/mead/medved-cranberry-glass.png",
    "foam": true,
    "absorption": [
      0.3,
      3,
      2.1
    ],
    "scattering": 1.2,
    "scatteringColor": [
      0.48,
      0.012,
      0.02
    ],
    "foamAllowed": true
  },
  "mead-forest-berries": {
    "name": "Медовуха «Мёдведь» с лесными ягодами",
    "target": "src/assets/products/mead/medved-forest-berries-glass.png",
    "foam": true,
    "absorption": [
      0.3,
      3,
      2.1
    ],
    "scattering": 1.2,
    "scatteringColor": [
      0.48,
      0.012,
      0.02
    ],
    "foamAllowed": true
  },
  "mead-sea-buckthorn": {
    "name": "Медовуха «Мёдведь» Облепиховая",
    "target": "src/assets/products/mead/medved-sea-buckthorn-glass.png",
    "foam": true,
    "absorption": [
      0.08,
      1.1,
      3.8
    ],
    "scattering": 2.5,
    "scatteringColor": [
      0.8,
      0.25,
      0.015
    ],
    "foamAllowed": true
  },
  "mead-plum": {
    "name": "Медовуха «Мёдведь» Сливовая",
    "target": "src/assets/products/mead/medved-plum-glass.png",
    "foam": true,
    "absorption": [
      0.28,
      0.75,
      2.4
    ],
    "scattering": 1.6,
    "scatteringColor": [
      0.46,
      0.3,
      0.05
    ],
    "foamAllowed": true
  },
  "mead-blackcurrant": {
    "name": "Медовуха «Мэрион» Черносмородиновая",
    "target": "src/assets/products/mead/medved-blackcurrant-glass.png",
    "foam": true,
    "absorption": [
      0.55,
      4.4,
      2.6
    ],
    "scattering": 0.6,
    "scatteringColor": [
      0.22,
      0.006,
      0.036
    ],
    "foamAllowed": true
  },
  "cider-khmelyar": {
    "name": "Сидр «Хмеляр»",
    "target": "src/assets/products/cider/khmelyar-glass.png",
    "foam": false,
    "absorption": [
      0.1,
      0.7,
      2.5
    ],
    "scattering": 0.6,
    "scatteringColor": [
      0.62,
      0.36,
      0.09
    ],
    "foamAllowed": false
  },
  "cider-woodstock": {
    "name": "Сидр «Вудсток»",
    "target": "src/assets/products/cider/woodstock-glass.png",
    "foam": false,
    "absorption": [
      0.08,
      0.62,
      2.3
    ],
    "scattering": 0.35,
    "scatteringColor": [
      0.7,
      0.45,
      0.16
    ],
    "foamAllowed": false
  },
  "cider-cherry": {
    "name": "Сидр Вишневый",
    "target": "src/assets/products/cider/cherry-glass.png",
    "foam": false,
    "absorption": [
      0.12,
      5.5,
      4.5
    ],
    "scattering": 0,
    "scatteringColor": [
      0,
      0,
      0
    ],
    "foamAllowed": false
  },
  "cider-antonovka": {
    "name": "Сидр «Антоновка»",
    "target": "src/assets/products/cider/antonovka-glass.png",
    "foam": false,
    "absorption": [
      0.03,
      0.3,
      2
    ],
    "scattering": 0,
    "scatteringColor": [
      0,
      0,
      0
    ],
    "foamAllowed": false
  },
  "perry-williams": {
    "name": "Пуаре «Мистер Вильямс»",
    "target": "src/assets/products/perry/mister-williams-glass.png",
    "foam": false,
    "absorption": [
      0.05,
      0.5,
      2.6
    ],
    "scattering": 0.5,
    "scatteringColor": [
      0.7,
      0.5,
      0.12
    ],
    "foamAllowed": false
  },
  "mead-dark": {
    "name": "Медовуха «Мёдведь» Тёмная",
    "target": "src/assets/products/mead/medved-dark-glass.png",
    "foam": true,
    "absorption": [
      2.5,
      4.2,
      6.5
    ],
    "scattering": 0.2,
    "scatteringColor": [
      0.07,
      0.019,
      0.005
    ],
    "foamAllowed": true
  },
  "mead-light": {
    "name": "Медовуха «Мёдведь» Светлая",
    "target": "src/assets/products/mead/medved-light-glass.png",
    "foam": true,
    "absorption": [
      0.08,
      1.1,
      3.8
    ],
    "scattering": 2.5,
    "scatteringColor": [
      0.8,
      0.25,
      0.015
    ],
    "foamAllowed": true
  },
  "mead-cherry": {
    "name": "Медовуха «Мёдведь» Вишнёвая",
    "target": "src/assets/products/mead/medved-cherry-glass.png",
    "foam": true,
    "absorption": [
      0.12,
      5.5,
      4.5
    ],
    "scattering": 0,
    "scatteringColor": [
      0,
      0,
      0
    ],
    "foamAllowed": true
  },
  "cider-valentine": {
    "name": "Сидр «Валентайн»",
    "target": "src/assets/products/cider/valentine-glass.png",
    "foam": false,
    "absorption": [
      0.03,
      0.3,
      2
    ],
    "scattering": 0,
    "scatteringColor": [
      0,
      0,
      0
    ],
    "foamAllowed": false
  }
}

Object.defineProperties(recipes, {
  cider: { value: recipes['cider-antonovka'] },
  mead: { value: recipes['mead-light'] },
})
export const drinkPresets = Object.freeze(recipes)
