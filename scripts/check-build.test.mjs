import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import Typograf from 'typograf'
import { preventHangingPrepositions } from '../src/directives/typography.js'
import { contacts } from '../src/data/contacts.js'
import { metrikaCounterId } from '../src/utils/metrika.js'
import { runInNewContext } from 'node:vm'
import { getSiteVariant } from '../src/data/site-variants.js'
import { resolveProductRender } from '../src/data/product-render-settings.js'
import { heroLayerMedia } from '../src/utils/hero-layer-layout.js'

const output = path.resolve('dist')
const buildInfo = JSON.parse(await readFile(path.join(output, 'site-variant.json'), 'utf8'))
const variant = getSiteVariant(process.env.SITE_VARIANT || buildInfo.variant)
assert.equal(buildInfo.variant, variant.name, 'Tests must use the built variant')
const staging = process.env.SITE_ENV === 'staging'
const origin = 'https://medved.beer'
const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
const manifest = JSON.parse(await readFile(path.join(output, '.vite', 'manifest.json'), 'utf8'))
const entry = Object.keys(manifest).find((id) => manifest[id].isEntry)
assert.ok(entry, 'missing client entry')
const homeHtml = await readFile(path.join(output, 'index.html'), 'utf8')
const entryUrl = [...homeHtml.matchAll(/<script\b[^>]*src="([^"]+)"/g)]
  .map((match) => match[1]).find((url) => url.endsWith(manifest[entry].file))
assert.ok(entryUrl, 'missing client script in HTML')
const basePath = entryUrl.slice(0, -manifest[entry].file.length).replace(/\/$/, '')

test('hero image media queries follow the existing visibility settings', () => {
  assert.equal(heroLayerMedia(null, 'background'), '')
  assert.equal(heroLayerMedia({ mobile: { middle: { enabled: false } }, tablet: { middle: { enabled: true } } }, 'middle'), '(40rem <= width < 80rem), (width >= 80rem)')
  assert.equal(heroLayerMedia({ mobile: { middle: { enabled: false } } }, 'middle'), 'not all')
})

test('server HTML keeps critical sources and defers lower production images', async () => {
  const html = await readFile(path.join(output, 'proizvodstvo/index.html'), 'utf8')
  assert.match(html, /<img\b[^>]*src="[^"]*production-photo[^"]*"[^>]*loading="eager"/)
  const stepImages = [...html.matchAll(/<img\b[^>]*data-src="([^"]*production-brewing[^"]*)"[^>]*>/g)]
  assert.equal(stepImages.length, 1)
  assert.doesNotMatch(stepImages[0][0], /(?:\s)src=/)
  assert.ok(homeHtml.includes('loading="eager"'))
})

function collectChunks(id, collected = new Set()) {
  if (collected.has(id)) return collected
  assert.ok(manifest[id], `missing manifest entry: ${id}`)
  collected.add(id)
  for (const dependency of manifest[id].imports || []) collectChunks(dependency, collected)
  return collected
}

test('text formatting preserves the two enabled typography rules', () => {
  Typograf.addRule({
    name: 'common/nbsp/nonBreakingHyphenatedWord',
    handler: text => text.replace(/([0-9A-Za-zА-Яа-яЁё])-(?=[0-9A-Za-zА-Яа-яЁё])/g, '$1‑'),
  })
  const reference = new Typograf({ locale: ['ru'] })
  reference.disableRule('*')
  reference.enableRule('common/nbsp/afterShortWordByList')
  reference.enableRule('common/nbsp/nonBreakingHyphenatedWord')
  const samples = [
    'В Санкт-Петербурге с 2006 года',
    'И в городе, и за городом',
    '«О компании» и «О нас»',
    '(Для партнёров) — по всей России',
    'Для   партнёров и\nдля клиентов',
    'На\u00a0сайте уже есть неразрывные пробелы',
    'Пиво-медоваренный завод, 0.45-л, A-B-C и 12-34',
    'https://medved.beer/sankt-peterburg/ и http://example.com/a-b?q=c-d',
    'МЁДВЕДЬ — работает для вас',
    '',
  ]
  for (const sample of samples) {
    const expected = reference.execute(sample)
    assert.equal(preventHangingPrepositions(sample), expected, sample)
    assert.equal(preventHangingPrepositions(expected), expected, `Repeated formatting: ${sample}`)
  }
})

