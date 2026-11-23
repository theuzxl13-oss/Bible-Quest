/**
 * Identificação dos ambientes (Fase 1 da Etapa 2, passo 1.5, versão 0.17.6).
 *
 * O Layout marca a aplicação com `data-ambiente`, conforme a rota. Nesta versão
 * é SÓ identificação: os tokens de ambiente (`[data-ambiente]` em tokens.css)
 * só são lidos pelos componentes base (bq-*), que nenhuma tela usa ainda, então
 * nada muda na tela. As paletas aprovadas serão aplicadas depois, com aprovação.
 *
 * Identidades: Central (Acampamento de Aventura), História (Trilha da
 * Jornada), Quiz (Templo do Saber), Biblioteca (Sala de Estudos), Perfil (Tenda
 * do Personagem) e Conquistas (Sala dos Troféus). Telas de serviço (entrada,
 * configurações, sobre, página não encontrada, administração) ficam neutras.
 */
export type Ambiente = 'central' | 'historia' | 'quiz' | 'biblioteca' | 'perfil' | 'conquistas'

const REGRAS: [RegExp, Ambiente][] = [
  [/^\/painel$/, 'central'],
  [/^\/historia(\/|$)/, 'historia'],
  [/^\/quiz(\/|$)/, 'quiz'],
  [/^\/diario$/, 'quiz'],
  [/^\/revisao$/, 'quiz'],
  [/^\/biblioteca(\/|$)/, 'biblioteca'],
  [/^\/linha-do-tempo$/, 'biblioteca'],
  [/^\/perfil$/, 'perfil'],
  [/^\/estatisticas$/, 'perfil'],
  [/^\/ranking$/, 'perfil'],
  [/^\/guarda-roupa$/, 'perfil'],
  [/^\/conquistas$/, 'conquistas'],
]

/**
 * Ambiente de uma rota. No resultado de uma partida, segue o modo jogado:
 * Modo História → historia; qualquer outro modo (Quiz, treino, diário,
 * revisão, multiplayer) → quiz.
 */
export function ambienteDaRota(pathname: string, modoDaPartida?: string): Ambiente | undefined {
  if (pathname === '/resultado') return modoDaPartida ? (modoDaPartida === 'historia' ? 'historia' : 'quiz') : undefined
  return REGRAS.find(([r]) => r.test(pathname))?.[1]
}
