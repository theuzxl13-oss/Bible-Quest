import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Adventurer } from '../../components/Adventurer'
import { ArtImage, ArtCredit } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { Stars } from '../../components/ui'
import { getBook } from '../../data/bible/canon'
import { getCharacter } from '../../data/library/characters'
import { getPlace } from '../../data/library/places'
import { getExperience } from '../../data/story'
import { questionsForExperience } from '../../data/questions'
import { phaseDifficulty, phaseNumber } from '../../services/game/journeyMap'
import { isExperienceUnlocked } from '../../services/game/progression'
import { worldOfBook } from '../../data/worlds'
import { useGame } from '../../state/GameContext'
import NotFound from '../NotFound'

/** Tela de entrada da fase. */
export default function ExperiencePage() {
  const { bookId, experienceId } = useParams()
  const exp = getExperience(experienceId)
  const { progress, profile, markVisited } = useGame()
  const unlocked = exp ? isExperienceUnlocked(exp.id, progress) : false
  const [news, setNews] = useState<string[]>([])
  const visited = useRef<string | null>(null)

  useEffect(() => {
    if (!exp || !unlocked || visited.current === exp.id) return
    visited.current = exp.id
    const r = markVisited(exp.id)
    const names = [...r.newCharacters.map((id) => getCharacter(id)?.name), ...r.newPlaces.map((id) => getPlace(id)?.name)].filter(Boolean) as string[]
    if (names.length) setNews(names)
  }, [exp, unlocked, markVisited])

  if (!exp || exp.bookId !== bookId) return <NotFound />
  if (!unlocked) return <Navigate to="/historia" replace />
  const book = getBook(exp.bookId)!
  const world = worldOfBook(exp.bookId)
  const qs = questionsForExperience(exp.id)
  const diff = phaseDifficulty(qs.reduce((s, q) => s + q.difficulty, 0) / Math.max(1, qs.length))
  const ep = progress.experiences[exp.id]
  const n = phaseNumber(exp.id)

  return (
    <article className="phase">
      <section className="hero hero-mid phase-hero">
        <ArtImage art={exp.image} className="hero-bg" priority />
        <div className="hero-shade" />
        <div className="container hero-content">
          <Link to="/historia" className="back-link"><Icon name="arrowLeft" size={16} /> Mapa da jornada</Link>
          <p className="eyebrow">{world ? `Mundo ${world.number} · ` : ''}{book.name} · Fase {n}</p>
          <h1 className="display-sm">{exp.title}</h1>
          <div className="phase-badges">
            <span className="tag"><Icon name="book" size={14} /> {exp.scope}</span>
            <span className={`tag tag-diff-${diff.level}`}>{diff.label}</span>
            <span className="tag">{qs.length} perguntas</span>
            {ep?.completed && <span className="tag tag-done"><Stars value={ep.bestStars} size={13} /> Concluída</span>}
          </div>
          <ArtCredit art={exp.image} />
        </div>
      </section>

      <div className="container section phase-body">
        {news.length > 0 && (
          <p className="notice notice-info library-news" role="status">
            <Icon name="book" /> <span><strong>Nova ficha na Biblioteca:</strong> {news.join(', ')}. <Link to="/biblioteca">Abrir Biblioteca</Link></span>
          </p>
        )}

        <div className="phase-grid">
          <section className="panel phase-intro" aria-labelledby="pi-t">
            <div className="phase-guide">
              {profile?.character && <Adventurer config={profile.character} size={64} portrait />}
              <div>
                <p className="eyebrow">{profile?.character?.name ?? 'Você'} chega a um novo lugar</p>
                <h2 id="pi-t">Introdução</h2>
              </div>
            </div>
            <p className="lead">{exp.intro[0]}</p>
            <p className="small muted">Na fase você acompanha a narrativa, lê os trechos bíblicos e o aprendizado, e depois responde a {qs.length} perguntas sobre a passagem.</p>
            <div className="row-actions">
              <Link to={`/historia/${book.id}/${exp.id}/historia`} className="btn btn-gold btn-lg">
                Iniciar fase <Icon name="play" size={18} />
              </Link>
              {ep?.completed && (
                <Link to={`/historia/${book.id}/${exp.id}/desafio`} className="btn btn-outline">Ir direto ao desafio</Link>
              )}
            </div>
            {ep?.completed && <p className="small muted">Revisitar é livre. XP extra só se você superar sua melhor pontuação ({ep.bestScore}).</p>}
          </section>

          <aside className="panel phase-cast" aria-labelledby="pc-t">
            <h2 id="pc-t">Personagens desta fase</h2>
            {exp.characters.length === 0 ? (
              <p className="muted small">Esta passagem não destaca personagens humanos.</p>
            ) : (
              <ul className="cast-list">
                {exp.characters.map((id) => {
                  const c = getCharacter(id)
                  if (!c) return null
                  return (
                    <li key={id}>
                      <Link to={`/biblioteca/personagem/${id}`} className="cast-item">
                        <span className="portrait"><ArtImage art={c.image} focus={c.focus} className="portrait-img" sizes="56px" decorative /></span>
                        <span><strong>{c.name}</strong><span className="small muted"> · {c.role}</span></span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
            <p className="small muted">As imagens são pinturas relacionadas à história, não retratos dos personagens.</p>
            {exp.places.length > 0 && (
              <>
                <h3>Lugares</h3>
                <p className="small">{exp.places.map((id) => getPlace(id)?.name).filter(Boolean).join(' · ')}</p>
              </>
            )}
          </aside>
        </div>
      </div>
    </article>
  )
}
