/*
 * CAPTURAS E MEDIÇÕES DO RELATÓRIO DO MAPA (entrega 2: protótipo do Éden)
 * Uso: node tools/mapa/relatorio.cjs <porta> <pasta>
 * - fotos do mapa (alta, leve e 2D), do Quiz e da página de demonstração dos estados;
 * - toque: o ponto central de cada marco precisa devolver o próprio botão (a arte não cobre nada);
 * - rolagem: quadros durante uma rolagem suave do mapa inteiro (indicativo; o navegador de teste
 *   desenha por software);
 * - peso: bytes das imagens do mapa baixadas pela página.
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const [PORTA = '5199', PASTA = 'relatorio'] = process.argv.slice(2)
fs.mkdirSync(PASTA, { recursive: true })
const URL = `http://localhost:${PORTA}`
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel']
const exp = (s) => ({ completed: true, bestStars: s, bestScore: 80, attempts: 1 })
const MEIO = { [GN[0]]: exp(3), [GN[1]]: exp(2), [GN[2]]: exp(1) }
const BAU = { [GN[0]]: exp(3), [GN[1]]: exp(3), [GN[2]]: exp(2), [GN[3]]: exp(3), [GN[4]]: exp(1) }
const perfil = {
  id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-27T00:00:00.000Z', storage: 'local',
  character: { version: 2, id: 'p-teste', name: 'Tobias', base: 'masculino', body: 'masculino', beard: 'nenhuma', skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1,
    equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: [] } },
}
const medidas = {}

async function abrir(nav, qualidade, experiences, extra = {}) {
  const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, ...extra })
  await ctx.addInitScript(([p, e, q]) => {
    localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p))
    localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: true }))
    if (!localStorage.getItem('bible-quest:v1:progress')) localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: e, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null }))
  }, [perfil, experiences, qualidade])
  const pg = await ctx.newPage()
  pg.setDefaultTimeout(120000)
  const bytes = {}
  pg.on('response', async (r) => {
    if (/mapas\/.*\.webp/.test(r.url())) {
      try { bytes[r.url().replace(/^.*mapas\//, '')] = (await r.body()).length } catch { /* ignorar */ }
    }
  })
  return { ctx, pg, bytes }
}

async function marcosLivres(pg) {
  return pg.evaluate(() => {
    const r = []
    for (const no of document.querySelectorAll('[data-node], [data-qnode]')) {
      const b = no.querySelector('button')
      if (!b) continue
      b.scrollIntoView({ block: 'center' })
      const q = b.getBoundingClientRect()
      const alvo = document.elementFromPoint(q.left + q.width / 2, q.top + q.height * 0.4)
      r.push({ id: no.getAttribute('data-node') || no.getAttribute('data-qnode'), livre: Boolean(alvo && b.contains(alvo)), largura: Math.round(q.width), altura: Math.round(q.height) })
    }
    return r
  })
}

;(async () => {
  const nav = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })

  // 1. História, qualidade alta: fotos, toque e rolagem
  for (const [nome, e] of [['meio', MEIO], ['bau', BAU], ['inicio', {}]]) {
    const { ctx, pg, bytes } = await abrir(nav, 'alta', e)
    await pg.goto(`${URL}/#/historia`)
    await pg.waitForSelector('.tr-arte')
    await pg.waitForFunction(() => [...document.querySelectorAll('img.tr-arte')].every((i) => i.complete && i.naturalWidth > 0))
    await pg.waitForTimeout(2500)
    await pg.screenshot({ path: path.join(PASTA, `historia-${nome}.png`) })
    const eden = pg.locator('.tr-regiao-eden').first()
    await eden.screenshot({ path: path.join(PASTA, `eden-com-marcos-${nome}.png`) })
    if (nome === 'meio') {
      await pg.locator('[data-mundo="mundo-genesis"]').first().screenshot({ path: path.join(PASTA, 'genesis-trecho-inteiro.png') })
      medidas.toque = await marcosLivres(pg)
      medidas.bytesAlta = bytes
      // rolagem suave do topo ao fim da página, contando quadros
      medidas.rolagem = await pg.evaluate(async () => {
        window.scrollTo(0, 0)
        await new Promise((r) => setTimeout(r, 300))
        const alvo = document.documentElement.scrollHeight - innerHeight
        const t0 = performance.now()
        const quadros = []
        let ultimo = t0
        await new Promise((fim) => {
          const passo = (t) => {
            const k = Math.min(1, (t - t0) / 3000)
            window.scrollTo(0, alvo * k)
            quadros.push(t - ultimo)
            ultimo = t
            if (k < 1) requestAnimationFrame(passo)
            else fim()
          }
          requestAnimationFrame(passo)
        })
        const ord = [...quadros].sort((a, b) => a - b)
        return { alturaPagina: document.documentElement.scrollHeight, quadros: quadros.length, mediaMs: +(quadros.reduce((a, b) => a + b, 0) / quadros.length).toFixed(1), p95Ms: +ord[Math.floor(ord.length * 0.95)].toFixed(1), chegouAoFim: Math.abs(scrollY - alvo) < 2 }
      })
    }
    if (nome === 'bau') {
      // o baú do cabeçalho leva ao baú disponível no Éden
      await pg.evaluate(() => window.scrollTo(0, 0))
      await pg.getByRole('button', { name: /pronto para abrir/ }).click()
      await pg.waitForTimeout(1200)
      medidas.bauVisivel = await pg.evaluate(() => {
        const b = document.querySelector('[data-node="bau-mundo-genesis-5"]').getBoundingClientRect()
        return b.top >= 0 && b.bottom <= innerHeight
      })
      await pg.screenshot({ path: path.join(PASTA, 'bau-disponivel-apos-toque-no-cabecalho.png') })
    }
    await ctx.close()
  }

  // 2. qualidade leve e 2D (imagem leve)
  for (const q of ['leve', '2d']) {
    const { ctx, pg, bytes } = await abrir(nav, q, MEIO)
    await pg.goto(`${URL}/#/historia`)
    await pg.waitForSelector('.tr-arte')
    await pg.waitForFunction(() => [...document.querySelectorAll('img.tr-arte')].every((i) => i.complete && i.naturalWidth > 0))
    await pg.waitForTimeout(2500)
    await pg.screenshot({ path: path.join(PASTA, `historia-${q}.png`) })
    medidas[`bytes_${q}`] = bytes
    await ctx.close()
  }

  // 3. Quiz (mesmo motor) e toque nos marcos do Quiz
  {
    const { ctx, pg } = await abrir(nav, 'alta', MEIO)
    await pg.goto(`${URL}/#/quiz`)
    await pg.waitForSelector('.tr-regiao')
    await pg.waitForTimeout(2000)
    await pg.screenshot({ path: path.join(PASTA, 'quiz.png') })
    medidas.toqueQuiz = await marcosLivres(pg)
    await ctx.close()
  }

  // 4. página de demonstração dos estados (mesmos componentes)
  {
    const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 })
    const pg = await ctx.newPage()
    await pg.goto(`${URL}/tools/mapa/demo.html`)
    await pg.waitForSelector('#regiao .tr-arte')
    await pg.waitForTimeout(1500)
    for (const id of ['estados', 'quiz', 'baus', 'regiao']) await pg.locator(`#${id}`).screenshot({ path: path.join(PASTA, `demo-${id}.png`) })
    await ctx.close()
  }

  await nav.close()
  fs.writeFileSync(path.join(PASTA, 'medidas.json'), JSON.stringify(medidas, null, 1))
  console.log(JSON.stringify(medidas, null, 1).slice(0, 2500))
})()
