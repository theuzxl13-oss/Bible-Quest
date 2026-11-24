/*
 * Roda o BUILD DE DIAGNÓSTICO da Central 3D num emulador e coleta os registros.
 * Só observa: não toca no jogo. Usado pelo fluxo android-diagnostico.yml.
 *
 * Uso: node tools/android/diagnostico/central-efeito.cjs <apk-de-diagnostico> <pasta-de-saída>
 *
 * Rodadas (para separar o efeito das animações do sistema da ordem dos testes):
 *   1. animações do sistema DESLIGADAS
 *   2. animações do sistema LIGADAS
 *   3. animações do sistema DESLIGADAS de novo
 * Em cada rodada, três cenários:
 *   normal        fecha o processo e abre o aplicativo
 *   aviao         o mesmo, em modo avião
 *   segundo-plano abre, espera a cena, vai para a tela inicial (HOME), espera 10 s e volta
 * De cada cenário guarda: o registro da página (window.__bqDiag), as linhas BQDiag
 * (bloqueios da thread principal), os ANR do logcat e capturas de tela.
 */
const { _android } = require('playwright')
const fs = require('fs')
const path = require('path')

const PACOTE = 'com.kzanntech.biblequest'
const [APK, SAIDA_ARG] = process.argv.slice(2)
const SAIDA = path.resolve(SAIDA_ARG || 'diagnostico-central-efeito')
const PERFIL = require('../perfil-teste.json')
fs.mkdirSync(SAIDA, { recursive: true })
const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const ESCALAS = ['window_animation_scale', 'transition_animation_scale', 'animator_duration_scale']

async function sh(device, cmd) {
  return (await device.shell(cmd)).toString()
}

async function pagina(device) {
  for (let i = 0; i < 40; i++) {
    const vistas = device.webViews().filter((w) => w.pkg() === PACOTE)
    const wv = vistas.length ? vistas[vistas.length - 1] : await device.webView({ pkg: PACOTE }).catch(() => null)
    const page = wv ? await wv.page().catch(() => null) : null
    if (page && !page.isClosed() && (await page.evaluate(() => Boolean(window.__bqDiag)).catch(() => false))) return page
    await espera(1000)
  }
  throw new Error('WebView do aplicativo não encontrado')
}

async function modoAviao(device, ligar) {
  await sh(device, `cmd connectivity airplane-mode ${ligar ? 'enable' : 'disable'}`).catch(() => {})
  await sh(device, `svc wifi ${ligar ? 'disable' : 'enable'}`).catch(() => {})
  await sh(device, `svc data ${ligar ? 'disable' : 'enable'}`).catch(() => {})
  await espera(3000)
}

async function animacoes(device, ligadas) {
  for (const k of ESCALAS) await sh(device, `settings put global ${k} ${ligadas ? 1 : 0}`)
  await espera(1000)
  const v = {}
  for (const k of ESCALAS) v[k] = (await sh(device, `settings get global ${k}`)).trim()
  return v
}

/** Linhas do logcat: bloqueios da thread principal (BQDiag) e ANR. */
async function logcat(device) {
  const principal = (await sh(device, 'logcat -d -v time')).split('\n')
  const eventos = (await sh(device, 'logcat -d -v time -b events -s am_anr')).split('\n').filter((l) => /am_anr/.test(l))
  return {
    bloqueios: principal.filter((l) => /BQDiag/.test(l)).map((l) => l.trim()),
    anr: principal.filter((l) => /ANR in com\.kzanntech|Reason: Input dispatching timed out.*kzanntech/.test(l)).map((l) => l.trim()),
    amAnr: eventos.map((l) => l.trim()),
  }
}

/** Resumo: execuções do efeito com o motivo, e quando a cena ficou pronta. */
function resumir(eventos) {
  return eventos
    .filter((e) => /efeito|cena pronta|canvas|render: valores|prefers-reduced|visibilitychange|pageshow|teste:/.test(e.tipo))
    .map((e) => {
      const d = e.detalhe || {}
      const extra = d.motivo ? ` motivo=${JSON.stringify(d.motivo)}` : d.mudou ? ` mudou=${JSON.stringify(d.mudou)}` : d !== undefined && typeof d !== 'object' ? ` ${JSON.stringify(d)}` : ''
      return `${String(e.t).padStart(7)} ms  ${e.tipo}${extra}`
    })
}

