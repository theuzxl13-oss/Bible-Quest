// Abertura vista na tela: quadros reais (screencast do Chromium) desde a troca de rota até o
// primeiro quadro em que a área do mapa mostra a pintura (detalhe alto; o fundo liso ou a
// miniatura desfocada têm detalhe baixo). Versões antiga e nova alternadas, 2D, CPU 4×.
const { chromium } = require('playwright')
const fs = require('fs')
const { PNG } = (() => { try { return require('pngjs') } catch { return {} } })()
const src = fs.readFileSync(__dirname + '/cenarios.cjs', 'utf8')
const perfil = eval('(' + src.match(/const perfil = (\{[\s\S]*?\} \} \})/)[1] + ')')
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe']
const [N = '8', ALTAS] = process.argv.slice(2)
fs.mkdirSync(__dirname + '/quadros', { recursive: true })
;(async () => {
  const nav = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const res = []
  for (let i = 0; i < +N; i++) for (const [nome, porta] of (i % 2 ? [['depois', 5311], ['antes', 5310]] : [['antes', 5310], ['depois', 5311]])) {
    const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
    await ctx.addInitScript(([p, g]) => { if (!localStorage.getItem('bible-quest:v1:profile')) {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p)); localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: '2d', onboardingDone: true, reduceMotion: true }))
      localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: { 'bau-mundo-genesis-5': 'x' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null })) } }, [perfil, GN])
    if (ALTAS) await ctx.route(/mapas\/genesis\/(eden|diluvio)-leve\.webp/, (r) => r.fulfill({ path: __dirname + '/dist-android/mapas/genesis/' + r.request().url().match(/(eden|diluvio)-leve/)[1] + '.webp', contentType: 'image/webp' }))
    const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg)
    await pg.goto(`http://localhost:${porta}/#/painel`); await pg.waitForTimeout(2500)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    const quadros = []
    cdp.on('Page.screencastFrame', (f) => { quadros.push({ t: f.metadata.timestamp * 1000, dados: f.data }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}) })
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 })
    await pg.waitForTimeout(500)
    const t0 = await pg.evaluate(() => { const t = Date.now(); location.hash = '#/historia'; return t })
    await pg.waitForTimeout(4000)
    await cdp.send('Page.stopScreencast')
    fs.writeFileSync(`${__dirname}/quadros/${nome}-${i}.json`, JSON.stringify({ t0, quadros: quadros.filter((q) => q.t >= t0 - 50).map((q) => ({ t: Math.round(q.t - t0), dados: q.dados })) }))
    res.push({ nome, i })
    await ctx.close()
  }
  await nav.close()
})()
