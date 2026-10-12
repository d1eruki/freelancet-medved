import meadImageUrl from '../assets/products/mead/mead-default-glass.png'
import ciderImageUrl from '../assets/products/cider/cider-default-glass.png'
import perryImageUrl from '../assets/products/perry/perry-default-glass.png'
import meadCardImageUrl from '../assets/products/mead/mead-category-glass.png'
import ciderCardImageUrl from '../assets/products/cider/cider-category-glass.png'
import perryCardImageUrl from '../assets/products/perry/perry-category-glass.png'
import meadHeroBackgroundUrl from '../assets/heroes/medovuha/poster-background.png'
import ciderHeroBackgroundUrl from '../assets/heroes/sidr/poster-background.png'
import perryHeroBackgroundUrl from '../assets/heroes/puare/poster-background.png'

export const catalogCategoryDefinitions = [
  {
    slug: 'medovuha',
    heroBackground: meadHeroBackgroundUrl,
    name: 'Медовуха',
    tagline: 'Фрукты, ягоды и пряности',
    description: 'Девять сортов медовухи: светлая и тёмная медовуха, фруктовые и ягодные вкусы.',
    heroDescription: ['Мягкий вкус, ', 'сочные фруктовые ноты ', 'и яркий аромат пряностей.'],
    introduction: 'В линейке — «Мэрион» Берри, манго, лесные ягоды, облепиха, слива, чёрная смородина, светлая, тёмная и вишнёвая медовуха.',
    image: meadImageUrl,
    cardImage: meadCardImageUrl,
    imageAlt: 'Бокал медовухи',
    products: [
      { id: 'light-mead' },
      { id: 'dark-mead' },
      { id: 'berry-mead' },
      { id: 'mango-mead' },
      { id: 'cranberry-mead', enabled: false },
      { id: 'forest-berries-mead' },
      { id: 'sea-buckthorn-mead' },
      { id: 'plum-mead' },
      { id: 'blackcurrant-mead' },
      { id: 'cherry-mead' },
    ],
  },
  {
    slug: 'sidr',
    heroBackground: ciderHeroBackgroundUrl,
    name: 'Сидр',
    tagline: 'Свежесть спелых яблок',
    description: 'Пять сортов сидра: сухой, полусухие и полусладкие.',
    heroDescription: ['Яблочная свежесть, ', 'приятная кислинка ', 'и выразительный фруктовый вкус.'],
    introduction: 'В линейке — «Хмеляр», «Вудсток», «Ветка Антоновки», вишневый и классический полусухой «Валентайн».',
    image: ciderImageUrl,
    cardImage: ciderCardImageUrl,
    imageAlt: 'Бокал яблочного сидра',
    products: [
      { id: 'hop-cider' },
      { id: 'woodstock-cider' },
      { id: 'valentine-cider' },
      { id: 'cherry-cider' },
      { id: 'antonovka-cider' },
    ],
  },
  {
    slug: 'puare',
    heroBackground: perryHeroBackgroundUrl,
    name: 'Пуаре',
    tagline: 'Тонкий вкус груши',
    description: 'Пуаре «Мистер Вильямс» из сока прямого отжима спелых груш.',
    heroDescription: ['Мягкий вкус спелой груши ', 'дополняют лёгкая свежесть ', 'и деликатная терпкость.'],
    introduction: 'Традиционный неосветлённый и нефильтрованный полусухой пуаре с нотами лемонграсса.',
    image: perryImageUrl,
    cardImage: perryCardImageUrl,
    imageAlt: 'Бокал грушевого пуаре',
    products: [
      { id: 'pear-perry' },
    ],
  },
]
