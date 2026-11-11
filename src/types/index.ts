// Tipos de domínio do Bible Quest.
// Estes contratos são os mesmos que serão usados quando o armazenamento local
// for substituído pelo Supabase (ver src/services e docs/supabase/schema.sql).

export type JourneyId = 'criacao' | 'noe' | 'abraao' | 'jose' | 'moises'

export type Difficulty = 1 | 2 | 3

export type QuestionCategory =
  | 'narrativa'
  | 'personagens'
  | 'versiculos'
  | 'historia'
  | 'geografia'
  | 'cronologia'
  | 'livros'

export type QuestionType =
  | 'multiple'
  | 'complete'
  | 'truefalse'
  | 'whoami'
  | 'book'
  | 'order'
  | 'memory'

interface QuestionBase {
  id: string
  journeyId: JourneyId
  chapterId: string
  type: QuestionType
  difficulty: Difficulty
  category: QuestionCategory
  /** Enunciado mostrado ao jogador. */
  prompt: string
  /** Explicação exibida após a resposta. */
  explanation: string
  /** Referência bíblica verificável, ex.: "Gênesis 1:1". */
  reference: string
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple' | 'book' | 'whoami' | 'complete'
  options: string[]
  /** Índice da opção correta. */
  answer: number
  /** Pistas (usado em "Quem sou eu?"). */
  clues?: string[]
  /** Trecho com lacuna "____" (usado em "Complete o versículo"). */
  verse?: string
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'truefalse'
  answer: boolean
}

export interface OrderQuestion extends QuestionBase {
  type: 'order'
  /** Itens já na ordem correta. A interface embaralha. */
  items: string[]
}

export interface MemoryQuestion extends QuestionBase {
  type: 'memory'
  /** Pares que o jogador precisa associar. */
  pairs: { a: string; b: string }[]
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | OrderQuestion
  | MemoryQuestion

export interface ScripturePassage {
  reference: string
  text: string
}

export interface Chapter {
  id: string
  journeyId: JourneyId
  order: number
  title: string
  /** Passagem bíblica que o capítulo cobre. */
  scope: string
  image: string
  /** Narrativa dramatizada (texto da equipe, não é texto bíblico). */
  narrative: string[]
  /** Explicação histórica e bíblica. */
  context: string[]
  /** Trechos curtos da Almeida (domínio público). */
  passages: ScripturePassage[]
}

export interface Journey {
  id: JourneyId
  order: number
  title: string
  subtitle: string
  books: string
  era: string
  image: string
  summary: string
  chapters: Chapter[]
}

export type AgeRange = 'ate12' | '13a17' | '18mais'

export interface Profile {
  id: string
  nickname: string
  avatar: string
  ageRange: AgeRange
  createdAt: string
  /** Sempre 'local' nesta versão. Futuro: 'supabase'. */
  storage: 'local'
}

export interface ChapterProgress {
  completed: boolean
  bestStars: number
  bestScore: number
  attempts: number
}

export interface MatchRecord {
  id: string
  date: string
  mode: 'capitulo' | 'diario' | 'demo-multiplayer'
  journeyId?: JourneyId
  chapterId?: string
  title: string
  correct: number
  total: number
  score: number
  xp: number
  stars: number
  passed: boolean
}

export interface Progress {
  xp: number
  chapters: Record<string, ChapterProgress>
  achievements: Record<string, string>
  history: MatchRecord[]
  streak: { current: number; best: number; lastDay: string | null }
  daily: { lastCompletedDay: string | null; completedCount: number }
  stats: {
    answered: number
    correct: number
    perfectChapters: number
    byType: Partial<Record<QuestionType, { answered: number; correct: number }>>
  }
}

export type FontScale = 'normal' | 'grande' | 'extra'

export interface Settings {
  fontScale: FontScale
  highContrast: boolean
  reduceMotion: boolean
  showTimer: boolean
  readAloud: boolean
  onboardingDone: boolean
}

export interface AnswerResult {
  questionId: string
  type: QuestionType
  correct: boolean
  difficulty: Difficulty
  /** Fração de acerto (memória/ordem podem ter acerto parcial para exibição). */
  quality: number
}