test('page code is separate from the shared client entry', () => {
  const initialChunks = collectChunks(entry)
  const pageChunks = Object.keys(manifest).filter((id) => /Page\.vue$/.test(id))
  assert.ok(pageChunks.length > 1, 'pages were bundled together')
  for (const id of pageChunks) {
    assert.ok(manifest[id].isDynamicEntry, `${id} is not loaded dynamically`)
    assert.ok(!initialChunks.has(id), `${id} is loaded on every page`)
  }
})

test('catalog details and legal text are excluded from the shared client entry', async () => {
  const initialChunks = collectChunks(entry)
  for (const id of ['src/data/catalog.js', 'src/data/legal-content.js']) {
    assert.ok(manifest[id]?.isDynamicEntry, `${id} must be loaded on demand`)
    assert.ok(!initialChunks.has(id), `${id} must not load on every page`)
  }
  const initialCode = (await Promise.all([...initialChunks].map((id) =>
    readFile(path.join(output, manifest[id].file), 'utf8')))).join('\n')
  assert.doesNotMatch(initialCode, /Светлая медовуха с мягкой медовой сладостью/)
  assert.doesNotMatch(initialCode, /Настоящая Политика конфиденциальности персональных данных/)
})

test('each HTML preloads only its page and includes all required scripts and styles', async () => {
  const pageChunks = Object.keys(manifest).filter((id) => /Page\.vue$/.test(id))
  for (const url of [...urls, `${origin}/404.html`]) {
    const pathname = new URL(url).pathname
    const filePath = pathname === '/404.html' ? '404.html' : `${pathname.slice(1)}index.html`
    const html = await readFile(path.join(output, filePath), 'utf8')
    const preloads = [...html.matchAll(/<link\b[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)].map((match) => match[1])
    const selected = pageChunks.filter((id) => preloads.includes(`${basePath}/${manifest[id].file}`))
    assert.equal(selected.length, 1, `${url} must preload exactly one page component`)

    for (const id of collectChunks(selected[0])) {
      const chunk = manifest[id]
      const assetUrl = `${basePath}/${chunk.file}`
      assert.ok(preloads.includes(assetUrl) || html.includes(`src="${assetUrl}"`), `${url} -> ${assetUrl}`)
      for (const css of chunk.css || []) {
        assert.ok(html.includes(`rel="stylesheet" crossorigin href="${basePath}/${css}"`), `${url} -> ${css}`)
      }
    }
  }
})

test('every published URL has its own HTML and metadata', async () => {
  assert.equal(urls.length, 11)
  assert.equal(new Set(urls).size, urls.length)
  assert.ok(urls.includes(`${origin}/horeca/`))

  for (const url of urls) {
    const pathname = new URL(url).pathname
    const html = await readFile(path.join(output, pathname.slice(1), 'index.html'), 'utf8')
    assert.match(html, /<main>[\s\S]*?<h1\b[^>]*>[\s\S]*?<\/h1>/, url)
    assert.match(html, /<title>[^<]+<\/title>/, url)
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), url)
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`), url)
    assert.ok(html.includes(`<meta name="robots" content="${staging ? 'noindex, nofollow' : 'index, follow'}">`), url)
    assert.ok(!html.includes('file://'), url)
    assert.ok(!html.includes('/src/assets/'), url)
  }
})

test('Metrika is included only in production and initializes only on the canonical host', async () => {
  for (const url of [...urls, `${origin}/404.html`]) {
    const file = url.endsWith('/404.html') ? '404.html' : `${new URL(url).pathname.slice(1)}index.html`
    const html = await readFile(path.join(output, file), 'utf8')
    const scripts = [...html.matchAll(/<script type="text\/javascript">([\s\S]*?)<\/script>/g)]
      .filter((match) => match[1].includes('mc.yandex.ru/metrika/tag.js'))
    const pixels = [...html.matchAll(/<noscript>[\s\S]*?<img src="https:\/\/mc\.yandex\.ru\/watch\/(\d+)"[\s\S]*?<\/noscript>/g)]
    if (staging) {
      assert.equal(scripts.length, 0, url)
      assert.equal(pixels.length, 0, url)
      continue
    }
    assert.equal(scripts.length, 1, url)
    assert.equal(pixels.length, 1, url)
    assert.ok(scripts[0].index < html.indexOf('</head>'), url)
    assert.ok(pixels[0].index > html.indexOf('<body>'), url)
    assert.equal(Number(pixels[0][1]), metrikaCounterId)
    for (const hostname of ['medved.beer', 'test.medved.beer', 'localhost', '127.0.0.1']) {
      const inserted = []
      const window = {}
      const context = {
        window,
        location: { hostname, href: `https://${hostname}/kontakty/` },
        document: {
          referrer: '',
          scripts: [],
          createElement: () => ({}),
          getElementsByTagName: () => [{ parentNode: { insertBefore: (script) => inserted.push(script) } }],
        },
      }
      Object.defineProperty(context, 'ym', { get: () => window.ym })
      runInNewContext(scripts[0][1], context)
      if (hostname !== 'medved.beer') {
        assert.equal(inserted.length, 0, hostname)
        assert.equal(window.ym, undefined, hostname)
        continue
      }
      assert.equal(inserted.length, 1)
      assert.equal(inserted[0].src, `https://mc.yandex.ru/metrika/tag.js?id=${metrikaCounterId}`)
      assert.equal(inserted[0].async, 1)
      const [id, method, settings] = window.ym.a[0]
      assert.equal(id, metrikaCounterId)
      assert.equal(method, 'init')
      assert.equal(settings.webvisor, true)
      assert.equal(settings.clickmap, true)
      assert.equal(settings.trackLinks, true)
      assert.equal(settings.accurateTrackBounce, true)
      assert.equal(settings.url, context.location.href)
    }
  }
})

