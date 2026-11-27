// Perfil de CPU (amostragem do V8) da SAÍDA e da ENTRADA da cena, na versão legível (sem minificação).
// Soma o tempo próprio por função e o tempo total (inclusivo) das funções de interesse.
// Uso: node perfil-cpu.cjs <url> <qualidade> <saida.json>
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const [URL, QUAL, SAIDA] = process.argv.slice(2)
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden']
const perfil = { id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-27T00:00:00.000Z', storage: 'local',
  character: { version: 2, id: 'p', name: 'Tobias', base: 'masculino', body: 'masculino', beard: 'nenhuma', skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1,
    equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: [] } } }

function resumir(prof) {
  const porId = new Map(prof.nodes.map((n) => [n.id, n]))
  const pai = new Map(); for (const n of prof.nodes) for (const c of n.children ?? []) pai.set(c, n.id)
  const dt = new Map(); for (let i = 0; i < prof.samples.length; i++) dt.set(prof.samples[i], (dt.get(prof.samples[i]) ?? 0) + (prof.timeDeltas[i] ?? 0) / 1000)
  const proprio = {}; const inclusivo = {}
  const nome = (n) => `${n.callFrame.functionName || '(anônima)'} ${path.basename(n.callFrame.url || '')}:${n.callFrame.lineNumber + 1}`
  for (const [id, ms] of dt) {
    const n = porId.get(id); proprio[nome(n)] = (proprio[nome(n)] ?? 0) + ms
    const vistos = new Set(); let x = id
    while (x !== undefined) { const k = nome(porId.get(x)); if (!vistos.has(k)) { inclusivo[k] = (inclusivo[k] ?? 0) + ms; vistos.add(k) } x = pai.get(x) }
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => [k, Math.round(v)])
  const total = [...dt.values()].reduce((a, b) => a + b, 0)
  return { total_ms: Math.round(total), proprio: top(proprio, 25), inclusivo: top(inclusivo, 45) }
}

;(async () => {
  const nav = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
  await ctx.addInitScript(([p, g, q]) => { if (!localStorage.getItem('bible-quest:v1:profile')) {
    localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p)); localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: false }))
    localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: {}, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null })) } }, [perfil, GN, QUAL])
  const pg = await ctx.newPage(); pg.setDefaultTimeout(120000); const cdp = await ctx.newCDPSession(pg)
  const PRONTA = () => Boolean(document.querySelector('.camp-scene.is-3d:not(.is-loading) canvas.camp-canvas'))
  await pg.goto(URL + '#/configuracoes'); await pg.waitForTimeout(2000)
  // 1ª visita sem perfil (aquece caches: módulo 3D, GLB); o perfil é da 2ª entrada e da 2ª saída
  await pg.evaluate(() => { location.hash = '#/painel' }); await pg.waitForFunction(PRONTA); await pg.waitForTimeout(2000)
  await pg.evaluate(() => { location.hash = '#/configuracoes' }); await pg.waitForTimeout(12000)
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 })
  const res = {}
  await cdp.send('Profiler.start')
  await pg.evaluate(() => { location.hash = '#/painel' }); await pg.waitForFunction(PRONTA); await pg.waitForTimeout(2500)
  res.entrada = resumir((await cdp.send('Profiler.stop')).profile)
  await cdp.send('Profiler.start')
  await pg.evaluate(() => { location.hash = '#/configuracoes' }); await pg.waitForFunction(() => document.querySelectorAll('input[name=graphics]').length === 4); await pg.waitForTimeout(12000)
  res.saida = resumir((await cdp.send('Profiler.stop')).profile)
  fs.writeFileSync(SAIDA, JSON.stringify(res, null, 1))
  for (const k of ['entrada', 'saida']) {
    console.log(`=== ${k}: ${res[k].total_ms} ms amostrados`)
    console.log('  inclusivo:'); for (const [n, v] of res[k].inclusivo.slice(0, 30)) console.log(`   ${String(v).padStart(6)}  ${n}`)
    console.log('  próprio:'); for (const [n, v] of res[k].proprio.slice(0, 12)) console.log(`   ${String(v).padStart(6)}  ${n}`)
  }
  await nav.close()
})()
