import { access, mkdtemp, readFile, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import { getMetrikaMarkup } from '../src/utils/metrika.js'

const root = process.cwd()
const siteEnvironment = process.env.SITE_ENV || 'production'
if (!['production', 'staging'].includes(siteEnvironment)) throw new Error('SITE_ENV must be production or staging')
const staging = siteEnvironment === 'staging'
const output = path.join(root, 'dist')
const serverOutput = await mkdtemp(path.join(root, 'node_modules', '.medved-ssr-'))

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function setMetadata(template, page) {
  const values = [
    [/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`],
    [/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(page.description)}">`],
    [/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${staging ? 'noindex, nofollow' : page.robots || 'index, follow'}">`],
    [/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(page.title)}">`],
    [/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(page.description)}">`],
    [/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(page.title)}">`],
    [/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(page.description)}">`],
  ]

  let html = values.reduce((result, [pattern, replacement]) => {
    if (!pattern.test(result)) throw new Error(`Missing metadata element: ${pattern}`)
    return result.replace(pattern, replacement)
  }, template)

  const canonical = /<link rel="canonical" href="[^"]*">/
  const openGraphUrl = /<meta property="og:url" content="[^"]*">/
  if (page.canonicalUrl) {
    html = html.replace(canonical, `<link rel="canonical" href="${page.canonicalUrl}">`)
    html = html.replace(openGraphUrl, `<meta property="og:url" content="${page.canonicalUrl}">`)
  } else {
    html = html.replace(canonical, '').replace(openGraphUrl, '')
  }
  return html
}

try {
  await build({ build: { outDir: output, emptyOutDir: true, manifest: true } })
  const template = await readFile(path.join(output, 'index.html'), 'utf8')
  const manifest = JSON.parse(await readFile(path.join(output, '.vite', 'manifest.json'), 'utf8'))
  if (!template.includes('<div id="app"></div>')) throw new Error('Client HTML template has no empty app container')
  await build({
    build: { ssr: 'src/entry-server.js', outDir: serverOutput, emptyOutDir: true, sourcemap: false },
  })

  const { render, notFoundPage, pageRoutes, createStructuredData } = await import(pathToFileURL(path.join(serverOutput, 'entry-server.mjs')).href)
  const serverAssetPrefix = `${pathToFileURL(serverOutput).href}/assets/`
  const publicAssetPrefix = `${process.env.SITE_BASE || '/freelancet-medved/'}assets/`
  const metrika = staging
    ? { head: '', body: '' }
    : getMetrikaMarkup(new URL(pageRoutes[0].canonicalUrl).hostname)

  async function renderHtml(page, routePath) {
    const { html, modules } = await render(routePath)
    const rendered = html.replaceAll(serverAssetPrefix, publicAssetPrefix)
    for (const [, file] of rendered.matchAll(/(?:src|srcset)="[^"]*?assets\/([^\s,"<>]+)/g)) {
      await access(path.join(output, 'assets', file))
    }
    if (!rendered.includes('<main>')) throw new Error(`Could not render ${routePath}`)
    const files = new Set()
    const visited = new Set()
    function collectResources(id) {
      if (visited.has(id)) return
      visited.add(id)
      const chunk = manifest[id]
      if (!chunk) return
      for (const dependency of chunk.imports || []) collectResources(dependency)
      files.add(chunk.file)
      for (const css of chunk.css || []) files.add(css)
    }
    for (const id of modules) collectResources(id)

    const base = process.env.SITE_BASE || '/freelancet-medved/'
    const links = [...files].map((file) => {
      const url = `${base}${file}`
      if (template.includes(`href="${url}"`) || template.includes(`src="${url}"`)) return ''
      if (file.endsWith('.css')) return `<link rel="stylesheet" crossorigin href="${escapeHtml(url)}">`
      if (file.endsWith('.js')) return `<link rel="modulepreload" crossorigin href="${escapeHtml(url)}">`
      return ''
    }).filter(Boolean).join('\n    ')

    const structuredData = createStructuredData(page, (asset) => new URL(
      asset.replaceAll(serverAssetPrefix, publicAssetPrefix), page.canonicalUrl,
    ).href)
    // Экранируем символы HTML, чтобы содержимое каталога не могло закрыть script.
    const jsonLd = structuredData
      ? `<script type="application/ld+json">${JSON.stringify(structuredData).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026')}</script>`
      : ''

    return setMetadata(template, page)
      .replace('</head>', () => `${links}\n    ${jsonLd}\n    ${metrika.head}\n  </head>`)
      .replace('<body>', () => `<body>\n    ${metrika.body}`)
      .replace('<div id="app"></div>', `<div id="app">${rendered}</div>`)
  }

  for (const page of pageRoutes) {
    const directory = path.join(output, page.path.slice(1))
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, 'index.html'), await renderHtml(page, page.path))
  }
  await writeFile(path.join(output, '404.html'), await renderHtml(notFoundPage, '/__not-found__/'))

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pageRoutes.map((page) => `  <url><loc>${page.canonicalUrl}</loc></url>`).join('\n')}\n</urlset>\n`
  await writeFile(path.join(output, 'sitemap.xml'), sitemap)

  const activePaths = pageRoutes.filter((page) => page.path !== '/').map((page) => escapeRegex(page.path.slice(1, -1)))
  const routePattern = activePaths.join('|')
  const canonicalOrigin = new URL(pageRoutes[0].canonicalUrl).origin
  const redirects = `RewriteCond %{REQUEST_URI} !/$\nRewriteRule ^(${routePattern})$ ${canonicalOrigin}/$1/ [R=301,L,NE]`
  const rewrites = `RewriteRule ^$ index.html [L]\nRewriteRule ^(?:${routePattern})/?$ index.html [L]`
  const configPath = path.join(output, '.htaccess')
  const config = await readFile(configPath, 'utf8')
  if (!config.includes('# @active-route-redirects@') || !config.includes('# @active-route-rewrites@')) {
    throw new Error('Missing Apache route markers')
  }
  let generatedConfig = config
    .replace('# @active-route-redirects@', redirects)
    .replace('# @active-route-rewrites@', rewrites)
  if (staging) {
    // Явный HTTPS нужен за прокси Timeweb: относительный редирект Apache может вести на HTTP.
    const stagingOrigin = new URL(canonicalOrigin)
    stagingOrigin.hostname = `test.${stagingOrigin.hostname}`
    generatedConfig = generatedConfig
      .replace(/^RewriteCond %\{HTTP_HOST\} [^\n]+\nRewriteRule \^ [^\n]+%\{REQUEST_URI\} \[R=301,L,NE\]\n/m, '')
      .replaceAll(canonicalOrigin, stagingOrigin.origin)
    // HTTP-заголовок действует также после клиентской навигации и для файлов без HTML.
    // Заглушка Timeweb index.htm может иметь приоритет по умолчанию; оставляем её на диске.
    generatedConfig = `DirectoryIndex index.html\nHeader always set X-Robots-Tag "noindex, nofollow"\n${generatedConfig}`
    // Разрешаем роботам прочитать noindex, но не рекламируем карту рабочего сайта.
    await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nAllow: /\nDisallow: /api/\n')
  }
  await writeFile(configPath, generatedConfig)
} finally {
  await rm(serverOutput, { recursive: true, force: true })
}