test('structured data describes the organization and only the products on each category page', async () => {
  const categoriesSource = await readFile(new URL('../src/data/catalog-categories.js', import.meta.url), 'utf8')
  const categories = runInNewContext(categoriesSource
    .replace(/^import (\w+) from '([^']+)'$/gm, (_, name, image) => `const ${name} = ${JSON.stringify(image)}`)
    .replace(/export const /g, 'const ') + '; catalogCategoryDefinitions')
  const catalogSource = await readFile(new URL('../src/data/catalog.js', import.meta.url), 'utf8')
  // В Node пути картинок подставляются строками; состав каталога остаётся исходным.
  const catalog = runInNewContext(catalogSource
    .replace(/^import \{ catalogCategoryDefinitions \}.*$/m, '')
    .replace(/^import (\w+) from '([^']+)'$/gm, (_, name, image) => `const ${name} = ${JSON.stringify(image)}`)
    .replace(/^export (?=(?:const|function)\b)/gm, '') + '; catalogCategories', { catalogCategoryDefinitions: categories })
  const categoryPaths = urls.filter((url) => /^\/katalog\/[^/]+\/$/.test(new URL(url).pathname))
  for (const url of urls) {
    const html = await readFile(path.join(output, new URL(url).pathname.slice(1), 'index.html'), 'utf8')
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    assert.equal(scripts.length, 1, url)
    assert.ok(scripts[0].index < html.indexOf('</head>'), url)
    const data = JSON.parse(scripts[0][1])
    assert.equal(data['@context'], 'https://schema.org')
    const [organization, list] = data['@graph']
    assert.equal(organization['@type'], 'Organization')
    assert.equal(organization['@id'], `${origin}/#organization`)
    assert.equal(organization.address, contacts.address)
    assert.equal(organization.telephone, contacts.general.phone)
    assert.equal(organization.email, contacts.general.email)
    assert.ok(html.includes(organization.email), url)
    const images = [organization.logo]

    if (categoryPaths.includes(url)) {
      assert.equal(list['@type'], 'ItemList')
      assert.equal(list.numberOfItems, list.itemListElement.length)
      const category = catalog.find((entry) => new URL(url).pathname.endsWith(`/katalog/${entry.slug}/`))
      assert.ok(category, url)
      const catalogVariants = category.items.flatMap((item) => item.variants.map((variant) => ({
        name: `${item.name}, ${variant.volume}`,
        image: variant.image,
      })))
      assert.equal(list.numberOfItems, catalogVariants.length, url)
      // Мобильная и десктопная разметка повторяют карточки: считаем уникальные варианты.
      const groups = [...html.matchAll(/role="group" aria-label="Выбор объёма: ([^"]+)"[^>]*>([\s\S]*?)<\/div>/g)]
      const variants = new Map(groups.flatMap(([, name, buttons]) => [...buttons.matchAll(/aria-label="Показать объём ([^"]+)"/g)]
        .map(([, volume]) => [`${name}, ${volume}`, volume])))
      assert.ok(variants.size > 0, url)
      assert.equal(list.numberOfItems, variants.size, url)
      const ids = new Set()
      for (const [index, entry] of list.itemListElement.entries()) {
        const product = entry.item
        assert.equal(entry.position, index + 1)
        assert.equal(product['@type'], 'Product')
        assert.equal(product.url, url)
        assert.equal(product.manufacturer['@id'], organization['@id'])
        assert.ok(variants.has(product.name), product.name)
        assert.equal(product.size, variants.get(product.name))
        assert.equal(product.name, catalogVariants[index].name)
        assert.ok(product.description && !product.description.includes('undefined'))
        assert.ok(!ids.has(product['@id']), url)
        ids.add(product['@id'])
        assert.equal(product.offers, undefined)
        assert.equal(product.aggregateRating, undefined)
        if (catalogVariants[index].image) {
          assert.equal(typeof product.image, 'string', product.name)
          images.push(product.image)
        } else {
          assert.ok(!Object.hasOwn(product, 'image'), product.name)
        }
      }
    } else {
      assert.equal(list, undefined, url)
    }

    for (const image of images) {
      const target = new URL(image)
      assert.equal(target.origin, origin)
      assert.ok(target.pathname.startsWith(`${basePath}/assets/`), image)
      const file = target.pathname.slice(basePath.length + 1)
      assert.ok((await stat(path.join(output, file))).isFile(), image)
    }
  }

  const notFoundHtml = await readFile(path.join(output, '404.html'), 'utf8')
  assert.doesNotMatch(notFoundHtml, /application\/ld\+json/)
})

