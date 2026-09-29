import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const output = path.resolve('dist')
const origin = 'https://medved.beer'
const basePath = (process.env.SITE_BASE || '/freelancet-medved/').replace(/\/$/, '')
const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

test('every published URL has its own HTML and metadata', async () => {
  assert.equal(urls.length, 12)
  assert.equal(new Set(urls).size, urls.length)
  assert.ok(urls.includes(`${origin}/horeca/`))

  for (const url of urls) {
    const pathname = new URL(url).pathname
    const html = await readFile(path.join(output, pathname.slice(1), 'index.html'), 'utf8')
    assert.match(html, /<main>[\s\S]*?<h1\b[^>]*>[\s\S]*?<\/h1>/, url)
    assert.match(html, /<title>[^<]+<\/title>/, url)
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), url)
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`), url)
    assert.ok(!html.includes('file://'), url)
    assert.ok(!html.includes('/src/assets/'), url)
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

test('published pages match the documented structure', async () => {
  const structure = await readFile('docs/site-structure.md', 'utf8')
  const documentedPaths = [...structure.matchAll(/`(\/(?:[^`]+\/)?)`/g)].map((match) => match[1])
  const publishedPaths = urls.map((url) => new URL(url).pathname)
  assert.deepEqual([...documentedPaths].sort(), [...publishedPaths].sort())
})

test('unknown URLs use a non-indexable 404 page', async () => {
  const html = await readFile(path.join(output, '404.html'), 'utf8')
  const config = await readFile(path.join(output, '.htaccess'), 'utf8')

  assert.match(html, /<main>[\s\S]*?<h1\b[^>]*>[\s\S]*?404[\s\S]*?<\/h1>/)
  assert.match(html, /<meta name="robots" content="noindex, follow">/)
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

test('image and script URLs in published HTML point to built files', async () => {
  for (const url of [...urls, `${origin}/404.html`]) {
    const filePath = url.endsWith('/404.html')
      ? path.join(output, '404.html')
      : path.join(output, new URL(url).pathname.slice(1), 'index.html')
    const html = await readFile(filePath, 'utf8')
    for (const [, attribute, value] of html.matchAll(/\b(src|srcset)="([^"]+)"/g)) {
      const candidates = attribute === 'srcset' ? value.split(',') : [value]
      for (const candidate of candidates) {
        const asset = candidate.trim().split(/\s+/)[0]
        const target = new URL(asset, origin)
        if (target.origin !== origin) continue
        const pathname = basePath && target.pathname.startsWith(`${basePath}/`)
          ? target.pathname.slice(basePath.length)
          : target.pathname
        assert.ok((await stat(path.join(output, pathname.slice(1))).catch(() => null))?.isFile(), `${url} -> ${asset}`)
      }
    }
  }
})
