import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import { findPage, notFoundPage, pageRoutes } from './data/page-routes'
import { loadPageComponent } from './utils/page-components'

export { notFoundPage, pageRoutes }
export { createStructuredData } from './utils/structured-data.js'

export async function render(path) {
  const pageComponent = await loadPageComponent(findPage(path)?.type)
  const context = {}
  const html = await renderToString(createSSRApp(App, { path, pageComponent }), context)
  return { html, modules: context.modules }
}
