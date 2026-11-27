/*
 * CARREGAMENTO SOB DEMANDA DAS PINTURAS DO MAPA
 * (docs/relatorios/MAPA_AUDITORIA_MEMORIA_DESEMPENHO.md, § 10)
 *
 * Duas peças, ambas fora do React para sobreviver à saída e à volta ao mapa:
 *
 * 1. REGISTRO de pinturas decodificadas (no máximo MAX_PINTURAS). Cada pintura é pedida
 *    UMA vez: um elemento Image fora da página baixa e decodifica (decode()); a <img> da
 *    região só recebe o endereço depois disso. O registro guarda esse Image: enquanto ele
 *    existe, o recurso continua o mesmo e a volta ao mapa reaproveita a pintura em vez de
 *    decodificar outra cópia. Trocar a qualidade descarta a versão anterior da região.
 *
 * 2. GERENCIADOR de distância. Cada região inscrita recebe um estado pela distância, em
 *    telas, até a área visível:
 *      visível (na tela) · perto (até 1,5 tela) · longe (mais de 3 telas).
 *    Entre 1,5 e 3 telas a região mantém o estado anterior (histerese: nada de carregar e
 *    soltar repetidamente na divisa). Só as MAX_PINTURAS regiões mais próximas que não estão
 *    longe podem ter a pintura, qualquer que seja o número de regiões.
 *
 * Remover uma pintura da página NÃO devolve a memória na hora (a auditoria mediu isso): o
 * teto vem de nunca decodificar o que está longe e de nunca duplicar. Não há limpeza forçada.
 */

export const MAX_PINTURAS = 3
export const TELAS_PARA_CARREGAR = 1.5
export const TELAS_PARA_LIBERAR = 3
/** Tempo máximo que a abertura do mapa espera pela pintura da fase atual. */
export const ESPERA_MAXIMA_ABERTURA_MS = 800

export type EstadoPintura = 'longe' | 'perto' | 'visivel'

/* ---------------- regras puras (testadas sem navegador) ---------------- */

/** Distância, em telas, entre a região (topo e base em px da tela) e a área visível. */
export function distanciaEmTelas(topo: number, base: number, alturaTela: number): number {
  const h = alturaTela > 0 ? alturaTela : 1
  if (base < 0) return -base / h
  if (topo > h) return (topo - h) / h
  return 0
}

export function proximoEstado(atual: EstadoPintura, distancia: number): EstadoPintura {
  if (distancia <= 0) return 'visivel'
  if (distancia <= TELAS_PARA_CARREGAR) return 'perto'
  if (distancia > TELAS_PARA_LIBERAR) return 'longe'
  // margem de segurança: quem já tinha a pintura continua com ela; quem estava longe espera chegar a 1,5 tela
  return atual === 'longe' ? 'longe' : 'perto'
}

/** Quais regiões podem ter a pintura: as mais próximas que não estão longe, no máximo `max`. */
export function escolherCarregadas(regioes: { estado: EstadoPintura; distancia: number }[], max = MAX_PINTURAS): boolean[] {
  const ordem = regioes
    .map((r, i) => ({ ...r, i }))
    .filter((r) => r.estado !== 'longe')
    .sort((a, b) => a.distancia - b.distancia || a.i - b.i)
    .slice(0, max)
  const sim = new Set(ordem.map((r) => r.i))
  return regioes.map((_, i) => sim.has(i))
}

/* ---------------- registro de pinturas decodificadas ---------------- */

interface Entrada {
  regiao: string
  url: string
  img: HTMLImageElement | null
  pronta: boolean
  promessa: Promise<void>
  uso: number
}

const registro = new Map<string, Entrada>()
let relogio = 0

function decodificar(url: string): { img: HTMLImageElement | null; promessa: Promise<void> } {
  if (typeof Image === 'undefined') return { img: null, promessa: Promise.resolve() }
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  // navegadores sem decode() (e o ambiente de testes) seguem sem esperar
  const promessa = typeof img.decode === 'function' ? img.decode() : Promise.resolve()
  return { img, promessa }
}

function aparar() {
  if (registro.size <= MAX_PINTURAS) return
  const antigas = [...registro.values()].sort((a, b) => a.uso - b.uso)
  for (const e of antigas.slice(0, registro.size - MAX_PINTURAS)) registro.delete(e.url)
}

/**
 * Baixa e decodifica a pintura (uma vez só) e a guarda no registro.
 * Descarta a outra qualidade da mesma região. A promessa falha se o arquivo não decodifica.
 */
export function prepararPintura(regiao: string, url: string): Promise<void> {
  for (const [u, e] of registro) if (e.regiao === regiao && u !== url) registro.delete(u)
  let e = registro.get(url)
  if (!e) {
    const { img, promessa } = decodificar(url)
    const entrada: Entrada = { regiao, url, img, pronta: false, uso: 0, promessa: Promise.resolve() }
    entrada.promessa = promessa.then(
      () => {
        entrada.pronta = true
      },
      (erro) => {
        if (registro.get(url) === entrada) registro.delete(url)
        throw erro
      },
    )
    registro.set(url, entrada)
    e = entrada
  }
  e.uso = ++relogio
  aparar()
  return e.promessa
}

