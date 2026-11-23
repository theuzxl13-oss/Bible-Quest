import { Link, useNavigate } from 'react-router-dom'
import { ArtImage } from '../../ArtImage'
import { Icon } from '../../Icon'
import { getBook } from '../../../data/bible/canon'
import { questionsForExperience } from '../../../data/questions'
import { phaseDifficulty, phaseState, type PhaseNode } from '../../../services/game/journeyMap'
import { FIRST_CLEAR_BONUS, PASS_RATIO } from '../../../services/game/scoring'
import { STORY_SEQUENCE } from '../../../data/story'
import { useGame } from '../../../state/GameContext'
import { Estrelinhas, JanelaFase } from './Interface'

/** Apresentação de uma fase do Modo História, aberta ao tocar no mapa. */
export function JanelaFaseHistoria({ node, onFechar }: { node: PhaseNode; onFechar: () => void }) {
  const { progress, markVisited } = useGame()
  const navigate = useNavigate()
  const exp = node.experience
  const book = getBook(exp.bookId)
  const st = phaseState(exp.id, progress)
  const ep = progress.experiences[exp.id]
  const qs = questionsForExperience(exp.id)
  const diff = phaseDifficulty(qs.reduce((s, q) => s + q.difficulty, 0) / Math.max(1, qs.length))
  const anterior = STORY_SEQUENCE[STORY_SEQUENCE.findIndex((e) => e.id === exp.id) - 1]

  const comecar = () => {
    markVisited(exp.id)
    navigate(`/historia/${exp.bookId}/${exp.id}/historia`)
  }

  return (
    <JanelaFase
      titulo={exp.title}
      numero={node.number}
      rotulo={`${book?.name ?? ''} · Fase ${node.number}`}
      onFechar={onFechar}
      imagem={<ArtImage art={exp.image} className="av-janela-arte" sizes="(min-width: 600px) 520px, 92vw" decorative />}
      acoes={
        st === 'bloqueada' ? (
          <button type="button" className="btn btn-outline" onClick={onFechar} data-foco>Voltar ao mapa</button>
        ) : (
          <>
            <button type="button" className="btn btn-gold btn-lg" onClick={comecar} data-foco>
              {ep?.completed ? 'Jogar de novo' : 'Começar fase'} <Icon name="play" size={18} />
            </button>
            {ep?.completed && <Link to={`/historia/${exp.bookId}/${exp.id}/desafio`} className="btn btn-outline">Só as perguntas</Link>}
            <Link to={`/historia/${exp.bookId}/${exp.id}`} className="link small">Personagens e lugares da fase</Link>
          </>
        )
      }
    >
      <p className="av-janela-desc">{exp.intro[0]}</p>
      <dl className="av-ficha">
        <div><dt>Objetivo</dt><dd>Acompanhe a história e responda {qs.length} perguntas. Acerte pelo menos {Math.round(PASS_RATIO * 100)}% para concluir.</dd></div>
        <div><dt>Referência bíblica</dt><dd>{exp.scope}</dd></div>
        <div><dt>Dificuldade</dt><dd><span className={`tag tag-diff-${diff.level}`}>{diff.label}</span></dd></div>
        <div>
          <dt>Recompensa</dt>
          <dd>{ep?.completed ? `XP só se superar sua melhor pontuação (${ep.bestScore} pontos).` : `Pontos das respostas + ${FIRST_CLEAR_BONUS} XP na primeira conclusão.`}</dd>
        </div>
        <div><dt>Suas estrelas</dt><dd><Estrelinhas n={ep?.bestStars ?? 0} /></dd></div>
      </dl>
      {st === 'bloqueada' && (
        <p className="notice notice-warn small">
          <Icon name="lock" size={16} /> Fase bloqueada. Conclua {anterior ? `a fase ${node.number - 1}, “${anterior.title}”,` : 'a fase anterior'} para liberar esta.
        </p>
      )}
    </JanelaFase>
  )
}
