import { experiencesOf, getExperience } from '../story'
import { worldOfBook } from '../worlds'
import { getQuizNode, QUIZ_REGIONS } from '../quiz/regions'
import { CENARIO_BIBLIOTECA, cenarioDaFaseNoMundo, cenarioDoDesafio, type CenarioPartida } from './cenarios'

/**
 * Cenário de fundo de uma partida, pela fase do Modo História ou pelo desafio
 * do Modo Quiz. Treino livre, diário e revisão usam a biblioteca antiga.
 */
export function cenarioDaPartida({ experienceId, quizNodeId }: { experienceId?: string; quizNodeId?: string }): CenarioPartida {
  const exp = getExperience(experienceId)
  if (exp) {
    const mundo = worldOfBook(exp.bookId)
    if (mundo) {
      const fases = mundo.books.flatMap((b) => experiencesOf(b))
      return cenarioDaFaseNoMundo(mundo.id, fases.findIndex((e) => e.id === exp.id) + 1, fases.length)
    }
  }
  const node = getQuizNode(quizNodeId)
  if (node) {
    const regiao = QUIZ_REGIONS.find((r) => r.id === node.regionId)
    return cenarioDoDesafio(node.regionId, (regiao?.nodes.findIndex((n) => n.id === node.id) ?? 0) + 1)
  }
  return CENARIO_BIBLIOTECA
}