export function pinturaPronta(url: string): boolean {
  return registro.get(url)?.pronta === true
}

/** A região foi para longe: o registro deixa de segurar a pintura (sem forçar limpeza). */
export function liberarPintura(url: string) {
  registro.delete(url)
}

/** Endereços guardados agora (diagnóstico e testes). */
export function pinturasNoRegistro(): string[] {
  return [...registro.keys()]
}

export function limparRegistroParaTestes() {
  registro.clear()
  aberturas.clear()
}

/* ---------------- abertura do mapa ---------------- */

type Promessa = Promise<void> & { status?: 'pending' | 'fulfilled'; value?: void }
const aberturas = new Map<string, Promessa>()
const RESOLVIDA: Promessa = Object.assign(Promise.resolve(), { status: 'fulfilled' as const, value: undefined })

/**
 * Promessa para o `use()` do mapa: termina quando as pinturas da abertura (a região da fase
 * atual e as vizinhas, que cabem na mesma tela) estão decodificadas, ou depois de
 * ESPERA_MAXIMA_ABERTURA_MS, ou se alguma falhar (aí a miniatura cobre). Nunca rejeita.
 * Enquanto ela não termina, a troca de tela (feita em transição pelo roteador) mantém a tela
 * anterior visível: o mapa aparece já com a pintura, sem quadro vazio.
 */
export function aguardarAbertura(alvos: { regiao: string; url: string }[]): Promise<void> {
  const faltam = alvos.slice(0, MAX_PINTURAS).filter((a) => !pinturaPronta(a.url))
  if (!faltam.length) return RESOLVIDA
  // sem decode() (navegadores antigos e o ambiente de testes) não há o que esperar: prepara em segundo plano
  if (typeof HTMLImageElement === 'undefined' || typeof HTMLImageElement.prototype.decode !== 'function') {
    for (const a of faltam) prepararPintura(a.regiao, a.url).catch(() => undefined)
    return RESOLVIDA
  }
  const chave = faltam.map((a) => a.url).join('|')
  const existente = aberturas.get(chave)
  if (existente && faltam.every((a) => registro.has(a.url))) return existente
  const p: Promessa = Promise.race([
    Promise.all(faltam.map((a) => prepararPintura(a.regiao, a.url).catch(() => undefined))),
    new Promise<void>((ok) => setTimeout(ok, ESPERA_MAXIMA_ABERTURA_MS)),
  ]).then(() => {
    p.status = 'fulfilled'
    p.value = undefined
  })
  p.status = 'pending'
  aberturas.set(chave, p)
  return p
}

/* ---------------- gerenciador de distância ---------------- */

export interface Inscricao {
  elemento: Element
  estado: EstadoPintura
  carregar: boolean
  avisar: (carregar: boolean) => void
}

const inscritos = new Set<Inscricao>()
let quadro = 0
let primeira: ReturnType<typeof setTimeout> | null = null

function agendar() {
  // durante a carência da inscrição, a rolagem é a do próprio mapa indo até a fase atual
  if (primeira || quadro || typeof requestAnimationFrame === 'undefined') return
  quadro = requestAnimationFrame(() => {
    quadro = 0
    avaliar()
  })
}

export function avaliar() {
  if (primeira) {
    clearTimeout(primeira)
    primeira = null
  }
  const lista = [...inscritos]
  const h = typeof window !== 'undefined' ? window.innerHeight : 1
  const dados = lista.map((i) => {
    const r = i.elemento.getBoundingClientRect()
    const distancia = distanciaEmTelas(r.top, r.bottom, h)
    i.estado = proximoEstado(i.estado, distancia)
    return { estado: i.estado, distancia }
  })
  const carregar = escolherCarregadas(dados)
  lista.forEach((i, k) => {
    if (i.carregar !== carregar[k]) {
      i.carregar = carregar[k]
      i.avisar(carregar[k])
    }
  })
}

/**
 * Inscreve uma região (chamada num efeito comum do React). A primeira avaliação acontece 250 ms
 * depois da última inscrição: nesse intervalo o mapa rola até a fase atual (StoryMap, 50 ms,
 * registrado no mesmo lote de efeitos), e avaliar antes olharia o topo da página e soltaria a
 * pintura que acabou de ser preparada para a abertura.
 */
export function inscrever(elemento: Element, carregar: boolean, avisar: (carregar: boolean) => void): () => void {
  const i: Inscricao = { elemento, estado: carregar ? 'visivel' : 'longe', carregar, avisar }
  inscritos.add(i)
  if (inscritos.size === 1 && typeof window !== 'undefined') {
    window.addEventListener('scroll', agendar, { passive: true, capture: true })
    window.addEventListener('resize', agendar, { passive: true })
  }
  if (primeira) clearTimeout(primeira)
  primeira = setTimeout(() => {
    primeira = null
    avaliar()
  }, 250)
  return () => {
    inscritos.delete(i)
    if (inscritos.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('scroll', agendar, { capture: true })
      window.removeEventListener('resize', agendar)
      if (quadro) cancelAnimationFrame(quadro)
      quadro = 0
      if (primeira) clearTimeout(primeira)
      primeira = null
    }
  }
}
