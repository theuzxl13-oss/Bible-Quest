// Visitas repetidas à Central (cena 3D do menu): menu → Configurações → menu, N vezes.
// Mede a cada visita: tempo de saída, tempo de entrada (até a cena pronta), tarefas longas e quadros
// perdidos; nas visitas marcadas: memória por processo (memory-infra), heap JS, DOM e contadores WebGL.
// Uso: node visitas.cjs <url> <qualidade alta|leve> <N> <saida.json> [destino: configuracoes|historia]
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const { despejar } = require('../memoria/dump.cjs')
const [URL, QUAL, N, SAIDA, DESTINO = 'configuracoes'] = process.argv.slice(2)
const MARCAS = new Set([0, 1, 2, 5, 10, 15, 20, 24, 30, 40, 50].filter((x) => x <= +N))
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe']
const perfil = { id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-27T00:00:00.000Z', storage: 'local',
  character: { version: 2, id: 'p', name: 'Tobias', base: 'masculino', body: 'masculino', beard: 'nenhuma', skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1,
    equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: [] } } }
const MB = (b) => +(b / 1048576).toFixed(1)
const ef = (p, n) => MB(p?.alocadores[n]?.effective ?? 0)

;(async () => {
  const nav = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--js-flags=--expose-gc'] })
  const cdpNav = await nav.newBrowserCDPSession()
  const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
  await ctx.addInitScript({ path: path.join(__dirname, 'instrumentar.js') })
  await ctx.addInitScript(([p, g, q]) => {
    if (!localStorage.getItem('bible-quest:v1:profile')) {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p))
      localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: false }))
      localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: { 'bau-mundo-genesis-5': 'x' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null }))
    }
    window.__lt = []
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true })
  }, [perfil, GN, QUAL])
  const pg = await ctx.newPage(); pg.setDefaultTimeout(120000)
  const cdp = await ctx.newCDPSession(pg)
  const erros = []; pg.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(m.text().slice(0, 200)) })

  const PRONTA = () => Boolean(document.querySelector('.camp-scene.is-3d:not(.is-loading) canvas.camp-canvas'))
  const SAIU = { configuracoes: () => document.querySelectorAll('input[name=graphics]').length === 4, historia: () => document.querySelectorAll('.tr-regiao-diluvio img.tr-arte').length > 0 }[DESTINO]

  async function medirTroca(hash, condicao, janelaQuadros = 2500) {
    return pg.evaluate(async ([hash, condTxt, janela]) => {
      const cond = eval(condTxt)
      window.__lt.length = 0
      const t0 = performance.now(); const inter = []; let u = t0; let pronto = null
      location.hash = hash
      await new Promise((ok) => {
        const passo = (t) => { inter.push(t - u); u = t; if (pronto === null && cond()) pronto = t - t0
          if (pronto !== null && t - t0 > pronto + janela) return ok(); if (t - t0 > 60000) return ok(); requestAnimationFrame(passo) }
        requestAnimationFrame(passo)
      })
      const q = inter.slice(1)
      return { ms: pronto === null ? null : Math.round(pronto), quadros: q.length, quadros_acima_50ms: q.filter((x) => x > 50).length, pior_quadro_ms: Math.round(Math.max(...q)),
        tarefas_longas: window.__lt.filter(([s]) => s >= t0 - 5).map(([s, d]) => [Math.round(s - t0), d]) }
    }, [hash, `(${condicao})`, janelaQuadros])
  }

  async function registrar(visita, onde) {
    for (let i = 0; i < 3; i++) { await cdp.send('HeapProfiler.collectGarbage'); await pg.waitForTimeout(400) }
    await pg.waitForTimeout(1500)
    const d = await despejar(cdpNav)
    const ps = Object.values(d.porProc)
    const r = ps.find((p) => p.nome === 'Renderer'); const g = ps.find((p) => p.nome === 'GPU Process'); const b = ps.find((p) => p.nome === 'Browser')
    const heap = await cdp.send('Runtime.getHeapUsage')
    const dom = await cdp.send('Memory.getDOMCounters')
    const gl = await pg.evaluate(() => window.__glResumo())
    const l = { visita, onde, pegada: { total: MB(ps.reduce((t, p) => t + (p.pegada ?? 0), 0)), renderer: MB(r?.pegada ?? 0), gpu: MB(g?.pegada ?? 0), browser: MB(b?.pegada ?? 0) },
      renderer: { v8: ef(r, 'v8'), blink_gc: ef(r, 'blink_gc'), partition_alloc: ef(r, 'partition_alloc'), malloc: ef(r, 'malloc'), gpu_cliente: ef(r, 'gpu'), canvas: ef(r, 'canvas'), cc_imagens: ef(r, 'cc/image_memory') },
      gpu: { shared_images: ef(g, 'gpu/shared_images'), gl: ef(g, 'gpu/gl'), skia: ef(g, 'skia'), malloc: ef(g, 'malloc'), transfer: ef(g, 'gpu/transfer_cache'), outros_gpu: ef(g, 'gpu') },
      heap_js: MB(heap.usedSize), dom: { nos: dom.nodes, documentos: dom.documents, ouvintes: dom.jsEventListeners }, gl }
    console.log(`visita ${String(visita).padStart(2)} ${onde.padEnd(14)} total ${l.pegada.total} | ren ${l.pegada.renderer} (v8 ${l.renderer.v8}, malloc ${l.renderer.malloc}) | gpu ${l.pegada.gpu} (shared ${l.gpu.shared_images}, gl ${l.gpu.gl}) | heap ${l.heap_js} | nós ${dom.nodes} ouvintes ${dom.jsEventListeners} | ctx criados ${gl.contextos_criados} ativos ${gl.contextos_ativos} js ${gl.contextos_ainda_na_memoria_js} | gl ativos ${JSON.stringify(gl.objetos_gl_nos_ativos)} | shaders ${gl.compilacoes_de_shader}`)
    if (process.env.BRUTO) fs.writeFileSync(SAIDA.replace('.json', `-v${visita}-${onde}-bruto.json`), JSON.stringify(d.porProc))
    return l
  }

  const res = { url: URL, qualidade: QUAL, destino: DESTINO, visitas: [], marcas: [] }
  // entrada inicial
  await pg.goto(URL + '#/' + DESTINO); await pg.waitForFunction(SAIU); await pg.waitForTimeout(2000)
  res.marcas.push(await registrar(0, 'fora-da-cena'))
  for (let v = 1; v <= +N; v++) {
    const entrada = await medirTroca('#/painel', PRONTA, 2500)
    await pg.waitForTimeout(1500)
    if (MARCAS.has(v)) res.marcas.push(await registrar(v, 'na-cena'))
    const saida = await medirTroca('#/' + DESTINO, SAIU, 1000)
    await pg.waitForTimeout(800)
    res.visitas.push({ visita: v, entrada, saida })
    console.log(`  v${v}: entrada ${entrada.ms} ms (longas ${JSON.stringify(entrada.tarefas_longas.map((x) => x[1]))}, quadros>50ms ${entrada.quadros_acima_50ms}) | saída ${saida.ms} ms (longas ${JSON.stringify(saida.tarefas_longas.map((x) => x[1]))})`)
    if (MARCAS.has(v)) res.marcas.push(await registrar(v, 'fora-da-cena'))
  }
  res.erros_console = [...new Set(erros)].slice(0, 20)
  fs.writeFileSync(SAIDA, JSON.stringify(res, null, 1))
  await nav.close()
})()