test('catalog metadata includes wholesale supply and the city', async () => {
  for (const url of urls.filter((url) => new URL(url).pathname.startsWith('/katalog/'))) {
    const html = await readFile(path.join(output, new URL(url).pathname.slice(1), 'index.html'), 'utf8')
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
    const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1]
    assert.match(title, /оптом/)
    assert.match(title, /Санкт-Петербурге/)
    assert.match(description, /Оптовые поставки/)
    assert.match(description, /производител/)
    assert.match(description, /Санкт-Петербург/)
  }
})

test('internal links in published HTML resolve to a page or file', async () => {
  const publishedPaths = new Set(urls.map((url) => new URL(url).pathname))

  for (const url of urls) {
    const html = await readFile(path.join(output, new URL(url).pathname.slice(1), 'index.html'), 'utf8')
    for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue
      const target = new URL(href.replaceAll('&amp;', '&'), origin)
      if (target.origin !== origin) continue
      const pathname = basePath && target.pathname.startsWith(`${basePath}/`)
        ? target.pathname.slice(basePath.length)
        : target.pathname
      if (publishedPaths.has(pathname)) continue
      const targetPath = path.join(output, pathname.slice(1))
      assert.ok((await stat(targetPath).catch(() => null))?.isFile(), `${url} -> ${href}`)
    }
  }
})

