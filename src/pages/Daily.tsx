import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArtImage } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { QuizRunner } from '../components/QuizRunner'
import { Notice } from '../components/ui'
import { canClaimDaily, dailyQuestions, DAILY_SIZE } from '../services/game/daily'
import { DAILY_BONUS } from '../services/game/scoring'
import { visibleStreak } from '../services/game/streak'
import { useGame } from '../state/GameContext'

function formatDay(day: string) {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function Daily() {
  const { progress, dailyContext } = useGame()
  const ctx = dailyContext()
  const questions = useMemo(() => dailyQuestions(ctx.day), [ctx.day])
  const [playing, setPlaying] = useState(false)
  const claimable = canClaimDaily(progress, ctx.day)
  const streak = visibleStreak(progress.streak, ctx.day)

  if (playing) {
    return <QuizRunner questions={questions} title="Desafio diário" mode="diario" exitTo="/painel" replayTo="/diario" rules={{ lives: 0 }} />
  }

  return (
    <>
      <section className="hero hero-mid">
        <ArtImage art="place-catherine" className="hero-bg" priority />
        <div className="hero-shade" />
        <div className="container hero-content">
          <Link to="/painel" className="back-link"><Icon name="arrowLeft" size={16} /> Painel</Link>
          <p className="eyebrow">{formatDay(ctx.day)}</p>
          <h1 className="display-sm">Desafio diário</h1>
          <p className="hero-lead">
            {DAILY_SIZE} perguntas de toda a Bíblia, iguais para todos os jogadores no mesmo dia. A recompensa especial
            (+{DAILY_BONUS} XP além dos pontos) vale uma vez por dia.
          </p>
          <div className="journey-meter">
            <div><span className="meter-n">{streak}</span><span className="small">{streak === 1 ? 'dia seguido' : 'dias seguidos'}</span></div>
            <div><span className="meter-n">{progress.daily.completedCount}</span><span className="small">desafios concluídos</span></div>
          </div>
          <div className="hero-actions">
            {claimable ? (
              <button type="button" className="btn btn-gold btn-lg" onClick={() => setPlaying(true)}>Começar <Icon name="play" size={18} /></button>
            ) : (
              <>
                <button type="button" className="btn btn-outline btn-lg" onClick={() => setPlaying(true)}>Treinar novamente (sem recompensa)</button>
                <Link to="/livre" className="btn btn-gold btn-lg">Ir para o Modo Livre</Link>
              </>
            )}
          </div>
        </div>
      </section>
      <div className="container section narrow stack-lg">
        {!claimable && !ctx.clockSuspicious && (
          <Notice tone="info" icon="check" title="Desafio de hoje concluído">Volte amanhã para um novo conjunto e para manter sua sequência.</Notice>
        )}
        {ctx.clockSuspicious && (
          <Notice tone="warn" icon="clock" title="Data do aparelho anterior ao último desafio">
            A data deste aparelho parece ter voltado no tempo. A recompensa diária fica bloqueada até a data atual
            passar do último desafio recompensado.
          </Notice>
        )}
        <section aria-labelledby="log">
          <h2 id="log" className="section-title">Desafios realizados</h2>
          {progress.daily.log.length === 0 ? (
            <p className="muted">Nenhum desafio diário concluído ainda.</p>
          ) : (
            <ul className="history">
              {progress.daily.log.slice(0, 14).map((d) => (
                <li key={d.day} className="history-item">
                  <strong>{formatDay(d.day)}</strong>
                  <div className="history-right">
                    <span className="small">{d.correct}/{d.total} acertos</span>
                    <span className="small gold">+{d.xp} XP</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="small muted">
          Nesta versão a data vem do seu aparelho, com proteção contra retrocesso do relógio. Na versão online, o dia e a
          recompensa serão validados pelo servidor.
        </p>
      </div>
    </>
  )
}