async function cenario(device, rodada, nome, fn) {
  const id = `${rodada}-${nome}`
  console.log(`\n=== ${id}`)
  await sh(device, 'logcat -c').catch(() => {})
  await sh(device, 'logcat -b events -c').catch(() => {})
  const page = await fn()
  await fs.promises.writeFile(path.join(SAIDA, `${id}.png`), await device.screenshot())
  const eventos = await page.evaluate(() => window.__bqDiag.eventos).catch((e) => [{ tipo: 'erro ao ler o registro', detalhe: String(e) }])
  const log = await logcat(device)
  const resumo = resumir(eventos)
  const execucoes = eventos.filter((e) => /^efeito executa/.test(e.tipo)).map((e) => ({ t: e.t, hora: e.hora, tipo: e.tipo, motivo: e.detalhe?.motivo, antes: e.detalhe?.antes, depois: e.detalhe?.depois }))
  const r = { cenario: id, execucoesDoEfeito: execucoes, resumo, bloqueiosDaThreadPrincipal: log.bloqueios, anr: log.anr, amAnr: log.amAnr, eventos }
  fs.writeFileSync(path.join(SAIDA, `${id}.json`), JSON.stringify(r, null, 2))
  for (const l of resumo) console.log(l)
  console.log(`execuções do efeito: ${execucoes.length}; bloqueios: ${log.bloqueios.length}; ANR: ${log.anr.filter((l) => /ANR in/.test(l)).length}`)
  return { id, execucoes: execucoes.length, motivos: execucoes.slice(1).map((x) => x.motivo), bloqueios: log.bloqueios, anr: log.anr.filter((l) => /ANR in/.test(l)).length, amAnr: log.amAnr }
}

;(async () => {
  const [device] = await _android.devices()
  if (!device) throw new Error('nenhum emulador conectado')
  const sistema = { tipo: (await sh(device, 'getprop ro.build.type')).trim(), api: (await sh(device, 'getprop ro.build.version.sdk')).trim() }
  console.log('sistema', sistema)

  // instala o build de diagnóstico e grava o perfil de teste (fictício)
  await sh(device, `pm uninstall ${PACOTE}`).catch(() => {})
  await device.installApk(APK)
  const versao = ((await sh(device, `dumpsys package ${PACOTE}`)).match(/versionName=(\S+)/) || [])[1]
  console.log('versão instalada', versao)
  if (!/diagnostico/.test(versao || '')) throw new Error('o APK instalado não é o build de diagnóstico')
  await sh(device, `am start -W -n ${PACOTE}/.MainActivity`)
  await espera(8000)
  let page = await pagina(device)
  await page.evaluate((itens) => { for (const [k, v] of Object.entries(itens)) localStorage.setItem(k, JSON.stringify(v)) }, PERFIL)
  await sh(device, `am force-stop ${PACOTE}`)

  const abrirFrio = async (espera_s) => {
    await sh(device, `am force-stop ${PACOTE}`)
    await espera(1500)
    await sh(device, `am start -n ${PACOTE}/.MainActivity`)
    await espera(espera_s * 1000)
    return pagina(device)
  }

  const rodadas = [['1-animacoes-desligadas', false], ['2-animacoes-ligadas', true], ['3-animacoes-desligadas', false]]
  const resultado = { sistema, versao, rodadas: [] }
  for (const [rodada, ligadas] of rodadas) {
    const escalas = await animacoes(device, ligadas)
    const linhas = []
    await modoAviao(device, false)
    linhas.push(await cenario(device, rodada, 'normal', () => abrirFrio(45)))
    await modoAviao(device, true)
    linhas.push(await cenario(device, rodada, 'aviao', () => abrirFrio(45)))
    await modoAviao(device, false)
    linhas.push(
      await cenario(device, rodada, 'segundo-plano', async () => {
        page = await abrirFrio(40)
        await page.evaluate(() => window.__bqDiag.marca('teste: indo para a tela inicial (HOME)')).catch(() => {})
        await sh(device, 'input keyevent 3')
        await espera(10000)
        await sh(device, `am start -n ${PACOTE}/.MainActivity`)
        await espera(20000)
        await page.evaluate(() => window.__bqDiag.marca('teste: 20 s depois de voltar do segundo plano')).catch(() => {})
        return page
      }),
    )
    resultado.rodadas.push({ rodada, animacoesDoSistema: escalas, cenarios: linhas })
  }
  await animacoes(device, true)
  fs.writeFileSync(path.join(SAIDA, 'resumo.json'), JSON.stringify(resultado, null, 2))
  console.log('\nRESUMO')
  for (const r of resultado.rodadas) for (const c of r.cenarios) console.log(`${c.id}: ${c.execucoes} execução(ões) do efeito; motivos das repetições: ${JSON.stringify(c.motivos)}; bloqueios: ${c.bloqueios.length}; ANR: ${c.anr}`)
  await device.close()
})().catch((e) => {
  console.error(e)
  fs.writeFileSync(path.join(SAIDA, 'erro.txt'), String((e && e.stack) || e))
  process.exit(1)
})
