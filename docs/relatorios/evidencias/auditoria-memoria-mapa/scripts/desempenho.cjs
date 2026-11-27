// Tempos do mapa: abertura, decodificações (rastro devtools.timeline), rolagem, resposta ao toque, decodificação isolada.
// Uso: node desempenho.cjs <qualidade: alta|leve|2d> <cpu: 1|4|6> <saida.json>
const { chromium } = require('playwright')
const fs = require('fs')
const [QUAL, CPU, SAIDA] = process.argv.slice(2)
const URL = 'http://localhost:5310/'
const ARGS = ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe', 'gn-arca', 'gn-diluvio', 'gn-alianca-noe']
const prog = (n) => Object.fromEntries(GN.slice(0, n).map((id) => [id, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }]))
const perfil = { id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-27T00:00:00.000Z', storage: 'local',
  character: { version: 2, id: 'p', name: 'Tobias', base: 'masculino', body: 'masculino', beard: 'nenhuma', skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1,
    equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: [] } } }
const est = (a) => { const o = [...a].sort((x, y) => x - y); const m = a.reduce((t, v) => t + v, 0) / (a.length || 1); return { n: a.length, media: +m.toFixed(1), mediana: +o[Math.floor(o.length / 2)]?.toFixed(1), p95: +o[Math.floor(o.length * 0.95)]?.toFixed(1), max: +o[o.length - 1]?.toFixed(1) } }

async function contexto(nav) {
  const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/140.0.0.0 Mobile Safari/537.36' })
  await ctx.addInitScript(([p, e, q]) => {
    if (!localStorage.getItem('bible-quest:v1:profile')) {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p))
      localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: true }))
      localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: e, chests: { 'bau-mundo-genesis-5': '2026-11-27T00:00:00Z' }, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null }))
    }
    window.__ev = []; window.__lt = []
    try {
      new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__ev.push({ n: e.name, d: e.duration, p: e.processingEnd - e.processingStart, i: e.processingStart - e.startTime }))).observe({ type: 'event', durationThreshold: 16, buffered: true })
      new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push(e.duration))).observe({ type: 'longtask', buffered: true })
    } catch {}
  }, [perfil, prog(7), QUAL])
  if (process.env.TROCA_ALTA) await ctx.route(/mapas\/genesis\/(eden|diluvio)-leve\.webp/, (r) => r.fulfill({ path: require('path').join(__dirname, 'dist-android/mapas/genesis/' + r.request().url().match(/(eden|diluvio)-leve/)[1] + '.webp'), contentType: 'image/webp' }))
  return ctx
}

