import type { Progress } from '../types'
import { STORY_SEQUENCE, experiencesOf } from './story'

export interface AchievementDef {
  id: string
  title: string
  description: string
  /** Modo ao qual a conquista pertence, para agrupar na tela. */
  area: 'historia' | 'livre' | 'constancia'
  icon: 'scroll' | 'star' | 'flame' | 'crown' | 'book' | 'shield' | 'compass' | 'laurel' | 'clock' | 'user'
  check: (p: Progress) => boolean
}

const done = (p: Progress, id: string) => Boolean(p.experiences[id]?.completed)
/** Todas as experiências até (e incluindo) `id` na sequência da jornada. */
const doneUpTo = (p: Progress, id: string) => {
  const idx = STORY_SEQUENCE.findIndex((e) => e.id === id)
  return idx >= 0 && STORY_SEQUENCE.slice(0, idx + 1).every((e) => done(p, e.id))
}
const bookDone = (p: Progress, bookId: string) => {
  const exps = experiencesOf(bookId)
  return exps.length > 0 && exps.every((e) => done(p, e.id))
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Modo História
  { id: 'primeiro-passo', area: 'historia', title: 'Primeiro passo', description: 'Conclua sua primeira experiência no Modo História.', icon: 'compass', check: (p) => Object.values(p.experiences).some((e) => e.completed) },
  { id: 'sem-erros', area: 'historia', title: 'Sem tropeços', description: 'Conclua uma experiência acertando todas as perguntas.', icon: 'star', check: (p) => p.stats.perfectExperiences >= 1 },
  { id: 'origens', area: 'historia', title: 'Testemunha das origens', description: 'Conclua as experiências da criação até a queda.', icon: 'scroll', check: (p) => doneUpTo(p, 'gn-queda') },
  { id: 'alianca', area: 'historia', title: 'Guardião da aliança', description: 'Avance até a aliança com Noé.', icon: 'shield', check: (p) => doneUpTo(p, 'gn-alianca-noe') },
  { id: 'patriarcas', area: 'historia', title: 'Peregrino da fé', description: 'Conclua a história de Abraão até o monte Moriá.', icon: 'compass', check: (p) => doneUpTo(p, 'gn-moria') },
  { id: 'genesis', area: 'historia', title: 'Livro de Gênesis', description: 'Conclua todas as experiências de Gênesis.', icon: 'crown', check: (p) => bookDone(p, 'genesis') },
  { id: 'exodo', area: 'historia', title: 'Caminho no mar', description: 'Conclua todas as experiências de Êxodo.', icon: 'laurel', check: (p) => bookDone(p, 'exodo') },
  // Modo Livre
  { id: 'livre-1', area: 'livre', title: 'Desafiante', description: 'Jogue sua primeira partida no Modo Livre.', icon: 'star', check: (p) => p.free.matches >= 1 },
  { id: 'livre-10', area: 'livre', title: 'Competidor', description: 'Jogue 10 partidas no Modo Livre.', icon: 'laurel', check: (p) => p.free.matches >= 10 },
  { id: 'todas-modalidades', area: 'livre', title: 'Explorador de modalidades', description: 'Jogue todas as 7 modalidades do Modo Livre.', icon: 'compass', check: (p) => Object.keys(p.free.byMode).length >= 7 },
  { id: 'detetive', area: 'livre', title: 'Detetive bíblico', description: 'Acerte um "Quem sou eu?" com apenas uma pista.', icon: 'user', check: (p) => p.free.oneClueHits >= 1 },
  { id: 'relampago', area: 'livre', title: 'Relâmpago', description: 'Acerte 10 perguntas numa rodada de Contra o tempo.', icon: 'clock', check: (p) => p.free.bestTimeAttack >= 10 },
  // Constância e conhecimento
  { id: 'constancia-3', area: 'constancia', title: 'Constância', description: 'Mantenha uma sequência de 3 dias de estudo.', icon: 'flame', check: (p) => p.streak.best >= 3 },
  { id: 'constancia-7', area: 'constancia', title: 'Uma semana inteira', description: 'Mantenha uma sequência de 7 dias de estudo.', icon: 'flame', check: (p) => p.streak.best >= 7 },
  { id: 'diario-1', area: 'constancia', title: 'Desafio do dia', description: 'Conclua o desafio diário pela primeira vez.', icon: 'book', check: (p) => p.daily.completedCount >= 1 },
  { id: 'diario-7', area: 'constancia', title: 'Sete manhãs', description: 'Conclua 7 desafios diários.', icon: 'book', check: (p) => p.daily.completedCount >= 7 },
  { id: 'cem-respostas', area: 'constancia', title: 'Estudioso', description: 'Responda 100 perguntas em qualquer modo.', icon: 'book', check: (p) => p.stats.answered >= 100 },
  { id: 'memoria', area: 'historia', title: 'Memória de escriba', description: 'Acerte 5 desafios de memória.', icon: 'scroll', check: (p) => (p.stats.byType.memory?.correct ?? 0) >= 5 },
  { id: 'versiculos', area: 'constancia', title: 'Palavra guardada', description: 'Acerte 10 perguntas de "Complete o versículo".', icon: 'laurel', check: (p) => (p.stats.byType.complete?.correct ?? 0) >= 10 },
]

export const ACHIEVEMENT_AREA_LABEL = { historia: 'Modo História', livre: 'Modo Livre', constancia: 'Constância e conhecimento' } as const