test('temporarily hidden page is absent from output and blocked before existing files', async () => {
  assert.ok(!urls.includes(`${origin}/partnery/`))
  assert.equal(await stat(path.join(output, 'partnery')).catch(() => null), null)
  const config = await readFile(path.join(output, '.htaccess'), 'utf8')
  const hiddenRule = config.match(/^RewriteRule (\^partnery[^\s]*) - \[R=404,L\]$/m)
  assert.ok(hiddenRule, 'missing hidden page rule')
  assert.ok(hiddenRule.index < config.indexOf('RewriteCond %{REQUEST_FILENAME} -f'))
  const hiddenPattern = new RegExp(hiddenRule[1])
  for (const route of ['partnery', 'partnery/', 'partnery/index.html']) {
    assert.ok(hiddenPattern.test(route), route)
  }
  for (const url of urls) {
    const html = await readFile(path.join(output, new URL(url).pathname.slice(1), 'index.html'), 'utf8')
    assert.doesNotMatch(html, /href="[^"]*\/partnery(?:\/|["?#])/)
  }
  assert.doesNotMatch(await readFile(path.join(output, 'llms.txt'), 'utf8'), /partnery/)
})

test('published pages match the documented structure', async () => {
  const structure = await readFile('docs/site-structure.md', 'utf8')
  const documentedPaths = new Set([...structure.matchAll(/`(\/(?:[^`]+\/)?)`/g)].map((match) => match[1]))
  const publishedPaths = urls.map((url) => new URL(url).pathname)
  assert.deepEqual([...documentedPaths].sort(), [...publishedPaths].sort())
})

test('unknown URLs use a non-indexable 404 page', async () => {
  const html = await readFile(path.join(output, '404.html'), 'utf8')
  const config = await readFile(path.join(output, '.htaccess'), 'utf8')

  assert.match(html, /<main>[\s\S]*?<h1\b[^>]*>[\s\S]*?404[\s\S]*?<\/h1>/)
  assert.ok(html.includes(`<meta name="robots" content="${staging ? 'noindex, nofollow' : 'noindex, follow'}">`))
  assert.doesNotMatch(html, /<link rel="canonical"/)
  assert.doesNotMatch(html, /<meta property="og:url"/)
  assert.ok(!urls.some((url) => new URL(url).pathname === '/404.html'))
  assert.match(config, /^ErrorDocument 404 \/404\.html$/m)
  assert.doesNotMatch(config, /@active-route-/)
  assert.match(config, /^RewriteRule \^ - \[R=404,L\]$/m)
})

test('Apache route rules cover every published page', async () => {
  const config = await readFile(path.join(output, '.htaccess'), 'utf8')
  const rule = config.match(/^RewriteRule (\^\(\?:[^\n]+) index\.html \[L\]$/m)
  assert.ok(rule, 'missing generated route rewrite rule')
  const routePattern = new RegExp(rule[1])

  for (const url of urls) {
    const route = new URL(url).pathname.slice(1)
    if (!route) continue
    assert.ok(routePattern.test(route), `Apache cannot serve ${url}`)
  }
  assert.ok(!routePattern.test('missing-page/'))
})

test('HTML revalidates its cache without changing asset or API caching', async () => {
  const config = await readFile(path.join(output, '.htaccess'), 'utf8')
  const blocks = [...config.matchAll(/<FilesMatch "([^"]+)">([\s\S]*?)<\/FilesMatch>/g)]
    .filter((match) => /Header\s+always\s+set\s+Cache-Control\s+"no-cache"/.test(match[2]))
  assert.equal(blocks.length, 1, 'expected one scoped HTML cache rule')
  const [block, pattern] = blocks[0]
  assert.doesNotMatch(config.replace(block, ''), /^\s*Header\s+.*Cache-Control/gm, 'cache rule must stay scoped')
  const matchesFile = new RegExp(pattern)
  const files = await readdir(output, { recursive: true })
  const htmlFiles = files.filter(file => file.endsWith('.html'))
  assert.ok(htmlFiles.includes('index.html'))
  assert.ok(htmlFiles.includes('404.html'))
  for (const file of htmlFiles) assert.ok(matchesFile.test(path.basename(file)), file)
  for (const file of files.filter(file => !file.endsWith('.html'))) {
    assert.ok(!matchesFile.test(path.basename(file)), `HTML cache rule must not affect ${file}`)
  }
})

test('deployment environment preserves redirects and indexing policy', async () => {
  const config = await readFile(path.join(output, '.htaccess'), 'utf8')
  const robots = await readFile(path.join(output, 'robots.txt'), 'utf8')
  const redirects = [...config.matchAll(/^RewriteRule\s+\S+\s+(\S+)\s+\[[^\]]*R=301[^\]]*\]$/gm)]
    .map((match) => match[1])
  assert.ok(redirects.length > 0)
  if (staging) {
    assert.match(config, /^DirectoryIndex index\.html$/m)
    assert.match(config, /^Header always set X-Robots-Tag "noindex, nofollow"$/m)
    const stagingOrigin = new URL(origin)
    stagingOrigin.hostname = `test.${stagingOrigin.hostname}`
    assert.ok(redirects.every((target) => target.startsWith(`${stagingOrigin.origin}/`)))
    assert.doesNotMatch(robots, /Sitemap:/)
    assert.doesNotMatch(robots, /^Disallow:\s*\/$/m)
  } else {
    assert.doesNotMatch(config, /X-Robots-Tag/)
    assert.ok(redirects.every((target) => target.startsWith(`${origin}/`) || target === `${origin}%{REQUEST_URI}`))
    assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`))
  }
})

