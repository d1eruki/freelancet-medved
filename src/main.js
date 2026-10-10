import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
import { findPage } from './data/page-routes'
import { loadPageComponent } from './utils/page-components'
import { loadPageData } from './utils/page-data.js'
import { trackContactClicks } from './utils/metrika.js'
import './styles/main.css'

const root = document.querySelector('#app')
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
const path = window.location.pathname.slice(basePath.length) || '/'
trackContactClicks()

// Загружаем страницу до гидратации: директивы не должны менять её HTML раньше Vue.
const page = findPage(path)
Promise.all([loadPageComponent(page?.type), loadPageData(page)]).then(([pageComponent, pageData]) => {
  const create = root?.hasChildNodes() ? createSSRApp : createApp
  create(App, { path, pageComponent, pageData }).mount(root)
})
