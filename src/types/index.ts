// Tipos de domínio do Bible Quest.
// Estes contratos são os mesmos que serão usados quando o armazenamento local
// for substituído pelo Supabase (ver src/services e docs/supabase/schema.sql).

/** Testamento no cânon. */
export type Testament = 'AT' | 'NT'

export type BookGroup =
  | 'pentateuco'
  | 'historicos'
  | 'poeticos'
  | 'profetas-maiores'
  | 'profetas-menores'
  | 'evangelhos'
  | 'atos'
  | 'cartas-paulinas'
  | 'cartas-gerais'
  | 'profecia'

export interface BookMeta {
  /** Identificador estável, ex.: "genesis", "1-samuel". */
  id: string
  name: string
  abbrev: string
  testament: Testament
  group: BookGroup
  chapters: number
}

/** Um cânon é uma lista ordenada de livros. Outros cânones podem ser adicionados depois. */
export interface Canon {
  id: string
  name: string
  books: BookMeta[]
}

/** Modalidades do Modo Livre. */
export type FreeModeId =
  | 'aleatorias'
  | 'verdadeiro-falso'
  | 'complete'
  | 'quem-sou-eu'
  | 'contra-o-tempo'
  | 'ordem'
  | 'livro'
  | 'personagem'
  | 'tema'
  | 'dificuldade'

/** Níveis de dificuldade escolhidos pelo jogador no Modo Livre. */
export type FreeLevel = 'iniciante' | 'intermediario' | 'avancado' | 'especialista'

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
  | 'match'

interface QuestionBase {
  id: string
  /** Livro bíblico ao qual a pergunta se refere. */
  bookId: string
  /** Experiência do Modo História. Ausente = pergunta só do Modo Livre. */
  experienceId?: string
  type: QuestionType
  difficulty: Difficulty
  category: QuestionCategory
  /** Enunciado mostrado ao jogador. */
  prompt: string
  /** Explicação exibida após a resposta. */
  explanation: string
  /** Referência bíblica verificável, ex.: "Gênesis 1:1". */
  reference: string
  /** Obra de arte exibida com a pergunta (chave de ART). */
  image?: string
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
  /** memory: cartas viradas; match: relacionar colunas visíveis. */
  type: 'memory' | 'match'
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

/**
 * Uma experiência do Modo História: um acontecimento ou passagem, não
 * necessariamente um capítulo bíblico.
 */
export interface Experience {
  id: string
  bookId: string
  order: number
  title: string
  /** Passagem coberta, ex.: "Gênesis 1:1–2:3". */
  scope: string
  image: string
  /** 1. Introdução: contexto do acontecimento (texto da equipe). */
  intro: string[]
  /** 2. Narrativa dramatizada (texto da equipe, não é texto bíblico). */
  narrative: string[]
  /** 3. Trechos curtos da Almeida RC 1911 (domínio público). */
  passages: ScripturePassage[]
  /** 3. Referências para leitura completa. */
  references: string[]
  /** 4. Aprendizado: significado e ensinamentos. */
  learning: string[]
  /** Personagens bíblicos que aparecem na fase (ids da Biblioteca). */
  characters: string[]
  /** Lugares relacionados (ids da Biblioteca). */
  places: string[]
}

export type AgeRange = 'ate12' | '13a17' | '18mais'

/**
 * Aparência do personagem do jogador: um aventureiro que acompanha a
 * jornada. Ele NÃO representa nenhum personagem bíblico.
 */
export interface CharacterConfig {
  name: string
  archetype: 'viajante' | 'escriba' | 'pastora' | 'exploradora'
  skin: number
  hair: 'curto' | 'longo' | 'cacheado' | 'coque' | 'tranca' | 'raspado'
  hairColor: number
  outfit: 'tunica' | 'manto' | 'viagem' | 'escriba'
  outfitColor: number
  accessory: 'cajado' | 'bolsa' | 'pergaminho' | 'lamparina' | 'nenhum'
}

export interface Profile {
  id: string
  nickname: string
  avatar: string
  ageRange: AgeRange
  createdAt: string
  /** Sempre 'local' nesta versão. Futuro: 'supabase'. */
  storage: 'local'
  /** Personagem aventureiro. Ausente até a criação do personagem. */
  character?: CharacterConfig
}

export interface ExperienceProgress {
  completed: boolean
  bestStars: number
  bestScore: number
  attempts: number
}

export interface MatchRecord {
  id: string
  date: string
  mode: 'historia' | 'livre' | 'diario' | 'revisao' | 'demo-multiplayer'
  freeMode?: FreeModeId
  bookId?: string
  experienceId?: string
  title: string
  correct: number
  total: number
  score: number
  xp: number
  stars: number
  passed: boolean
}

export interface QuestionRecord {
  seen: number
  wrong: number
  /** true se a última resposta a esta pergunta foi errada. */
  lastWrong: boolean
  lastSeen: string
}

export interface DailyLogEntry {
  day: string
  correct: number
  total: number
  xp: number
}

export interface Progress {
  xp: number
  experiences: Record<string, ExperienceProgress>
  /** Última experiência aberta, para "continuar de onde parou". */
  lastExperienceId: string | null
  achievements: Record<string, string>
  history: MatchRecord[]
  streak: { current: number; best: number; lastDay: string | null }
  daily: { lastCompletedDay: string | null; completedCount: number; log: DailyLogEntry[] }
  /** XP de prática acumulado no dia (Modo Livre e tentativas reprovadas), sujeito a limite diário. */
  practice: { day: string | null; xp: number }
  /** Baús de recompensa já abertos (id → data). */
  chests: Record<string, string>
  /** Fichas desbloqueadas na Biblioteca (id → data). */
  library: { characters: Record<string, string>; places: Record<string, string> }
  /** Mundos cuja abertura já foi exibida. */
  worldsSeen: string[]
  /** Última fase em que o avatar foi mostrado no mapa (para animar o avanço). */
  mapCursor: string | null
  /** Revisão inteligente: histórico por pergunta. */
  review: Record<string, QuestionRecord>
  /** Maior sequência de acertos seguidos em qualquer modo. */
  bestAnswerStreak: number
  currentAnswerStreak: number
  multiplayer: { demoMatches: number; demoWins: number }
  free: {
    matches: number
    byMode: Partial<Record<FreeModeId, { played: number; best: number }>>
    oneClueHits: number
    bestTimeAttack: number
  }
  stats: {
    answered: number
    correct: number
    perfectExperiences: number
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
  /** Pontos específicos da modalidade (ex.: menos pistas, rapidez). Padrão: pela dificuldade. */
  points?: number
  /** Pistas usadas em "Quem sou eu?". */
  cluesUsed?: number
}
