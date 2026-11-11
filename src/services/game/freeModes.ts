import type { FreeModeId, Question } from '../../types'
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
  },
  {
    id: 'verdadeiro-falso',
    title: 'Verdadeiro ou falso',
    tagline: 'Decida rápido, aprenda com a explicação',
    rules: '10 afirmações. Depois de cada resposta, veja a explicação e a referência bíblica.',
    icon: 'check',
    image: 'place-catherine',
    roundSize: 10,
  },
  {
    id: 'complete',
    title: 'Complete o versículo',
    tagline: 'Almeida 1911, domínio público',
    rules: '8 trechos bíblicos com uma palavra faltando. Escolha a palavra correta.',
    icon: 'scroll',
    image: 'creation-eden',
    roundSize: 8,
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
  },
]

export function getFreeMode(id: string | undefined): FreeModeDef | undefined {
  return FREE_MODES.find((m) => m.id === id)
}

export function freeModePool(id: FreeModeId, pool: Question[]): Question[] {
  const types = FREE_MODE_TYPES[id]
  return pool.filter((q) => types.includes(q.type))
}

/** Monta uma rodada. "Perguntas aleatórias" e "contra o tempo" crescem em dificuldade. */
export function buildRound(id: FreeModeId, pool: Question[], rand: () => number = Math.random): Question[] {
  const def = getFreeMode(id)!
  const eligible = shuffle(freeModePool(id, pool), rand).slice(0, def.roundSize)
  if (id === 'aleatorias' || id === 'contra-o-tempo') {
    return [...eligible].sort((a, b) => a.difficulty - b.difficulty)
  }
  return eligible
}
