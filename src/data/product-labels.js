import lightMeadLabel from '../../materials/customer-design/labels/cans-330ml-500ml/light-mead.png?url'
import antonovkaLabel from '../../materials/customer-design/labels/cans-330ml-500ml/antonovka.png?url'
import williamsLabel from '../../materials/customer-design/labels/cans-330ml-500ml/poiret-pear.png?url'

export const productLabels = Object.freeze({ medovuha: lightMeadLabel, sidr: antonovkaLabel, puare: williamsLabel })
// Предзагрузка и выбор этикетки используют один набор файлов.
export const preloadLabelUrls = Object.freeze(Object.values(productLabels))
