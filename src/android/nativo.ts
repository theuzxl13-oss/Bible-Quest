/*
 * Integração nativa do aplicativo Android (Capacitor).
 * Carregado SOMENTE no build do aplicativo (`vite build --mode android`): no
 * site, a importação fica atrás de `if (ANDROID)` e é eliminada do pacote.
 *
 * - botão voltar do Android: fecha a janela aberta; senão volta uma tela;
 *   na Central (ou na primeira tela do cadastro), sai do aplicativo;
 * - links externos (http/https de outro endereço) abrem no navegador do
 *   sistema, nunca dentro do aplicativo;
 * - tela de abertura: escondida quando a primeira tela do jogo já foi desenhada.
 */
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { SplashScreen } from '@capacitor/splash-screen'

/** Telas em que o botão voltar sai do aplicativo (não há tela anterior a elas). */
const TELAS_RAIZ = ['/painel', '/', '/boas-vindas', '/entrar']

/** Janelas e painéis abertos por cima da tela, do mais interno para o mais externo. */
const SELETOR_JANELA = '[role="dialog"], .av-janela, .modal, .camp-painel:not([hidden])'

function rotaAtual(): string {
  const h = window.location.hash.replace(/^#/, '')
  return (h.split('?')[0] || '/').replace(/\/+$/, '') || '/'
}

function janelaAberta(): HTMLElement | null {
  const todas = [...document.querySelectorAll<HTMLElement>(SELETOR_JANELA)].filter((el) => {
    if (el.closest('[hidden]')) return false
    const st = getComputedStyle(el)
    return st.display !== 'none' && st.visibility !== 'hidden'
  })
  return todas.at(-1) ?? null
}

/** Fecha a janela aberta como o teclado faria (Esc); se ela não reagir, usa o botão de fechar dela. */
async function fecharJanela(janela: HTMLElement): Promise<boolean> {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
  await new Promise((r) => setTimeout(r, 60))
  if (!janela.isConnected || janelaAberta() !== janela) return true
  const fechar = janela.querySelector<HTMLElement>('[aria-label^="Fechar"], .av-fechar, [data-fechar]')
  if (fechar) {
    fechar.click()
    return true
  }
  return false
}

export async function voltar(): Promise<void> {
  const janela = janelaAberta()
  if (janela && (await fecharJanela(janela))) return
  const rota = rotaAtual()
  if (TELAS_RAIZ.includes(rota)) {
    await App.exitApp()
    return
  }
  // índice do React Router no histórico: 0 significa que não há tela anterior
  const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
  if (idx > 0) window.history.back()
  else window.location.hash = '#/painel'
}

function abrirLinksExternosNoNavegador(): void {
  document.addEventListener(
    'click',
    (e) => {
      const alvo = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href]') : null
      if (!alvo) return
      let url: URL
      try {
        url = new URL(alvo.href, window.location.href)
      } catch {
        return
      }
      if ((url.protocol === 'http:' || url.protocol === 'https:') && url.origin !== window.location.origin) {
        e.preventDefault()
        void Browser.open({ url: url.href })
      }
    },
    true,
  )
}

export function iniciarAplicativo(): void {
  abrirLinksExternosNoNavegador()
  void App.addListener('backButton', () => {
    void voltar()
  })
  // a tela de abertura sai depois que o primeiro quadro do jogo foi desenhado
  requestAnimationFrame(() => requestAnimationFrame(() => void SplashScreen.hide({ fadeOutDuration: 200 })))
}
