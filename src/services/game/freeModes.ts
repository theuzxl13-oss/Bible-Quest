import type { FreeLevel, FreeModeId, Question } from '../../types'
import { THEMES, questionMatchesTheme, questionMentions } from '../../data/themes'
import { CHARACTERS } from '../../data/library/characters'
import { FREE_MODE_TYPES } from '../../data/questions'
import { shuffle } from './random'
import type { IconName } from '../../components/Icon'

export interface FreeModeDef {
  id: FreeModeId
  title: string
  tagline: string
  rules: string
  icon: IconName
  image: string
  /** Número de perguntas por rodada (contra o tempo usa o tempo como limite). */
  roundSize: number
  /** O jogador pode escolher dificuldade e quantidade de perguntas. */
  configurable?: boolean
}

export const FREE_MODES: FreeModeDef[] = [
  {
    id: 'aleatorias',
    title: 'Perguntas aleatórias',
    tagline: 'De Gênesis a Apocalipse',
    rules: '10 perguntas de vários livros, da mais fácil para a mais difícil. Pontos pela dificuldade e bônus por acertos seguidos.',
    icon: 'compass',
    image: 'hero-jerusalem',
    roundSize: 10,
    configurable: true,
  },
  {
    id: 'verdadeiro-falso',
    title: 'Verdadeiro ou falso',
    tagline: 'Decida rápido, aprenda com a explicação',
    rules: '10 afirmações. Depois de cada resposta, veja a explicação e a referência bíblica.',
    icon: 'check',
    image: 'place-catherine',
    roundSize: 10,
    configurable: true,
  },
  {
    id: 'complete',
    title: 'Complete o versículo',
    tagline: 'Almeida 1911, domínio público',
    rules: '8 trechos bíblicos com uma palavra faltando. Escolha a palavra correta.',
    icon: 'scroll',
    image: 'creation-eden',
    roundSize: 8,
    configurable: true,
  },
  {
    id: 'quem-sou-eu',
    title: 'Quem sou eu?',
    tagline: 'Menos pistas, mais pontos',
    rules: '6 personagens. As pistas aparecem uma de cada vez: responda cedo para ganhar mais pontos.',
    icon: 'user',
    image: 'gn-jacob',
    roundSize: 6,
  },
  {
    id: 'contra-o-tempo',
    title: 'Contra o tempo',
    tagline: '60 segundos, 3 erros',
    rules: 'Responda o máximo que puder em 60 segundos. Respostas rápidas valem bônus. A rodada termina no fim do tempo ou no 3º erro.',
    icon: 'clock',
    image: 'moses-plague',
    roundSize: 40,
  },
  {
    id: 'ordem',
    title: 'Ordem dos acontecimentos',
    tagline: 'Coloque a história em sequência',
    rules: '4 sequências de acontecimentos fora de ordem. Organize e veja a explicação ao final de cada uma.',
    icon: 'arrowDown',
    image: 'gn-babel',
    roundSize: 4,
  },
  {
    id: 'livro',
    title: 'Identifique o livro',
    tagline: 'Em que livro está?',
    rules: '8 passagens ou acontecimentos. Descubra a qual livro bíblico pertencem.',
    icon: 'book',
    image: 'nt-beatitudes',
    roundSize: 8,
    configurable: true,
  },
  {
    id: 'personagem',
    title: 'Desafios por personagem',
    tagline: 'Escolha um personagem bíblico',
    rules: 'Perguntas sobre o personagem escolhido, de várias fases e livros.',
    icon: 'users',
    image: 'abraham-counsel',
    roundSize: 8,
    configurable: true,
  },
  {
    id: 'tema',
    title: 'Desafios por tema',
    tagline: 'Criação, alianças, sabedoria...',
    rules: 'Perguntas reunidas por tema bíblico, de diferentes passagens.',
    icon: 'scroll',
    image: 'moses-sinai',
    roundSize: 8,
    configurable: true,
  },
  {
    id: 'dificuldade',
    title: 'Desafios por dificuldade',
    tagline: 'Do iniciante ao especialista',
    rules: 'Escolha o nível. No Especialista, só perguntas difíceis e 20 segundos por pergunta, com bônus de rapidez.',
    icon: 'trophy',
    image: 'moses-pharaoh',
    roundSize: 10,
    configurable: true,
  },
]

export const FREE_LEVELS: { id: FreeLevel; label: string; description: string; difficulties: number[] }[] = [
  { id: 'iniciante', label: 'Iniciante', description: 'Perguntas fáceis', difficulties: [1] },
  { id: 'intermediario', label: 'Intermediário', description: 'Fáceis e médias', difficulties: [1, 2] },
  { id: 'avancado', label: 'Avançado', description: 'Médias e difíceis', difficulties: [2, 3] },
  { id: 'especialista', label: 'Especialista', description: 'Só difíceis, com tempo', difficulties: [3] },
]

export interface RoundOptions {
  level?: FreeLevel | 'todas'
  count?: number
  characterId?: string
  themeId?: string
}

/** Filtra o banco conforme modalidade, nível, personagem e tema. */
export function filteredPool(id: FreeModeId, pool: Question[], opts: RoundOptions = {}): Question[] {
  let qs = freeModePool(id, pool)
  if (opts.level && opts.level !== 'todas') {
    const ds = FREE_LEVELS.find((l) => l.id === opts.level)!.difficulties
    qs = qs.filter((q) => ds.includes(q.difficulty))
  }
  if (id === 'personagem' && opts.characterId) qs = qs.filter((q) => questionMentions(q, opts.characterId!))
  if (id === 'tema' && opts.themeId) {
    const t = THEMES.find((x) => x.id === opts.themeId)
    qs = t ? qs.filter((q) => questionMatchesTheme(q, t)) : []
  }
  return qs
}

/** Personagens e temas com perguntas suficientes (pelo menos 5). */
export function availableCharacters(pool: Question[]) {
  return CHARACTERS.filter((c) => filteredPool('personagem', pool, { characterId: c.id }).length >= 5)
}
export function availableThemes(pool: Question[]) {
  return THEMES.filter((t) => filteredPool('tema', pool, { themeId: t.id }).length >= 5)
}

export function getFreeMode(id: string | undefined): FreeModeDef | undefined {
  return FREE_MODES.find((m) => m.id === id)
}

export function freeModePool(id: FreeModeId, pool: Question[]): Question[] {
  const types = FREE_MODE_TYPES[id]
  return pool.filter((q) => types.includes(q.type))
}

/** Monta uma rodada. "Perguntas aleatórias" e "contra o tempo" crescem em dificuldade. */
export function buildRound(id: FreeModeId, pool: Question[], rand: () => number = Math.random, opts: RoundOptions = {}): Question[] {
  const def = getFreeMode(id)!
  const size = opts.count ?? def.roundSize
  const eligible = shuffle(filteredPool(id, pool, opts), rand).slice(0, size)
  if (id === 'aleatorias' || id === 'contra-o-tempo' || id === 'dificuldade') {
    return [...eligible].sort((a, b) => a.difficulty - b.difficulty)
  }
  return eligible
}
