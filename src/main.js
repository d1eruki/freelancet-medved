import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
import './styles/main.css'

const root = document.querySelector('#app')
const app = root?.hasChildNodes() ? createSSRApp(App) : createApp(App)
app.mount(root)
