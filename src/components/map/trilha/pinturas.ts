/*
 * CARREGAMENTO SOB DEMANDA DAS PINTURAS DO MAPA
 * (docs/relatorios/MAPA_AUDITORIA_MEMORIA_DESEMPENHO.md, § 10; resultados em
 *  docs/relatorios/MAPA_CARREGAMENTO_SOB_DEMANDA.md)
 *
 * Duas peças, ambas fora do React para sobreviver à saída e à volta ao mapa:
 *
 * 1. REGISTRO de pinturas. Cada pintura é baixada UMA vez por um elemento Image fora da
 *    página; a <img> da região só recebe o endereço depois disso. O registro guarda esse
 *    Image enquanto a região estiver entre as LIMITE_REGISTRO usadas por último, mesmo depois
 *    de ela sair da página: assim a imagem continua a mesma para o navegador e, na volta (à
 *    região ou ao mapa), ele reaproveita a decodificação em vez de criar outra cópia.
 *    Trocar a qualidade descarta a versão anterior da região.
 *    O registro NÃO chama decode(): medido no Chromium, decode() força a decodificação em
 *    resolução cheia e a mantém no cache; sem ele, o navegador decodifica na escala em que a
 *    pintura é desenhada e solta o que não usa (metade da memória com duas regiões).
 *
 * 2. GERENCIADOR de distância. Cada região inscrita recebe um estado pela distância, em
 *    telas, até a área visível:
 *      visível (na tela) · perto (até 1,5 tela) · longe (mais de 3 telas).
 *    Entre 1,5 e 3 telas a região mantém o estado anterior (histerese: nada de carregar e
 *    soltar repetidamente na divisa). Só as MAX_PINTURAS regiões mais próximas que não estão
 *    longe têm a pintura na página, qualquer que seja o número de regiões.
 *
 * Remover uma pintura da página NÃO devolve a memória na hora (a auditoria mediu isso): o
 * teto vem de nunca desenhar o que está longe e de nunca duplicar. Não há limpeza forçada.
 */

export const MAX_PINTURAS = 3
/** Pinturas que o registro mantém referenciadas (as da página e as usadas por último). */
export const LIMITE_REGISTRO = 6
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
  naPagina: boolean
  promessa: Promise<void>
  uso: number
}

const registro = new Map<string, Entrada>()
let relogio = 0

type Carregador = (url: string) => { img: HTMLImageElement | null; promessa: Promise<void> }

/** Ambiente sem carregamento de imagens (testes em jsdom): nada a esperar. */
const SEM_CARREGAMENTO = typeof Image === 'undefined' || (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent))

const baixar: Carregador = (url) => {
  if (SEM_CARREGAMENTO) return { img: null, promessa: Promise.resolve() }
  const img = new Image()
  const promessa = new Promise<void>((ok, falha) => {
    img.onload = () => ok()
    img.onerror = () => falha(new Error(`pintura não carregou: ${url}`))
  })
  img.src = url
  return { img, promessa }
}
let carregador: Carregador = baixar
let carregadorDeTeste = false

/** Só para testes: simula o navegador baixando (ou falhando). `null` volta ao normal. */
export function trocarCarregadorParaTestes(c: Carregador | null) {
  carregador = c ?? baixar
  carregadorDeTeste = Boolean(c)
}

function aparar() {
  if (registro.size <= LIMITE_REGISTRO) return
  const antigas = [...registro.values()].sort((a, b) => Number(a.naPagina) - Number(b.naPagina) || a.uso - b.uso)
  for (const e of antigas.slice(0, registro.size - LIMITE_REGISTRO)) registro.delete(e.url)
}

/**
 * Baixa a pintura (uma vez só) e a guarda no registro, marcada como presente na página.
 * Descarta a outra qualidade da mesma região. A promessa falha se o arquivo não carrega.
 */
export function prepararPintura(regiao: string, url: string): Promise<void> {
  for (const [u, e] of registro) if (e.regiao === regiao && u !== url) registro.delete(u)
  let e = registro.get(url)
  if (!e) {
    const { img, promessa } = carregador(url)
    const entrada: Entrada = { regiao, url, img, pronta: false, naPagina: true, uso: 0, promessa: Promise.resolve() }
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
  e.naPagina = true
  aparar()
  return e.promessa
}

export function pinturaPronta(url: string): boolean {
  return registro.get(url)?.pronta === true
}

/**
 * A região foi para longe e a pintura saiu da página. O registro continua com a referência
 * (até o LIMITE_REGISTRO) para que a volta reaproveite a mesma imagem; não força limpeza.
 */
export function soltarPintura(url: string) {
  const e = registro.get(url)
  if (e) e.naPagina = false
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

type Promessa = Promise<void> & { status?: 'pending' | 'fulfilled'; value?: void; criada?: number }
/** Uma falha na abertura não é tentada de novo antes disso (a região tenta mais uma vez sozinha). */
const REUSO_ABERTURA_MS = 10_000
const aberturas = new Map<string, Promessa>()
const RESOLVIDA: Promessa = Object.assign(Promise.resolve(), { status: 'fulfilled' as const, value: undefined })

/**
 * Promessa para o `use()` do mapa: termina quando as pinturas da abertura (a região da fase
 * atual e as vizinhas, que cabem na mesma tela) estão baixadas, ou depois de
 * ESPERA_MAXIMA_ABERTURA_MS, ou se alguma falhar (aí a miniatura cobre). Nunca rejeita.
 * Enquanto ela não termina, a troca de tela (feita em transição pelo roteador) mantém a tela
 * anterior visível. As pinturas usam decoding="sync": o navegador só mostra o quadro do mapa com
 * elas já decodificadas, e a miniatura cobre qualquer atraso (nunca um quadro vazio).
 */
export function aguardarAbertura(alvos: { regiao: string; url: string }[]): Promise<void> {
  const faltam = alvos.slice(0, MAX_PINTURAS).filter((a) => !pinturaPronta(a.url))
  if (!faltam.length) return RESOLVIDA
  // sem carregamento de imagens (testes em jsdom) não há o que esperar: prepara em segundo plano
  if (SEM_CARREGAMENTO && !carregadorDeTeste) {
    for (const a of faltam) prepararPintura(a.regiao, a.url).catch(() => undefined)
    return RESOLVIDA
  }
  const chave = faltam.map((a) => a.url).join('|')
  // A mesma entrada no mapa pode chamar isto várias vezes (o React refaz o componente que
  // esperou): reaproveita a promessa recente, mesmo se a pintura falhou; senão, cada nova
  // tentativa pediria o arquivo de novo e o mapa nunca abriria.
  const existente = aberturas.get(chave)
  if (existente && (existente.status === 'pending' || Date.now() - (existente.criada ?? 0) < REUSO_ABERTURA_MS)) return existente
  const p: Promessa = Promise.race([
    Promise.all(faltam.map((a) => prepararPintura(a.regiao, a.url).catch(() => undefined))),
    new Promise<void>((ok) => setTimeout(ok, ESPERA_MAXIMA_ABERTURA_MS)),
  ]).then(() => {
    p.status = 'fulfilled'
    p.value = undefined
  })
  p.status = 'pending'
  p.criada = Date.now()
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
