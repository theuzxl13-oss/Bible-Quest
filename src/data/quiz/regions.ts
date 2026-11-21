import type { FreeLevel, FreeModeId } from '../../types'

/*
 * MAPA DO MODO QUIZ (independente do Modo História)
 * 4 regiões com 6 desafios cada. Cada desafio combina modalidade,
 * dificuldade e quantidade de perguntas. A região seguinte abre quando todos
 * os desafios da anterior forem concluídos.
 */
export interface QuizNode {
  id: string
  regionId: string
  title: string
  mode: FreeModeId
  level: FreeLevel | 'todas'
  count: number
  characterId?: string
  themeId?: string
}

export interface QuizRegion {
  id: string
  number: number
  title: string
  subtitle: string
  art: string
  theme: { sky: string; ground: string; stone: string; banner: string }
  nodes: QuizNode[]
}

const n = (regionId: string, i: number, title: string, mode: FreeModeId, level: QuizNode['level'], count: number, extra: Partial<QuizNode> = {}): QuizNode => ({ id: `${regionId}-${i}`, regionId, title, mode, level, count, ...extra })

export const QUIZ_REGIONS: QuizRegion[] = [
  {
    id: 'vale', number: 1, title: 'Vale dos Iniciantes', subtitle: 'Primeiros passos pelos desafios', art: 'creation-eden',
    theme: { sky: '#26402f', ground: '#1a2c21', stone: '#d9cba3', banner: '#5f8a4a' },
    nodes: [
      n('vale', 1, 'Verdadeiro ou falso', 'verdadeiro-falso', 'iniciante', 6),
      n('vale', 2, 'Perguntas aleatórias', 'aleatorias', 'iniciante', 6),
      n('vale', 3, 'Complete o versículo', 'complete', 'iniciante', 5),
      n('vale', 4, 'Quem sou eu?', 'quem-sou-eu', 'todas', 4),
      n('vale', 5, 'Identifique o livro', 'livro', 'todas', 5),
      n('vale', 6, 'Tema: criação e origens', 'tema', 'todas', 5, { themeId: 'criacao' }),
    ],
  },
  {
    id: 'planicie', number: 2, title: 'Planície do Saber', subtitle: 'Desafios intermediários', art: 'place-raheh',
    theme: { sky: '#4a3a22', ground: '#2e2414', stone: '#efe0b8', banner: '#c9883a' },
    nodes: [
      n('planicie', 1, 'Perguntas aleatórias', 'aleatorias', 'intermediario', 8),
      n('planicie', 2, 'Verdadeiro ou falso', 'verdadeiro-falso', 'intermediario', 8),
      n('planicie', 3, 'Ordem dos acontecimentos', 'ordem', 'todas', 3),
      n('planicie', 4, 'Personagem: Abraão', 'personagem', 'todas', 6, { characterId: 'abraao' }),
      n('planicie', 5, 'Complete o versículo', 'complete', 'intermediario', 6),
      n('planicie', 6, 'Contra o tempo', 'contra-o-tempo', 'todas', 40),
    ],
  },
  {
    id: 'montanhas', number: 3, title: 'Montanhas dos Sábios', subtitle: 'Desafios avançados', art: 'place-catherine',
    theme: { sky: '#2b3550', ground: '#181f33', stone: '#d6dbe6', banner: '#6d86b8' },
    nodes: [
      n('montanhas', 1, 'Perguntas aleatórias', 'aleatorias', 'avancado', 8),
      n('montanhas', 2, 'Identifique o livro', 'livro', 'avancado', 6),
      n('montanhas', 3, 'Quem sou eu?', 'quem-sou-eu', 'todas', 6),
      n('montanhas', 4, 'Tema: alianças e promessas', 'tema', 'todas', 8, { themeId: 'alianca' }),
      n('montanhas', 5, 'Ordem dos acontecimentos', 'ordem', 'todas', 4),
      n('montanhas', 6, 'Personagem: José', 'personagem', 'todas', 8, { characterId: 'jose' }),
    ],
  },
  {
    id: 'torre', number: 4, title: 'Torre dos Especialistas', subtitle: 'Só para quem domina as Escrituras', art: 'gn-babel',
    theme: { sky: '#3b2a44', ground: '#1f1526', stone: '#e8d9b0', banner: '#b03a3a' },
    nodes: [
      n('torre', 1, 'Especialista', 'dificuldade', 'especialista', 5),
      n('torre', 2, 'Perguntas aleatórias', 'aleatorias', 'especialista', 6),
      n('torre', 3, 'Contra o tempo', 'contra-o-tempo', 'todas', 40),
      n('torre', 4, 'Identifique o livro', 'livro', 'especialista', 5),
      n('torre', 5, 'Personagem: Moisés', 'personagem', 'todas', 8, { characterId: 'moises' }),
      n('torre', 6, 'Desafio final', 'dificuldade', 'especialista', 10),
    ],
  },
]

export const QUIZ_NODES: QuizNode[] = QUIZ_REGIONS.flatMap((r) => r.nodes)

export function getQuizNode(id: string | undefined): QuizNode | undefined {
  return QUIZ_NODES.find((x) => x.id === id)
}