test('image and script URLs resolve, raster output uses WebP/AVIF and srcset widths match the built images', async () => {
  for (const file of await readdir(output, { recursive: true })) {
    assert.doesNotMatch(file, /\.(?:png|jpe?g)$/i, `Raster output must use WebP/AVIF: ${file}`)
  }
  const imageWidths = new Map()
  for (const url of [...urls, `${origin}/404.html`]) {
    const filePath = url.endsWith('/404.html')
      ? path.join(output, '404.html')
      : path.join(output, new URL(url).pathname.slice(1), 'index.html')
    const html = await readFile(filePath, 'utf8')
    for (const [, attribute, value] of html.matchAll(/\b(src|srcset)="([^"]+)"/g)) {
      const candidates = attribute === 'srcset' ? value.split(',') : [value]
      for (const candidate of candidates) {
        const [asset, descriptor] = candidate.trim().split(/\s+/)
        const target = new URL(asset, origin)
        if (target.origin !== origin) continue
        const pathname = basePath && target.pathname.startsWith(`${basePath}/`)
          ? target.pathname.slice(basePath.length)
          : target.pathname
        const file = path.join(output, pathname.slice(1))
        assert.ok((await stat(file).catch(() => null))?.isFile(), `${url} -> ${asset}`)
        if (attribute === 'srcset' && /^\d+w$/.test(descriptor)) {
          if (!imageWidths.has(file)) imageWidths.set(file, (await sharp(file).metadata()).width)
          assert.equal(imageWidths.get(file), Number.parseInt(descriptor, 10), `${url} -> ${asset}: ${descriptor}`)
        }
      }
    }
  }
})

test('responsive images include small candidates and typography uses preloaded WOFF2', async () => {
  const files = await readdir(path.join(output, 'assets'))
  assert.ok(files.some(file => /-320w-[^.]+\.webp$/.test(file)), 'missing 320 px images')
  assert.ok(files.some(file => /-480w-[^.]+\.webp$/.test(file)), 'missing 480 px images')
  assert.ok(files.some(file => /-320w-[^.]+\.avif$/.test(file)), 'missing 320 px AVIF images')
  assert.ok(files.some(file => /-480w-[^.]+\.avif$/.test(file)), 'missing 480 px AVIF images')
  assert.ok(!files.some(file => /\.ttf$/i.test(file)), 'TTF must not be published')
  const fontPrefixes = ['climate-crisis-site', 'involve-variable', 'tsvik-sp-demo-site']
  const css = (await Promise.all(files.filter(file => file.endsWith('.css')).map(file =>
    readFile(path.join(output, 'assets', file), 'utf8')))).join('\n')
  const fontFiles = []
  for (const prefix of fontPrefixes) {
    const matches = files.filter(file => file.startsWith(`${prefix}-`) && file.endsWith('.woff2'))
    assert.equal(matches.length, 1, prefix)
    const font = await readFile(path.join(output, 'assets', matches[0]))
    assert.equal(font.toString('ascii', 0, 4), 'wOF2', prefix)
    assert.ok(css.includes(matches[0]), `CSS must reference ${prefix}`)
    fontFiles.push(matches[0])
  }
  for (const url of [...urls, `${origin}/404.html`]) {
    const route = new URL(url).pathname.slice(1)
    const html = await readFile(path.join(output, route, route.endsWith('.html') ? '' : 'index.html'), 'utf8')
    const preloads = [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*as="font"[^>]*>/g)]
    assert.equal(preloads.length, 2, url)
    for (const file of fontFiles.slice(0, 2)) {
      assert.equal(preloads.filter(([tag]) => tag.includes(file)).length, 1, `${url}: ${file}`)
    }
    for (const [tag] of preloads) assert.match(tag, /type="font\/woff2"/)
  }
})

