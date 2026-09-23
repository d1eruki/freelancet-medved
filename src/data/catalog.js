import meadImageUrl from '../assets/products/mead/mead-default-glass.png'
import pomegranateBerryMeadGlassImageUrl from '../assets/products/mead/marion-pomegranate-berry-glass.png'
import mangoMeadGlassImageUrl from '../assets/products/mead/marion-mango-glass.png'
import cranberryMeadGlassImageUrl from '../assets/products/mead/medved-cranberry-glass.png'
import forestBerriesMeadGlassImageUrl from '../assets/products/mead/medved-forest-berries-glass.png'
import seaBuckthornMeadGlassImageUrl from '../assets/products/mead/medved-sea-buckthorn-glass.png'
import plumMeadGlassImageUrl from '../assets/products/mead/medved-plum-glass.png'
import blackcurrantMeadGlassImageUrl from '../assets/products/mead/medved-blackcurrant-glass.png'
import ciderImageUrl from '../assets/products/cider/cider-default-glass.png'
import hopCiderGlassImageUrl from '../assets/products/cider/khmelyar-glass.png'
import woodstockCiderGlassImageUrl from '../assets/products/cider/woodstock-glass.png'
import blackcurrantCiderGlassImageUrl from '../assets/products/cider/marion-blackcurrant-berry-glass.png'
import berryCiderGlassImageUrl from '../assets/products/cider/marion-berry-glass.png'
import cherryCiderGlassImageUrl from '../assets/products/cider/cherry-glass.png'
import antonovkaCiderGlassImageUrl from '../assets/products/cider/antonovka-glass.png'
import perryImageUrl from '../assets/products/perry/perry-default-glass.png'
import pearPerryGlassImageUrl from '../assets/products/perry/mister-williams-glass.png'
import pearPerryLiterImageUrl from '../assets/products/perry/mister-williams-1l.png'
import cranberryMeadLiterImageUrl from '../assets/products/mead/medved-cranberry-1l.png'
import mangoMeadLiterImageUrl from '../assets/products/mead/marion-mango-1l.png'
import forestBerryMeadLiterImageUrl from '../assets/products/mead/medved-forest-berries-1l.png'
import seaBuckthornMeadLiterImageUrl from '../assets/products/mead/medved-sea-buckthorn-1l.png'
import plumMeadLiterImageUrl from '../assets/products/mead/medved-plum-1l.png'
import blackcurrantMeadLiterImageUrl from '../assets/products/mead/medved-blackcurrant-1l.png'
import cherryCiderBottleImageUrl from '../assets/products/cider/cherry-750ml.png'
import antonovkaCiderBottleImageUrl from '../assets/products/cider/antonovka-750ml.png'
import pearPerryBottleImageUrl from '../assets/products/perry/mister-williams-750ml.png'
import hopCiderSmallImageUrl from '../assets/products/cider/khmelyar-330ml.png'
import woodstockCiderSmallImageUrl from '../assets/products/cider/woodstock-330ml.png'
import pearPerrySmallImageUrl from '../assets/products/perry/mister-williams-330ml.png'
import pomegranateMeadSmallImageUrl from '../assets/products/mead/marion-pomegranate-berry-330ml.png'
import mangoMeadSmallImageUrl from '../assets/products/mead/marion-mango-330ml.png'
import blackcurrantCiderSmallImageUrl from '../assets/products/cider/marion-blackcurrant-berry-330ml.png'
import berryCiderSmallImageUrl from '../assets/products/cider/marion-berry-330ml.png'
import cherryCiderSmallImageUrl from '../assets/products/cider/cherry-330ml.png'
import antonovkaCiderSmallImageUrl from '../assets/products/cider/antonovka-330ml.png'
import hopCiderImageUrl from '../assets/products/cider/khmelyar-450ml.png'
import woodstockCiderImageUrl from '../assets/products/cider/woodstock-450ml.png'
import pearPerryImageUrl from '../assets/products/perry/mister-williams-450ml.png'
import pomegranateMeadImageUrl from '../assets/products/mead/marion-pomegranate-berry-450ml.png'
import mangoMeadImageUrl from '../assets/products/mead/marion-mango-450ml.png'
import blackcurrantCiderImageUrl from '../assets/products/cider/marion-blackcurrant-berry-450ml.png'
import berryCiderImageUrl from '../assets/products/cider/marion-berry-450ml.png'
import cherryCiderImageUrl from '../assets/products/cider/cherry-450ml.png'
import antonovkaCiderImageUrl from '../assets/products/cider/antonovka-450ml.png'

