import { sitePath } from '../utils/site-path'

export const navigation = [
  { label: 'Продукция', href: sitePath('/katalog/') },
  { label: 'Производство', href: sitePath('/proizvodstvo/') },
  { label: 'О компании', href: sitePath('/o-kompanii/') },
  { label: 'Где купить', href: sitePath('/partnery/') },
  { label: 'Контакты', href: sitePath('/kontakty/') },
]
