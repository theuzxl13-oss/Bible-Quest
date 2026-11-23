/*
 * Verificação do APK de depuração num emulador Android (GitHub Actions).
 *
 * Uso: com o emulador ligado e o APK já instalado (adb install):
 *   node tools/android/verificar-no-emulador.cjs <pasta-de-saída>
 *
 * Conecta ao WebView do aplicativo pelo Playwright (APK de depuração: a
 * depuração do WebView fica ligada) e confere:
 *   1. o aplicativo abre e a página vem de arquivos locais (https://localhost);
 *   2. nenhuma requisição sai para a internet;
 *   3. o progresso fica salvo entre aberturas do aplicativo;
 *   4. funciona sem internet (modo avião);
 *   5. o painel administrativo e o multiplayer de demonstração estão inacessíveis;
 *   6. a leitura em voz alta não aparece nas Configurações;
 *   7. o botão voltar volta uma tela e, na Central, sai do aplicativo.
 * Salva capturas da tela do emulador e um resultado.json. Sai com erro se algo falhar.
 */
const { _android } = require('playwright')
const fs = require('fs')
const path = require('path')

const PACOTE = 'com.kzanntech.biblequest'
const SAIDA = path.resolve(process.argv[2] || 'verificacao-android')
const PERFIL = require('./perfil-teste.json')
fs.mkdirSync(SAIDA, { recursive: true })

