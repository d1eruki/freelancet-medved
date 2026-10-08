import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  { ignores: ['node_modules/**', 'dist/**', 'archive/**', 'materials/**', 'test-results/**', 'playwright-report/**'] },
  {
    files: ['**/*.{js,mjs,vue}'],
    extends: [js.configs.recommended],
    rules: {
      // Неиспользуемый код виден в отчёте; внедрение линтера не требует массовой чистки исходников.
      'no-unused-vars': 'warn',
    },
  },
  ...vue.configs['flat/essential'],
  { files: ['src/**/*.{js,vue}'], languageOptions: { globals: globals.browser } },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', '*.mjs', 'vite.config.js'],
    languageOptions: { globals: globals.node },
  },
])
