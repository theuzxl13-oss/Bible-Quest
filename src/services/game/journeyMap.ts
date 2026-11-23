import type { Experience, Progress } from '../../types'
import { WORLDS, type World } from '../../data/worlds'
import { STORY_SEQUENCE, experiencesOf } from '../../data/story'
import { isExperienceCompleted, isExperienceUnlocked } from './progression'
import { CHEST_XP, WORLD_CHEST_XP } from './scoring'
import { syncUnlockedItems } from './items'

/*
 * MAPA DA JORNADA
 * Cada mundo com conteúdo vira um trecho do caminho: fases numeradas em
 * sequência global e baús de recompensa a cada 5 fases e no fim do mundo.
 */

export interface PhaseNode {
  kind: 'phase'
  id: string
  /** Número da fase na jornada inteira (1, 2, 3...). */
  number: number
  experience: Experience
}

export interface ChestNode {
  kind: 'chest'
  id: string
  /** Fase que precisa estar concluída para abrir o baú. */
  afterExperienceId: string
  xp: number
  final: boolean
}

export type MapNode = PhaseNode | ChestNode

export interface WorldSection {
  world: World
  nodes: MapNode[]
  phases: PhaseNode[]
}

export const CHEST_EVERY = 5

export function phaseNumber(experienceId: string): number {
  return STORY_SEQUENCE.findIndex((e) => e.id === experienceId) + 1
}

/** Mundos que já têm fases. */
export function worldSections(): WorldSection[] {
  const out: WorldSection[] = []
  for (const world of WORLDS) {
    const exps = world.books.flatMap((b) => experiencesOf(b))
    if (exps.length === 0) continue
    const nodes: MapNode[] = []
    const phases: PhaseNode[] = []
    exps.forEach((e, i) => {
      const node: PhaseNode = { kind: 'phase', id: e.id, number: phaseNumber(e.id), experience: e }
      nodes.push(node)
      phases.push(node)
      const last = i === exps.length - 1
      if (last || (i + 1) % CHEST_EVERY === 0) {
        nodes.push({ kind: 'chest', id: `bau-${world.id}-${i + 1}`, afterExperienceId: e.id, xp: last ? WORLD_CHEST_XP : CHEST_XP, final: last })
      }
    })
    out.push({ world, nodes, phases })
  }
  return out
}

export function allChests(): ChestNode[] {
  return worldSections().flatMap((s) => s.nodes.filter((n): n is ChestNode => n.kind === 'chest'))
}

export type ChestState = 'aberto' | 'disponivel' | 'fechado'

export function chestState(chest: ChestNode, p: Progress): ChestState {
  if (p.chests[chest.id]) return 'aberto'
  return isExperienceCompleted(chest.afterExperienceId, p) ? 'disponivel' : 'fechado'
}

export type PhaseState = 'concluida' | 'atual' | 'bloqueada'

export function phaseState(id: string, p: Progress): PhaseState {
  if (isExperienceCompleted(id, p)) return 'concluida'
  return isExperienceUnlocked(id, p) ? 'atual' : 'bloqueada'
}

/** Fase em que o avatar deve ficar: a atual ou, se tudo estiver concluído, a última. */
export function avatarPhaseId(p: Progress): string {
  const current = STORY_SEQUENCE.find((e) => phaseState(e.id, p) === 'atual')
  return (current ?? STORY_SEQUENCE[STORY_SEQUENCE.length - 1]).id
}

/** Abre um baú uma única vez. Retorna o XP concedido (0 se não puder abrir). */
export function openChest(p: Progress, chestId: string, now = new Date()): { progress: Progress; xp: number; newItems: string[] } {
  const chest = allChests().find((c) => c.id === chestId)
  if (!chest || chestState(chest, p) !== 'disponivel') return { progress: p, xp: 0, newItems: [] }
  const next = structuredClone(p)
  next.chests[chest.id] = now.toISOString()
  next.xp += chest.xp
  const synced = syncUnlockedItems(next, now)
  return { progress: synced.progress, xp: chest.xp, newItems: synced.newItems }
}

/** Dificuldade exibida da fase, pela média das perguntas. */
export function phaseDifficulty(avg: number): { label: string; level: 1 | 2 | 3 } {
  if (avg < 1.5) return { label: 'Iniciante', level: 1 }
  if (avg < 2) return { label: 'Intermediário', level: 2 }
  return { label: 'Avançado', level: 3 }
}
