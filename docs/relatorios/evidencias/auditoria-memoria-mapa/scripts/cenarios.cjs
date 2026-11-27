// Auditoria de memória do mapa: percurso menu → mapa → Éden/Dilúvio → menu → pressão → mapa → troca de qualidade → menu.
// Uso: node cenarios.cjs <raster: software|gpu> <qualidade inicial: alta|leve|2d> <saida.json>
const { chromium } = require('playwright')
const fs = require('fs')
const { despejar } = require('./dump.cjs')
const [RASTER, QUAL, SAIDA] = process.argv.slice(2)
const URL = 'http://localhost:5310/'
const ARGS = RASTER === 'gpu'
  ? ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : []
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe', 'gn-arca', 'gn-diluvio', 'gn-alianca-noe']
const exp = (s) => ({ completed: true, bestStars: s, bestScore: 80, attempts: 1 })
const prog = (n) => Object.fromEntries(GN.slice(0, n).map((id) => [id, exp(3)]))
const perfil = { id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-27T00:00:00.000Z', storage: 'local',
  character: { version: 2, id: 'p', name: 'Tobias', base: 'masculino', body: 'masculino', beard: 'nenhuma', skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1,
    equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: [] } } }

function pss(pid) {
  try {
    const t = fs.readFileSync(`/proc/${pid}/smaps_rollup`, 'utf8')
    const v = (k) => +(t.match(new RegExp(`^${k}:\\s+(\\d+)`, 'm'))?.[1] ?? 0) / 1024
    return { rss: +v('Rss').toFixed(1), pss: +v('Pss').toFixed(1) }
  } catch { return null }
}
const MB = (b) => +(b / 1048576).toFixed(2)
const pega = (p, n) => MB(p?.alocadores[n]?.effective ?? 0)

