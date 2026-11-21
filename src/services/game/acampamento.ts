import type { Progress } from '../../types'
import { ELEMENTOS_ACAMPAMENTO, type CondicaoAcampamento, type ElementoAcampamento } from '../../data/acampamento'
import { ACHIEVEMENTS } from '../../data/achievements'
import { levelFromXp } from './levels'
import { allChests, chestState } from './journeyMap'

/*
 * Regras puras da central do acampamento: o que está liberado, a próxima
 * melhoria e o resumo de recompensas. Tudo calculado do progresso real.
 */

function valorAtual(c: CondicaoAcampamento, p: Progress): number {
  switch (c.tipo) {
    case 'sempre':
      return 0
    case 'nivel':
      return levelFromXp(p.xp)
    case 'fases':
      return Object.values(p.experiences).filter((e) => e.completed).length
    case 'conquistas':
      return Object.keys(p.achievements).length
    case 'baus':
      return Object.keys(p.chests).length
  }
}

export function condicaoCumprida(c: CondicaoAcampamento, p: Progress): boolean {
  return c.tipo === 'sempre' || valorAtual(c, p) >= c.valor
}

/** Identificadores dos elementos do cenário já liberados. */
export function elementosLiberados(p: Progress): string[] {
  return ELEMENTOS_ACAMPAMENTO.filter((e) => condicaoCumprida(e.condicao, p)).map((e) => e.id)
}

/** A próxima melhoria do acampamento, com o andamento até ela (ou nada, se tudo já estiver liberado). */
export function proximaMelhoria(p: Progress): { elemento: ElementoAcampamento; atual: number; meta: number } | null {
  const pendentes = ELEMENTOS_ACAMPAMENTO.filter((e) => !condicaoCumprida(e.condicao, p) && e.condicao.tipo !== 'sempre')
  if (!pendentes.length) return null
  // a mais próxima de ser alcançada (maior fração concluída)
  const fr = (e: ElementoAcampamento) => {
    const c = e.condicao as Exclude<CondicaoAcampamento, { tipo: 'sempre' }>
    return valorAtual(c, p) / c.valor
  }
  const e = [...pendentes].sort((a, b) => fr(b) - fr(a))[0]
  const c = e.condicao as Exclude<CondicaoAcampamento, { tipo: 'sempre' }>
  return { elemento: e, atual: Math.min(valorAtual(c, p), c.valor), meta: c.valor }
}

/** Baús do mapa do Modo História prontos para abrir. */
export function bausDisponiveis(p: Progress): number {
  return allChests().filter((c) => chestState(c, p) === 'disponivel').length
}

/** Conquista mais recente (pela data em que foi obtida). */
export function conquistaRecente(p: Progress) {
  const [id] = Object.entries(p.achievements).sort((a, b) => b[1].localeCompare(a[1]))[0] ?? []
  return id ? ACHIEVEMENTS.find((a) => a.id === id) ?? null : null
}

/** Tempo até o próximo desafio diário (meia-noite local), em minutos. */
export function minutosAteAmanha(now = new Date()): number {
  const amanha = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return Math.max(0, Math.ceil((amanha.getTime() - now.getTime()) / 60000))
}

export function formatarTempo(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min`
}
