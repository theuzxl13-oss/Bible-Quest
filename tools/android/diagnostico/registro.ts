/*
 * REGISTRO DE DIAGNÓSTICO da Central 3D (build temporário, NUNCA no APK oficial).
 *
 * Este arquivo só entra no build de diagnóstico: tools/android/diagnostico/instrumentar.cjs
 * o copia para src/__diagnostico.ts dentro do executor do GitHub Actions e o importa
 * no começo de src/main.tsx. O repositório não o importa em lugar nenhum.
 *
 * Guarda tudo em window.__bqDiag.eventos, desde o primeiro instante da página:
 * - cada execução e limpeza do efeito que cria a cena 3D, com os quatro valores
 *   (qualidade gráfica, animações reduzidas, elementos liberados, baú pronto) e o que mudou;
 * - cada renderização em que algum desses valores mudou;
 * - canvas 3D entrando e saindo; cena pronta;
 * - visibilidade, foco, pageshow/pagehide e mudança da preferência de movimento;
 * - quadros atrasados (intervalo entre quadros acima de 500 ms) e tarefas longas do JavaScript.
 */

export interface ValoresCena {
  qualidade: string
  animacoesReduzidas: boolean
  reduceMotionConfiguracao: boolean
  prefersReducedMotion: boolean
  configuracaoGraficos: string
  elementos: string
  bauPronto: boolean
  estado: string
}

interface Evento {
  t: number
  hora: string
  tipo: string
  detalhe?: unknown
}

interface Diag {
  eventos: Evento[]
  marca(tipo: string, detalhe?: unknown): void
  render(v: ValoresCena): void
  efeito(fase: 'executa' | 'limpeza', v: ValoresCena): void
}

const CHAVES: (keyof ValoresCena)[] = ['qualidade', 'animacoesReduzidas', 'reduceMotionConfiguracao', 'prefersReducedMotion', 'configuracaoGraficos', 'elementos', 'bauPronto']

function diferencas(a: ValoresCena | null, b: ValoresCena): string[] {
  if (!a) return ['(primeira vez)']
  return CHAVES.filter((k) => a[k] !== b[k]).map((k) => `${k}: ${JSON.stringify(a[k])} → ${JSON.stringify(b[k])}`)
}

const eventos: Evento[] = []
let ultimoRender: ValoresCena | null = null
let ultimaExecucao: ValoresCena | null = null
let execucoes = 0

const diag: Diag = {
  eventos,
  marca(tipo, detalhe) {
    const t = Math.round(performance.now())
    eventos.push({ t, hora: new Date().toISOString(), tipo, detalhe })
    if (eventos.length > 2000) eventos.splice(0, eventos.length - 2000)
    // também no logcat (Capacitor/Console), para medir em aparelhos físicos só com o adb
    try {
      console.info(`BQDiag|${tipo}|relogio=${Date.now()}|t=${t}|${detalhe === undefined ? '' : JSON.stringify(detalhe).slice(0, 400)}`)
    } catch {
      /* ignora */
    }
  },
  render(v) {
    const mudou = diferencas(ultimoRender, v)
    if (mudou.length) diag.marca('render: valores mudaram', { mudou, valores: v })
    ultimoRender = v
  },
  efeito(fase, v) {
    if (fase === 'executa') {
      execucoes++
      diag.marca(`efeito executa #${execucoes}`, { motivo: diferencas(ultimaExecucao, v), antes: ultimaExecucao, depois: v })
      ultimaExecucao = v
    } else {
      diag.marca(`efeito limpeza (antes da execução #${execucoes + 1} ou ao sair)`, { valoresDaExecucaoAnterior: v })
    }
  },
}

;(window as unknown as { __bqDiag: Diag }).__bqDiag = diag
diag.marca('página iniciada', { url: location.href, userAgent: navigator.userAgent })

// canvas 3D entrando e saindo
new MutationObserver((ms) => {
  for (const m of ms) {
    for (const n of Array.from(m.addedNodes)) if (n.nodeName === 'CANVAS') diag.marca('+canvas')
    for (const n of Array.from(m.removedNodes)) if (n.nodeName === 'CANVAS') diag.marca('-canvas')
  }
}).observe(document.documentElement, { childList: true, subtree: true })

// marcos de tela: boas-vindas visível, Central visível (o desenho acontece no quadro seguinte)
const vistos = new Set<string>()
const marcos: [string, string][] = [
  ['.welcome-title', 'tela de boas-vindas visível'],
  ['.camp-scene', 'Central visível'],
]
const procurarMarcos = () => {
  for (const [sel, nome] of marcos) {
    if (!vistos.has(nome) && document.querySelector(sel)) {
      vistos.add(nome)
      requestAnimationFrame(() => requestAnimationFrame(() => diag.marca(nome)))
    }
  }
}
new MutationObserver(procurarMarcos).observe(document.documentElement, { childList: true, subtree: true })

// tempo de resposta aos toques (Event Timing): atraso até o jogo começar a tratar e duração total até o desenho
try {
  new PerformanceObserver((lista) => {
    for (const e of lista.getEntries() as PerformanceEventTiming[]) {
      if (!['pointerdown', 'pointerup', 'click', 'keydown'].includes(e.name)) continue
      diag.marca('toque', { evento: e.name, duracaoMs: Math.round(e.duration), atrasoDeEntradaMs: Math.round(e.processingStart - e.startTime) })
    }
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
} catch {
  diag.marca('Event Timing indisponível')
}

// ciclo de vida da página
document.addEventListener('visibilitychange', () => diag.marca('visibilitychange', document.visibilityState))
window.addEventListener('focus', () => diag.marca('focus'))
window.addEventListener('blur', () => diag.marca('blur'))
window.addEventListener('pageshow', (e) => diag.marca('pageshow', { persisted: (e as PageTransitionEvent).persisted }))
window.addEventListener('pagehide', () => diag.marca('pagehide'))
window.addEventListener('resize', () => diag.marca('resize', { w: innerWidth, h: innerHeight }))
const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
diag.marca('prefers-reduced-motion inicial', mq.matches)
mq.addEventListener('change', (e) => diag.marca('prefers-reduced-motion mudou', e.matches))

// quadros atrasados (a página parou de desenhar por mais de 500 ms)
let anterior = performance.now()
const quadro = (agora: number) => {
  const intervalo = agora - anterior
  if (intervalo > 500) diag.marca('quadro atrasado', { ms: Math.round(intervalo) })
  anterior = agora
  requestAnimationFrame(quadro)
}
requestAnimationFrame(quadro)

// tarefas longas do JavaScript (bloqueiam a página)
try {
  new PerformanceObserver((lista) => {
    for (const e of lista.getEntries()) if (e.duration > 200) diag.marca('tarefa longa (JS)', { ms: Math.round(e.duration), inicio: Math.round(e.startTime) })
  }).observe({ type: 'longtask', buffered: true })
} catch {
  diag.marca('longtask indisponível')
}

export {}
