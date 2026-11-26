/*
 * VALIDAÇÃO TÉCNICA DE DESEMPENHO DOS PERSONAGENS (reformulação visual, entrega 1 — refinamento)
 *
 * Não substitui o teste em aparelho real (Moto G75): mede, num Chromium com renderização por
 * software, o que dá para medir sem o aparelho, e grava os números para comparar depois.
 *
 * 1. Estático (dos arquivos GLB publicados): tamanho do arquivo, triângulos do personagem como ele
 *    aparece (corpo + um cabelo + túnica + saia + cinto + sandália), triângulos totais, número e
 *    dimensões das texturas e memória de vídeo estimada das texturas (RGBA + mipmaps).
 * 2. No jogo (Central e guarda-roupa, qualidades "alta" e "leve"): tempo até a cena ficar pronta,
 *    tempo de download do GLB, memória JS (performance.memory), quadros por segundo em 20 s de
 *    cena parada e de giro, erros no console e perda de contexto WebGL (estabilidade).
 *
 * Uso: node tools/personagem/modular/medir-desempenho.cjs <porta> <saida.json>
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const [PORTA = '5199', SAIDA = 'desempenho.json'] = process.argv.slice(2)
const PASTA = path.join(__dirname, '../../../public/models/personagem')

// ------------------------------------------------------------------ 1. estático
function lerGlb(f) {
  const b = fs.readFileSync(f)
  const n = b.readUInt32LE(12)
  const j = JSON.parse(b.subarray(20, 20 + n).toString('utf8'))
  const binIni = 20 + n + 8
  return { j, b, binIni }
}
// dimensões de uma imagem WebP (cabeçalhos VP8, VP8L e VP8X)
function tamanhoWebp(buf) {
  const tipo = buf.toString('ascii', 12, 16)
  if (tipo === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff]
  if (tipo === 'VP8L') {
    const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24]
    return [1 + (((b1 & 0x3f) << 8) | b0), 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6))]
  }
  if (tipo === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)]
  return [0, 0]
}
function estatico(arquivo) {
  const { j, b, binIni } = lerGlb(path.join(PASTA, arquivo))
  const tris = {}
  for (const m of j.meshes) for (const p of m.primitives) {
    const peca = p.material !== undefined ? j.materials[p.material].name.split('__')[1] : '?'
    tris[peca] = (tris[peca] ?? 0) + j.accessors[p.indices].count / 3
  }
  const texturas = (j.images ?? []).map((im) => {
    const v = j.bufferViews[im.bufferView]
    const dados = b.subarray(binIni + (v.byteOffset ?? 0), binIni + (v.byteOffset ?? 0) + v.byteLength)
    const [w, h] = tamanhoWebp(dados)
    return { w, h, bytes: v.byteLength }
  })
  const visivel = (cabelo) => ['Corpo', cabelo, 'Tunica_cima', 'Tunica_saia', 'Cinto_couro', 'Sandalia_simples', 'Sobrancelhas'].reduce((s, p) => s + (tris[p] ?? 0), 0)
  return {
    arquivo,
    bytes: b.length,
    triangulos_total: Object.values(tris).reduce((s, v) => s + v, 0),
    triangulos_visiveis: { cabelo_curto: visivel('Cabelo_curto'), cabelo_longo: visivel('Cabelo_longo') },
    pecas: Object.keys(tris).length,
    texturas: texturas.length,
    maior_textura: texturas.reduce((m, t) => (t.w * t.h > m.w * m.h ? t : m), { w: 0, h: 0 }),
    memoria_texturas_mb: Math.round(texturas.reduce((s, t) => s + t.w * t.h * 4 * 1.333, 0) / 1048576 * 10) / 10,
  }
}

// ------------------------------------------------------------------ 2. no jogo
function perfil(corpo) {
  const base = corpo === 'feminino'
    ? { base: 'feminino', body: 'feminino', beard: 'nenhuma', skin: 2, face: 'suave', hairStyle: 'longo', hairColor: 1, equipped: { tunica: 'tunica-azul', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-corda', acessorios: [] } }
    : { base: 'masculino', body: 'masculino', beard: 'curta', skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1, equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: [] } }
  return { id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-26T00:00:00.000Z', storage: 'local', character: { version: 2, id: 'p-teste', name: 'Teste', ...base } }
}

async function medirTela(nav, corpo, qualidade, tela) {
  const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 })
  await ctx.addInitScript(([p, q]) => {
    localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p))
    localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: false }))
  }, [perfil(corpo), qualidade])
  const pg = await ctx.newPage()
  const erros = []
  pg.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()) })
  pg.on('pageerror', (e) => erros.push(String(e)))
  const rota = tela === 'central' ? '/#/painel' : '/#/guarda-roupa'
  const pronto = tela === 'central' ? '.camp-scene.is-3d:not(.is-loading)' : '.wardrobe-preview .char3d.is-live:not(.is-loading)'
  const t0 = Date.now()
  await pg.goto(`http://localhost:${PORTA}${rota}`)
  await pg.waitForSelector(pronto, { timeout: 180000 })
  const tempoPronto = Date.now() - t0
  // contexto perdido? quadros por segundo em 20 s
  await pg.evaluate(() => {
    window.__perdido = 0
    for (const c of document.querySelectorAll('canvas')) c.addEventListener('webglcontextlost', () => { window.__perdido++ })
  })
  const fps = await pg.evaluate(() => new Promise((ok) => {
    let n = 0
    const ini = performance.now()
    const passo = () => { n++; if (performance.now() - ini < 20000) requestAnimationFrame(passo); else ok(n / ((performance.now() - ini) / 1000)) }
    requestAnimationFrame(passo)
  }))
  const r = await pg.evaluate(() => ({
    glb: performance.getEntriesByType('resource').filter((e) => /heroi-.*\.glb/.test(e.name)).map((e) => ({ arquivo: e.name.split('/').pop(), ms: Math.round(e.duration), bytes: e.transferSize || e.encodedBodySize })),
    heap_mb: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
    perdido: window.__perdido,
  }))
  await ctx.close()
  return { corpo, qualidade, tela, pronto_ms: tempoPronto, fps: Math.round(fps * 10) / 10, ...r, erros: erros.filter((e) => !/favicon|DevTools/.test(e)) }
}

;(async () => {
  const arquivos = fs.readdirSync(PASTA).filter((f) => /^heroi-.*\.glb$/.test(f)).sort()
  const est = arquivos.map(estatico)
  console.table(est.map((e) => ({ arquivo: e.arquivo, MB: (e.bytes / 1048576).toFixed(2), tris: e.triangulos_total, visiveis_curto: e.triangulos_visiveis.cabelo_curto, texturas: e.texturas, tex_MB: e.memoria_texturas_mb })))
  const nav = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-precise-memory-info'] })
  const jogo = []
  for (const corpo of ['masculino', 'feminino']) {
    for (const qualidade of ['alta', 'leve']) {
      for (const tela of ['central', 'guarda-roupa']) {
        const r = await medirTela(nav, corpo, qualidade, tela)
        console.log(JSON.stringify(r))
        jogo.push(r)
      }
    }
  }
  await nav.close()
  fs.writeFileSync(SAIDA, JSON.stringify({ data: new Date().toISOString(), ambiente: 'Chromium sem GPU (SwiftShader), viewport 412x915 — não é o aparelho', estatico: est, jogo }, null, 1))
  const falhas = jogo.filter((r) => r.erros.length || r.perdido)
  console.log(falhas.length ? `ATENÇÃO: ${falhas.length} medições com erro ou contexto perdido` : 'estabilidade: sem erros e sem perda de contexto')
})()
