import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArtImage } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { QuizRunner } from '../components/QuizRunner'
import { dailyQuestions, DAILY_SIZE } from '../services/game/daily'
import { dayKey } from '../services/game/dates'
import { DAILY_BONUS } from '../services/game/scoring'
import { visibleStreak } from '../services/game/streak'
import { useGame } from '../state/GameContext'

export default function Daily() {
  const today = dayKey()
  const questions = useMemo(() => dailyQuestions(today), [today])
  const { progress } = useGame()
  const [playing, setPlaying] = useState(false)
  const done = progress.daily.lastCompletedDay === today

  if (playing) {
    return <QuizRunner questions={questions} title="Desafio diário" mode="diario" exitTo="/painel" useLives={false} />
  }

  return (
    <section className="hero hero-full">
      <ArtImage art="place-catherine" className="hero-bg" priority />
      <div className="hero-shade" />
      <div className="container hero-content">
        <Link to="/painel" className="back-link"><Icon name="arrowLeft" size={16} /> Painel</Link>
        <p className="eyebrow">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 className="display-sm">Desafio diário</h1>
        <p className="hero-lead">
          {DAILY_SIZE} perguntas de todas as jornadas, iguais para todos os jogadores no mesmo dia. Concluir mantém sua
          sequência de {visibleStreak(progress.streak, today)} {visibleStreak(progress.streak, today) === 1 ? 'dia' : 'dias'} e vale +{DAILY_BONUS} XP de bônus.
        </p>
        {done ? (
          <>
            <p className="notice notice-info" role="note">Você já concluiu o desafio de hoje. Pode treinar de novo, mas sem XP extra.</p>
            <div className="hero-actions">
              <button type="button" className="btn btn-outline btn-lg" onClick={() => setPlaying(true)}>Treinar novamente</button>
              <Link to="/painel" className="btn btn-gold btn-lg">Voltar ao painel</Link>
            </div>
          </>
        ) : (
          <div className="hero-actions">
            <button type="button" className="btn btn-gold btn-lg" onClick={() => setPlaying(true)}>
              Começar <Icon name="play" size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
