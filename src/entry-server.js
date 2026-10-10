import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import { findPage, notFoundPage } from './data/page-routes'
import { loadPageComponent } from './utils/page-components'
import { loadPageData } from './utils/page-data.js'

export { notFoundPage, pageRoutes, getPageRobots } from './data/page-routes.js'
export { createStructuredData } from './utils/structured-data.js'

export async function render(path) {
  const page = findPage(path) || notFoundPage
  const [pageComponent, pageData] = await Promise.all([loadPageComponent(page.type), loadPageData(page)])
  const context = {}
  const html = await renderToString(createSSRApp(App, { path, pageComponent, pageData }), context)
  return { html, modules: context.modules, page: { ...page, ...pageData } }
}