test('critical HTML images offer AVIF with matching WebP fallback before JavaScript', async () => {
  const html = await readFile(path.join(output, 'index.html'), 'utf8')
  const pictures = [...html.matchAll(/<picture\b[^>]*>([\s\S]*?)<\/picture>/g)]
    .map(([, content]) => content).filter(content => content.includes('type="image/avif"'))
  assert.ok(pictures.length > 0, 'Missing AVIF sources in prerendered HTML')
  for (const content of pictures) {
    const avif = content.match(/<source\b[^>]*type="image\/avif"[^>]*srcset="([^"]+)"/)
    if (!avif) continue // Отложенные изображения пока не имеют адреса.
    const fallback = content.match(/<img\b[^>]*src="([^"]+)"/)
    assert.ok(fallback, 'Missing fallback img')
    assert.match(content, /(?:src|srcset)="[^"]+\.webp(?:[\s,"])/)
    assert.match(avif[1], /\.avif(?:\s|,|$)/)
    const avifDescriptors = avif[1].split(',').map(candidate => candidate.trim().split(/\s+/)[1])
    const webpSet = content.match(/<img\b[^>]*srcset="([^"]+)"/)
      || content.match(/<source\b(?![^>]*type=)[^>]*srcset="([^"]+)"/)
    if (webpSet) assert.deepEqual(avifDescriptors,
      webpSet[1].split(',').map(candidate => candidate.trim().split(/\s+/)[1]))
  }
})

test('image formats preserve responsive descriptors and CSS density fallbacks', async () => {
  const { registerImageFormats, getAvifSource, getAvifSrcset, getImageBackground } = await import('../src/utils/image-formats.js')
  registerImageFormats('/test-320.webp', '/test-320.avif')
  registerImageFormats('/test-640.webp', '/test-640.avif')
  assert.equal(getAvifSource('/lossless.webp'), undefined)
  assert.equal(getAvifSrcset('/test-320.webp 320w, /test-640.webp 640w'), '/test-320.avif 320w, /test-640.avif 640w')
  assert.equal(getAvifSrcset('/test-320.webp 320w, /unknown.webp 640w'), undefined)
  assert.equal(getImageBackground('/test-320.webp'), 'image-set(url("/test-320.avif") type("image/avif"), url("/test-320.webp") type("image/webp"))')
  assert.equal(getImageBackground(undefined, 'image-set(url("/test-320.webp") 0.5x, url("/test-640.webp") 1x)'),
    'image-set(url("/test-320.avif") 0.5x type("image/avif"), url("/test-320.webp") 0.5x type("image/webp"), url("/test-640.avif") 1x type("image/avif"), url("/test-640.webp") 1x type("image/webp"))')
  assert.equal(getImageBackground('/lossless.webp'), 'url("/lossless.webp")')
  assert.equal(getImageBackground(undefined, 'linear-gradient(red, blue)'), 'linear-gradient(red, blue)')
})

