import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PlayerCharacter } from '../../components/character/PlayerCharacter'
import { Icon } from '../../components/Icon'
import { QuizRunner } from '../../components/quiz/QuizRunner'
import { Stars } from '../../components/ui'
import { getCharacter } from '../../data/library/characters'
import { getQuizNode, QUIZ_REGIONS } from '../../data/quiz/regions'
import { THEMES } from '../../data/themes'
import { buildRound, filteredPool, FREE_LEVELS, getFreeMode } from '../../services/game/freeModes'
import { quizNodeState } from '../../services/game/quizMap'
import { PASS_RATIO, QUIZ_FIRST_CLEAR_BONUS, STAR_RULES } from '../../services/game/scoring'
import { useGame } from '../../state/GameContext'
import NotFound from '../NotFound'
import { roundRules } from '../free/FreePlay'

/** Mínimo de perguntas para um desafio do mapa ser jogável. */
export const QUIZ_MIN_QUESTIONS = 3

/** Introdução e instruções de um desafio do mapa do Modo Quiz, seguidas da partida. */
export default function QuizChallenge() {
  const { nodeId } = useParams()
  const node = getQuizNode(nodeId)
  const { progress, questionPool } = useGame()
  const [round, setRound] = useState(0)
  const mode = node ? getFreeMode(node.mode) : undefined
  const opts = node ? { level: node.level, count: node.count, characterId: node.characterId, themeId: node.themeId } : {}
  const available = node ? filteredPool(node.mode, questionPool, opts).length : 0
  const questions = useMemo(() => (node && round > 0 ? buildRound(node.mode, questionPool, Math.random, opts) : []), [node, round, questionPool]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!node || !mode) return <NotFound />
  const region = QUIZ_REGIONS.find((r) => r.id === node.regionId)!
  const st = quizNodeState(node.id, progress)
  const np = progress.quiz.nodes[node.id]
  const index = region.nodes.findIndex((n) => n.id === node.id) + 1
  const subject = node.characterId ? getCharacter(node.characterId)?.name : node.themeId ? THEMES.find((t) => t.id === node.themeId)?.label : undefined

  if (round > 0 && questions.length > 0 && st !== 'bloqueado') {
    return (
      <QuizRunner
        key={round}
        questions={questions}
        title={`${region.title} · ${node.title}`}
        mode="quiz"
        freeMode={node.mode}
        quizNodeId={node.id}
        exitTo="/quiz"
        replayTo={`/quiz/desafio/${node.id}`}
        rules={roundRules(node.mode, node.level, questions.length)}
      />
    )
  }

  const level = node.level === 'todas' ? 'Todas as dificuldades' : FREE_LEVELS.find((l) => l.id === node.level)?.label
  const rules = roundRules(node.mode, node.level, Math.min(node.count, available))

  return (
    <div className="container section narrow stack">
      <Link to="/quiz" className="back-link"><Icon name="arrowLeft" size={16} /> Mapa do Modo Quiz</Link>
      <div className="panel mode-intro stack quiz-intro" style={{ ['--banner' as string]: region.theme.banner }}>
        <div className="quiz-intro-head">
          <span className="quiz-intro-char"><PlayerCharacter size={84} pose="idle" /></span>
          <div>
            <p className="eyebrow">Região {region.number} · {region.title} · Desafio {index} de {region.nodes.length}</p>
            <h1>{node.title}</h1>
            {np?.completed && <Stars value={np.bestStars} size={20} />}
          </div>
        </div>
        <p>{mode.rules}</p>
        <ul className="quiz-facts small">
          <li><Icon name="star" size={16} /> Modalidade: {mode.title}{subject ? ` · ${subject}` : ''}</li>
          <li><Icon name="shield" size={16} /> Dificuldade: {level}</li>
          <li><Icon name="scroll" size={16} /> {node.mode === 'contra-o-tempo' ? 'Responda o máximo que conseguir até o tempo acabar' : `${Math.min(node.count, available)} perguntas`}</li>
          {rules.timeLimit && <li><Icon name="clock" size={16} /> Tempo: {rules.timeLimit} segundos{rules.lives ? `, até ${rules.lives} erros` : ''}</li>}
        </ul>
        <div className="notice notice-info small">
          Para concluir, acerte pelo menos {Math.round(PASS_RATIO * 100)}%. Estrelas: 1 ao concluir, 2 com {Math.round(STAR_RULES.two * 100)}% e 3 com {Math.round(STAR_RULES.three * 100)}%.
          {' '}A primeira conclusão rende os pontos da partida mais {QUIZ_FIRST_CLEAR_BONUS} XP e libera o próximo desafio; repetir conta como treino, com limite diário.
        </div>
        {st === 'bloqueado' ? (
          <p className="notice notice-warn">Este desafio ainda está bloqueado. Conclua o desafio anterior{index === 1 ? ' e a região anterior' : ''} para liberá-lo.</p>
        ) : available < QUIZ_MIN_QUESTIONS ? (
          <p className="notice notice-warn">Não há perguntas suficientes para este desafio neste aparelho.</p>
        ) : (
          <button type="button" className="btn btn-gold btn-lg" onClick={() => setRound(round + 1)}>
            {np?.completed ? 'Jogar novamente' : 'Começar desafio'} <Icon name="play" size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
