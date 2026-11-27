/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

// versão exibida no jogo: vem do package.json, nunca escrita à mão
const versao: string = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version

/**
 * Build do aplicativo Android (`vite build --mode android`, usado pelo Capacitor).
 * No app, o Capacitor encaixa a página entre as barras do sistema
 * (SystemBars, insetsHandling "native"), então o `viewport-fit=cover` do site
 * sai do HTML: assim nada fica embaixo da barra de status nem do recorte da
 * câmera, em qualquer versão do WebView. O build do site não passa por aqui.
 */
function htmlDoAplicativo(): Plugin {
  return {
    name: 'bible-quest-html-android',
    transformIndexHtml: (html) => html.replace(', viewport-fit=cover', ''),
  }
}

/**
 * Prévia de desenvolvimento (`vite build --mode previa`, publicada pelo .github/workflows/previa.yml
 * num endereço separado do site oficial). Muda só o que fica FORA do jogo:
 * - o título da aba ("Bible Quest — Prévia de desenvolvimento");
 * - robots noindex (a prévia não aparece em buscadores);
 * - o commit publicado, em <meta name="bq-previa"> e no arquivo previa.json.
 * O jogo em si é o mesmo do site; só os dados salvos usam outro prefixo (__PREVIA__).
 */
function htmlDaPrevia(): Plugin {
  const commit = process.env.GITHUB_SHA ?? (() => {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    } catch {
      return 'desconhecido'
    }
  })()
  const quando = new Date().toISOString()
  return {
    name: 'bible-quest-html-previa',
    transformIndexHtml: (html) =>
      html
        .replace(/<title>[^<]*<\/title>/, '<title>Bible Quest — Prévia de desenvolvimento</title>')
        .replace('</head>', `    <meta name="robots" content="noindex, nofollow" />\n    <meta name="bq-previa" content="${commit}" />\n  </head>`),
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'previa.json', source: JSON.stringify({ previa: true, versao, commit, gerada_em: quando }, null, 2) + '\n' })
    },
  }
}

// base './' faz o build funcionar em qualquer subdiretório (ex.: GitHub Pages
// em https://<usuario>.github.io/Bible-Quest/) e também dentro de um WebView
// Android (Capacitor). As rotas usam HashRouter, então não há 404 em links diretos.
export default defineConfig(({ mode }) => {
  const android = mode === 'android'
  const previa = mode === 'previa'
  return {
    base: './',
    plugins: android ? [react(), htmlDoAplicativo()] : previa ? [react(), htmlDaPrevia()] : [react()],
    // __ANDROID__ e __PREVIA__ são constantes de compilação: no build do site valem false e
    // o código exclusivo do aplicativo (e o prefixo da prévia) sai do pacote.
    define: { __VERSAO__: JSON.stringify(versao), __ANDROID__: JSON.stringify(android), __PREVIA__: JSON.stringify(previa) },
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
  }
})