// В публикацию не должны попадать исходники через карты сборки.
test('published output excludes sourcemaps and their references', async () => {
  const files = await readdir(output, { recursive: true })
  assert.ok(!files.some(file => file.endsWith('.map')), 'sourcemap files are published')
  for (const file of files.filter(file => /\.(js|css)$/.test(file))) {
    const source = await readFile(path.join(output, file), 'utf8')
    assert.doesNotMatch(source, /[#@]\s*sourceMappingURL\s*=/, file)
  }
})

async function builtAsset(source, extension) {
  let asset = manifest[source]
  if (!asset) {
    // Конвертированные PNG плагин публикует как именованные WebP без исходного пути.
    const prefix = `_${path.basename(source, path.extname(source))}-`
    let candidates = Object.entries(manifest).filter(([key, item]) => key.startsWith(prefix)
      && !/^\d+w-/.test(key.slice(prefix.length)) && item.file.endsWith(extension))
    // Rollup объединяет побайтово одинаковые WebP под одним из исходных имён.
    if (source.endsWith('.webp')) {
      const original = await readFile(source)
      candidates = []
      for (const entry of Object.entries(manifest).filter(([, item]) => item.file.endsWith(extension))) {
        const file = path.join(output, entry[1].file)
        if ((await stat(file)).size === original.length && original.equals(await readFile(file))) candidates.push(entry)
      }
    }
    candidates = [...new Map(candidates.map(entry => [entry[1].file, entry])).values()]
    assert.equal(candidates.length, 1, `expected one built asset for ${source}`)
    asset = candidates[0][1]
  }
  assert.ok(asset?.file.endsWith(extension), `missing built asset for ${source}`)
  return readFile(path.join(output, asset.file))
}

test('selected variant and shared photographic slider are present in prerendered HTML', async () => {
  assert.equal(buildInfo.version, 1)
  for (const url of [...urls, `${origin}/404.html`]) {
    const pathname = new URL(url).pathname
    const file = pathname === '/404.html' ? '404.html' : `${pathname.slice(1)}index.html`
    const html = await readFile(path.join(output, file), 'utf8')
    assert.ok(html.includes(`data-site-variant="${variant.name}"`), file)
  }
  const compact = homeHtml.replace(/\s+/g, '')
  assert.ok(compact.includes(variant.slogan.replace(/\s+/g, '')))
  assert.match(homeHtml, /href="https:\/\/marionciders\.com\/"/)
  const cssFiles = [...new Set(Object.values(manifest).flatMap(item => item.css || []))]
  const css = (await Promise.all(cssFiles.map(file => readFile(path.join(output, file), 'utf8')))).join('\n')
  const motionScope = css.match(/\.is-moving-forward\[data-v-([0-9a-f]+)\]/)?.[1]
  const firstPanel = homeHtml.match(/<article\b[^>]*id="home-product-panel-medovuha"[^>]*>/)?.[0]
  assert.ok(motionScope && firstPanel?.includes(`data-v-${motionScope}`), 'Prerendered slider must match its scoped animation rules')
  assert.equal((homeHtml.match(/<img\b[^>]*class="[^"]*\bproduct-glass\b/g) || []).length, 3)
  assert.doesNotMatch(homeHtml, /class="product-layer-clip"/)
})

test('slider images retain source dimensions and transparency in both modern formats', async () => {
  for (const slug of ['mead', 'cider', 'perry']) {
    const source = `src/assets/home/neuro-${slug}-glass.png`
    const original = await sharp(source).metadata()
    for (const extension of ['.webp', '.avif']) {
      const built = await builtAsset(source, extension)
      const metadata = await sharp(built).metadata()
      assert.deepEqual([metadata.width, metadata.height], [original.width, original.height], source)
      assert.ok(metadata.hasAlpha, source)
      const stats = await sharp(built).stats()
      assert.ok(!stats.isOpaque && stats.channels[3]?.max > 0, source)
    }
  }
})

test('published site excludes Three, models and the removed WebGL mode', async () => {
  const assets = await readdir(path.join(output, 'assets'))
  assert.ok(!assets.some(file => /\.glb$|three-runtime|webgl-warmup/.test(file)))
  for (const chunk of Object.values(manifest).filter(item => item.file.endsWith('.js'))) {
    const source = await readFile(path.join(output, chunk.file), 'utf8')
    assert.doesNotMatch(source, /WebGLRenderer|Картинки вместо 3D/)
  }
})

test('render workshop retains independent separate and combined purposes', () => {
  const separate = resolveProductRender({ preset: 'slider' }).settings
  const combined = resolveProductRender({ preset: 'slider-combined' }).settings
  assert.equal(separate.layers, 'separate')
  assert.equal(combined.layers, 'combined')
  assert.equal(separate.glassPrint.enabled, true)
  assert.equal(combined.glassPrint.enabled, false)
  assert.equal(separate.light.intensity, 80)
  assert.equal(combined.light.intensity, 48)
  assert.deepEqual(separate.light.position, separate.shadow.position)
  assert.deepEqual([separate.composition.modelBottom, separate.composition.canBottom], [80, 12])
  assert.deepEqual([combined.composition.modelBottom, combined.composition.canBottom], [12, 80])
  assert.deepEqual(separate.camera, combined.camera)
  const custom = resolveProductRender({ preset: 'slider-combined', settings: { glassPrint: { enabled: true } } }).settings
  assert.equal(custom.layers, 'combined')
  assert.equal(custom.glassPrint.enabled, true)
  assert.equal(resolveProductRender({ preset: 'slider-combined' }).settings.glassPrint.enabled, false)
})
