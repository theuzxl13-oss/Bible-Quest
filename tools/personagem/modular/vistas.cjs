/*
 * VISTAS DO PERSONAGEM NO JOGO (frente, lado e costas), para comparar versões.
 * Abre o guarda-roupa com um perfil de teste e fotografa o personagem nas três vistas.
 * Uso: node tools/personagem/modular/vistas.cjs <porta> <pasta> <rótulo> [qualidade]
 * Gera <pasta>/<rótulo>-<corpo>-<visual>.png para alguns visuais de cada corpo.
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const [PORTA = '5199', PASTA = 'vistas', ROTULO = 'depois', QUALIDADE = 'alta'] = process.argv.slice(2)
fs.mkdirSync(PASTA, { recursive: true })

const VISUAIS = {
  masculino: [
    { nome: 'tunica', hairStyle: 'curto', beard: 'nenhuma', tunica: 'tunica-terra', cinto: 'faixa-vermelha', manto: 'manto-azul' },
    { nome: 'barba', hairStyle: 'ondulado', beard: 'cheia', tunica: 'tunica-bordada', cinto: 'cinto-bronze', manto: null },
    { nome: 'simples', hairStyle: 'curto', beard: 'nenhuma', tunica: 'tunica-terra', cinto: 'cinto-couro', manto: null },
  ],
  feminino: [
    { nome: 'tunica', hairStyle: 'longo', beard: 'nenhuma', tunica: 'tunica-azul', cinto: 'faixa-dourada', manto: 'manto-marrom' },
    { nome: 'medio', hairStyle: 'ondulado', beard: 'nenhuma', tunica: 'tunica-purpura', cinto: 'cinto-corda', manto: 'xale-listrado' },
    { nome: 'simples', hairStyle: 'longo', beard: 'nenhuma', tunica: 'tunica-azul', cinto: 'cinto-corda', manto: null },
  ],
}

function perfil(corpo, v) {
  return {
    id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-26T00:00:00.000Z', storage: 'local',
    character: {
      version: 2, id: 'p-teste', name: 'Teste', base: corpo, body: corpo, beard: v.beard, skin: corpo === 'feminino' ? 2 : 1, face: 'suave',
      hairStyle: v.hairStyle, hairColor: 1, equipped: { tunica: v.tunica, manto: v.manto ?? null, calcado: 'sandalias-simples', cinto: v.cinto, acessorios: [] },
    },
  }
}

;(async () => {
  const nav = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })
  for (const corpo of ['masculino', 'feminino']) {
    for (const v of VISUAIS[corpo]) {
      const ctx = await nav.newContext({ viewport: { width: 1100, height: 1300 }, deviceScaleFactor: 2 })
      await ctx.addInitScript(([p, q]) => {
        localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p))
        localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: true }))
      }, [perfil(corpo, v), QUALIDADE])
      const pg = await ctx.newPage()
      pg.setDefaultTimeout(180000)
      await pg.goto(`http://localhost:${PORTA}/#/guarda-roupa`)
      await pg.waitForSelector('.wardrobe-preview .char3d.is-live:not(.is-loading)')
      await pg.waitForTimeout(1500)
      for (const vista of ['Frente', 'Lado', 'Costas']) {
        await pg.getByRole('button', { name: vista, exact: true }).click()
        await pg.waitForTimeout(1600)
        await pg.locator('.wardrobe-preview canvas').first().screenshot({ path: path.join(PASTA, `${ROTULO}-${corpo}-${v.nome}-${vista.toLowerCase()}.png`) })
      }
      await ctx.close()
    }
  }
  await nav.close()
  console.log('vistas salvas em', PASTA)
})()
