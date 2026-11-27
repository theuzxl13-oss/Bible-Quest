/*
 * CAPTURAS DO MAPA (reformulação visual, entrega 2: mapa de Gênesis)
 * Abre o mapa do Modo História (e do Quiz) com perfis de progresso de teste e fotografa.
 * Uso: node tools/mapa/capturar.cjs <porta> <pasta> <rótulo> [qualidade]
 * Gera <rótulo>-historia-<progresso>.png (viewport de celular) e <rótulo>-quiz.png.
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const [PORTA = '5199', PASTA = 'mapa', ROTULO = 'atual', QUALIDADE = 'alta'] = process.argv.slice(2)
fs.mkdirSync(PASTA, { recursive: true })

const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe']
const exp = (stars) => ({ completed: true, bestStars: stars, bestScore: 80, attempts: 1 })
const PROGRESSOS = {
  // 3 fases concluídas (3, 2 e 1 estrelas): a 4.ª é a atual; o baú da fase 5 está bloqueado
  meio: { [GN[0]]: exp(3), [GN[1]]: exp(2), [GN[2]]: exp(1) },
  // 5 fases concluídas: baú disponível, a 6.ª é a atual
  bau: { [GN[0]]: exp(3), [GN[1]]: exp(3), [GN[2]]: exp(2), [GN[3]]: exp(3), [GN[4]]: exp(1) },
  // começo: nada concluído
  inicio: {},
}

function perfil() {
  return {
    id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-27T00:00:00.000Z', storage: 'local',
    character: { version: 2, id: 'p-teste', name: 'Tobias', base: 'masculino', body: 'masculino', beard: 'nenhuma', skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1,
      equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: [] } },
  }
}

;(async () => {
  const nav = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })
  for (const [nome, experiences] of Object.entries(PROGRESSOS)) {
    const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 })
    await ctx.addInitScript(([p, e, q]) => {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p))
      localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: true }))
      const pr = JSON.parse(localStorage.getItem('bible-quest:v1:progress') || 'null')
      if (!pr) localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: e, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null }))
    }, [perfil(), experiences, QUALIDADE])
    const pg = await ctx.newPage()
    pg.setDefaultTimeout(120000)
    await pg.goto(`http://localhost:${PORTA}/#/historia`)
    await pg.waitForSelector('.av-mapa')
    await pg.waitForTimeout(2500)
    await pg.screenshot({ path: path.join(PASTA, `${ROTULO}-historia-${nome}.png`) })
    // página inteira do trecho de Gênesis (o mapa todo, para avaliar o cenário)
    const trecho = pg.locator('[data-mundo="mundo-genesis"]').first()
    if (await trecho.count()) await trecho.screenshot({ path: path.join(PASTA, `${ROTULO}-historia-${nome}-genesis.png`) })
    if (nome === 'meio') {
      await pg.goto(`http://localhost:${PORTA}/#/quiz`)
      await pg.waitForSelector('.av-mapa')
      await pg.waitForTimeout(2000)
      await pg.screenshot({ path: path.join(PASTA, `${ROTULO}-quiz.png`) })
    }
    await ctx.close()
  }
  await nav.close()
  console.log('capturas em', PASTA)
})()
