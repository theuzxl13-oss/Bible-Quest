import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { PlayerCharacter } from '../../components/character/PlayerCharacter'
import { ArtImage } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { ReadAloud } from '../../components/ReadAloud'
import { getCharacter } from '../../data/library/characters'
import { BIBLE_SOURCE_NOTE, getExperience } from '../../data/story'
import { questionsForExperience } from '../../data/questions'
import { phaseNumber } from '../../services/game/journeyMap'
import { isExperienceUnlocked } from '../../services/game/progression'
import type { Experience } from '../../types'
import { useGame } from '../../state/GameContext'
import NotFound from '../NotFound'

type Slide =
  | { kind: 'intro'; paragraphs: string[] }
  | { kind: 'narrativa'; text: string; characters: string[] }
  | { kind: 'biblia' }
  | { kind: 'aprendizado'; paragraphs: string[] }

function buildSlides(exp: Experience): Slide[] {
  const perSlide = Math.max(1, Math.ceil(exp.characters.length / Math.max(1, exp.narrative.length)))
  return [
    { kind: 'intro', paragraphs: exp.intro },
    ...exp.narrative.map((text, i) => ({ kind: 'narrativa' as const, text, characters: exp.characters.slice(i * perSlide, i * perSlide + perSlide) })),
    { kind: 'biblia' },
    { kind: 'aprendizado', paragraphs: exp.learning },
  ]
}

const TITLES: Record<Slide['kind'], string> = {
  intro: 'Introdução',
  narrativa: 'Narrativa',
  biblia: 'Referências bíblicas',
  aprendizado: 'Aprendizado',
}

/** Cena narrativa da fase, apresentada em quadros antes do desafio. */
export default function PhaseScene() {
  const { bookId, experienceId } = useParams()
  const exp = getExperience(experienceId)
  const { progress, profile } = useGame()
  const navigate = useNavigate()
  const [i, setI] = useState(0)
  const slides = exp ? buildSlides(exp) : []
  const last = i === slides.length - 1

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /input|textarea|select/i.test(t.tagName)) return
      if (e.key === 'ArrowRight') setI((x) => Math.min(slides.length - 1, x + 1))
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [slides.length])

  if (!exp || exp.bookId !== bookId) return <NotFound />
  if (!isExperienceUnlocked(exp.id, progress)) return <Navigate to="/historia" replace />
  const s = slides[i]
  const challenge = `/historia/${exp.bookId}/${exp.id}/desafio`
  const count = questionsForExperience(exp.id).length
  const speech =
    s.kind === 'intro' || s.kind === 'aprendizado' ? s.paragraphs.join(' ') : s.kind === 'narrativa' ? s.text : exp.passages.map((p) => `${p.reference}. ${p.text}`).join(' ')

  return (
    <div className="scene">
      <ArtImage art={exp.image} className="scene-bg" priority decorative />
      <div className="scene-shade" />
      <div className="scene-top container">
        <Link to={`/historia/${exp.bookId}/${exp.id}`} className="icon-btn" aria-label="Voltar à fase"><Icon name="arrowLeft" /></Link>
        <div className="scene-progress">
          <span className="small">Fase {phaseNumber(exp.id)} · {exp.title}</span>
          <ol className="scene-dots" aria-label={`Quadro ${i + 1} de ${slides.length}`}>
            {slides.map((sl, k) => <li key={k} className={k === i ? 'is-on' : k < i ? 'is-past' : ''}><span className="sr-only">{TITLES[sl.kind]}</span></li>)}
          </ol>
        </div>
        <Link to={challenge} className="btn btn-ghost btn-sm">Pular para o desafio</Link>
      </div>

      <div className="scene-stage container" key={i}>
        {s.kind === 'narrativa' && s.characters.length > 0 && (
          <ul className="scene-cast" aria-label="Personagens em cena">
            {s.characters.map((id, k) => {
              const c = getCharacter(id)
              return c ? (
                <li key={id} style={{ ['--k' as string]: k }}>
                  <span className="portrait portrait-lg"><ArtImage art={c.image} focus={c.focus} className="portrait-img" sizes="96px" decorative /></span>
                  <strong>{c.name}</strong>
                  <span className="small">{c.role}</span>
                </li>
              ) : null
            })}
          </ul>
        )}
        {profile?.character && (s.kind === 'intro' || s.kind === 'narrativa') && (
          <div className="scene-player" aria-hidden="true">
            <PlayerCharacter size={92} />
          </div>
        )}

        <section className={`scene-card scene-${s.kind}`} aria-live="polite" aria-labelledby="scene-t">
          <div className="scene-card-head">
            <h1 id="scene-t">{TITLES[s.kind]}</h1>
            {s.kind === 'narrativa' && <span className="tag tag-narrative">Narrativa dramatizada</span>}
            {s.kind === 'biblia' && <span className="tag tag-scripture">Almeida RC 1911</span>}
            <ReadAloud text={speech} />
          </div>
          {s.kind === 'intro' && s.paragraphs.map((p, k) => <p key={k}>{p}</p>)}
          {s.kind === 'narrativa' && (
            <>
              <p className="narrative">{s.text}</p>
              <p className="small muted">Ambientação escrita para o jogo. Não é texto bíblico e não atribui falas aos personagens.</p>
            </>
          )}
          {s.kind === 'biblia' && (
            <>
              {exp.passages.map((p) => (
                <blockquote key={p.reference} className="passage">
                  <p>{p.text}</p>
                  <cite>{p.reference}</cite>
                </blockquote>
              ))}
              <p className="refs-title">Para ler na sua Bíblia:</p>
              <ul className="refs-list">{exp.references.map((r) => <li key={r}>{r}</li>)}</ul>
              <p className="small muted">{BIBLE_SOURCE_NOTE}</p>
            </>
          )}
          {s.kind === 'aprendizado' && s.paragraphs.map((p, k) => <p key={k}>{p}</p>)}

          <div className="scene-actions">
            <button type="button" className="btn btn-outline" onClick={() => setI(i - 1)} disabled={i === 0}>
              <Icon name="arrowLeft" /> Voltar
            </button>
            {last ? (
              <button type="button" className="btn btn-gold btn-lg" onClick={() => navigate(challenge)}>
                Começar o desafio ({count} perguntas) <Icon name="play" size={18} />
              </button>
            ) : (
              <button type="button" className="btn btn-gold" onClick={() => setI(i + 1)} autoFocus>
                Continuar <Icon name="arrowRight" />
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
