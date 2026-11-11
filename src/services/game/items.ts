import type { CharacterAppearance, Progress } from '../../types'
import { ITEMS, getItem, type CharacterItem, type Requirement } from '../../data/character/items'
import { experiencesOf } from '../../data/story'
import { getBook } from '../../data/bible/canon'
import { ACHIEVEMENTS } from '../../data/achievements'
import { QUIZ_REGIONS } from '../../data/quiz/regions'
import { levelFromXp } from './levels'
import { isQuizRegionComplete } from './quizMap'

/*
 * EVOLUÇÃO VISUAL: desbloqueio de itens de personalização
 * Os requisitos são verificados sobre o progresso real do jogador.
 */

export function totalStars(p: Progress): number {
  return Object.values(p.experiences).reduce((s, e) => s + e.bestStars, 0)
}

export function meetsRequirement(r: Requirement, p: Progress): boolean {
  switch (r.kind) {
    case 'inicial':
      return true
    case 'nivel':
      return levelFromXp(p.xp) >= r.value
    case 'estrelas':
      return totalStars(p) >= r.value
    case 'conquista':
      return Boolean(p.achievements[r.id])
    case 'livro': {
      const exps = experiencesOf(r.id)
      return exps.length > 0 && exps.every((e) => p.experiences[e.id]?.completed)
    }
    case 'bau':
      return Boolean(p.chests[r.id])
    case 'quiz-regiao':
      return isQuizRegionComplete(r.id, p)
    case 'sequencia':
      return p.streak.best >= r.value
  }
}

export function requirementLabel(r: Requirement): string {
  switch (r.kind) {
    case 'inicial':
      return 'Disponível desde o início'
    case 'nivel':
      return `Alcance o nível ${r.value}`
    case 'estrelas':
      return `Junte ${r.value} estrelas no Modo História`
    case 'conquista':
      return `Conquista: ${ACHIEVEMENTS.find((a) => a.id === r.id)?.title ?? r.id}`
    case 'livro':
      return `Conclua o livro de ${getBook(r.id)?.name ?? r.id}`
    case 'bau': {
      const n = r.id.split('-').pop()
      return `Abra o baú depois da fase ${n} no mapa`
    }
    case 'quiz-regiao':
      return `Conclua a região ${QUIZ_REGIONS.find((q) => q.id === r.id)?.title ?? r.id} no Modo Quiz`
    case 'sequencia':
      return `Mantenha uma sequência de ${r.value} dias`
  }
}

export function isItemUnlocked(item: CharacterItem, p: Progress): boolean {
  return item.unlock.kind === 'inicial' || Boolean(p.items.unlocked[item.id]) || meetsRequirement(item.unlock, p)
}

/**
 * Registra no progresso os itens recém-desbloqueados (exceto os iniciais) e
 * os marca como "não vistos" para a tela de recompensa. Função pura.
 */
export function syncUnlockedItems(p: Progress, now = new Date()): { progress: Progress; newItems: string[] } {
  const newItems = ITEMS.filter((i) => i.unlock.kind !== 'inicial' && !p.items.unlocked[i.id] && meetsRequirement(i.unlock, p)).map((i) => i.id)
  if (newItems.length === 0) return { progress: p, newItems }
  const at = now.toISOString()
  return {
    progress: {
      ...p,
      items: {
        unlocked: { ...p.items.unlocked, ...Object.fromEntries(newItems.map((id) => [id, at])) },
        unseen: [...p.items.unseen, ...newItems.filter((id) => !p.items.unseen.includes(id))],
      },
    },
    newItems,
  }
}

/** Equipa um item na aparência, respeitando o encaixe (e a posição, para acessórios). */
export function equipItem(a: CharacterAppearance, itemId: string): CharacterAppearance {
  const item = getItem(itemId)
  if (!item) return a
  const equipped = { ...a.equipped, acessorios: [...a.equipped.acessorios] }
  if (item.slot === 'tunica') equipped.tunica = item.id
  if (item.slot === 'manto') equipped.manto = item.id
  if (item.slot === 'calcado') equipped.calcado = item.id
  if (item.slot === 'cinto') equipped.cinto = item.id
  if (item.slot === 'acessorio') {
    equipped.acessorios = equipped.acessorios.filter((id) => {
      const other = getItem(id)
      return other?.slot === 'acessorio' && other.place !== item.place
    })
    equipped.acessorios.push(item.id)
  }
  return { ...a, equipped }
}

/** Retira um item. Túnica e calçado são obrigatórios e não podem ser retirados. */
export function unequipItem(a: CharacterAppearance, itemId: string): CharacterAppearance {
  const item = getItem(itemId)
  if (!item || item.slot === 'tunica' || item.slot === 'calcado') return a
  const equipped = { ...a.equipped, acessorios: a.equipped.acessorios.filter((id) => id !== itemId) }
  if (item.slot === 'manto' && equipped.manto === itemId) equipped.manto = null
  if (item.slot === 'cinto' && equipped.cinto === itemId) equipped.cinto = null
  return { ...a, equipped }
}

export function isEquipped(a: CharacterAppearance, itemId: string): boolean {
  const e = a.equipped
  return e.tunica === itemId || e.manto === itemId || e.calcado === itemId || e.cinto === itemId || e.acessorios.includes(itemId)
}
