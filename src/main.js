import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
import { findPage } from './data/page-routes'
import { loadPageComponent } from './utils/page-components'
import './styles/main.css'

const root = document.querySelector('#app')
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
const path = window.location.pathname.slice(basePath.length) || '/'

// Загружаем страницу до гидратации: директивы не должны менять её HTML раньше Vue.
loadPageComponent(findPage(path)?.type).then((pageComponent) => {
  const create = root?.hasChildNodes() ? createSSRApp : createApp
  create(App, { path, pageComponent }).mount(root)
})
