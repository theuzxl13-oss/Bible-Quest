import { Link, useParams } from 'react-router-dom'
import { ArtImage, ArtCredit } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { Stars } from '../components/ui'
import { getJourney } from '../data/journeys'
import { questionsForChapter } from '../data/questions'
import { useGame } from '../state/GameContext'
import { isChapterUnlocked, isJourneyUnlocked } from '../services/game/unlock'
import NotFound from './NotFound'

export default function JourneyPage() {
  const { journeyId } = useParams()
  const journey = getJourney(journeyId)
  const { progress } = useGame()
  if (!journey) return <NotFound />
  const unlocked = isJourneyUnlocked(journey.id, progress)

  return (
    <>
      <section className="hero hero-mid">
        <ArtImage art={journey.image} className="hero-bg" priority />
        <div className="hero-shade" />
        <div className="container hero-content">
          <Link to="/mapa" className="back-link"><Icon name="arrowLeft" size={16} /> Mapa</Link>
          <p className="eyebrow">Jornada {journey.order} · {journey.books}</p>
          <h1 className="display-sm">{journey.title}</h1>
          <p className="hero-lead">{journey.summary}</p>
          <ArtCredit art={journey.image} />
        </div>
      </section>
      <div className="container section">
        {!unlocked && (
          <p className="notice notice-warn" role="note">Esta jornada ainda está bloqueada. Conclua a jornada anterior.</p>
        )}
        <h2 className="section-title">Capítulos</h2>
        <ol className="chapter-list">
          {journey.chapters.map((c) => {
            const open = isChapterUnlocked(c.id, progress)
            const cp = progress.chapters[c.id]
            const n = questionsForChapter(c.id).length
            return (
              <li key={c.id} className={`chapter-card ${open ? '' : 'is-locked'} ${cp?.completed ? 'is-done' : ''}`}>
                <ArtImage art={c.image} className="chapter-img" sizes="(min-width: 900px) 200px, 30vw" />
                <div className="chapter-body">
                  <p className="eyebrow">Capítulo {c.order} · {c.scope}</p>
                  <h3>{c.title}</h3>
                  <p className="small muted">{n} perguntas · 3 tentativas</p>
                  {cp?.completed && <Stars value={cp.bestStars} />}
                </div>
                <div className="chapter-action">
                  {open ? (
                    <Link to={`/capitulo/${c.id}`} className={`btn ${cp?.completed ? 'btn-outline' : 'btn-gold'}`} aria-label={`${cp?.completed ? 'Revisar' : 'Começar'} capítulo ${c.order}: ${c.title}`}>
                      {cp?.completed ? 'Revisar' : 'Começar'}
                    </Link>
                  ) : (
                    <span className="locked-label"><Icon name="lock" size={16} /> Bloqueado</span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </>
  )
}
