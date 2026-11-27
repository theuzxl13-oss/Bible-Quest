// Testa a prévia servida num subdiretório (como no GitHub Pages): carregamento, rotas, abertura
// direta e atualização, pinturas, mapas de História e Quiz, personagem 3D, fontes, recursos com
// erro, separação dos dados do site oficial, celular e computador.
// Uso: node testar-previa.cjs <url-base> <pasta-capturas>
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const [BASE, PASTA] = process.argv.slice(2)
fs.mkdirSync(PASTA, { recursive: true })
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe']
const perfil = { id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-27T00:00:00.000Z', storage: 'local',
  character: { version: 2, id: 'p', name: 'Tobias', base: 'masculino', body: 'masculino', beard: 'nenhuma', skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1,
    equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: [] } } }
const OFICIAL = 'bible-quest:v1:profile'
const SENTINELA = '{"marcador":"dados do site oficial — não mexer"}'

const ROTAS = [
  ['painel', '#/painel', () => Boolean(document.querySelector('main, .central, h1, h2'))],
  ['historia', '#/historia', () => [...document.querySelectorAll('img.tr-arte')].filter((i) => i.complete && i.naturalWidth > 0).length >= 2],
  ['quiz', '#/quiz', () => document.querySelectorAll('[data-qnode]').length > 0],
  ['guarda-roupa', '#/guarda-roupa', () => Boolean(document.querySelector('canvas, .char3d, .character'))],
  ['biblioteca', '#/biblioteca', () => Boolean(document.querySelector('h1, h2'))],
  ['linha-do-tempo', '#/linha-do-tempo', () => Boolean(document.querySelector('h1, h2'))],
  ['treino', '#/quiz/treino', () => Boolean(document.querySelector('h1, h2'))],
  ['configuracoes', '#/configuracoes', () => document.querySelectorAll('input[name=graphics]').length === 4],
]

