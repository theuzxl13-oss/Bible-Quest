import { Link, useNavigate } from 'react-router-dom'
import { GameIcon } from '../GameIcon'
import type { Experience } from '../../types'
import { phaseNumber } from '../../services/game/journeyMap'
import { useGame } from '../../state/GameContext'

/**
 * Ações da Central (Etapa 2): a ação principal "Continuar" (próxima fase do
 * Modo História) entre as placas dos dois modos. "Continuar" faz o mesmo que
 * "Começar fase" na janela do mapa: marca a fase como visitada (libera as
 * fichas da Biblioteca) e abre a cena narrativa.
 */
export function AcoesAcampamento({
  proxima,
  historia,
  quiz,
  onGesto,
}: {
  proxima: Experience | null
  historia: { feitas: number; total: number }
  quiz: { feitos: number; total: number }
  onGesto(modo: 'historia' | 'quiz'): void
}) {
  const navigate = useNavigate()
  const { markVisited } = useGame()
  const continuar = () => {
    if (!proxima) return navigate('/historia')
    markVisited(proxima.id)
    navigate(`/historia/${proxima.bookId}/${proxima.id}/historia`)
  }
  const primeira = historia.feitas === 0

  return (
    <nav className="camp-acoes" aria-label="Modos de jogo">
      <Link to="/historia" className="camp-modo" data-modo="historia" aria-label={`Modo História: Explore as Escrituras. ${historia.feitas} de ${historia.total} fases`} onMouseEnter={() => onGesto('historia')} onFocus={() => onGesto('historia')}>
        <span className="camp-modo-icone" aria-hidden="true"><GameIcon name="map" size={30} /></span>
        <span className="camp-modo-texto">
          <strong><span className="sr-only">Modo </span>História</strong>
          <small>Explore as Escrituras</small>
          <span className="camp-modo-progresso">{historia.feitas} de {historia.total} fases</span>
        </span>
      </Link>
      <button type="button" className="camp-continuar" onClick={continuar} aria-label={proxima ? `${primeira ? 'Começar' : 'Continuar'}: fase ${phaseNumber(proxima.id)}, ${proxima.title}` : 'Ver a jornada: todas as fases publicadas concluídas'}>
        <span className="camp-continuar-texto">
          <strong>{proxima ? (primeira ? 'Começar' : 'Continuar') : 'Ver a jornada'}</strong>
          <small>{proxima ? `Fase ${phaseNumber(proxima.id)} · ${proxima.title}` : 'Todas as fases publicadas concluídas'}</small>
        </span>
      </button>
      <Link to="/quiz" className="camp-modo" data-modo="quiz" aria-label={`Modo Quiz: Teste seu conhecimento. ${quiz.feitos} de ${quiz.total} desafios`} onMouseEnter={() => onGesto('quiz')} onFocus={() => onGesto('quiz')}>
        <span className="camp-modo-icone" aria-hidden="true"><GameIcon name="cerebro" size={30} /></span>
        <span className="camp-modo-texto">
          <strong><span className="sr-only">Modo </span>Quiz</strong>
          <small>Teste seu conhecimento</small>
          <span className="camp-modo-progresso">{quiz.feitos} de {quiz.total} desafios</span>
        </span>
      </Link>
    </nav>
  )
}
