import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { optimizeImagesPlugin } from './scripts/vite/optimize-images-plugin.mjs'
import { optimizeModelsPlugin } from './scripts/vite/optimize-models-plugin.mjs'

export default defineConfig({
  base: process.env.SITE_BASE || '/freelancet-medved/',
  define: { 'import.meta.env.VITE_SITE_ENV': JSON.stringify(process.env.SITE_ENV || 'production') },
  plugins: [optimizeImagesPlugin(), optimizeModelsPlugin(), vue(), tailwindcss()],
  build: {
    sourcemap: false,
  },
})
