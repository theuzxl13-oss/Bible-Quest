/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

// versão exibida no jogo: vem do package.json, nunca escrita à mão
const versao: string = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version

// base './' faz o build funcionar em qualquer subdiretório (ex.: GitHub Pages
// em https://<usuario>.github.io/Bible-Quest/) e também dentro de um WebView
// Android (Capacitor). As rotas usam HashRouter, então não há 404 em links diretos.
export default defineConfig({
  base: './',
  plugins: [react()],
  define: { __VERSAO__: JSON.stringify(versao) },
  build: {
    target: 'es2022',
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    testTimeout: 20000,
  },
})
