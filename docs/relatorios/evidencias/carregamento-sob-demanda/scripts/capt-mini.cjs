// Capturas do Dilúvio: versão antiga com o arquivo bloqueado, versão nova com o arquivo bloqueado (miniatura) e normal.
const { chromium } = require('playwright')
const fs = require('fs')
const src = fs.readFileSync(__dirname + '/cenarios.cjs', 'utf8')
const perfil = eval('(' + src.match(/const perfil = (\{[\s\S]*?\} \} \})/)[1] + ')')
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe']
;(async () => {
  const nav = await chromium.launch()
  for (const [nome, porta, bloq] of [['antes-bloqueado', 5310, true], ['depois-bloqueado-miniatura', 5311, true], ['depois-normal', 5311, false]]) {
    const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
    await ctx.addInitScript(([p, g]) => { if (!localStorage.getItem('bible-quest:v1:profile')) {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p)); localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: '2d', onboardingDone: true, reduceMotion: true }))
      localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: { 'bau-mundo-genesis-5': 'x' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null })) } }, [perfil, GN])
    if (bloq) await ctx.route(/mapas\/genesis\/diluvio(-leve)?\.webp/, (r) => r.abort())
    const pg = await ctx.newPage()
    await pg.goto(`http://localhost:${porta}/#/painel`); await pg.waitForTimeout(2500); await pg.evaluate(() => { location.hash = '#/historia' }); await pg.waitForFunction(() => Boolean(document.querySelector('.tr-regiao-diluvio')), null, { timeout: 60000 })
    await pg.evaluate(() => document.querySelector('.tr-regiao-diluvio').scrollIntoView({ block: 'center' })); await pg.waitForTimeout(3500)
    await pg.screenshot({ path: `capt/dil-${nome}.png` })
    await ctx.close()
  }
  await nav.close()
})()
