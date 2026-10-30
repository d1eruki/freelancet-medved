import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { getSiteVariant } from './src/data/site-variants.js'
import { optimizeImagesPlugin } from './scripts/vite/optimize-images-plugin.mjs'
import { optimizeModelsPlugin } from './scripts/vite/optimize-models-plugin.mjs'

export default defineConfig(() => {
  const variant = getSiteVariant(process.env.SITE_VARIANT)
  const sourcePath = relative => fileURLToPath(new URL(relative, import.meta.url))
  return {
    cacheDir: `node_modules/.vite-${variant.name}`,
    base: process.env.SITE_BASE || '/freelancet-medved/',
    define: {
      'import.meta.env.VITE_SITE_ENV': JSON.stringify(process.env.SITE_ENV || 'production'),
      'import.meta.env.VITE_SITE_VARIANT': JSON.stringify(variant.name),
    },
    plugins: [{
      name: 'site-variant',
      enforce: 'pre',
      transform(source, id) {
        if (id.split('?')[0] !== sourcePath('./src/styles/main.css')) return null
        return source.replace('--color-brand: var(--site-brand);', `--color-brand: ${variant.brand};`)
      },
      transformIndexHtml(html) {
        return html.replace('<html ', `<html data-site-variant="${variant.name}" `)
      },
    }, optimizeImagesPlugin(), optimizeModelsPlugin(), vue({
      features: { componentIdGenerator: 'filepath' },
    }), tailwindcss()],
    build: { sourcemap: false },
  }
})
