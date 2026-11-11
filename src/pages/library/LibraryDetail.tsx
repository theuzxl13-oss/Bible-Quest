import { Link, useParams } from 'react-router-dom'
import { ArtImage } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { ProgressBar } from '../../components/ui'
import { GROUP_INFO, TESTAMENT_LABEL, getBook } from '../../data/bible/canon'
import { BOOK_INFO } from '../../data/library/books'
import { getCharacter } from '../../data/library/characters'
import { getPlace } from '../../data/library/places'
import { STORY_SEQUENCE, experiencesOf } from '../../data/story'
import { phaseNumber } from '../../services/game/journeyMap'
import { bookCompletion, isExperienceUnlocked, percent } from '../../services/game/progression'
import { useGame } from '../../state/GameContext'
import NotFound from '../NotFound'
import { firstPhaseWith } from './Library'

function PhaseLinks({ ids }: { ids: string[] }) {
  const { progress } = useGame()
  if (ids.length === 0) return null
  return (
    <ul className="phase-links">
      {ids.map((id) => {
        const e = STORY_SEQUENCE.find((x) => x.id === id)!
        const open = isExperienceUnlocked(id, progress)
        return (
          <li key={id}>
            {open ? <Link to={`/historia/${e.bookId}/${e.id}`}>Fase {phaseNumber(id)} · {e.title}</Link> : <span className="muted"><Icon name="lock" size={12} /> Fase {phaseNumber(id)} · {e.title}</span>}
          </li>
        )
      })}
    </ul>
  )
}

function Locked({ label, phase }: { label: string; phase?: string }) {
  return (
    <div className="container section narrow center stack">
      <Icon name="lock" size={36} />
      <h1>Ficha ainda bloqueada</h1>
      <p className="muted">Você vai conhecer {label} {phase ? `na fase ${phaseNumber(phase)}` : 'em uma próxima fase'} da jornada.</p>
      <Link to="/biblioteca" className="btn btn-gold">Voltar à Biblioteca</Link>
    </div>
  )
}

export function CharacterSheet() {
  const { id } = useParams()
  const c = getCharacter(id)
  const { progress } = useGame()
  if (!c) return <NotFound />
  if (!progress.library.characters[c.id]) return <Locked label="este personagem" phase={firstPhaseWith('characters', c.id)?.id} />
  const phases = STORY_SEQUENCE.filter((e) => e.characters.includes(c.id)).map((e) => e.id)
  return (
    <article className="container section narrow stack-lg sheet">
      <Link to="/biblioteca" className="back-link"><Icon name="arrowLeft" size={16} /> Biblioteca</Link>
      <header className="sheet-head">
        <span className="portrait sheet-portrait"><ArtImage art={c.image} focus={c.focus} className="portrait-img" sizes="160px" /></span>
        <div>
          <p className="eyebrow">Personagem bíblico</p>
          <h1>{c.name}</h1>
          <p className="lead">{c.role}</p>
        </div>
      </header>
      <p>{c.summary}</p>
      <p className="small muted">Ilustração: pintura em domínio público relacionada à história; não é um retrato.</p>
      <section><h2>Principais acontecimentos</h2><ul className="bullets">{c.events.map((e) => <li key={e}>{e}</li>)}</ul></section>
      <section>
        <h2>Relações</h2>
        <ul className="chips">
          {c.relations.map((r) => {
            const other = getCharacter(r.id)
            const known = Boolean(progress.library.characters[r.id])
            return (
              <li key={r.id} className="chip">
                {r.label}: {known ? <Link to={`/biblioteca/personagem/${r.id}`}>&nbsp;{other?.name}</Link> : <>&nbsp;{other?.name ?? r.id}</>}
              </li>
            )
          })}
        </ul>
      </section>
      <section><h2>Lições</h2><ul className="bullets">{c.lessons.map((l) => <li key={l}>{l}</li>)}</ul></section>
      <section><h2>Referências bíblicas</h2><ul className="refs-inline">{c.references.map((r) => <li key={r}>{r}</li>)}</ul></section>
      <section><h2>Na jornada</h2><PhaseLinks ids={phases} /></section>
    </article>
  )
}

export function PlaceSheet() {
  const { id } = useParams()
  const pl = getPlace(id)
  const { progress } = useGame()
  if (!pl) return <NotFound />
  if (!progress.library.places[pl.id]) return <Locked label="este lugar" phase={firstPhaseWith('places', pl.id)?.id} />
  const phases = STORY_SEQUENCE.filter((e) => e.places.includes(pl.id)).map((e) => e.id)
  return (
    <article className="container section narrow stack-lg sheet">
      <Link to="/biblioteca?aba=lugares" className="back-link"><Icon name="arrowLeft" size={16} /> Biblioteca</Link>
      <figure className="about-figure"><ArtImage art={pl.image} className="about-img" sizes="(min-width: 900px) 760px, 100vw" /></figure>
      <header>
        <p className="eyebrow">Lugar bíblico</p>
        <h1>{pl.name}</h1>
      </header>
      <section><h2>Contexto</h2><p>{pl.context}</p></section>
      <section><h2>Acontecimentos relacionados</h2><ul className="bullets">{pl.events.map((e) => <li key={e}>{e}</li>)}</ul></section>
      <section><h2>Referências bíblicas</h2><ul className="refs-inline">{pl.references.map((r) => <li key={r}>{r}</li>)}</ul></section>
      <section><h2>Na jornada</h2><PhaseLinks ids={phases} /></section>
    </article>
  )
}

export function BookSheet() {
  const { id } = useParams()
  const b = getBook(id)
  const { progress } = useGame()
  if (!b) return <NotFound />
  const info = BOOK_INFO[b.id]
  const c = bookCompletion(b.id, progress)
  const exps = experiencesOf(b.id)
  return (
    <article className="container section narrow stack-lg sheet">
      <Link to="/biblioteca?aba=livros" className="back-link"><Icon name="arrowLeft" size={16} /> Biblioteca</Link>
      <header>
        <p className="eyebrow">{TESTAMENT_LABEL[b.testament]} · {GROUP_INFO[b.group].label} · {b.chapters} {b.chapters === 1 ? 'capítulo' : 'capítulos'}</p>
        <h1>{b.name}</h1>
        <p className="tag">{info?.genre}</p>
      </header>
      <section><h2>Resumo</h2><p>{info?.summary}</p></section>
      <section><h2>Principais temas</h2><ul className="chips">{info?.themes.map((t) => <li key={t} className="chip">{t}</li>)}</ul></section>
      <section><h2>Referências importantes</h2><ul className="refs-inline">{info?.keyRefs.map((r) => <li key={r}>{r}</li>)}</ul></section>
      <section>
        <h2>Seu progresso</h2>
        {exps.length === 0 ? (
          <p className="muted">As fases deste livro ainda estão em preparação.</p>
        ) : (
          <>
            <ProgressBar value={c.done} max={c.total} label={`Progresso em ${b.name}`} />
            <p className="small muted">{c.done}/{c.total} fases · {percent(c.ratio)} · {c.stars}/{c.maxStars} estrelas</p>
            <PhaseLinks ids={exps.map((e) => e.id)} />
          </>
        )}
      </section>
    </article>
  )
}