async function contexto(nav, tipo, comPerfil) {
  const opcoes = tipo === 'celular'
    ? { viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true }
    : { viewport: { width: 1366, height: 820 }, deviceScaleFactor: 1 }
  const ctx = await nav.newContext(opcoes)
  await ctx.addInitScript(([p, g, oficial, sentinela, comPerfil]) => {
    // simula alguém que também joga no site oficial (mesmo domínio github.io)
    if (!localStorage.getItem(oficial)) localStorage.setItem(oficial, sentinela)
    if (comPerfil && !localStorage.getItem('bible-quest-previa:v1:profile')) {
      localStorage.setItem('bible-quest-previa:v1:profile', JSON.stringify(p))
      localStorage.setItem('bible-quest-previa:v1:settings', JSON.stringify({ graphics: 'auto', onboardingDone: true, reduceMotion: true }))
      localStorage.setItem('bible-quest-previa:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: { 'bau-mundo-genesis-5': 'x' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null }))
    }
  }, [perfil, GN, OFICIAL, SENTINELA, comPerfil])
  return ctx
}

function vigiar(pg, falhas) {
  pg.on('pageerror', (e) => falhas.push(`erro: ${e.message}`))
  pg.on('console', (m) => { if (m.type() === 'error') falhas.push(`console: ${m.text().slice(0, 160)}`) })
  pg.on('response', (r) => { if (r.status() >= 400) falhas.push(`HTTP ${r.status()}: ${r.url().replace(BASE, '')}`) })
  pg.on('requestfailed', (r) => falhas.push(`falhou: ${r.url().replace(BASE, '')} ${r.failure()?.errorText}`))
}

;(async () => {
  const nav = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const res = {}
  for (const tipo of ['celular', 'computador']) {
    const r = (res[tipo] = { rotas: {}, falhas: [] })
    // 1) primeira visita, sem dados: tela de boas-vindas
    {
      const ctx = await contexto(nav, tipo, false); const pg = await ctx.newPage(); const falhas = []; vigiar(pg, falhas)
      const t0 = Date.now()
      await pg.goto(BASE, { waitUntil: 'load' })
      await pg.waitForFunction(() => (document.getElementById('root')?.textContent ?? '').trim().length > 20, null, { timeout: 60000 })
      r.primeira_visita = { ms: Date.now() - t0, titulo: await pg.title(), texto: (await pg.evaluate(() => document.getElementById('root').innerText)).slice(0, 120).replace(/\s+/g, ' ') }
      await pg.waitForTimeout(1500)
      await pg.screenshot({ path: path.join(PASTA, `${tipo}-0-primeira-visita.png`) })
      r.falhas.push(...falhas.map((f) => `[primeira visita] ${f}`))
      await ctx.close()
    }
    // 2) jogador com progresso: navegação pelo jogo e abertura direta + atualização de cada rota
    const ctx = await contexto(nav, tipo, true); const pg = await ctx.newPage(); pg.setDefaultTimeout(60000)
    const falhas = []; vigiar(pg, falhas)
    const baixados = new Set(); pg.on('response', (x) => { const u = x.url(); if (/\.(glb|webp|woff2?|png|jpe?g|svg)(\?|$)/.test(u) && x.status() < 400) baixados.add(u.replace(/^.*\//, '').replace(/\?.*$/, '')) })
    await pg.goto(BASE + '#/painel'); await pg.waitForTimeout(3000)
    let n = 1
    for (const [nome, rota, pronto] of ROTAS) {
      // a) navegação dentro do jogo (troca de rota)
      const t0 = Date.now()
      await pg.evaluate((h) => { location.hash = h }, rota)
      let ok = true
      try { await pg.waitForFunction(pronto, null, { timeout: 45000 }) } catch { ok = false }
      const navMs = Date.now() - t0
      await pg.waitForTimeout(1200)
      if (tipo === 'celular' || ['historia', 'quiz', 'guarda-roupa', 'painel'].includes(nome)) await pg.screenshot({ path: path.join(PASTA, `${tipo}-${n}-${nome}.png`) })
      // b) atualização do navegador nessa rota (abertura direta)
      const t1 = Date.now()
      await pg.reload({ waitUntil: 'load' })
      let okRecarga = true
      try { await pg.waitForFunction(pronto, null, { timeout: 45000 }) } catch { okRecarga = false }
      r.rotas[nome] = { navegacao_ok: ok, navegacao_ms: navMs, recarga_ok: okRecarga, recarga_ms: Date.now() - t1, hash: await pg.evaluate(() => location.hash) }
      n++
    }
    // 3) mapa da História: pinturas, emenda e marcos
    await pg.evaluate(() => { location.hash = '#/painel' }); await pg.waitForTimeout(1500)
    await pg.evaluate(() => { location.hash = '#/historia' })
    await pg.waitForFunction(ROTAS[1][2], null, { timeout: 45000 })
    r.mapa = await pg.evaluate(() => {
      const d = document.querySelector('.tr-regiao-diluvio').getBoundingClientRect(); const e = document.querySelector('.tr-regiao-eden').getBoundingClientRect()
      return { pinturas: [...document.querySelectorAll('img.tr-arte')].map((i) => i.currentSrc.replace(/^.*mapas\//, '')), miniaturas: document.querySelectorAll('img.tr-miniatura').length, emenda_px: +(e.top - d.bottom).toFixed(2), marcos: document.querySelectorAll('[data-node]').length }
    })
    // 4) fontes e recursos
    r.fontes = await pg.evaluate(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')))] })
    r.recursos_baixados = { glb: [...baixados].filter((x) => x.endsWith('.glb')), webp: [...baixados].filter((x) => x.endsWith('.webp')).length, fontes: [...baixados].filter((x) => /woff/.test(x)).length }
    // 5) dados: os do site oficial intactos; a prévia grava só no próprio prefixo
    r.dados = await pg.evaluate((oficial) => {
      const chaves = Object.keys(localStorage)
      return { oficial_intacto: localStorage.getItem(oficial), chaves_do_oficial: chaves.filter((k) => k.startsWith('bible-quest:')), chaves_da_previa: chaves.filter((k) => k.startsWith('bible-quest-previa:')) }
    }, OFICIAL)
    r.dados.oficial_intacto = r.dados.oficial_intacto === SENTINELA
    r.meta = await pg.evaluate(() => ({ titulo: document.title, robots: document.querySelector('meta[name=robots]')?.content, commit: document.querySelector('meta[name=bq-previa]')?.content }))
    r.previa_json = await pg.evaluate(async () => (await fetch('previa.json')).json())
    r.falhas.push(...falhas)
    await ctx.close()
  }
  fs.writeFileSync(path.join(PASTA, 'resultado.json'), JSON.stringify(res, null, 1))
  for (const [tipo, r] of Object.entries(res)) {
    console.log(`== ${tipo}`)
    console.log(' primeira visita:', JSON.stringify(r.primeira_visita))
    for (const [k, v] of Object.entries(r.rotas)) console.log(`  ${k.padEnd(15)} navegação ${v.navegacao_ok ? 'ok' : 'FALHOU'} (${v.navegacao_ms} ms) · atualização ${v.recarga_ok ? 'ok' : 'FALHOU'} (${v.recarga_ms} ms) · ${v.hash}`)
    console.log(' mapa:', JSON.stringify(r.mapa)); console.log(' fontes:', r.fontes.join(', ')); console.log(' recursos:', JSON.stringify(r.recursos_baixados))
    console.log(' dados:', JSON.stringify(r.dados)); console.log(' meta:', JSON.stringify(r.meta)); console.log(' falhas:', r.falhas.length ? r.falhas.slice(0, 12) : 'nenhuma')
  }
  await nav.close()
})()
