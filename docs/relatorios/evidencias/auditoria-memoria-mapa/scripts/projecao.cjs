// Projeção para 4 regiões e teste da premissa do carregamento sob demanda (sem mudar o jogo:
// as cópias das regiões são criadas só na página do teste, com URLs distintas para forçar imagens distintas).
// Uso: node projecao.cjs <gpu|software> <alta|leve> <saida.json>
const { chromium } = require('playwright')
const fs = require('fs')
const { despejar } = require('./dump.cjs')
const [RASTER, QUAL, SAIDA] = process.argv.slice(2)
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
    const imgs = await pg.evaluate(() => [...document.querySelectorAll('img.tr-arte')].map((i) => i.getAttribute('src').replace(/^.*mapas\//, '')))
    const l = { passo: nome, regioes_com_imagem: imgs.filter((s) => s.includes('.webp')).length,
      renderer_imagens: soma(r, /^cc\/image_memory$/), gpu_transfer: soma(g, /^gpu\/transfer_cache$/), total_imagens: 0,
      pegada_renderer: MB(r?.pegada ?? 0), pegada_gpu: MB(g?.pegada ?? 0) }
    l.total_imagens = +(l.renderer_imagens + l.gpu_transfer).toFixed(2)
    passos.push(l); console.log(JSON.stringify(l))
  }
  await pg.goto('http://localhost:5310/#/painel'); await pg.waitForTimeout(3000)
  await pg.evaluate(() => { location.hash = '#/historia' })
  await pg.waitForFunction(() => { const i = [...document.querySelectorAll('img.tr-arte')]; return i.length === 2 && i.every((x) => x.complete && x.naturalWidth > 0) })
  await reg('A-mapa-aberto-sem-forcar-decodificacao')
  await pg.evaluate(() => document.querySelector('.tr-regiao-eden').scrollIntoView({ block: 'center' }))
  await pg.waitForTimeout(800)
  await pg.evaluate(() => document.querySelector('.tr-regiao-diluvio').scrollIntoView({ block: 'center' }))
  await reg('B-2-regioes-percorridas')
  // simula as regiões 3 e 4: cópias das duas regiões acima do Dilúvio, com URLs distintas
  await pg.evaluate(() => {
    const dil = document.querySelector('.tr-regiao-diluvio'); const eden = document.querySelector('.tr-regiao-eden')
    for (const [orig, n] of [[eden, 4], [dil, 3]]) {
      const c = orig.cloneNode(true); c.classList.remove('tr-regiao-eden', 'tr-regiao-diluvio'); c.classList.add(`sim-regiao-${n}`); c.querySelectorAll('[data-node]').forEach((e) => e.remove())
      const im = c.querySelector('img.tr-arte'); im.src = im.getAttribute('src') + `?regiao=${n}`
      dil.parentElement.insertBefore(c, dil.parentElement.querySelector('.tr-pintada'))
    }
  })
  for (const s of ['.sim-regiao-4', '.sim-regiao-3', '.tr-regiao-diluvio', '.tr-regiao-eden']) { await pg.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), s); await pg.waitForTimeout(900) }
  await reg('C-4-regioes-percorridas-hoje')
  // premissa do carregamento sob demanda: regiões distantes (3 e 4) trocam a imagem por um marcador sem pixels
  await pg.evaluate(() => { for (const s of ['.sim-regiao-4', '.sim-regiao-3']) document.querySelector(`${s} img.tr-arte`).src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' })
  await reg('D-regioes-distantes-liberadas')
  await cdp.send('Memory.simulatePressureNotification', { level: 'moderate' })
  await reg('E-apos-pressao-moderada')
  await cdp.send('Memory.simulatePressureNotification', { level: 'critical' })
  await reg('F-apos-pressao-critica')
  // alternativa determinística: ImageBitmap fechado explicitamente
  const bm = await pg.evaluate(async () => {
    const b = await (await fetch(document.querySelector('.tr-regiao-eden img').getAttribute('src'))).blob()
    window.__bm = []; const t = performance.now()
    for (let i = 0; i < 4; i++) window.__bm.push(await createImageBitmap(b))
    return { ms_4_bitmaps: +(performance.now() - t).toFixed(0) }
  })
  await reg('G-4-imagebitmap-abertos')
  await pg.evaluate(() => { window.__bm.forEach((b) => b.close()); window.__bm = [] })
  await reg('H-imagebitmap-fechados')
  fs.writeFileSync(SAIDA, JSON.stringify({ raster: RASTER, qualidade: QUAL, passos, bm }, null, 1))
  await nav.close()
})()
