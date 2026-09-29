import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import { notFoundPage, pageRoutes } from './data/page-routes'

export { notFoundPage, pageRoutes }

export async function render(path) {
  return renderToString(createSSRApp(App, { path }))
}
