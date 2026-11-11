// DADOS DE EXEMPLO. Não representam jogadores reais.
// Exibidos apenas enquanto não houver backend conectado (ver ROADMAP.md).
export interface RankingEntry {
  nickname: string
  xp: number
  streak: number
  example: true
}

export const DEMO_RANKING: RankingEntry[] = [
  { nickname: 'Exemplo · Peregrina', xp: 2480, streak: 21, example: true },
  { nickname: 'Exemplo · Escriba', xp: 2210, streak: 9, example: true },
  { nickname: 'Exemplo · Viajante', xp: 1830, streak: 14, example: true },
  { nickname: 'Exemplo · Pastor', xp: 1520, streak: 4, example: true },
  { nickname: 'Exemplo · Aprendiz', xp: 1105, streak: 6, example: true },
  { nickname: 'Exemplo · Leitora', xp: 860, streak: 2, example: true },
  { nickname: 'Exemplo · Caminhante', xp: 540, streak: 3, example: true },
  { nickname: 'Exemplo · Iniciante', xp: 220, streak: 1, example: true },
]
