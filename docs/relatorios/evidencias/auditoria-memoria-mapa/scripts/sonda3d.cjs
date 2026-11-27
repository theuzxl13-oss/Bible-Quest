// Onde vai o tempo da abertura do mapa no modo 3D: tarefas longas e momento em que cada parte fica pronta.
const { chromium } = require('playwright')
const src = require('fs').readFileSync(__dirname + '/cenarios.cjs', 'utf8')
const perfil = eval('(' + src.match(/const perfil = (\{[\s\S]*?\} \} \})/)[1] + ')')
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe']
;(async () => {
  const nav = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  for (const q of ['alta', '2d']) {
    const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
    await ctx.addInitScript(([p, q, g]) => { if (!localStorage.getItem('bible-quest:v1:profile')) {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p)); localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: true }))
      localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: { 'bau-mundo-genesis-5': 'x' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null })) }
      window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }) }, [perfil, q, GN])
    const pg = await ctx.newPage(); pg.setDefaultTimeout(60000)
    await pg.goto('http://localhost:5310/#/painel'); await pg.waitForTimeout(4000)
    const r = await pg.evaluate(async () => {
      window.__lt.length = 0
      const t0 = performance.now(); location.hash = '#/historia'
      const marcos = {}
      await new Promise((ok) => { const v = () => {
        const t = Math.round(performance.now() - t0)
        if (!marcos.dom_do_mapa && document.querySelector('.tr-regiao-diluvio')) marcos.dom_do_mapa = t
        const im = [...document.querySelectorAll('img.tr-arte')]
        if (!marcos.imagens_prontas && im.length === 2 && im.every((i) => i.complete && i.naturalWidth)) marcos.imagens_prontas = t
        if (!marcos.personagem && document.querySelector('.tr-avatar img, .tr-avatar svg')) marcos.personagem = t
        if (marcos.imagens_prontas && (marcos.personagem || t > 20000)) return ok()
        requestAnimationFrame(v) }; v() })
      return { marcos, tarefas_longas: window.__lt.map(([s, d]) => [Math.round(s - t0), d]) }
    })
    console.log(q, JSON.stringify(r))
    await ctx.close()
  }
  await nav.close()
})()
