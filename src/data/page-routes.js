import { catalogCategoryDefinitions } from './catalog-categories.js'

const origin = 'https://medved.beer'

const pages = [
  { path: '/', title: 'Медовуха, сидр и пуаре оптом в Санкт-Петербурге — «МЁДВЕДЬ»', description: 'Производим медовуху, сидр и пуаре в Санкт-Петербурге с 2006 года. Оптовые поставки в кегах и ПЭТ-таре по СПб и Ленинградской области.', type: 'home' },
  { path: '/katalog/', title: 'Медовуха, сидр и пуаре оптом — каталог производителя «МЁДВЕДЬ» в Санкт-Петербурге', description: 'Каталог медовухи, яблочного сидра и грушевого пуаре от производителя «МЁДВЕДЬ». Оптовые поставки по Санкт-Петербургу и Ленинградской области.', type: 'catalog' },
  ...catalogCategoryDefinitions.map((category) => ({
    path: `/katalog/${category.slug}/`,
    title: category.slug === 'medovuha'
      ? 'Медовуха оптом в Санкт-Петербурге — «МЁДВЕДЬ»'
      : `${category.name} оптом в Санкт-Петербурге — производитель «МЁДВЕДЬ»`,
    description: category.slug === 'medovuha'
      ? `${category.products.filter((product) => product.enabled !== false).length} сортов медовухи «МЁДВЕДЬ»: светлая, тёмная, фруктовые и ягодные вкусы. Оптовые поставки от производителя в Санкт-Петербурге в кегах и ПЭТ-таре.`
      : `${category.description} Оптовые поставки от производителя «МЁДВЕДЬ» по Санкт-Петербургу и Ленинградской области.`,
    type: 'category',
    categorySlug: category.slug,
  })),
  { path: '/proizvodstvo/', title: 'Производство «МЁДВЕДЬ» — традиционные рецептуры и современное оборудование', description: 'Как производят медовуху и сидр «МЁДВЕДЬ»: натуральное сырьё, брожение без добавления спирта и контроль качества на каждом этапе.', type: 'production' },
  { path: '/o-kompanii/', title: 'О компании «МЁДВЕДЬ» — петербургская традиция медоварения', description: 'История пиво-медоваренного завода «МЁДВЕДЬ»: традиции Ивана Дурдина, развитие компании, ассортимент и награды.', type: 'about' },
  { path: '/horeca/', title: 'HoReCa — медовуха, сидр и пуаре «МЁДВЕДЬ» для баров и ресторанов', description: 'Напитки «МЁДВЕДЬ» для баров и ресторанов: оптовые поставки в кегах и ПЭТ-таре по Санкт-Петербургу, Ленинградской области и через региональных дистрибьюторов.', type: 'horeca' },
  { path: '/kontakty/', title: 'Контакты пиво-медоваренного завода «МЁДВЕДЬ»', description: 'Адрес и контакты пиво-медоваренного завода «МЁДВЕДЬ» в Санкт-Петербурге. Телефон и почта отдела оптовых продаж.', type: 'contacts' },
  { path: '/politika-konfidencialnosti/', title: 'Политика конфиденциальности', description: '', type: 'legal', legalKey: 'privacy' },
  { path: '/disclaimer/', title: 'Ограничение ответственности', description: '', type: 'legal', legalKey: 'disclaimer' },
]

export const pageRoutes = pages.map((page) => ({ ...page, canonicalUrl: new URL(page.path, origin).href }))
export const notFoundPage = { title: 'Страница не найдена', description: '', robots: 'noindex, follow' }

export function findPage(path) {
  const normalized = path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`
  return pageRoutes.find((page) => page.path === normalized) ?? null
}

export function getPageRobots(page, environment = 'production') {
  return environment === 'staging' ? 'noindex, nofollow' : page.robots || 'index, follow'
}
