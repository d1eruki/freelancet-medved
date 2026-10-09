import { catalogCategories } from './catalog'
import { legalContent } from './legal-content'

const origin = 'https://medved.beer'

const pages = [
  { path: '/', title: 'Медовуха (мид), сидр и пуаре оптом в Санкт-Петербурге — «МЁДВЕДЬ»', description: 'Производим медовуху (мид), сидр и пуаре в Санкт-Петербурге с 2006 года. Оптовые поставки в кегах и ПЭТ-таре по СПб и Ленинградской области.', type: 'home' },
  { path: '/katalog/', title: 'Мид, сидр и пуаре оптом — каталог производителя «МЁДВЕДЬ» в Санкт-Петербурге', description: 'Каталог медовухи (мида), яблочного сидра и грушевого пуаре от производителя «МЁДВЕДЬ». Оптовые поставки по Санкт-Петербургу и Ленинградской области.', type: 'catalog' },
  ...catalogCategories.map((category) => ({
    path: `/katalog/${category.slug}/`,
    title: category.slug === 'medovuha'
      ? 'Медовуха (мид) оптом в Санкт-Петербурге — «МЁДВЕДЬ»'
      : `${category.name} оптом в Санкт-Петербурге — производитель «МЁДВЕДЬ»`,
    description: category.slug === 'medovuha'
      ? `${category.items.length} сортов медовухи (мида) «МЁДВЕДЬ»: светлая, тёмная, фруктовые и ягодные вкусы. Оптовые поставки от производителя в Санкт-Петербурге в кегах и ПЭТ-таре.`
      : `${category.description} Оптовые поставки от производителя «МЁДВЕДЬ» по Санкт-Петербургу и Ленинградской области.`,
    type: 'category',
    category,
  })),
  { path: '/proizvodstvo/', title: 'Производство «МЁДВЕДЬ» — традиционные рецептуры и современное оборудование', description: 'Как производят мид и сидр «МЁДВЕДЬ»: натуральное сырьё, брожение без добавления спирта и контроль качества на каждом этапе.', type: 'production' },
  { path: '/o-kompanii/', title: 'О компании «МЁДВЕДЬ» — петербургская традиция медоварения', description: 'История пиво-медоваренного завода «МЁДВЕДЬ»: традиции Ивана Дурдина, развитие компании, ассортимент и награды.', type: 'about' },
  { path: '/horeca/', title: 'HoReCa — мид, сидр и пуаре «МЁДВЕДЬ» для баров и ресторанов', description: 'Напитки «МЁДВЕДЬ» для баров и ресторанов: оптовые поставки в кегах и ПЭТ-таре по Санкт-Петербургу, Ленинградской области и через региональных дистрибьюторов.', type: 'horeca' },
  { path: '/kontakty/', title: 'Контакты пиво-медоваренного завода «МЁДВЕДЬ»', description: 'Адрес и контакты пиво-медоваренного завода «МЁДВЕДЬ» в Санкт-Петербурге. Телефон и почта отдела оптовых продаж.', type: 'contacts' },
  { path: '/politika-konfidencialnosti/', title: legalContent.privacy.title, description: '', type: 'legal', legalPage: legalContent.privacy },
  { path: '/disclaimer/', title: legalContent.disclaimer.title, description: '', type: 'legal', legalPage: legalContent.disclaimer },
]

export const pageRoutes = pages.map((page) => ({ ...page, canonicalUrl: new URL(page.path, origin).href }))
export const notFoundPage = { title: 'Страница не найдена', description: '', robots: 'noindex, follow' }

export function findPage(path) {
  const normalized = path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`
  return pageRoutes.find((page) => page.path === normalized) ?? null
}
