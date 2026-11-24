/*
 * Diagnóstico da cena 3D da Central ao fechar e reabrir o aplicativo (Android).
 * SÓ OBSERVA: não muda nada no jogo. Roda no fluxo android-verificacoes.yml,
 * depois de verificar-no-emulador.cjs (o perfil de teste já está salvo).
 *
 * Uso: node tools/android/diagnostico-central.cjs <pasta-de-saída>
 *
 * Cenários:
 *   A. com internet: fecha o aplicativo (force-stop) e reabre;
 *   B. em modo avião: fecha e reabre;
 *   C. em modo avião, sem fechar: recarrega a página;
 *   D. em modo avião: fecha, reabre e, depois de 30 s, sai e volta para o aplicativo (tela inicial e volta).
 * Em cada um, aos 5, 15, 30 e 60 s: visibilidade da página, estado da cena, canvas e
 * contexto WebGL, quadros de animação por segundo, renderizador e captura de tela.
 * Também guarda as mensagens do console (logcat Capacitor/Console e chromium).
 */
const { _android } = require('playwright')
const fs = require('fs')
const path = require('path')

const PACOTE = 'com.kzanntech.biblequest'
const SAIDA = path.resolve(process.argv[2] || 'diagnostico-central')
fs.mkdirSync(SAIDA, { recursive: true })
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

async function estado(page) {
  return page.evaluate(async () => {
    const cena = document.querySelector('.camp-scene')
    const canvas = document.querySelector('.camp-canvas-host canvas')
    let contexto = 'sem canvas'
    if (canvas) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      contexto = gl ? (gl.isContextLost() ? 'PERDIDO' : 'ativo') : 'getContext devolveu null'
    }
    const r = canvas?.getBoundingClientRect()
    // quadros de animação em 1 s (0 = a página não está desenhando)
    const quadros = await Promise.race([
      new Promise((ok) => {
        let n = 0
        const t0 = performance.now()
        const f = () => {
          n++
          if (performance.now() - t0 < 1000) requestAnimationFrame(f)
          else ok(n)
        }
        requestAnimationFrame(f)
      }),
      new Promise((ok) => setTimeout(() => ok(0), 2500)),
    ])
    let renderizador = '?'
    try {
      const c = document.createElement('canvas')
      const g = c.getContext('webgl2') || c.getContext('webgl')
      const info = g && g.getExtension('WEBGL_debug_renderer_info')
      renderizador = g ? String(info ? g.getParameter(info.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER)) : 'sem WebGL'
      g?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch (e) {
      renderizador = 'erro: ' + e
    }
    return {
      hash: location.hash,
      visibilidade: document.visibilityState,
      foco: document.hasFocus(),
      online: navigator.onLine,
      cena: cena ? cena.className : 'sem cena',
      canvas: canvas ? { largura: canvas.width, altura: canvas.height, naTela: r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null } : null,
      contexto,
      quadrosPorSegundo: quadros,
      renderizador,
      tempoDesdeAbertura: Math.round(performance.now()),
    }
  })
}

async function abrir(device) {
  await device.shell(`am start -W -n ${PACOTE}/.MainActivity`)
  await espera(3000)
  const webview = await device.webView({ pkg: PACOTE })
  return webview.page()
}

async function seguir(device, page, nome, marcos = [5, 15, 30, 60]) {
  const linhas = []
  let t = 0
  for (const m of marcos) {
    await espera((m - t) * 1000)
    t = m
    const e = await estado(page).catch((err) => ({ erro: String(err) }))
    linhas.push({ segundos: m, ...e })
    console.log(nome, `${m}s`, JSON.stringify(e))
    await fs.promises.writeFile(path.join(SAIDA, `${nome}-${String(m).padStart(2, '0')}s.png`), await device.screenshot())
  }
  return linhas
}

async function modoAviao(device, ligar) {
  await device.shell(`cmd connectivity airplane-mode ${ligar ? 'enable' : 'disable'}`).catch(() => {})
  await device.shell(`svc wifi ${ligar ? 'disable' : 'enable'}`).catch(() => {})
  await device.shell(`svc data ${ligar ? 'disable' : 'enable'}`).catch(() => {})
  await espera(3000)
}

;(async () => {
  const [device] = await _android.devices()
  if (!device) throw new Error('nenhum emulador conectado')
  const resultado = { sistema: (await device.shell('getprop ro.build.type')).toString().trim(), cenarios: {} }

  // A. com internet: fecha e reabre
  await modoAviao(device, false)
  await device.shell(`am force-stop ${PACOTE}`)
  await device.shell('logcat -c')
  let page = await abrir(device)
  resultado.cenarios['A-com-internet-reaberto'] = await seguir(device, page, 'A-com-internet-reaberto')

  // B. em modo avião: fecha e reabre
  await modoAviao(device, true)
  await device.shell(`am force-stop ${PACOTE}`)
  await espera(1500)
  page = await abrir(device)
  resultado.cenarios['B-modo-aviao-reaberto'] = await seguir(device, page, 'B-modo-aviao-reaberto')

  // C. em modo avião, sem fechar: recarrega a página
  await page.reload().catch(() => {})
  resultado.cenarios['C-modo-aviao-recarregado'] = await seguir(device, page, 'C-modo-aviao-recarregado')

  // D. em modo avião: fecha, reabre e, depois, sai para a tela inicial e volta
  await device.shell(`am force-stop ${PACOTE}`)
  await espera(1500)
  page = await abrir(device)
  resultado.cenarios['D-modo-aviao-reaberto'] = await seguir(device, page, 'D-modo-aviao-reaberto', [5, 30])
  await device.shell('input keyevent 3')
  await espera(3000)
  await device.shell(`am start -n ${PACOTE}/.MainActivity`)
  resultado.cenarios['D-modo-aviao-depois-de-voltar'] = await seguir(device, page, 'D-modo-aviao-depois-de-voltar', [5, 15])

  await modoAviao(device, false)
  const log = (await device.shell('logcat -d -v time -s Capacitor/Console:* Capacitor:* chromium:*')).toString()
  fs.writeFileSync(path.join(SAIDA, 'console.txt'), log)
  fs.writeFileSync(path.join(SAIDA, 'diagnostico.json'), JSON.stringify(resultado, null, 2))
  await device.close()
  console.log('diagnóstico salvo em', SAIDA)
})().catch((e) => {
  console.error(e)
  fs.writeFileSync(path.join(SAIDA, 'erro.txt'), String((e && e.stack) || e))
  process.exit(1)
})
