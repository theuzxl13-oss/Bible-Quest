// Confirma se nós do DOM do mapa ficam retidos depois de sair dele (coleta de lixo forçada antes de contar).
const { chromium } = require('playwright')
const [QUAL] = process.argv.slice(2)
const src = require('fs').readFileSync(__dirname + '/cenarios.cjs', 'utf8')
const perfil = eval('(' + src.match(/const perfil = (\{[\s\S]*?\} \} \})/)[1] + ')')
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe']
;(async () => {
  const nav = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
  await ctx.addInitScript(([p, q, g]) => { if (!localStorage.getItem('bible-quest:v1:profile')) {
    localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p)); localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: true }))
    localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: { 'bau-mundo-genesis-5': 'x' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null })) } }, [perfil, QUAL, GN])
  const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg)
  const conta = async () => { for (let i = 0; i < 3; i++) { await cdp.send('HeapProfiler.collectGarbage'); await pg.waitForTimeout(300) } return cdp.send('Memory.getDOMCounters') }
  await pg.goto('http://localhost:5310/#/painel'); await pg.waitForTimeout(3000)
  const linhas = [['menu inicial', await conta(), 0]]
  for (let i = 1; i <= 6; i++) {
    await pg.evaluate(() => { location.hash = '#/historia' }); await pg.waitForFunction(() => Boolean(document.querySelector('.tr-regiao-diluvio'))); await pg.waitForTimeout(2500)
    const noMapa = await pg.evaluate(() => document.querySelectorAll('*').length)
    await pg.evaluate(() => { location.hash = '#/painel' }); await pg.waitForTimeout(2500)
    linhas.push([`após visita ${i}`, await conta(), noMapa])
  }
  for (const [n, c, m] of linhas) console.log(QUAL, n.padEnd(14), 'nós', c.nodes, 'docs', c.documents, 'ouvintes', c.jsEventListeners, 'elementos na página do mapa', m)
  // origem: o que segura os nós? amostra de objetos desanexados no heap
  const s = await pg.evaluate(() => document.querySelectorAll('*').length)
  console.log('elementos no menu', s)
  await nav.close()
})()
