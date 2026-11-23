/*
 * Verificações complementares da etapa 1 do aplicativo Android (GitHub Actions,
 * fluxo android-verificacoes.yml). Não muda nada no jogo: só observa os APKs.
 *
 * Uso, com o emulador ligado:
 *   node tools/android/verificacoes-complementares.cjs <apk-depuracao> <apk-lancamento-teste> <pasta-de-saída>
 *
 * 1. Tela de abertura: capturas seguidas logo depois de abrir o aplicativo.
 * 2. Ícone: o aplicativo na lista de aplicativos do lançador.
 * 3. Depuração do WebView:
 *    - APK de depuração: o soquete de depuração do WebView existe;
 *    - build de lançamento (assinado só para este teste com a chave de
 *      depuração do executor, nunca publicado): o soquete não existe.
 *    Precisa de um emulador com sistema "user" (imagem google_apis_playstore).
 * Grava as capturas e um complementos.json na pasta de saída.
 */
const { _android } = require('playwright')
const fs = require('fs')
const path = require('path')

const PACOTE = 'com.kzanntech.biblequest'
const [APK_DEPURACAO, APK_LANCAMENTO, SAIDA_ARG] = process.argv.slice(2)
const SAIDA = path.resolve(SAIDA_ARG || 'verificacoes-complementares')
fs.mkdirSync(SAIDA, { recursive: true })

const resultado = []
let falhas = 0
function confere(nome, ok, detalhe = '') {
  resultado.push({ nome, ok: Boolean(ok), detalhe })
  if (!ok) falhas++
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${nome}${detalhe ? ' — ' + detalhe : ''}`)
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const sh = async (device, cmd) => (await device.shell(cmd)).toString()
const salvar = async (device, nome) => fs.promises.writeFile(path.join(SAIDA, nome), await device.screenshot())

/** Soquetes de depuração do WebView abertos pelo processo do aplicativo. */
async function soquetesDeDepuracao(device) {
  const pid = (await sh(device, `pidof ${PACOTE}`)).trim()
  const unix = await sh(device, 'cat /proc/net/unix')
  const linhas = unix.split('\n').filter((l) => /devtools_remote/.test(l))
  return { pid, todos: linhas.map((l) => l.trim().split(/\s+/).pop()), doApp: linhas.filter((l) => pid && l.includes(`_${pid}`)).length }
}

;(async () => {
  const [device] = await _android.devices()
  if (!device) throw new Error('nenhum emulador conectado')
  await sh(device, 'settings put system screen_off_timeout 600000')
  // Em sistemas "userdebug" ou "eng" (imagens google_apis do emulador), o WebView
  // liga a depuração em TODOS os aplicativos, seja qual for a configuração do app.
  // Por isso este teste exige um sistema "user", como o dos celulares (google_apis_playstore).
  const tipo = (await sh(device, 'getprop ro.build.type')).trim()
  const depuravel = (await sh(device, 'getprop ro.debuggable')).trim()
  confere('sistema do emulador do tipo "user", como o dos celulares', tipo === 'user', `ro.build.type=${tipo} ro.debuggable=${depuravel}`)

  // ---- APK de depuração ----
  await sh(device, `pm uninstall ${PACOTE}`).catch(() => {})
  await device.installApk(APK_DEPURACAO)

  // 1. tela de abertura: abre sem esperar e captura em sequência
  await sh(device, 'input keyevent 3')
  await espera(1500)
  await sh(device, `am start -n ${PACOTE}/.MainActivity`)
  for (let i = 0; i < 8; i++) {
    await salvar(device, `abertura-${String(i).padStart(2, '0')}.png`)
    await espera(250)
  }
  await espera(8000)
  await salvar(device, 'depuracao-jogo-aberto.png')

  // 3a. depuração do WebView ligada no APK de depuração
  const dep = await soquetesDeDepuracao(device)
  confere('APK de depuração: soquete de depuração do WebView aberto', dep.doApp > 0, dep.todos.join(' ') || 'nenhum')

  // 2. ícone na lista de aplicativos do lançador
  await sh(device, 'input keyevent 3')
  await espera(2000)
  await salvar(device, 'lancador-inicio.png')
  await sh(device, 'input swipe 540 2000 540 500 400')
  await espera(2500)
  await salvar(device, 'lancador-aplicativos.png')
  await sh(device, 'input keyevent 3')

  // ---- build de lançamento (somente teste) ----
  await sh(device, `am force-stop ${PACOTE}`)
  await sh(device, `pm uninstall ${PACOTE}`)
  await device.installApk(APK_LANCAMENTO)
  const flags = await sh(device, `dumpsys package ${PACOTE}`)
  const linhaFlags = (flags.split('\n').find((l) => /\bflags=\[/.test(l)) || '').trim()
  confere('build de lançamento instalado sem o atributo DEBUGGABLE', linhaFlags && !/DEBUGGABLE/.test(linhaFlags), linhaFlags)
  await sh(device, `am start -W -n ${PACOTE}/.MainActivity`)
  await espera(10000)
  await salvar(device, 'lancamento-jogo-aberto.png')
  const lan = await soquetesDeDepuracao(device)
  confere('build de lançamento: aplicativo em execução', Boolean(lan.pid), `pid ${lan.pid || '—'}`)
  confere('build de lançamento: nenhum soquete de depuração do WebView', lan.doApp === 0, lan.todos.join(' ') || 'nenhum')
  await sh(device, `am force-stop ${PACOTE}`)
  await sh(device, `pm uninstall ${PACOTE}`)

  fs.writeFileSync(path.join(SAIDA, 'complementos.json'), JSON.stringify({ falhas, resultado }, null, 2))
  await device.close()
  console.log(falhas ? `\n${falhas} verificação(ões) falharam` : '\nTodas as verificações complementares passaram')
  process.exit(falhas ? 1 : 0)
})().catch((e) => {
  console.error(e)
  fs.writeFileSync(path.join(SAIDA, 'erro.txt'), String((e && e.stack) || e))
  process.exit(1)
})
