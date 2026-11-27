/*
 * ESTADO VISUAL DOS MARCOS DO MAPA (compartilhado entre Modo História e Modo Quiz)
 * As regras de progressão continuam nos serviços de cada modo (phaseState, quizNodeState);
 * aqui só se traduz o estado de cada modo para um dos quatro estados do estandarte:
 * - concluida: já concluída (mostra as estrelas reais);
 * - atual: aberta e é onde o personagem está (o próximo passo da jornada);
 * - disponivel: aberta, mas não é onde o personagem está (com as regras lineares de hoje
 *   isso quase não acontece; o estado existe para as regras futuras e não altera nada);
 * - bloqueada: ainda fechada.
 */

export type EstadoMarco = 'concluida' | 'atual' | 'disponivel' | 'bloqueada'

/** `base` é o estado vindo do modo; `ehAlvo` diz se é o marco onde o personagem está. */
export function estadoDoMarco(base: 'concluida' | 'concluido' | 'atual' | 'bloqueada' | 'bloqueado', ehAlvo: boolean): EstadoMarco {
  if (base === 'concluida' || base === 'concluido') return 'concluida'
  if (base === 'bloqueada' || base === 'bloqueado') return 'bloqueada'
  return ehAlvo ? 'atual' : 'disponivel'
}

/** Rótulo acessível da situação (mantém os textos que o jogo já usava). */
export function rotuloDoEstado(estado: EstadoMarco, estrelas: number, modo: 'historia' | 'quiz'): string {
  if (modo === 'historia') {
    if (estado === 'concluida') return `Concluída, ${estrelas} de 3 estrelas`
    if (estado === 'atual') return 'Fase atual'
    if (estado === 'disponivel') return 'Disponível'
    return 'Bloqueada'
  }
  if (estado === 'concluida') return `Concluído, ${estrelas} de 3 estrelas`
  if (estado === 'bloqueada') return 'Bloqueado'
  return 'Disponível'
}
