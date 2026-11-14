import { useNavigate } from 'react-router-dom'
import { ArtImage } from '../../ArtImage'
import { GameIcon } from '../../GameIcon'
import { Icon } from '../../Icon'
import { getCharacter } from '../../../data/library/characters'
import { QUIZ_REGIONS, type QuizNode } from '../../../data/quiz/regions'
import { THEMES } from '../../../data/themes'
import { FREE_LEVELS, filteredPool, getFreeMode } from '../../../services/game/freeModes'
import { quizNodeState } from '../../../services/game/quizMap'
import { PASS_RATIO, QUIZ_FIRST_CLEAR_BONUS, STAR_RULES } from '../../../services/game/scoring'
import { useGame } from '../../../state/GameContext'
import { roundRules } from '../../../pages/free/FreePlay'
import { Estrelinhas, JanelaFase } from './Interface'

/** Apresentação de um desafio do mapa do Modo Quiz. */
export function JanelaFaseQuiz({ node, onFechar }: { node: QuizNode; onFechar: () => void }) {
  const { progress, questionPool } = useGame()
  const navigate = useNavigate()
  const region = QUIZ_REGIONS.find((r) => r.id === node.regionId)!
  const index = region.nodes.findIndex((n) => n.id === node.id) + 1
  const mode = getFreeMode(node.mode)
  const st = quizNodeState(node.id, progress)
  const np = progress.quiz.nodes[node.id]
  const disponiveis = filteredPool(node.mode, questionPool, { level: node.level, count: node.count, characterId: node.characterId, themeId: node.themeId }).length
  const regras = roundRules(node.mode, node.level, Math.min(node.count, disponiveis))
  const nivel = node.level === 'todas' ? 'Todas as dificuldades' : FREE_LEVELS.find((l) => l.id === node.level)?.label
  const assunto = node.characterId ? getCharacter(node.characterId)?.name : node.themeId ? THEMES.find((t) => t.id === node.themeId)?.label : undefined

  return (
    <JanelaFase
      titulo={node.title}
      numero={index}
      rotulo={`${region.title} · Desafio ${index} de ${region.nodes.length}`}
      onFechar={onFechar}
      imagem={
        <div className="av-janela-quiz-arte">
          <ArtImage art={region.art} className="av-janela-arte" sizes="(min-width: 600px) 520px, 92vw" decorative />
          {mode && <span className="av-janela-modo"><GameIcon name={mode.icon} size={54} /></span>}
        </div>
      }
      acoes={
        st === 'bloqueado' ? (
          <button type="button" className="btn btn-outline" onClick={onFechar} data-foco>Voltar ao mapa</button>
        ) : (
          <button type="button" className="btn btn-gold btn-lg" data-foco onClick={() => navigate(`/quiz/desafio/${node.id}`, { state: { iniciar: true } })}>
            {np?.completed ? 'Jogar novamente' : 'Começar desafio'} <Icon name="play" size={18} />
          </button>
        )
      }
    >
      {/* as regras gerais da modalidade citam o tamanho padrão da rodada; aqui vale o do desafio */}
      <p className="av-janela-desc">{mode?.rules.replace(/^\d+(?= )/, String(Math.min(node.count, disponiveis)))}</p>
      <dl className="av-ficha">
        <div><dt>Tipo de desafio</dt><dd>{mode?.title}{assunto ? ` · ${assunto}` : ''}</dd></div>
        <div><dt>Dificuldade</dt><dd>{nivel}</dd></div>
        <div><dt>Perguntas</dt><dd>{node.mode === 'contra-o-tempo' ? 'O máximo que conseguir até o tempo acabar' : Math.min(node.count, disponiveis)}{regras.timeLimit ? ` · ${regras.timeLimit} segundos` : ''}</dd></div>
        <div><dt>Objetivo</dt><dd>Acerte pelo menos {Math.round(PASS_RATIO * 100)}%. Estrelas: 1 ao concluir, 2 com {Math.round(STAR_RULES.two * 100)}% e 3 com {Math.round(STAR_RULES.three * 100)}%.</dd></div>
        <div><dt>Recompensa</dt><dd>{np?.completed ? 'Repetir conta como treino, com limite diário de XP.' : `Pontos da partida + ${QUIZ_FIRST_CLEAR_BONUS} XP na primeira conclusão, e o próximo desafio é liberado.`}</dd></div>
        <div><dt>Suas estrelas</dt><dd><Estrelinhas n={np?.bestStars ?? 0} /></dd></div>
      </dl>
      {st === 'bloqueado' && (
        <p className="notice notice-warn small">
          <Icon name="lock" size={16} /> Desafio bloqueado. {index === 1 ? 'Conclua todos os desafios da região anterior.' : 'Conclua o desafio anterior para liberar este.'}
        </p>
      )}
    </JanelaFase>
  )
}
