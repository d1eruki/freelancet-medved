import { access, mkdtemp, readFile, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

const root = process.cwd()
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
    [/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${page.robots || 'index, follow'}">`],
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
  await build({ build: { outDir: output, emptyOutDir: true } })
  const template = await readFile(path.join(output, 'index.html'), 'utf8')
  if (!template.includes('<div id="app"></div>')) throw new Error('Client HTML template has no empty app container')
  await build({
    build: { ssr: 'src/entry-server.js', outDir: serverOutput, emptyOutDir: true, sourcemap: false },
  })

  const { render, notFoundPage, pageRoutes } = await import(pathToFileURL(path.join(serverOutput, 'entry-server.mjs')).href)
  const serverAssetPrefix = `${pathToFileURL(serverOutput).href}/assets/`
  const publicAssetPrefix = `${process.env.SITE_BASE || '/freelancet-medved/'}assets/`

  async function renderHtml(page, routePath) {
    const rendered = (await render(routePath)).replaceAll(serverAssetPrefix, publicAssetPrefix)
    for (const [, file] of rendered.matchAll(/(?:src|srcset)="[^"]*?assets\/([^\s,"<>]+)/g)) {
      await access(path.join(output, 'assets', file))
    }
    if (!rendered.includes('<main>')) throw new Error(`Could not render ${routePath}`)
    return setMetadata(template, page).replace('<div id="app"></div>', `<div id="app">${rendered}</div>`)
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
  await writeFile(configPath, config
    .replace('# @active-route-redirects@', redirects)
    .replace('# @active-route-rewrites@', rewrites))
} finally {
  await rm(serverOutput, { recursive: true, force: true })
}
