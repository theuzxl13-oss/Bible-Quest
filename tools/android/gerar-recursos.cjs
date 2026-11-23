/*
 * Gera os ícones e as imagens da tela de abertura do aplicativo Android a
 * partir dos SVGs desta pasta (icone-frente.svg e icone-monocromatico.svg).
 *
 * Uso (na raiz do projeto, com o Playwright e o Chromium disponíveis):
 *   node tools/android/gerar-recursos.cjs
 *
 * Saída em android/app/src/main/res/:
 *   mipmap-<densidade>/ic_launcher_foreground.png  camada da frente do ícone adaptativo (108 dp)
 *   mipmap-<densidade>/ic_launcher_monochrome.png  ícone temático do Android 13+ (108 dp)
 *   mipmap-<densidade>/ic_launcher.png e _round.png ícones para Android 7 (48 dp)
 *   drawable-<orientação>-<densidade>/splash.png    imagens de abertura antigas (fallback)
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const RAIZ = path.resolve(__dirname, '../..')
const RES = path.join(RAIZ, 'android/app/src/main/res')
const FUNDO = '#22160D' // terra-900 do jogo
const frente = fs.readFileSync(path.join(__dirname, 'icone-frente.svg'), 'utf8')
const mono = fs.readFileSync(path.join(__dirname, 'icone-monocromatico.svg'), 'utf8')
const DENSIDADES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 }

const dataUrl = (svg) => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')

async function render(page, html, w, h, arquivo, transparente) {
  await page.setViewportSize({ width: w, height: h })
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${html}</body></html>`)
  await page.waitForTimeout(50)
  fs.mkdirSync(path.dirname(arquivo), { recursive: true })
  await page.screenshot({ path: arquivo, omitBackground: transparente, clip: { x: 0, y: 0, width: w, height: h } })
}

;(async () => {
  const b = await chromium.launch()
  const page = await b.newPage({ deviceScaleFactor: 1 })
  for (const [d, k] of Object.entries(DENSIDADES)) {
    const t = Math.round(108 * k)
    const pasta = path.join(RES, `mipmap-${d}`)
    await render(page, `<img src="${dataUrl(frente)}" width="${t}" height="${t}" style="display:block">`, t, t, path.join(pasta, 'ic_launcher_foreground.png'), true)
    await render(page, `<img src="${dataUrl(mono)}" width="${t}" height="${t}" style="display:block">`, t, t, path.join(pasta, 'ic_launcher_monochrome.png'), true)
    // ícone completo para Android 7: fundo + a área visível do ícone adaptativo (os 72 dp do centro)
    const l = Math.round(48 * k)
    const centro = (raio) => `<div style="width:${l}px;height:${l}px;border-radius:${raio};background:${FUNDO};overflow:hidden;position:relative">
      <img src="${dataUrl(frente)}" style="position:absolute;width:${l * 1.5}px;height:${l * 1.5}px;left:${-l * 0.25}px;top:${-l * 0.25}px"></div>`
    await render(page, centro('22%'), l, l, path.join(pasta, 'ic_launcher.png'), true)
    await render(page, centro('50%'), l, l, path.join(pasta, 'ic_launcher_round.png'), true)
  }
  // imagens de abertura antigas (usadas só se o tema de abertura do Android 12+ não estiver disponível)
  for (const dir of fs.readdirSync(RES).filter((n) => n.startsWith('drawable') && fs.existsSync(path.join(RES, n, 'splash.png')))) {
    const arq = path.join(RES, dir, 'splash.png')
    const { w, h } = await (async () => {
      const buf = fs.readFileSync(arq)
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
    })()
    const t = Math.round(Math.min(w, h) * 0.5)
    await render(page, `<div style="width:${w}px;height:${h}px;background:${FUNDO};display:grid;place-items:center"><img src="${dataUrl(frente)}" width="${t}" height="${t}"></div>`, w, h, arq, false)
  }
  await b.close()
  console.log('recursos gerados em', path.relative(RAIZ, RES))
})()
