import { catalogCategories } from './catalog'
import { legalContent } from './legal-content'

const origin = 'https://medved.beer'

const pages = [
  { path: '/', title: '«МЁДВЕДЬ» Производитель мида, сидра и пуаре в Санкт-Петербурге', description: 'Слабоалкогольные напитки оптом от производителя в СПБ', type: 'home' },
  { path: '/katalog/', title: 'Каталог мида, сидра и пуаре «МЁДВЕДЬ»', description: 'Мид «МЁДВЕДЬ», яблочный сидр и грушевое пуаре от петербургского производителя. Выберите категорию и познакомьтесь с ассортиментом.', type: 'catalog' },
  ...catalogCategories.map((category) => ({
    path: `/katalog/${category.slug}/`,
    title: `${category.name} «МЁДВЕДЬ» — ассортимент`,
    description: category.description,
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
