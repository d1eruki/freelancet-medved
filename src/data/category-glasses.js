import meadGlass from '../assets/home/product-renders/medovuha-glass-clean.png?responsive'
import ciderGlass from '../assets/home/product-renders/sidr-glass-clean.png?responsive'
import perryGlass from '../assets/home/product-renders/puare-glass-clean.png?responsive'

// Общие изображения и геометрия бокалов для главной и страницы «О компании».
export const categoryGlasses = Object.freeze({
  medovuha: { image: meadGlass, width: 236, height: 433, slider: {"heightScale":0.6669431279620853,"topOffset":13.921800947867299,"leftOffset":43.5,"center":49.57627118644068,"origin":"49.57627118644068% 99.07621247113164%"} },
  sidr: { image: ciderGlass, width: 286, height: 499, slider: {"heightScale":0.6673868312757202,"topOffset":14.197530864197532,"leftOffset":43.5,"center":50.349650349650354,"origin":"50.349650349650354% 98.59719438877755%"} },
  puare: { image: perryGlass, width: 236, height: 434, slider: {"heightScale":0.6732696897374703,"topOffset":12.828162291169452,"leftOffset":43.5,"center":50.63559322033898,"origin":"50.63559322033898% 99.76958525345621%"} },
})
