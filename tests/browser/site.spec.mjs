import { readFile } from 'node:fs/promises'
import { test, expect } from './fixtures.mjs'

const sitemap = await readFile('dist/sitemap.xml', 'utf8')
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url).pathname)

test('Прямые адреса всех опубликованных страниц подключают Vue без ошибок гидратации', async ({ page, openPage }) => {
  for (const path of paths) {
    await openPage(path)
    await expect(page.locator('main h1')).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://medved.beer${path}`)
    await expect(page).not.toHaveTitle('')
  }
})

test('Отказ по возрасту, изменение ответа и сохранение подтверждения', async ({ page, openPage }) => {
  await openPage('kontakty/', { confirmed: false })
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('main')).toHaveCount(0)
  await page.getByRole('button', { name: 'Нет', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Доступ ограничен' })).toBeVisible()
  await page.getByRole('button', { name: 'Изменить ответ' }).click()
  await page.getByRole('button', { name: 'Да, мне есть 18' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('main h1')).toBeVisible()
  await page.reload()
  await expect.poll(() => page.locator('#app').evaluate(root => Boolean(root.__vue_app__))).toBe(true)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('Мобильное меню открывается, закрывается и переводит на другую страницу', async ({ page, openPage, isMobile }) => {
  test.skip(!isMobile, 'На широком экране навигация постоянно раскрыта')
  await openPage('kontakty/')
  const navigation = page.getByRole('navigation', { name: 'Основная навигация' })
  await expect(navigation).toBeHidden()
  await page.getByRole('button', { name: 'Открыть меню' }).click()
  await expect(navigation).toBeVisible()
  await page.getByRole('button', { name: 'Закрыть меню' }).click()
  await expect(navigation).toBeHidden()
  await page.getByRole('button', { name: 'Открыть меню' }).click()
  await navigation.getByRole('link', { name: 'Каталог', exact: true }).click()
  await expect(page).toHaveURL(/\/katalog\/$/)
  await expect(page.locator('main h1')).toContainText('Наши')
})

test('Клавиатура переключает напитки, фокус и связанную панель', async ({ page, openPage, isMobile }) => {
  test.skip(isMobile, 'На мобильном используются кнопки слайдов')
  await openPage()
  const tabs = page.getByRole('tablist', { name: 'Выбор напитка' }).getByRole('tab')
  await tabs.first().focus()
  for (const [key, index] of [['ArrowRight', 1], ['End', 2], ['ArrowRight', 0], ['ArrowLeft', 2], ['Home', 0]]) {
    await page.keyboard.press(key)
    await expect(tabs.nth(index)).toBeFocused()
    await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true')
    const panelId = await tabs.nth(index).getAttribute('aria-controls')
    const panel = page.locator(`[id="${panelId}"]`)
    await expect(panel).toHaveAttribute('aria-hidden', 'false')
    await expect(panel).not.toHaveAttribute('inert')
    await expect(page.getByRole('tabpanel')).toHaveCount(1)
  }
})

test('Мобильные кнопки переключают слайды в обе стороны', async ({ page, openPage, isMobile }) => {
  test.skip(!isMobile, 'Проверка мобильных кнопок')
  await openPage()
  await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'home-product-tab-medovuha')
  await page.getByRole('tabpanel').getByRole('button', { name: 'Следующий напиток' }).click()
  await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'home-product-tab-sidr')
  await page.getByRole('tabpanel').getByRole('button', { name: 'Предыдущий напиток' }).click()
  await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'home-product-tab-medovuha')
})

test('Выбор объёма меняет изображение и характеристики напитка', async ({ page, openPage }) => {
  await openPage('katalog/sidr/')
  const selector = page.getByRole('group', { name: 'Выбор объёма: Сидр Вишневый', exact: true })
  const card = page.getByRole('listitem').filter({ has: selector })
  await selector.getByRole('button', { name: 'Показать объём 0,75 л', exact: true }).click()
  await expect(selector.getByRole('button', { name: 'Показать объём 0,75 л', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(card.getByRole('img', { name: 'Сидр Вишневый, 0,75 л', exact: true })).toBeVisible()
  await expect(card.locator('[aria-live="polite"]')).toHaveText('жемчужный, полусладкий')
  await selector.getByRole('button', { name: 'Показать объём 30 л', exact: true }).click()
  await expect(card.getByRole('img', { name: 'Сидр Вишневый, 30 л', exact: true })).toBeVisible()
  await expect(card.locator('[aria-live="polite"]')).toContainText('газированный')
})

test('Служебная страница 404 подключает Vue и остаётся без canonical', async ({ page, openPage }) => {
  await openPage('404.html')
  await expect(page.locator('main h1')).toContainText('404')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
})
