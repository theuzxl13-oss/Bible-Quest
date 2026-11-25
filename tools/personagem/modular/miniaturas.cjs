/*
 * VALIDAÇÃO DAS MINIATURAS NO JOGO (reformulação visual, entrega 1: personagens)
 *
 * Abre o guarda-roupa do jogo de verdade (build servido em http://localhost:PORTA), com um
 * perfil de teste por corpo, e coleta a miniatura 3D de cada opção de Cabelo, Barba, Rosto,
 * Expressão e Corpo. Compara as miniaturas da mesma categoria, duas a duas: a diferença de
 * pixels precisa passar de 3 % (critério P1 do plano). Salva as folhas de miniaturas em PNG.
 *
 * Uso: node tools/personagem/modular/miniaturas.cjs <porta> <pasta-de-saida>
 * (o servidor é o "vite preview" do build; o Chromium do Playwright já vem instalado)
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const [PORTA = '4173', SAIDA = 'miniaturas'] = process.argv.slice(2)
fs.mkdirSync(SAIDA, { recursive: true })

function perfil(corpo) {
  const base = corpo === 'feminino'
    ? { base: 'feminino', body: 'feminino', beard: 'nenhuma', skin: 2, face: 'suave', hairStyle: 'tranca', hairColor: 1, equipped: { tunica: 'tunica-azul', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-corda', acessorios: ['bolsa'] } }
    : { base: 'masculino', body: 'masculino', beard: 'nenhuma', skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1, equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: ['cajado'] } }
  return {
    id: 'teste', nickname: 'Teste', avatar: 'lamp', ageRange: '18mais', createdAt: '2026-11-25T00:00:00.000Z', storage: 'local',
    character: { version: 2, id: 'p-teste', name: corpo === 'feminino' ? 'Lia' : 'Tobias', ...base },
  }
}

// diferença entre duas imagens (fração de pixels que mudam mais de 24 níveis em algum canal)
async function diferenca(pagina, a, b) {
  return pagina.evaluate(async ([a, b]) => {
    const carregar = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src })
    const [ia, ib] = await Promise.all([carregar(a), carregar(b)])
    const w = ia.naturalWidth, h = ia.naturalHeight
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const g = c.getContext('2d')
    g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, w, h).data
    g.clearRect(0, 0, w, h); g.drawImage(ib, 0, 0, w, h); const db = g.getImageData(0, 0, w, h).data
    let dif = 0, n = 0
    for (let i = 0; i < da.length; i += 4) {
      if (da[i + 3] < 10 && db[i + 3] < 10) continue
      n++
      if (Math.abs(da[i] - db[i]) > 24 || Math.abs(da[i + 1] - db[i + 1]) > 24 || Math.abs(da[i + 2] - db[i + 2]) > 24 || Math.abs(da[i + 3] - db[i + 3]) > 60) dif++
    }
    return n ? dif / n : 0
  }, [a, b])
}

;(async () => {
  const navegador = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })
  const relatorio = []
  let falhas = 0
  for (const corpo of ['masculino', 'feminino']) {
    const ctx = await navegador.newContext({ viewport: { width: 1280, height: 1600 }, deviceScaleFactor: 1 })
    await ctx.addInitScript((p) => {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p))
      localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: 'alta', onboardingDone: true, reduceMotion: true }))
    }, perfil(corpo))
    const pagina = await ctx.newPage()
    pagina.setDefaultTimeout(120000)
    await pagina.goto(`http://localhost:${PORTA}/#/guarda-roupa`)
    await pagina.waitForSelector('.wardrobe-tabs')
    const abas = corpo === 'masculino' ? ['Rosto', 'Cabelo', 'Barba'] : ['Rosto', 'Cabelo']
    for (const aba of abas) {
      await pagina.getByRole('tab', { name: aba, exact: true }).click()
      await pagina.waitForTimeout(300)
      // espera todas as miniaturas da aba ficarem prontas
      await pagina.waitForFunction(() => {
        const cards = [...document.querySelectorAll('#wardrobe-tab .option-card')]
        return cards.length > 0 && cards.every((c) => c.querySelector('.option-preview img'))
      }, null, { timeout: 240000 })
      const grupos = await pagina.$$eval('#wardrobe-tab fieldset', (fs) => fs.map((f) => ({
        nome: f.querySelector('legend')?.textContent?.trim() ?? '',
        opcoes: [...f.querySelectorAll('.option-card')].map((c) => ({ rotulo: c.querySelector('strong')?.textContent?.trim() ?? '', src: c.querySelector('.option-preview img')?.getAttribute('src') ?? '' })),
      })).filter((g) => g.opcoes.length > 1))
      for (const g of grupos) {
        for (let i = 0; i < g.opcoes.length; i++) {
          for (let j = i + 1; j < g.opcoes.length; j++) {
            const d = await diferenca(pagina, g.opcoes[i].src, g.opcoes[j].src)
            const ok = d > 0.03
            if (!ok) falhas++
            relatorio.push({ corpo, categoria: g.nome, a: g.opcoes[i].rotulo, b: g.opcoes[j].rotulo, diferenca: Math.round(d * 1000) / 10, ok })
          }
        }
      }
      await pagina.locator('#wardrobe-tab').screenshot({ path: path.join(SAIDA, `${corpo}-${aba.toLowerCase()}.png`) })
    }
    await pagina.locator('.wardrobe-preview').screenshot({ path: path.join(SAIDA, `${corpo}-personagem.png`) })
    await ctx.close()
  }
  await navegador.close()
  fs.writeFileSync(path.join(SAIDA, 'relatorio.json'), JSON.stringify(relatorio, null, 1))
  const menor = relatorio.reduce((m, r) => Math.min(m, r.diferenca), 100)
  console.log(`pares comparados: ${relatorio.length}; menor diferença: ${menor} %; pares abaixo de 3 %: ${falhas}`)
  for (const r of relatorio.filter((r) => !r.ok)) console.log('IGUAIS DEMAIS:', r.corpo, r.categoria, r.a, '×', r.b, r.diferenca + ' %')
  process.exit(falhas ? 1 : 0)
})()
