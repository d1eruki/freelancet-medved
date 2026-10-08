const address = '190020, Санкт-Петербург, Курляндская ул., д. 28, литер Г, помещение 75'

export const contacts = Object.freeze({
  address,
  footerAddress: 'г. Санкт-Петербург, Курляндская улица, д. 28Г, пом. 75',
  addressMapUrl: `https://yandex.ru/maps/?text=${encodeURIComponent('Санкт-Петербург, Курляндская улица, 28Г')}`,
  routeUrl: `https://yandex.ru/maps/?mode=routes&rtext=~${encodeURIComponent(address)}&rtt=auto`,
  mapEmbedUrl: 'https://yandex.ru/map-widget/v1/?ll=30.280969%2C59.910135&z=17&pt=30.280969%2C59.910135%2Cpm2rdm',
  mapTitle: 'Яндекс Карта: Курляндская улица, 28Г, Санкт-Петербург',
  general: Object.freeze({
    label: 'Общие вопросы',
    title: 'Завод «МЁДВЕДЬ»',
    hours: 'Пн–пт, 9:30–18:00',
    phone: '+7 (812) 940-84-27',
    phoneHref: 'tel:+78129408427',
    email: 'info@medved.beer',
    emailHref: 'mailto:info@medved.beer',
  }),
  sales: Object.freeze({
    label: 'Сотрудничество и поставки',
    title: 'Оптовые продажи',
    hours: 'Пн–пт, 9:30–20:00',
    phone: '+7 (963) 312-89-39',
    phoneHref: 'tel:+79633128939',
    email: 'opt@medved.beer',
    emailHref: `mailto:opt@medved.beer?subject=${encodeURIComponent('Запрос о сотрудничестве')}`,
    tone: 'brand',
  }),
})