async function rastrear(cdpNav, fn) {
  const ev = []
  const fim = new Promise((ok) => cdpNav.once('Tracing.tracingComplete', ok))
  const coleta = (e) => ev.push(...e.value)
  cdpNav.on('Tracing.dataCollected', coleta)
  await cdpNav.send('Tracing.start', { traceConfig: { includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'cc', 'gpu'] }, transferMode: 'ReportEvents' })
  const r = await fn()
  await cdpNav.send('Tracing.end'); await fim
  cdpNav.off('Tracing.dataCollected', coleta)
  const dec = ev.filter((e) => /Decode Image|ImageDecodeTask|Decode LazyPixelRef|ImageFrameGenerator::decode/.test(e.name) && e.ph === 'X')
  const porNome = {}
  for (const e of dec) { const k = e.name; (porNome[k] ??= []).push((e.dur ?? 0) / 1000) }
  const urls = {}
  for (const e of ev) { const u = e.args?.data?.url ?? e.args?.imageUrl; if (u && /mapas/.test(u) && /Decode/.test(e.name)) urls[u.replace(/^.*mapas\//, '')] = (urls[u.replace(/^.*mapas\//, '')] ?? 0) + 1 }
  return { r, decodificacoes: Object.fromEntries(Object.entries(porNome).map(([k, v]) => [k, est(v)])), decodificacoes_por_url: urls }
}

;(async () => {
  const nav = await chromium.launch({ args: ARGS })
  const cdpNav = await nav.newBrowserCDPSession()
  const res = { qualidade: QUAL, cpu: +CPU, abertura_fria: [], abertura_quente: [] }
  for (let rep = 0; rep < 3; rep++) {
    const ctx = await contexto(nav); const pg = await ctx.newPage(); pg.setDefaultTimeout(180000)
    const cdp = await ctx.newCDPSession(pg)
    await pg.goto(URL + '#/painel'); await pg.waitForTimeout(3000)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: +CPU })
    const abrir = async () => {
      const t0 = await pg.evaluate(() => { const t = performance.now(); location.hash = '#/historia'; return t })
      await pg.waitForFunction(() => { const i = [...document.querySelectorAll('img.tr-arte')]; return i.length === 2 && i.every((x) => x.complete && x.naturalWidth > 0) })
      return pg.evaluate(async (t0) => {
        const t1 = performance.now()
        await Promise.all([...document.querySelectorAll('img.tr-arte')].map((i) => i.decode().catch(() => null)))
        const t2 = performance.now()
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        return { carregou_ms: +(t1 - t0).toFixed(0), decodificou_ms: +(t2 - t0).toFixed(0), primeiro_quadro_ms: +(performance.now() - t0).toFixed(0) }
      }, t0)
    }
    const fria = await rastrear(cdpNav, abrir)
    res.abertura_fria.push({ ...fria.r, decodificacoes: fria.decodificacoes, por_url: fria.decodificacoes_por_url })
    await pg.waitForTimeout(1500)
    await pg.evaluate(() => { location.hash = '#/painel' }); await pg.waitForTimeout(2500)
    const quente = await rastrear(cdpNav, abrir)
    res.abertura_quente.push({ ...quente.r, decodificacoes: quente.decodificacoes, por_url: quente.decodificacoes_por_url })
    await pg.waitForTimeout(1500)
    if (rep === 0) {
      // rolagem do mapa inteiro (de cima até o Éden e de volta), com rastro de decodificações
      const rol = await rastrear(cdpNav, () => pg.evaluate(async () => {
        window.__lt.length = 0
        const fim = document.documentElement.scrollHeight - innerHeight
        const q = []
        for (const [de, ate] of [[fim, 0], [0, fim], [fim, 0]]) {
          window.scrollTo(0, de); await new Promise((r) => setTimeout(r, 300))
          const t0 = performance.now(); let u = t0
          await new Promise((ok) => { const passo = (t) => { const k = Math.min(1, (t - t0) / 3000); window.scrollTo(0, de + (ate - de) * k); q.push(t - u); u = t; k < 1 ? requestAnimationFrame(passo) : ok() }; requestAnimationFrame(passo) })
        }
        return { quadros: q.slice(1), longas: [...window.__lt], altura: document.documentElement.scrollHeight }
      }))
      res.rolagem = { quadros: est(rol.r.quadros), acima_33ms: rol.r.quadros.filter((x) => x > 33.4).length, acima_50ms: rol.r.quadros.filter((x) => x > 50).length, tarefas_longas: est(rol.r.longas), altura_pagina: rol.r.altura, decodificacoes: rol.decodificacoes, por_url: rol.decodificacoes_por_url }
      // toques: abrir a janela da fase em marcos do Éden e do Dilúvio e fechar
      await pg.evaluate(() => { window.__ev.length = 0 })
      const ids = await pg.evaluate(() => [...document.querySelectorAll('.tr-pintada [data-node] .tr-botao')].map((b) => b.parentElement.getAttribute('data-node')))
      const toques = []
      for (const id of ids.slice(0, 10)) {
        const b = pg.locator(`[data-node="${id}"] .tr-botao`)
        await b.scrollIntoViewIfNeeded(); await pg.waitForTimeout(300)
        const bb = await b.boundingBox()
        const t = await pg.evaluate(() => performance.now())
        await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height * 0.4)
        await pg.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => null)
        const abriu = await pg.evaluate((t) => performance.now() - t, t)
        toques.push({ id, ms_ate_janela: +abriu.toFixed(0), abriu: abriu < 4900 })
        await pg.keyboard.press('Escape'); await pg.waitForTimeout(300)
        if (await pg.locator('[role="dialog"]').count()) { await pg.locator('[role="dialog"] button').first().click().catch(() => null); await pg.waitForTimeout(300) }
      }
      await pg.waitForTimeout(500)
      const ev = await pg.evaluate(() => window.__ev)
      res.toques = { janela: est(toques.filter((t) => t.abriu).map((t) => t.ms_ate_janela)), sem_janela: toques.filter((t) => !t.abriu).map((t) => t.id), eventos: est(ev.filter((e) => /pointer|click|touch/.test(e.n)).map((e) => e.d)), detalhes: toques }
      // decodificação isolada de cada imagem (createImageBitmap a partir do arquivo já baixado)
      res.decodificacao_isolada = await pg.evaluate(async () => {
        const o = {}
        for (const a of ['eden', 'eden-leve', 'diluvio', 'diluvio-leve']) {
          const blob = await (await fetch(`mapas/genesis/${a}.webp`)).blob()
          const ts = []
          for (let i = 0; i < 5; i++) { const t = performance.now(); const bm = await createImageBitmap(blob); ts.push(performance.now() - t); bm.close() }
          ts.sort((x, y) => x - y); o[a] = { mediana_ms: +ts[2].toFixed(1), min_ms: +ts[0].toFixed(1), max_ms: +ts[4].toFixed(1) }
        }
        return o
      })
    }
    await ctx.close()
  }
  fs.writeFileSync(SAIDA, JSON.stringify(res, null, 1))
  console.log(JSON.stringify({ fria: res.abertura_fria.map((a) => [a.carregou_ms, a.decodificou_ms, a.primeiro_quadro_ms]), quente: res.abertura_quente.map((a) => [a.carregou_ms, a.decodificou_ms, a.primeiro_quadro_ms]), rolagem: { ...res.rolagem, decodificacoes: undefined }, dec: res.rolagem?.decodificacoes, porurl: res.rolagem?.por_url, toques: { janela: res.toques?.janela, eventos: res.toques?.eventos }, iso: res.decodificacao_isolada, decFria: res.abertura_fria[0].decodificacoes, urlFria: res.abertura_fria[0].por_url }))
  await nav.close()
})()
