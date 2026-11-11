import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { QuizRunner, type QuizRules } from '../../components/QuizRunner'
import { buildRound, getFreeMode } from '../../services/game/freeModes'
import { TIME_ATTACK_MAX_ERRORS, TIME_ATTACK_SECONDS } from '../../services/game/scoring'
import type { FreeModeId } from '../../types'
import { useGame } from '../../state/GameContext'
import NotFound from '../NotFound'

const RULES: Record<FreeModeId, QuizRules> = {
  aleatorias: { lives: 0 },
  'verdadeiro-falso': { lives: 0 },
  complete: { lives: 0 },
  'quem-sou-eu': { lives: 0, progressiveClues: true },
  'contra-o-tempo': { lives: TIME_ATTACK_MAX_ERRORS, timeLimit: TIME_ATTACK_SECONDS, speedBonus: true },
  ordem: { lives: 0 },
  livro: { lives: 0 },
}

export default function FreePlay() {
  const { modeId } = useParams()
  const mode = getFreeMode(modeId)
  const { questionPool } = useGame()
  const [round, setRound] = useState(0)
  const [playing, setPlaying] = useState(false)
  const questions = useMemo(() => (mode ? buildRound(mode.id, questionPool) : []), [mode, questionPool, round]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mode) return <NotFound />

  if (playing && questions.length > 0) {
    return (
      <QuizRunner
        key={`${mode.id}-${round}`}
        questions={questions}
        title={mode.title}
        mode="livre"
        freeMode={mode.id}
        exitTo="/livre"
        replayTo={`/livre/${mode.id}`}
        rules={RULES[mode.id]}
      />
    )
  }

  return (
    <div className="container section narrow stack">
      <Link to="/livre" className="back-link"><Icon name="arrowLeft" size={16} /> Modo Livre</Link>
      <div className="panel mode-intro stack">
        <span className="mode-icon mode-icon-lg"><Icon name={mode.icon} size={30} /></span>
        <p className="eyebrow">Modo Livre</p>
        <h1>{mode.title}</h1>
        <p>{mode.rules}</p>
        {questions.length === 0 ? (
          <p className="notice notice-warn">Não há perguntas suficientes para esta modalidade.</p>
        ) : (
          <button
            type="button"
            className="btn btn-gold btn-lg"
            onClick={() => {
              setRound((r) => r + 1)
              setPlaying(true)
            }}
          >
            Começar <Icon name="play" size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
