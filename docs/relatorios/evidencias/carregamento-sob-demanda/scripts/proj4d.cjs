// Memória com 4 regiões reais no mapa (variante de teste com as regiões 3 e 4 simuladas por cópias
// das pinturas, servida na porta 5312), percorridas com rolagem de verdade. Mesmo despejo da auditoria.
// Uso: PORTA=5312 node proj4.cjs <gpu|software> <alta|leve> <saida.json>
const { chromium } = require('playwright')
const fs = require('fs')
const { despejar } = require('./dump.cjs')
const [RASTER, QUAL, SAIDA] = process.argv.slice(2)
const URL = `http://localhost:${process.env.PORTA || 5312}/`
const ARGS = RASTER === 'gpu' ? ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : []
const src = fs.readFileSync(__dirname + '/cenarios.cjs', 'utf8')
const perfil = eval('(' + src.match(/const perfil = (\{[\s\S]*?\} \} \})/)[1] + ')')
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe']
const MB = (b) => +(b / 1048576).toFixed(2)
const soma = (p, re) => MB(Object.entries(p?.alocadores ?? {}).filter(([n]) => re.test(n)).reduce((t, [, a]) => t + a.effective, 0))

;(async () => {
  const nav = await chromium.launch({ args: ARGS })
  const cdpNav = await nav.newBrowserCDPSession()
  const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
  await ctx.addInitScript(([p, q, g]) => { if (!localStorage.getItem('bible-quest:v1:profile')) {
    localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p)); localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: true }))
    localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: { 'bau-mundo-genesis-5': 'x' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null })) } }, [perfil, QUAL, GN])
  const pg = await ctx.newPage(); pg.setDefaultTimeout(120000); const cdp = await ctx.newCDPSession(pg)
  const passos = []
  async function reg(nome) {
    await pg.waitForTimeout(1500); await cdp.send('HeapProfiler.collectGarbage'); await pg.waitForTimeout(800)
    const d = await despejar(cdpNav)
    const ps = Object.values(d.porProc); const r = ps.find((p) => p.nome === 'Renderer'); const g = ps.find((p) => p.nome === 'GPU Process')
    const imgs = await pg.evaluate(() => [...document.querySelectorAll('img.tr-arte')].map((i) => i.closest('.tr-pintada').className.match(/tr-regiao-(\w+)/)[1]))
    const l = { passo: nome, pinturas_na_pagina: imgs.length, regioes: imgs.join(','),
      renderer_imagens: soma(r, /^cc\/image_memory$/), gpu_transfer: soma(g, /^gpu\/transfer_cache$/), total_imagens: 0 }
    l.total_imagens = +(l.renderer_imagens + l.gpu_transfer).toFixed(2)
    l.entradas_pagina = Object.entries(r?.alocadores ?? {}).filter(([n]) => /^cc\/image_memory\/[^/]+\/gpu\/[^/]+$|^cc\/image_memory\/[^/]+\/(at_raster|budgeted)\/[^/]+$/.test(n)).map(([n, a]) => +(a.size / 1048576).toFixed(2))
    l.entradas_gpu = Object.entries(g?.alocadores ?? {}).filter(([n]) => /^gpu\/transfer_cache\/[^/]+\/gpu\/entry_[^/]+$/.test(n)).map(([n, a]) => +(a.size / 1048576).toFixed(2))
    passos.push(l); console.log(JSON.stringify(l))
  }
  await pg.goto(URL + '#/painel'); await pg.waitForTimeout(3000)
  await pg.evaluate(() => { location.hash = '#/historia' })
  await pg.waitForFunction(() => document.querySelectorAll('.tr-pintada').length === 4)
  await reg('A-mapa-aberto')
  const maxNaPagina = []
  for (const s of ['sim4', 'sim3', 'diluvio', 'eden', 'sim3', 'sim4', 'eden']) {
    await pg.evaluate((s) => document.querySelector(`.tr-regiao-${s}`).scrollIntoView({ block: 'center' }), s); await pg.waitForTimeout(900)
    maxNaPagina.push(await pg.evaluate(() => document.querySelectorAll('img.tr-arte').length))
  }
  await reg('B-4-regioes-percorridas-ida-e-volta')
  await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(900)
  await reg('C-topo-da-pagina')
  await cdp.send('Memory.simulatePressureNotification', { level: 'critical' })
  await reg('D-apos-pressao-critica')
  fs.writeFileSync(SAIDA, JSON.stringify({ raster: RASTER, qualidade: QUAL, passos, pinturas_na_pagina_a_cada_parada: maxNaPagina }, null, 1))
  console.log('pinturas na página a cada parada', JSON.stringify(maxNaPagina))
  await nav.close()
})()