const resultado = []
let falhas = 0
function confere(nome, ok, detalhe = '') {
  resultado.push({ nome, ok: Boolean(ok), detalhe })
  if (!ok) falhas++
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${nome}${detalhe ? ' — ' + detalhe : ''}`)
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

async function abrir(device) {
  await device.shell(`am start -W -n ${PACOTE}/.MainActivity`)
  await espera(6000)
  const webview = await device.webView({ pkg: PACOTE })
  const page = await webview.page()
  await page.waitForLoadState('domcontentloaded')
  return page
}
async function irPara(page, rota) {
  await page.evaluate((r) => { window.location.hash = r }, rota)
  await espera(2500)
}
/** Espera a cena da Central terminar de carregar (o emulador desenha o 3D por software, devagar). */
async function esperarCentral(page) {
  return page
    .waitForFunction(() => location.hash === '#/painel' && document.querySelector('.camp-scene') && !document.querySelector('.camp-scene.is-loading'), null, { timeout: 90000 })
    .then(() => true)
    .catch(() => false)
}
async function emPrimeiroPlano(device) {
  const s = (await device.shell('dumpsys activity activities')).toString()
  const linha = s.split('\n').find((l) => /mResumedActivity|topResumedActivity/.test(l)) || ''
  return linha.includes(PACOTE)
}

;(async () => {
  const [device] = await _android.devices()
  if (!device) throw new Error('nenhum aparelho ou emulador conectado (adb devices)')
  console.log('Aparelho:', device.model(), device.serial())
  const versao = (await device.shell('getprop ro.build.version.sdk')).toString().trim()
  confere('emulador com Android API 36', versao === '36', `API ${versao}`)

  // 1–2. abertura, arquivos locais e nenhuma requisição externa
  let page = await abrir(device)
  const externas = []
  page.on('request', (r) => { const u = new URL(r.url()); if (!/^(localhost|127\.0\.0\.1)$/.test(u.hostname) && u.protocol.startsWith('http')) externas.push(r.url()) })
  await fs.promises.writeFile(path.join(SAIDA, '01-primeira-abertura.png'), await device.screenshot())
  const origem = await page.evaluate(() => window.location.origin)
  confere('a página vem dos arquivos do aplicativo', origem === 'https://localhost', origem)
  // sem perfil, o jogo abre na rota inicial (endereço sem #, ou #/boas-vindas) com o título do jogo
  const hashInicial = await page.evaluate(() => window.location.hash)
  confere(
    'a primeira tela é a de boas-vindas (sem perfil)',
    ['', '#', '#/', '#/boas-vindas', '#/entrar'].includes(hashInicial) && (await page.locator('h1.welcome-title').isVisible()),
    hashInicial || '(rota inicial)',
  )

  // 3. cria o perfil de teste (fictício) e confere que ele fica salvo entre aberturas
  await page.evaluate((itens) => { for (const [k, v] of Object.entries(itens)) localStorage.setItem(k, JSON.stringify(v)) }, PERFIL)
  await irPara(page, '#/painel')
  await page.reload()
  await espera(6000)
  const centralPronta = await esperarCentral(page)
  await espera(1500)
  await fs.promises.writeFile(path.join(SAIDA, '02-central.png'), await device.screenshot())
  confere('a Central abre com o perfil', (await page.evaluate(() => window.location.hash)) === '#/painel')
  confere('a cena da Central termina de carregar', centralPronta)

  // 5–6. recursos desativados no aplicativo
  await irPara(page, '#/admin')
  confere('painel administrativo inacessível', await page.getByText('Este caminho não está no mapa').isVisible())
  await irPara(page, '#/quiz/multiplayer')
  const hashMulti = await page.evaluate(() => window.location.hash)
  confere('multiplayer de demonstração inacessível (leva ao treino livre)', hashMulti === '#/quiz/treino', hashMulti)
  confere('sem atalho para as salas multiplayer', (await page.getByText('Salas privadas com amigos').count()) === 0)
  await fs.promises.writeFile(path.join(SAIDA, '03-treino-livre.png'), await device.screenshot())
  await irPara(page, '#/configuracoes')
  confere('leitura em voz alta oculta nas Configurações', (await page.getByText('Botões de leitura em voz alta').count()) === 0)
  await fs.promises.writeFile(path.join(SAIDA, '04-configuracoes.png'), await device.screenshot())

  // 7. botão voltar: volta uma tela; na Central, sai do aplicativo
  await irPara(page, '#/painel')
  await esperarCentral(page)
  await irPara(page, '#/biblioteca')
  // confirma que a Biblioteca está de fato na tela (a Central saiu) antes de apertar voltar
  const naBiblioteca = await page
    .waitForFunction(() => location.hash === '#/biblioteca' && !document.querySelector('.camp-scene') && /Biblioteca/i.test(document.querySelector('main')?.textContent || ''), null, { timeout: 30000 })
    .then(() => true)
    .catch(() => false)
  await espera(1500)
  await fs.promises.writeFile(path.join(SAIDA, '05-biblioteca.png'), await device.screenshot())
  confere('a Biblioteca abre (a Central sai da tela)', naBiblioteca, await page.evaluate(() => window.location.hash))
  // diagnóstico do botão voltar: o evento chega à página? há teclado aberto ou erro de JavaScript?
  const errosJs = []
  page.on('pageerror', (e) => errosJs.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errosJs.push(m.text()) })
  await page.evaluate(() => { window.__voltares = 0; document.addEventListener('backbutton', () => { window.__voltares++ }) })
  const antes = await page.evaluate(() => ({ foco: document.activeElement?.tagName + '.' + (document.activeElement?.className || ''), estado: history.state, tamanho: history.length }))
  const teclado = (await device.shell('dumpsys input_method')).toString().split('\n').filter((l) => /mInputShown|mIsInputViewShown|isInputViewShown/.test(l)).map((l) => l.trim()).join(' ')
  await device.shell('input keyevent 4')
  await espera(4000)
  const diag = { antes, teclado, eventosVoltar: await page.evaluate(() => window.__voltares), depois: await page.evaluate(() => ({ hash: location.hash, estado: history.state, tamanho: history.length })), errosJs }
  fs.writeFileSync(path.join(SAIDA, 'diagnostico-voltar.json'), JSON.stringify(diag, null, 2))
  console.log('diagnóstico do voltar:', JSON.stringify(diag))
  const depoisDoVoltar = await page.evaluate(() => window.location.hash)
  const centralDeVolta = await page.evaluate(() => Boolean(document.querySelector('.camp-scene')))
  confere('voltar na Biblioteca leva de volta à Central (o aplicativo continua aberto)', depoisDoVoltar === '#/painel' && centralDeVolta && (await emPrimeiroPlano(device)), depoisDoVoltar)
  await device.shell('input keyevent 4')
  await espera(2500)
  confere('voltar na Central sai do aplicativo', !(await emPrimeiroPlano(device)))

  confere('nenhuma requisição para a internet', externas.length === 0, externas.slice(0, 3).join(' '))

  // 4. sem internet: modo avião, reabre o aplicativo e confere que o progresso continua
  await device.shell('cmd connectivity airplane-mode enable').catch(() => {})
  await device.shell('svc wifi disable').catch(() => {})
  await device.shell('svc data disable').catch(() => {})
  await device.shell(`am force-stop ${PACOTE}`)
  await espera(1500)
  page = await abrir(device)
  await espera(4000)
  await esperarCentral(page)
  await espera(1500)
  await fs.promises.writeFile(path.join(SAIDA, '06-sem-internet.png'), await device.screenshot())
  const hashOffline = await page.evaluate(() => window.location.hash)
  confere('sem internet, o aplicativo abre direto na Central (progresso salvo)', hashOffline === '#/painel', hashOffline)
  confere('sem internet, a Central mostra o jogador', await page.getByText('Tobias').first().isVisible().catch(() => false))

  // registro de erros do aplicativo
  const log = (await device.shell(`logcat -d -s AndroidRuntime:E Capacitor:E chromium:E`)).toString()
  fs.writeFileSync(path.join(SAIDA, 'logcat-erros.txt'), log)
  confere('nenhum travamento (FATAL EXCEPTION)', !/FATAL EXCEPTION/.test(log))

  fs.writeFileSync(path.join(SAIDA, 'resultado.json'), JSON.stringify({ api: versao, falhas, resultado }, null, 2))
  await device.close()
  console.log(falhas ? `\n${falhas} verificação(ões) falharam` : '\nTodas as verificações passaram')
  process.exit(falhas ? 1 : 0)
})().catch((e) => {
  console.error(e)
  fs.writeFileSync(path.join(SAIDA, 'erro.txt'), String(e && e.stack || e))
  process.exit(1)
})
