// Instantâneo do heap depois de N visitas à cena (fora dela, após coleta de lixo): conta objetos
// por construtor e mostra quem segura os contextos WebGL e os WebGLRenderer que já deveriam ter sumido.
// Uso: node heap-retencao.cjs <url> <qualidade> <visitas> <saida.json>
const { chromium } = require('playwright')
const fs = require('fs')
const [URL, QUAL, N, SAIDA] = process.argv.slice(2)
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden']
const perfil = { id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-27T00:00:00.000Z', storage: 'local',
  character: { version: 2, id: 'p', name: 'Tobias', base: 'masculino', body: 'masculino', beard: 'nenhuma', skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1,
    equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: [] } } }
const CONTAR = ['WebGLRenderer', 'WebGL2RenderingContext', 'HTMLCanvasElement', 'Scene', 'Mesh', 'SkinnedMesh', 'InstancedMesh', 'BufferGeometry', 'Texture', 'CanvasTexture',
  'MeshStandardMaterial', 'MeshBasicMaterial', 'WebGLRenderTarget', 'Skeleton', 'Bone', 'AnimationMixer', 'WebGLProgram', 'ResizeObserver', 'IntersectionObserver', 'PerspectiveCamera', 'DirectionalLight']

;(async () => {
  const nav = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
  await ctx.addInitScript(([p, g, q]) => { if (!localStorage.getItem('bible-quest:v1:profile')) {
    localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p)); localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: false }))
    localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: {}, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null })) } }, [perfil, GN, QUAL])
  const pg = await ctx.newPage(); pg.setDefaultTimeout(180000); const cdp = await ctx.newCDPSession(pg)
  const PRONTA = () => Boolean(document.querySelector('.camp-scene.is-3d:not(.is-loading) canvas.camp-canvas'))
  await pg.goto(URL + '#/configuracoes'); await pg.waitForTimeout(2000)
  for (let v = 1; v <= +N; v++) {
    await pg.evaluate(() => { location.hash = '#/painel' }); await pg.waitForFunction(PRONTA); await pg.waitForTimeout(2000)
    await pg.evaluate(() => { location.hash = '#/configuracoes' }); await pg.waitForFunction(() => document.querySelectorAll('input[name=graphics]').length === 4); await pg.waitForTimeout(12000)
  }
  for (let i = 0; i < 3; i++) { await cdp.send('HeapProfiler.collectGarbage'); await pg.waitForTimeout(500) }
  const partes = []
  cdp.on('HeapProfiler.addHeapSnapshotChunk', (e) => partes.push(e.chunk))
  await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false })
  const snap = JSON.parse(partes.join(''))
  const m = snap.snapshot.meta
  const NF = m.node_fields.length, EF = m.edge_fields.length
  const nTipo = m.node_fields.indexOf('type'), nNome = m.node_fields.indexOf('name'), nEdges = m.node_fields.indexOf('edge_count'), nSelf = m.node_fields.indexOf('self_size')
  const eTipo = m.edge_fields.indexOf('type'), eNome = m.edge_fields.indexOf('name_or_index'), eAlvo = m.edge_fields.indexOf('to_node')
  const tiposNo = m.node_types[nTipo], tiposAresta = m.edge_types[eTipo]
  const nodes = snap.nodes, edges = snap.edges, strs = snap.strings
  const total = nodes.length / NF
  const primeiraAresta = new Uint32Array(total + 1)
  for (let i = 0, e = 0; i < total; i++) { primeiraAresta[i] = e; e += nodes[i * NF + nEdges] * EF } primeiraAresta[total] = edges.length
  const nome = (i) => strs[nodes[i * NF + nNome]]
  const tipo = (i) => tiposNo[nodes[i * NF + nTipo]]
  // contagem
  const contagem = {}
  for (let i = 0; i < total; i++) { const n = nome(i); if (tipo(i) === 'object' && CONTAR.includes(n)) contagem[n] = (contagem[n] ?? 0) + 1 }
  // arestas reversas (ignorando fracas)
  const reverso = Array.from({ length: total }, () => [])
  for (let i = 0; i < total; i++) for (let e = primeiraAresta[i]; e < primeiraAresta[i + 1]; e += EF) {
    const t = tiposAresta[edges[e + eTipo]]; if (t === 'weak') continue
    const alvo = edges[e + eAlvo] / NF
    const rot = t === 'element' || t === 'hidden' ? `[${edges[e + eNome]}]` : strs[edges[e + eNome]]
    reverso[alvo].push([i, rot, t])
  }
  // caminho mais curto até a raiz (nó 0) para cada WebGLRenderer
  const caminho = (alvo) => {
    const veio = new Map([[alvo, null]]); const fila = [alvo]
    while (fila.length) { const x = fila.shift(); if (x === 0) break
      for (const [de, rot, t] of reverso[x]) { if (veio.has(de)) continue; const nd = nome(de); if (tipo(de) === 'synthetic' && de !== 0 && /\(Internalized|\(Handle scope|\(Stack roots/.test(nd)) continue; veio.set(de, [x, rot, t]); fila.push(de) } }
    if (!veio.has(0)) return null
    const passos = []; let x = 0
    // reconstrói de 0 até o alvo
    const ida = []; let y = 0; while (y !== alvo) { const [prox, rot, t] = veio.get(y) ?? []; if (prox === undefined) break; ida.push(`${tipo(y)}:${nome(y).slice(0, 50)} -[${t}:${String(rot).slice(0, 40)}]->`); y = prox }
    ida.push(`${tipo(alvo)}:${nome(alvo)}`)
    void passos; void x
    return ida
  }
  const renderers = []; for (let i = 0; i < total; i++) if (tipo(i) === 'object' && nome(i) === 'WebGLRenderer') renderers.push(i)
  const caminhos = renderers.slice(0, 6).map((r) => caminho(r))
  const res = { qualidade: QUAL, visitas: +N, contagem, renderers: renderers.length, caminhos }
  fs.writeFileSync(SAIDA, JSON.stringify(res, null, 1))
  console.log('contagem', JSON.stringify(contagem))
  caminhos.forEach((c, k) => { console.log(`--- WebGLRenderer ${k + 1}:`); (c ?? ['(sem caminho até a raiz)']).slice(-14).forEach((p) => console.log('   ', p)) })
  await nav.close()
})()
