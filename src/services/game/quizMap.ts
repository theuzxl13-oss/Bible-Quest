import type { Progress } from '../../types'
import { QUIZ_NODES, QUIZ_REGIONS, type QuizNode } from '../../data/quiz/regions'

/*
 * Progressão do mapa do Modo Quiz, separada do Modo História.
 * - Desafios em sequência dentro da região; a primeira região começa aberta.
 * - Uma região abre quando todos os desafios da anterior foram concluídos.
 */
export function isQuizNodeDone(id: string, p: Progress): boolean {
  return Boolean(p.quiz.nodes[id]?.completed)
}

export function isQuizRegionComplete(regionId: string, p: Progress): boolean {
  const r = QUIZ_REGIONS.find((x) => x.id === regionId)
  return Boolean(r && r.nodes.every((n) => isQuizNodeDone(n.id, p)))
}

export function isQuizRegionUnlocked(regionId: string, p: Progress): boolean {
  const i = QUIZ_REGIONS.findIndex((r) => r.id === regionId)
  return i === 0 || (i > 0 && isQuizRegionComplete(QUIZ_REGIONS[i - 1].id, p))
}

export function isQuizNodeUnlocked(id: string, p: Progress): boolean {
  const node = QUIZ_NODES.find((x) => x.id === id)
  if (!node || !isQuizRegionUnlocked(node.regionId, p)) return false
  if (isQuizNodeDone(id, p)) return true
  const region = QUIZ_REGIONS.find((r) => r.id === node.regionId)!
  const i = region.nodes.findIndex((x) => x.id === id)
  return i === 0 || isQuizNodeDone(region.nodes[i - 1].id, p)
}

export type QuizNodeState = 'concluido' | 'atual' | 'bloqueado'

export function quizNodeState(id: string, p: Progress): QuizNodeState {
  if (isQuizNodeDone(id, p)) return 'concluido'
  return isQuizNodeUnlocked(id, p) ? 'atual' : 'bloqueado'
}

/** Desafio onde o personagem fica no mapa do Quiz. */
export function quizAvatarNode(p: Progress): QuizNode {
  return QUIZ_NODES.find((n) => quizNodeState(n.id, p) === 'atual') ?? QUIZ_NODES[QUIZ_NODES.length - 1]
}

export function quizCompletion(p: Progress) {
  const done = QUIZ_NODES.filter((n) => isQuizNodeDone(n.id, p)).length
  const stars = Object.values(p.quiz.nodes).reduce((s, n) => s + n.bestStars, 0)
  return { done, total: QUIZ_NODES.length, stars, maxStars: QUIZ_NODES.length * 3 }
}