export const catalogCategories = [
  {
    slug: 'medovuha',
    name: 'Медовуха',
    tagline: 'Мёд, ягоды и пряности',
    description: 'Семь сортов медовухи с фруктами, ягодами и пряностями.',
    heroDescription: 'Мягкий вкус мёда дополняют сочные фруктовые ноты и яркий аромат.',
    introduction: 'В линейке — клюква, манго, лесные ягоды, облепиха, слива, чёрная смородина и ягодный купаж «Помэгрэнет энд берри».',
    image: meadImageUrl,
    imageAlt: 'Бокал медовухи',
    items: [
      {
        name: 'Медовуха «Мэрион» Помэгрэнет энд берри',
        details: 'нефильтрованная, неосветлённая',
        description: 'Богатый купаж соков граната, черники, малины и яблок. Яркий и многогранный ягодный вкус, поднимающий самооценку с первого глотка.',
        variants: [
          { volume: '30 л', image: pomegranateBerryMeadGlassImageUrl },
          { volume: '0,33 л', image: pomegranateMeadSmallImageUrl },
          { volume: '0,45 л', image: pomegranateMeadImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мэрион» Манго',
        details: 'нефильтрованная, неосветлённая',
        description: 'Натуральное пюре сочного манго и фруктовые соки в бархатистом исполнении. Тропический побег от серых будней, оформленный с безупречным вкусом и светским изяществом.',
        variants: [
          { volume: '30 л', image: mangoMeadGlassImageUrl },
          { volume: '0,33 л', image: mangoMeadSmallImageUrl },
          { volume: '0,45 л', image: mangoMeadImageUrl },
          { volume: '1 л', image: mangoMeadLiterImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мёдведь» Клюквенная',
        details: 'нефильтрованная, неосветлённая',
        description: 'Виртуозный баланс мягкого мёда и бодрящей клюквенной кислинки. Напиток с достоинством, который освежает мысли быстрее, чем новости, и идеально подходит на роль аперитива.',
        variants: [
          { volume: '30 л', image: cranberryMeadGlassImageUrl },
          { volume: '1 л', image: cranberryMeadLiterImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мёдведь» с лесными ягодами',
        details: 'нефильтрованная, неосветлённая',
        description: 'Гармоничный союз медовой сладости и лесной кислинки. Лечит от скуки эффективнее психотерапевта и безупречно сочетается с сырной тарелкой или хорошей компанией.',
        variants: [
          { volume: '30 л', image: forestBerriesMeadGlassImageUrl },
          { volume: '1 л', image: forestBerryMeadLiterImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мёдведь» Облепиховая',
        details: 'нефильтрованная, неосветлённая',
        description: 'Самобытный напиток со вкусом спелой облепихи и мягким медовым акцентом. Солнце в бокале с аристократическим выдержанным характером.',
        variants: [
          { volume: '30 л', image: seaBuckthornMeadGlassImageUrl },
          { volume: '1 л', image: seaBuckthornMeadLiterImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мёдведь» Сливовая',
        details: 'нефильтрованная, неосветлённая',
        description: 'Мягкий округлый вкус садовых слив с приятной кислинкой и благородным финишем. Солидный выбор для тех, кто понимает толк в десертах и хорошем отдыхе.',
        variants: [
          { volume: '30 л', image: plumMeadGlassImageUrl },
          { volume: '1 л', image: plumMeadLiterImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мёдведь» Черносмородиновая',
        details: 'нефильтрованная, неосветлённая',
        description: 'Натуральный мёд, сок чёрной смородины и секретные пряные травы. Насыщенный букет с мягкой терпкостью, способный создать атмосферу уединённого загородного поместья.',
        variants: [
          { volume: '30 л', image: blackcurrantMeadGlassImageUrl },
          { volume: '1 л', image: blackcurrantMeadLiterImageUrl },
        ],
      },
    ],
  },
  {
    slug: 'sidr',
    name: 'Сидр',
    tagline: 'Свежесть спелых яблок',
    description: 'Шесть сортов сидра: сухой, полусухой, полусладкие и сладкий.',
    heroDescription: 'Яблочная свежесть, приятная кислинка и выразительный фруктовый вкус.',
    introduction: 'В линейке — «Хмеляр», «Вудсток», «Антоновка», вишневый и два ягодных сорта «Мэрион».',
    image: ciderImageUrl,
    imageAlt: 'Бокал яблочного сидра',
    items: [
      {
        name: 'Сидр «Хмеляр»',
        details: 'негазированный, нефильтрованный, полусладкий',
        description: 'Нефильтрованный сидр с тонкой хмелевой горчинкой. Сложный и глубокий букет для тех, кто любит с умным видом вести беседы об органолептике.',
        variants: [
          { volume: '30 л', image: hopCiderGlassImageUrl },
          { volume: '0,33 л', image: hopCiderSmallImageUrl },
          { volume: '0,45 л', image: hopCiderImageUrl },
        ],
      },
      {
        name: 'Сидр «Вудсток»',
        details: 'негазированный, нефильтрованный, сухой',
        description: 'Традиционный сухой непастеризованный сидр из сока прямого отжима. Бескомпромиссная честная сухая терпкость для истинных ценителей классики.',
        variants: [
          { volume: '30 л', image: woodstockCiderGlassImageUrl },
          { volume: '0,33 л', image: woodstockCiderSmallImageUrl },
          { volume: '0,45 л', image: woodstockCiderImageUrl },
        ],
      },
      {
        name: 'Сидр «Мэрион» Блэккорант энд берри',
        details: 'негазированный, полусладкий',
        description: 'Сок прямого отжима с черной смородиной, черникой и малиной. Бархатистый ягодный сидр, которому не стыдно признаться в любви в публичном месте.',
        variants: [
          { volume: '30 л', image: blackcurrantCiderGlassImageUrl },
          { volume: '0,33 л', image: blackcurrantCiderSmallImageUrl },
          { volume: '0,45 л', image: blackcurrantCiderImageUrl },
        ],
      },
      {
        name: 'Сидр «Мэрион» Берри',
        details: 'негазированный, полусладкий',
        description: 'Ягодный сочный сидр с идеальным балансом умеренной сладости и кислинки. Способен украсить любой вечер, даже если из гостей только вы и ваш кот.',
        variants: [
          { volume: '30 л', image: berryCiderGlassImageUrl },
          { volume: '0,33 л', image: berryCiderSmallImageUrl },
          { volume: '0,45 л', image: berryCiderImageUrl },
        ],
      },
      {
        name: 'Сидр Вишневый',
        details: 'жемчужный, газированный, полусладкий',
        description: 'Яблочный сок прямого отжима и натуральная вишня с тонами благородной терпкости. Идеальная альтернатива сухим винам для тех, кто сегодня настроен чуть более игриво.',
        variants: [
          { volume: '30 л', image: cherryCiderGlassImageUrl },
          { volume: '0,33 л', image: cherryCiderSmallImageUrl },
          { volume: '0,45 л', image: cherryCiderImageUrl },
          { volume: '0,75 л', image: cherryCiderBottleImageUrl, details: 'жемчужный, полусладкий' },
        ],
      },
      {
        name: 'Сидр «Антоновка»',
        details: 'жемчужный, газированный, полусухой',
        description: 'Игристый полусухой сидр с легендарной яблочной кислинкой. Заряжает бодростью и аристократическим оптимизмом лучше любого утреннего кофе.',
        variants: [
          { volume: '30 л', image: antonovkaCiderGlassImageUrl },
          { volume: '0,33 л', image: antonovkaCiderSmallImageUrl },
          { volume: '0,45 л', image: antonovkaCiderImageUrl },
          { volume: '0,75 л', image: antonovkaCiderBottleImageUrl, details: 'жемчужный, полусухой' },
        ],
      },
    ],
  },
  {
    slug: 'puare',
    name: 'Пуаре',
    tagline: 'Тонкий вкус груши',
    description: 'Пуаре «Мистер Вильямс» из сока прямого отжима спелых груш.',
    heroDescription: 'Мягкий вкус спелой груши дополняют лёгкая свежесть и деликатная терпкость.',
    introduction: 'Традиционный неосветлённый и нефильтрованный полусухой пуаре с нотами лемонграсса.',
    image: perryImageUrl,
    imageAlt: 'Бокал грушевого пуаре',
    items: [
      {
        name: 'Пуаре «Мистер Вильямс»',
        details: 'традиционный, неосветлённый, нефильтрованный, полусухой',
        description: 'Изготовлен из сока прямого отжима спелых груш с легким реверансом в сторону лемонграсса. Настолько утонченный пуаре с благородными танинами, что рука сама тянется отставить мизинец при бокале.',
        variants: [
          { volume: '30 л', image: pearPerryGlassImageUrl },
          { volume: '0,33 л', image: pearPerrySmallImageUrl },
          { volume: '0,45 л', image: pearPerryImageUrl },
          { volume: '0,75 л', image: pearPerryBottleImageUrl },
          { volume: '1 л', image: pearPerryLiterImageUrl },
        ],
      },
    ],
  },
]
