// Abertura do mapa (2D, CPU 4× mais lenta), versões antiga e nova alternadas, contexto novo a cada vez.
// Mede do toque (troca de rota) até o primeiro quadro com o mapa e as duas pinturas prontas.
const { chromium } = require('playwright')
const fs = require('fs')
const src = fs.readFileSync(__dirname + '/cenarios.cjs', 'utf8')
const perfil = eval('(' + src.match(/const perfil = (\{[\s\S]*?\} \} \})/)[1] + ')')
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe']
const [QUAL = '2d', N = '10', ALTAS] = process.argv.slice(2)
;(async () => {
  const nav = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const res = { antes: [], depois: [] }
  for (let i = 0; i < +N; i++) for (const [nome, porta] of (i % 2 ? [['depois', 5311], ['antes', 5310]] : [['antes', 5310], ['depois', 5311]])) {
    const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
    await ctx.addInitScript(([p, g, q]) => { if (!localStorage.getItem('bible-quest:v1:profile')) {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p)); localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: true }))
      localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: { 'bau-mundo-genesis-5': 'x' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null })) } }, [perfil, GN, QUAL])
    if (ALTAS) await ctx.route(/mapas\/genesis\/(eden|diluvio)-leve\.webp/, (r) => r.fulfill({ path: __dirname + '/dist-android/mapas/genesis/' + r.request().url().match(/(eden|diluvio)-leve/)[1] + '.webp', contentType: 'image/webp' }))
    const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg)
    await pg.goto(`http://localhost:${porta}/#/painel`); await pg.waitForTimeout(2500)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    const ms = await pg.evaluate(() => new Promise((ok) => {
      const t0 = performance.now(); location.hash = '#/historia'
      const v = () => { const im = [...document.querySelectorAll('img.tr-arte')]
        if (document.querySelector('.av-historia') && im.length === 2 && im.every((x) => x.complete && x.naturalWidth)) ok(Math.round(performance.now() - t0)); else requestAnimationFrame(v) }
      requestAnimationFrame(v) }))
    res[nome].push(ms); await ctx.close()
  }
  const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
  console.log(JSON.stringify({ qualidade: QUAL, imagens_altas: Boolean(ALTAS), antes: res.antes, depois: res.depois, mediana_antes: med(res.antes), mediana_depois: med(res.depois), variacao: +((med(res.depois) / med(res.antes) - 1) * 100).toFixed(1) + '%' }))
  fs.writeFileSync(`r5/abertura-${QUAL}${ALTAS ? '-altas' : ''}.json`, JSON.stringify(res))
  await nav.close()
})()