;(async () => {
  const nav = await chromium.launch({ args: ARGS })
  const cdpNav = await nav.newBrowserCDPSession()
  const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/140.0.0.0 Mobile Safari/537.36' })
  await ctx.addInitScript(([p, e, q]) => {
    if (!localStorage.getItem('bible-quest:v1:profile')) {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p))
      localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: true }))
      localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: e, chests: { 'bau-mundo-genesis-5': '2026-11-27T00:00:00Z' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null }))
    }
  }, [perfil, prog(7), QUAL])
  if (process.env.TROCA_ALTA) await ctx.route(/mapas\/genesis\/(eden|diluvio)-leve\.webp/, (r) => r.fulfill({ path: require('path').join(__dirname, 'dist-android/mapas/genesis/' + r.request().url().match(/(eden|diluvio)-leve/)[1] + '.webp'), contentType: 'image/webp' }))
  const pg = await ctx.newPage()
  pg.setDefaultTimeout(120000)
  const cdp = await ctx.newCDPSession(pg)
  const baixados = []
  pg.on('response', async (r) => { if (/mapas\/.*\.webp/.test(r.url())) { let n = 0; try { n = (await r.body()).length } catch {} baixados.push({ arq: r.url().replace(/^.*mapas\//, ''), bytes: n, status: r.status(), cache: r.fromServiceWorker() }) } })

  const passos = []
  const espera = (ms) => pg.waitForTimeout(ms)
  async function registrar(nome, extra = {}) {
    await espera(1500)
    await cdp.send('HeapProfiler.collectGarbage')
    await espera(800)
    const d = await despejar(cdpNav)
    const procs = Object.entries(d.porProc)
    const ren = procs.find(([, p]) => p.nome === 'Renderer')
    const gpu = procs.find(([, p]) => p.nome === 'GPU Process')
    const bro = procs.find(([, p]) => p.nome === 'Browser')
    const r = ren?.[1]; const g = gpu?.[1]
    const dom = await pg.evaluate(() => ({
      imgs: [...document.querySelectorAll('img.tr-arte')].map((i) => i.currentSrc.replace(/^.*mapas\//, '')),
      rota: location.hash,
    }))
    const heap = await cdp.send('Runtime.getHeapUsage')
    const linha = {
      passo: nome, ...dom,
      pegada: { renderer: MB(r?.pegada ?? 0), gpu: MB(g?.pegada ?? 0), browser: MB(bro?.[1].pegada ?? 0), total: MB(procs.reduce((t, [, p]) => t + (p.pegada ?? 0), 0)) },
      pss: { renderer: pss(ren?.[0]), gpu: pss(gpu?.[0]), browser: pss(bro?.[0]) },
      renderer: {
        imagens_decodificadas: pega(r, 'cc/image_memory'), tiles: pega(r, 'cc/tile_memory'), skia_cache: pega(r, 'skia/sk_resource_cache'),
        imagens_codificadas: pega(r, 'web_cache/Image_resources'), v8: pega(r, 'v8'), blink_gc: pega(r, 'blink_gc'), partition_alloc: pega(r, 'partition_alloc'), malloc: pega(r, 'malloc'),
        gpu_cliente: pega(r, 'gpu'),
      },
      gpu: { shared_images: pega(g, 'gpu/shared_images'), transfer_cache: pega(g, 'gpu/transfer_cache'), gl: pega(g, 'gpu/gl'), skia: pega(g, 'skia'), cc: pega(g, 'cc'), malloc: pega(g, 'malloc') },
      browser_discardable: pega(bro?.[1], 'discardable'),
      js_heap_usado: MB(heap.usedSize), ...extra,
    }
    passos.push(linha)
    console.log(nome.padEnd(22), 'pegada total', linha.pegada.total, '| ren', linha.pegada.renderer, 'gpu', linha.pegada.gpu, '| img dec', linha.renderer.imagens_decodificadas, 'tiles', linha.renderer.tiles, 'cod', linha.renderer.imagens_codificadas, '| gpu shared', linha.gpu.shared_images, 'transf', linha.gpu.transfer_cache, '|', dom.imgs.join(','))
    if (process.env.TUDO) fs.writeFileSync(SAIDA.replace('.json', `-${nome}-bruto.json`), JSON.stringify(d.porProc, null, 1))
  }
  async function abrirMapa() {
    const t0 = Date.now()
    await pg.evaluate(() => { location.hash = '#/historia' })
    await pg.waitForFunction(() => [...document.querySelectorAll('img.tr-arte')].every((i) => i.complete && i.naturalWidth > 0))
    const t1 = Date.now()
    await pg.evaluate(() => Promise.all([...document.querySelectorAll('img.tr-arte')].map((i) => i.decode().catch(() => null))))
    return { ms_ate_carregar: t1 - t0, ms_ate_decodificar: Date.now() - t0 }
  }
  const rolarAte = (sel) => pg.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), sel)

  await pg.goto(URL + '#/painel')
  await pg.waitForFunction(() => Boolean(document.querySelector('#root > *')))
  await espera(3000)
  await registrar('1-menu-inicial')
  await registrar('2-mapa-aberto', await abrirMapa())
  await rolarAte('.tr-regiao-eden'); await registrar('3-no-eden')
  await rolarAte('.tr-regiao-diluvio'); await registrar('4-no-diluvio')
  for (let i = 0; i < 6; i++) { await rolarAte(i % 2 ? '.tr-regiao-diluvio' : '.tr-regiao-eden'); await espera(500) }
  await rolarAte('[data-mundo="mundo-exodo"]'); await espera(500)
  await rolarAte('.tr-regiao-eden')
  await registrar('5-vai-e-volta')
  await pg.evaluate(() => { location.hash = '#/painel' })
  await registrar('6-voltou-ao-menu')
  await cdp.send('Memory.simulatePressureNotification', { level: 'critical' })
  await registrar('7-menu-apos-pressao')
  await registrar('8-mapa-de-novo', await abrirMapa())
  if (QUAL !== '2d') {
    const outra = QUAL === 'alta' ? 'Leve' : 'Alta'
    await pg.evaluate(() => { location.hash = '#/configuracoes' })
    await pg.waitForFunction(() => document.querySelectorAll('input[name=graphics]').length === 4); await pg.evaluate((o) => [...document.querySelectorAll('input[name=graphics]')].find((i) => i.parentElement.textContent.trim() === o).click(), outra)
    await espera(500)
    await registrar(`9-trocou-para-${outra.toLowerCase()}`, await abrirMapa())
    await rolarAte('.tr-regiao-diluvio'); await espera(400); await rolarAte('.tr-regiao-eden')
    await registrar('10-rolou-nova-qualidade')
  }
  await pg.evaluate(() => { location.hash = '#/painel' })
  await registrar('11-menu-final')
  fs.writeFileSync(SAIDA, JSON.stringify({ raster: RASTER, qualidade: QUAL, args: ARGS, passos, baixados }, null, 1))
  await nav.close()
})()
