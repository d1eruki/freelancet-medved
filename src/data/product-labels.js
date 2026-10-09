import lightMeadLabel from '../../materials/customer-design/labels/cans-330ml-500ml/medved-light-mead-450ml.png?url'
import antonovkaLabel from '../../materials/customer-design/labels/cans-330ml-500ml/vetka-antonovki-450ml.png?url'
import williamsLabel from '../../materials/customer-design/labels/cans-330ml-500ml/poiret-pear-330ml.png?url'

export const productLabels = Object.freeze({ medovuha: lightMeadLabel, sidr: antonovkaLabel, puare: williamsLabel })
// Предзагрузка и выбор этикетки используют один набор файлов.
export const preloadLabelUrls = Object.freeze(Object.values(productLabels))
