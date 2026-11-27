// Modo Quiz nas versões antiga e nova: mesmos marcos, mesmas posições, nenhuma pintura nem miniatura.
const { chromium } = require('playwright')
const fs = require('fs')
const src = fs.readFileSync(__dirname + '/cenarios.cjs', 'utf8')
const perfil = eval('(' + src.match(/const perfil = (\{[\s\S]*?\} \} \})/)[1] + ')')
;(async () => {
  const nav = await chromium.launch()
  const r = {}
  for (const [nome, porta] of [['antes', 5310], ['depois', 5311]]) {
    const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true })
    await ctx.addInitScript(([p]) => { localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p)); localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: '2d', onboardingDone: true, reduceMotion: true })) }, [perfil])
    const pg = await ctx.newPage(); const erros = []; pg.on('pageerror', (e) => erros.push(e.message))
    await pg.goto(`http://localhost:${porta}/#/painel`); await pg.waitForTimeout(2000)
    await pg.evaluate(() => { location.hash = '#/quiz' }); await pg.waitForFunction(() => document.querySelectorAll('[data-qnode]').length > 0); await pg.waitForTimeout(1500)
    r[nome] = await pg.evaluate(() => ({ marcos: [...document.querySelectorAll('[data-qnode]')].map((n) => { const b = n.getBoundingClientRect(); return [n.getAttribute('data-qnode'), Math.round(b.left), Math.round(b.top + scrollY)] }), pinturas: document.querySelectorAll('img.tr-arte, img.tr-miniatura').length }))
    r[nome].erros = erros
    await ctx.close()
  }
  console.log('marcos', r.antes.marcos.length, r.depois.marcos.length, 'iguais', JSON.stringify(r.antes.marcos) === JSON.stringify(r.depois.marcos), 'pinturas', r.antes.pinturas, r.depois.pinturas, 'erros', r.antes.erros.length, r.depois.erros.length)
  fs.writeFileSync('r5/quiz.json', JSON.stringify(r))
  await nav.close()
})()
