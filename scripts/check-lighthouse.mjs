import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const environment = process.env.SITE_ENV || 'production'
const sites = {
  production: { url: 'https://medved.beer/', analytics: 'Метрика включена.' },
  staging: { url: 'https://test.medved.beer/', analytics: 'Метрика отключена; результаты нельзя напрямую сравнивать с production.' },
}
if (!Object.hasOwn(sites, environment)) throw new Error('SITE_ENV must be production or staging')
const { url, analytics } = sites[environment]
const includeSeo = environment === 'production'
const profiles = ['mobile', 'desktop']
const runs = 3
const categories = ['performance', 'accessibility', 'best-practices', ...(includeSeo ? ['seo'] : [])]
const directory = resolve(process.env.LIGHTHOUSE_REPORTS || `/tmp/medved-lighthouse-${environment}-reports`)

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!sorted.length) return null
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}
function number(value, digits = 0) {
  return Number.isFinite(value) ? value.toFixed(digits) : '—'
}

async function summarize() {
  const columns = ['Профиль', 'Успешные замеры', 'Скорость: медиана (диапазон)', 'Доступность', 'Практики', ...(includeSeo ? ['SEO'] : []), 'LCP, с', 'TBT, мс', 'CLS']
  const lines = [
    `# Lighthouse: ${environment} — опубликованная главная страница`, '', url, '',
    `Возраст подтверждён заранее; холодный кеш. ${analytics} Каждый профиль измеряется трижды, последовательно.`, '',
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
  ]
  let failed = false
  const failures = []
  const metadata = []
  for (const profile of profiles) {
    const reports = []
    for (let run = 1; run <= runs; run++) {
      const name = `${profile}-${run}`
      try {
        const report = JSON.parse(await readFile(resolve(directory, `${name}.json`), 'utf8'))
        if (report.runtimeError) throw new Error(report.runtimeError.message)
        if (categories.some(category => !Number.isFinite(report.categories?.[category]?.score))) {
          throw new Error('В отчёте отсутствуют баллы обязательных категорий')
        }
        reports.push(report)
      } catch (error) {
        failed = true
        failures.push(`${name}: ${error.message}`)
      }
    }
    const scores = category => reports.map(report => report.categories[category].score * 100)
    const metric = audit => median(reports.map(report => report.audits[audit]?.numericValue))
    const speed = scores('performance')
    const lcp = metric('largest-contentful-paint')
    const range = speed.length ? `${number(Math.min(...speed))}–${number(Math.max(...speed))}` : '—'
    const values = [
      profile, `${reports.length}/${runs}`, `${number(median(speed))} (${range})`,
      number(median(scores('accessibility'))), number(median(scores('best-practices'))),
      ...(includeSeo ? [number(median(scores('seo')))] : []),
      number(lcp === null ? null : lcp / 1000, 2), number(metric('total-blocking-time')),
      number(metric('cumulative-layout-shift'), 3),
    ]
    lines.push(`| ${values.join(' | ')} |`)
    if (reports.length) {
      const report = reports[0]
      metadata.push(`Профиль ${profile}: Lighthouse ${report.lighthouseVersion}; браузер ${report.environment?.hostUserAgent || report.userAgent}; начало ${report.fetchTime}.`)
      for (const warning of new Set(reports.flatMap(report => report.runWarnings || []))) {
        metadata.push(`Предупреждение ${profile}: ${warning}`)
      }
    }
  }
  lines.push('', ...metadata, '', 'Медиана каждой метрики рассчитана отдельно. Баллы не блокируют публикацию; ошибка или неполный набор замеров отмечаются как сбой аудита.')
  if (failures.length) lines.push('', '## Неудачные замеры', '', ...failures.map(failure => `- ${failure}`))
  const summary = lines.join('\n') + '\n'
  await writeFile(resolve(directory, 'summary.md'), summary)
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary)
  console.info(summary)
  if (failed) process.exitCode = 1
}

async function collect() {
  if (!process.env.LIGHTHOUSE_MODULES) throw new Error('Укажите LIGHTHOUSE_MODULES с временными зависимостями аудита')
  const require = createRequire(resolve(process.env.LIGHTHOUSE_MODULES, 'audit.cjs'))
  const load = name => import(pathToFileURL(require.resolve(name)).href)
  const [{ default: lighthouse }, chromeLauncher, { default: puppeteer }, { default: desktop }] = await Promise.all([
    load('lighthouse'), load('chrome-launcher'), load('puppeteer-core'), load('lighthouse/core/config/lr-desktop-config.js'),
  ])
  for (const profile of profiles) {
    for (let run = 1; run <= runs; run++) {
      const name = `${profile}-${run}`
      let chrome, browser
      try {
        console.info(`Lighthouse ${name}: ${url}`)
        chrome = await chromeLauncher.launch({
          chromePath: process.env.CHROME_PATH,
          chromeFlags: ['--headless', '--no-sandbox', '--disable-extensions'],
        })
        browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` })
        const [page] = await browser.pages()
        // Подготовка хранилища без выполнения кода сайта, прогрева 3D или Метрики.
        await page.setJavaScriptEnabled(false)
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
        if (!response?.ok() || new URL(page.url()).origin !== new URL(url).origin) {
          throw new Error('Проверяемый сайт недоступен или перенаправил на другой домен')
        }
        await page.evaluate(() => localStorage.setItem('medved-age-confirmed', 'true'))
        await page.goto('about:blank')
        await page.setJavaScriptEnabled(true)
        const session = await page.createCDPSession()
        await session.send('Network.clearBrowserCache')
        await session.detach()
        browser.disconnect()
        browser = null
        const config = profile === 'desktop' ? desktop : { extends: 'lighthouse:default' }
        const result = await lighthouse(url, {
          port: chrome.port, output: ['html', 'json'], logLevel: 'error',
          onlyCategories: categories,
          // Сохраняем только подтверждение возраста; кеш Lighthouse очищает штатно.
          clearStorageTypes: ['file_systems', 'indexeddb', 'websql', 'shader_cache', 'service_workers', 'cache_storage'],
        }, config)
        if (!result) throw new Error('Lighthouse не вернул результат')
        await writeFile(resolve(directory, `${name}.html`), result.report[0])
        await writeFile(resolve(directory, `${name}.json`), result.report[1])
      } catch (error) {
        console.error(`${name}: ${error.message}`)
        await writeFile(resolve(directory, `${name}.error.txt`), error.stack || error.message)
      } finally {
        browser?.disconnect()
        await chrome?.kill()
      }
    }
  }
}

await mkdir(directory, { recursive: true })
if (!process.argv.includes('--summarize')) await collect()
await summarize()
