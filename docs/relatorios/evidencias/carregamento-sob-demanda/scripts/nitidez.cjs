// Captura a mesma região (Éden) nas versões antiga e nova com 4 regiões, para comparar a nitidez.
const { chromium } = require('playwright')
const fs = require('fs')
const src = fs.readFileSync(__dirname + '/cenarios.cjs', 'utf8')
const perfil = eval('(' + src.match(/const perfil = (\{[\s\S]*?\} \} \})/)[1] + ')')
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe']
;(async () => {
  const nav = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  for (const [nome, porta] of [['antes4', 5314], ['depois4', 5312], ['antes2', 5310], ['depois2', 5311]]) {
    const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
    await ctx.addInitScript(([p, g]) => { if (!localStorage.getItem('bible-quest:v1:profile')) {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p)); localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: '2d', onboardingDone: true, reduceMotion: true }))
      localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: { 'bau-mundo-genesis-5': 'x' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null })) } }, [perfil, GN])
    await ctx.route(/mapas\/genesis\/(eden|diluvio)-leve\.webp/, (r) => r.fulfill({ path: __dirname + '/dist-android/mapas/genesis/' + r.request().url().match(/(eden|diluvio)-leve/)[1] + '.webp', contentType: 'image/webp' }))
    const pg = await ctx.newPage()
    await pg.goto(`http://localhost:${porta}/#/painel`); await pg.waitForTimeout(2000)
    await pg.evaluate(() => { location.hash = '#/historia' }); await pg.waitForFunction(() => Boolean(document.querySelector('.tr-regiao-eden img.tr-arte')))
    for (const s of ['.tr-regiao-sim4', '.tr-regiao-sim3', '.tr-regiao-diluvio', '.tr-regiao-eden']) { await pg.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), s); await pg.waitForTimeout(1200) }
    await pg.waitForTimeout(1500)
    await pg.screenshot({ path: `capt/nitidez-${nome}.png`, clip: { x: 0, y: 200, width: 412, height: 500 } })
    await ctx.close()
  }
  await nav.close()
})()
