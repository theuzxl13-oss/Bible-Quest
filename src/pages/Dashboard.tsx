import { Link } from 'react-router-dom'
import { ArtImage } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { LocalProfileNotice, ProgressBar, Stars } from '../components/ui'
import { JOURNEYS, getJourney } from '../data/journeys'
import { useGame } from '../state/GameContext'
import { levelProgress, levelTitle } from '../services/game/levels'
import { visibleStreak } from '../services/game/streak'
import { dayKey } from '../services/game/dates'
import { isJourneyUnlocked, journeyCompletion, nextChapter } from '../services/game/unlock'

export default function Dashboard() {
  const { profile, progress } = useGame()
  const lp = levelProgress(progress.xp)
  const today = dayKey()
  const streak = visibleStreak(progress.streak, today)
  const dailyDone = progress.daily.lastCompletedDay === today
  const next = nextChapter(progress)
  const nextJourney = next ? getJourney(next.journeyId) : null
  const accuracy = progress.stats.answered ? Math.round((progress.stats.correct / progress.stats.answered) * 100) : 0

  return (
    <div className="container section stack-lg">
      <header className="dash-head">
        <div>
          <p className="eyebrow">Painel</p>
          <h1>Olá, {profile!.nickname}</h1>
        </div>
        <div className="stat-pills">
          <span className="pill" title="Sequência de dias">
            <Icon name="flame" size={18} /> {streak} {streak === 1 ? 'dia' : 'dias'}
          </span>
          <span className="pill">
            <Icon name="star" size={18} /> {progress.xp} XP
          </span>
        </div>
      </header>

      <div className="dash-grid">
        <section className="panel level-card" aria-labelledby="lvl-title">
          <p className="eyebrow">Nível {lp.level}</p>
          <h2 id="lvl-title">{levelTitle(lp.level)}</h2>
          <ProgressBar value={lp.current} max={lp.needed} label="Progresso para o próximo nível" />
          <p className="muted small">
            {lp.current} / {lp.needed} XP para o nível {lp.level + 1}
          </p>
          <dl className="mini-stats">
            <div><dt>Respostas</dt><dd>{progress.stats.answered}</dd></div>
            <div><dt>Precisão</dt><dd>{accuracy}%</dd></div>
            <div><dt>Melhor sequência</dt><dd>{progress.streak.best}</dd></div>
          </dl>
        </section>

        {next && nextJourney ? (
          <Link to={`/capitulo/${next.id}`} className="panel continue-card">
            <ArtImage art={next.image} className="continue-img" sizes="(min-width: 900px) 40vw, 100vw" />
            <div className="continue-body">
              <p className="eyebrow">Continuar · {nextJourney.title}</p>
              <h2>Capítulo {next.order}: {next.title}</h2>
              <p className="muted">{next.scope}</p>
              <span className="btn btn-gold">Abrir capítulo <Icon name="arrowRight" /></span>
            </div>
          </Link>
        ) : (
          <section className="panel continue-card">
            <div className="continue-body">
              <p className="eyebrow">Jornadas concluídas</p>
              <h2>Você completou todas as jornadas disponíveis</h2>
              <p className="muted">Refaça capítulos para conquistar 3 estrelas e medalhas de ouro.</p>
              <Link to="/mapa" className="btn btn-gold">Ver mapa</Link>
            </div>
          </section>
        )}

        <Link to="/diario" className={`panel daily-card ${dailyDone ? 'is-done' : ''}`}>
          <Icon name="calendar" size={28} />
          <div>
            <p className="eyebrow">Desafio diário</p>
            <h2>{dailyDone ? 'Concluído hoje' : '5 perguntas de hoje'}</h2>
            <p className="muted small">{dailyDone ? 'Volte amanhã para manter a sequência.' : 'Mantenha sua sequência e ganhe bônus de XP.'}</p>
          </div>
          <Icon name="arrowRight" />
        </Link>

        <Link to="/multiplayer" className="panel daily-card">
          <Icon name="users" size={28} />
          <div>
            <p className="eyebrow">Multiplayer · demonstração</p>
            <h2>Salas privadas</h2>
            <p className="muted small">Veja como funcionarão as partidas com amigos.</p>
          </div>
          <Icon name="arrowRight" />
        </Link>
      </div>

      <section aria-labelledby="jr-title">
        <div className="section-head">
          <h2 id="jr-title" className="section-title">Suas jornadas</h2>
          <Link to="/mapa" className="link">Ver mapa completo</Link>
        </div>
        <div className="journey-mini-grid">
          {JOURNEYS.map((j) => {
            const c = journeyCompletion(j.id, progress)
            const unlocked = isJourneyUnlocked(j.id, progress)
            return (
              <Link key={j.id} to={unlocked ? `/jornada/${j.id}` : '/mapa'} className={`journey-mini ${unlocked ? '' : 'is-locked'}`}>
                <ArtImage art={j.image} className="journey-mini-img" sizes="(min-width: 900px) 20vw, 50vw" />
                <div className="journey-mini-body">
                  <h3>{j.title}</h3>
                  {unlocked ? (
                    <>
                      <ProgressBar value={c.done} max={c.total} label={`Progresso em ${j.title}`} />
                      <span className="small muted">{c.done}/{c.total} capítulos</span>
                    </>
                  ) : (
                    <span className="small muted"><Icon name="lock" size={14} /> Bloqueada</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="hist-title">
        <div className="section-head">
          <h2 id="hist-title" className="section-title">Partidas recentes</h2>
          <Link to="/perfil" className="link">Histórico completo</Link>
        </div>
        {progress.history.length === 0 ? (
          <p className="muted">Nenhuma partida ainda. Que tal começar pelo primeiro capítulo?</p>
        ) : (
          <ul className="history">
            {progress.history.slice(0, 4).map((h) => (
              <li key={h.id} className="history-item">
                <div>
                  <strong>{h.title}</strong>
                  <span className="muted small"> · {new Date(h.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="history-right">
                  {h.mode === 'capitulo' && <Stars value={h.stars} size={14} />}
                  <span className="small">{h.correct}/{h.total}</span>
                  <span className="small gold">+{h.xp} XP</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <LocalProfileNotice />
    </div>
  )
}
