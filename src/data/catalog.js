import meadImageUrl from '../assets/mead-glass-cutout.png'
import ciderImageUrl from '../assets/cider-glass-cutout.png'
import perryImageUrl from '../assets/perry-glass-cutout.png'
import pearPerryLiterImageUrl from '../assets/sorts/image 1.png'
import cranberryMeadLiterImageUrl from '../assets/sorts/image 2.png'
import mangoMeadLiterImageUrl from '../assets/sorts/image 3.png'
import forestBerryMeadLiterImageUrl from '../assets/sorts/image 4.png'
import seaBuckthornMeadLiterImageUrl from '../assets/sorts/image 5.png'
import plumMeadLiterImageUrl from '../assets/sorts/image 6.png'
import blackcurrantMeadLiterImageUrl from '../assets/sorts/image 7.png'
import cherryCiderBottleImageUrl from '../assets/sorts/image 8.png'
import antonovkaCiderBottleImageUrl from '../assets/sorts/image 9.png'
import pearPerryBottleImageUrl from '../assets/sorts/image 10.png'
import hopCiderSmallImageUrl from '../assets/sorts/image 11.png'
import woodstockCiderSmallImageUrl from '../assets/sorts/image 12.png'
import pearPerrySmallImageUrl from '../assets/sorts/image 13.png'
import pomegranateMeadSmallImageUrl from '../assets/sorts/image 14.png'
import mangoMeadSmallImageUrl from '../assets/sorts/image 15.png'
import blackcurrantCiderSmallImageUrl from '../assets/sorts/image 16.png'
import berryCiderSmallImageUrl from '../assets/sorts/image 17.png'
import cherryCiderSmallImageUrl from '../assets/sorts/image 18.png'
import antonovkaCiderSmallImageUrl from '../assets/sorts/image 19.png'
import hopCiderImageUrl from '../assets/sorts/image 20.png'
import woodstockCiderImageUrl from '../assets/sorts/image 21.png'
import pearPerryImageUrl from '../assets/sorts/image 22.png'
import pomegranateMeadImageUrl from '../assets/sorts/image 23.png'
import mangoMeadImageUrl from '../assets/sorts/image 24.png'
import blackcurrantCiderImageUrl from '../assets/sorts/image 25.png'
import berryCiderImageUrl from '../assets/sorts/image 26.png'
import cherryCiderImageUrl from '../assets/sorts/image 27.png'
import antonovkaCiderImageUrl from '../assets/sorts/image 28.png'

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
          { volume: '0,33 л', image: pomegranateMeadSmallImageUrl },
          { volume: '0,45 л', image: pomegranateMeadImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мэрион» Манго',
        details: 'нефильтрованная, неосветлённая',
        description: 'Натуральное пюре сочного манго и фруктовые соки в бархатистом исполнении. Тропический побег от серых будней, оформленный с безупречным вкусом и светским изяществом.',
        variants: [
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
          { volume: '1 л', image: cranberryMeadLiterImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мёдведь» с лесными ягодами',
        details: 'нефильтрованная, неосветлённая',
        description: 'Гармоничный союз медовой сладости и лесной кислинки. Лечит от скуки эффективнее психотерапевта и безупречно сочетается с сырной тарелкой или хорошей компанией.',
        variants: [
          { volume: '1 л', image: forestBerryMeadLiterImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мёдведь» Облепиховая',
        details: 'нефильтрованная, неосветлённая',
        description: 'Самобытный напиток со вкусом спелой облепихи и мягким медовым акцентом. Солнце в бокале с аристократическим выдержанным характером.',
        variants: [
          { volume: '1 л', image: seaBuckthornMeadLiterImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мёдведь» Сливовая',
        details: 'нефильтрованная, неосветлённая',
        description: 'Мягкий округлый вкус садовых слив с приятной кислинкой и благородным финишем. Солидный выбор для тех, кто понимает толк в десертах и хорошем отдыхе.',
        variants: [
          { volume: '1 л', image: plumMeadLiterImageUrl },
        ],
      },
      {
        name: 'Медовуха «Мёдведь» Черносмородиновая',
        details: 'нефильтрованная, неосветлённая',
        description: 'Натуральный мёд, сок чёрной смородины и секретные пряные травы. Насыщенный букет с мягкой терпкостью, способный создать атмосферу уединённого загородного поместья.',
        variants: [
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
          { volume: '0,33 л', image: hopCiderSmallImageUrl },
          { volume: '0,45 л', image: hopCiderImageUrl },
        ],
      },
      {
        name: 'Сидр «Вудсток»',
        details: 'негазированный, нефильтрованный, сухой',
        description: 'Традиционный сухой непастеризованный сидр из сока прямого отжима. Бескомпромиссная честная сухая терпкость для истинных ценителей классики.',
        variants: [
          { volume: '0,33 л', image: woodstockCiderSmallImageUrl },
          { volume: '0,45 л', image: woodstockCiderImageUrl },
        ],
      },
      {
        name: 'Сидр «Мэрион» Блэккорант энд берри',
        details: 'негазированный, полусладкий',
        description: 'Сок прямого отжима с черной смородиной, черникой и малиной. Бархатистый ягодный сидр, которому не стыдно признаться в любви в публичном месте.',
        variants: [
          { volume: '0,33 л', image: blackcurrantCiderSmallImageUrl },
          { volume: '0,45 л', image: blackcurrantCiderImageUrl },
        ],
      },
      {
        name: 'Сидр «Мэрион» Берри',
        details: 'негазированный, полусладкий',
        description: 'Ягодный сочный сидр с идеальным балансом умеренной сладости и кислинки. Способен украсить любой вечер, даже если из гостей только вы и ваш кот.',
        variants: [
          { volume: '0,33 л', image: berryCiderSmallImageUrl },
          { volume: '0,45 л', image: berryCiderImageUrl },
        ],
      },
      {
        name: 'Сидр Вишневый',
        details: 'жемчужный, газированный, полусладкий',
        description: 'Яблочный сок прямого отжима и натуральная вишня с тонами благородной терпкости. Идеальная альтернатива сухим винам для тех, кто сегодня настроен чуть более игриво.',
        variants: [
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
    heroDescription: 'Вкус спелой груши с тонкой свежестью и деликатной терпкостью.',
    introduction: 'Традиционный неосветлённый и нефильтрованный полусухой пуаре с нотами лемонграсса.',
    image: perryImageUrl,
    imageAlt: 'Бокал грушевого пуаре',
    items: [
      {
        name: 'Пуаре «Мистер Вильямс»',
        details: 'традиционный, неосветлённый, нефильтрованный, полусухой',
        description: 'Изготовлен из сока прямого отжима спелых груш с легким реверансом в сторону лемонграсса. Настолько утонченный пуаре с благородными танинами, что рука сама тянется отставить мизинец при бокале.',
        variants: [
          { volume: '0,33 л', image: pearPerrySmallImageUrl },
          { volume: '0,45 л', image: pearPerryImageUrl },
          { volume: '0,75 л', image: pearPerryBottleImageUrl },
          { volume: '1 л', image: pearPerryLiterImageUrl },
        ],
      },
    ],
  },
]
