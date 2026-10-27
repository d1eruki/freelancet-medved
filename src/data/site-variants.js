// Вариант выбирается при запуске Vite, одинаково для браузера и готового HTML.
export const siteVariants = Object.freeze({
  original: Object.freeze({ name: 'original', brand: '#3d5a45', slogan: 'Варим с душой', headerLogo: 'seal', homeRestingPaw: true }),
  client: Object.freeze({ name: 'client', brand: '#3d5a45', slogan: 'Пчелы умрут от зависти', headerLogo: 'barrel', homeRestingPaw: false }),
})

export function getSiteVariant(name = 'original') {
  if (!Object.hasOwn(siteVariants, name)) throw new Error('SITE_VARIANT must be original or client')
  return siteVariants[name]
}

export const siteVariant = getSiteVariant(import.meta.env?.VITE_SITE_VARIANT || 'original')
