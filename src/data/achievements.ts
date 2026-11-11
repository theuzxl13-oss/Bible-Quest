import type { Progress } from '../types'
import { ALL_CHAPTERS, JOURNEYS } from './journeys'

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: 'scroll' | 'star' | 'flame' | 'crown' | 'book' | 'shield' | 'compass' | 'laurel'
  check: (p: Progress) => boolean
}

const journeyDone = (p: Progress, journeyId: string) =>
  JOURNEYS.find((j) => j.id === journeyId)!.chapters.every((c) => p.chapters[c.id]?.completed)

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'primeiro-passo',
    title: 'Primeiro passo',
    description: 'Conclua o seu primeiro capítulo.',
    icon: 'compass',
    check: (p) => Object.values(p.chapters).some((c) => c.completed),
  },
  {
    id: 'sem-erros',
    title: 'Sem tropeços',
    description: 'Conclua um capítulo acertando todas as perguntas.',
    icon: 'star',
    check: (p) => p.stats.perfectChapters >= 1,
  },
  {
    id: 'origens',
    title: 'Testemunha das origens',
    description: 'Complete a jornada da Criação.',
    icon: 'scroll',
    check: (p) => journeyDone(p, 'criacao'),
  },
  {
    id: 'alianca',
    title: 'Guardião da aliança',
    description: 'Complete a jornada de Noé.',
    icon: 'shield',
    check: (p) => journeyDone(p, 'noe'),
  },
  {
    id: 'peregrino',
    title: 'Peregrino da fé',
    description: 'Complete a jornada de Abraão.',
    icon: 'compass',
    check: (p) => journeyDone(p, 'abraao'),
  },
  {
    id: 'interprete',
    title: 'Intérprete de sonhos',
    description: 'Complete a jornada de José.',
    icon: 'crown',
    check: (p) => journeyDone(p, 'jose'),
  },
  {
    id: 'exodo',
    title: 'Caminho no mar',
    description: 'Complete a jornada de Moisés.',
    icon: 'laurel',
    check: (p) => journeyDone(p, 'moises'),
  },
  {
    id: 'pentateuco',
    title: 'Mestre das origens',
    description: 'Conclua todos os capítulos das cinco jornadas.',
    icon: 'crown',
    check: (p) => ALL_CHAPTERS.every((c) => p.chapters[c.id]?.completed),
  },
  {
    id: 'constancia-3',
    title: 'Constância',
    description: 'Mantenha uma sequência de 3 dias de estudo.',
    icon: 'flame',
    check: (p) => p.streak.best >= 3,
  },
  {
    id: 'constancia-7',
    title: 'Uma semana inteira',
    description: 'Mantenha uma sequência de 7 dias de estudo.',
    icon: 'flame',
    check: (p) => p.streak.best >= 7,
  },
  {
    id: 'diario-1',
    title: 'Desafio do dia',
    description: 'Conclua o desafio diário pela primeira vez.',
    icon: 'book',
    check: (p) => p.daily.completedCount >= 1,
  },
  {
    id: 'cem-respostas',
    title: 'Estudioso',
    description: 'Responda 100 perguntas.',
    icon: 'book',
    check: (p) => p.stats.answered >= 100,
  },
  {
    id: 'memoria',
    title: 'Memória de escriba',
    description: 'Acerte 5 desafios de memória.',
    icon: 'scroll',
    check: (p) => (p.stats.byType.memory?.correct ?? 0) >= 5,
  },
  {
    id: 'versiculos',
    title: 'Palavra guardada',
    description: 'Acerte 10 perguntas de "Complete o versículo".',
    icon: 'laurel',
    check: (p) => (p.stats.byType.complete?.correct ?? 0) >= 10,
  },
]
