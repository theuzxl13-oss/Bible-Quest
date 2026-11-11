import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlayerCharacter } from '../../components/character/PlayerCharacter'
import { ArtImage } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { JourneyMap } from '../../components/map/JourneyMap'
import { ChestIcon } from '../../components/map/Scenery'
import { ProgressBar } from '../../components/ui'
import { getBook } from '../../data/bible/canon'
import { getCharacter } from '../../data/library/characters'
import { STORY_SEQUENCE } from '../../data/story'
import { WORLDS } from '../../data/worlds'
import { avatarPhaseId, allChests, phaseState, worldSections } from '../../services/game/journeyMap'
import { levelFromXp, levelTitle } from '../../services/game/levels'
import { continueExperience, journeyCompletion, percent } from '../../services/game/progression'
import { useGame } from '../../state/GameContext'

const STEP_MS = 700

export default function StoryMap() {
  const { progress, profile, settings, setMapCursor, claimChest, markWorldSeen } = useGame()
  const sections = useMemo(() => worldSections(), [])
  const character = profile!.character!
  const target = avatarPhaseId(progress)
  const startAt = progress.mapCursor && STORY_SEQUENCE.some((e) => e.id === progress.mapCursor) ? progress.mapCursor : target
  const [avatarAt, setAvatarAt] = useState(startAt)
  const [walking, setWalking] = useState(false)
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [chest, setChest] = useState<{ id: string; xp: number; opened: boolean; newItems: string[] } | null>(null)
  const [worldIntro, setWorldIntro] = useState<string | null>(null)
  const timers = useRef<number[]>([])
  const reduceMotion = settings.reduceMotion || (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  const cont = continueExperience(progress)
  const contentWorlds = new Set(sections.map((s) => s.world.id))

  const scrollTo = (id: string, smooth = true) => {
    const el = document.querySelector(`[data-node="${id}"]`) ?? document.getElementById(id)
    el?.scrollIntoView({ block: 'center', behavior: smooth && !reduceMotion ? 'smooth' : 'auto' })
  }

  // Avanço animado do avatar até a fase atual
  useEffect(() => {
    const from = STORY_SEQUENCE.findIndex((e) => e.id === startAt)
    const to = STORY_SEQUENCE.findIndex((e) => e.id === target)
    window.setTimeout(() => scrollTo(startAt, false), 50)
    if (from === to || from < 0 || to < 0) {
      setMapCursor(target)
      return
    }
    if (reduceMotion || to < from) {
      setAvatarAt(target)
      setJustUnlocked(target)
      setMapCursor(target)
      return
    }
    const steps = STORY_SEQUENCE.slice(from + 1, to + 1).map((e) => e.id)
    timers.current.push(window.setTimeout(() => setWalking(true), 500))
    steps.forEach((id, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setAvatarAt(id)
          scrollTo(id)
        }, 600 + i * STEP_MS),
      )
    })
    timers.current.push(
      window.setTimeout(() => {
        setWalking(false)
        setJustUnlocked(target)
        setMapCursor(target)
      }, 600 + steps.length * STEP_MS + 200),
    )
    const t = timers.current
    return () => t.forEach((x) => window.clearTimeout(x))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Abertura de um novo mundo (uma vez por mundo)
  useEffect(() => {
    if (walking) return
    const w = sections.find((s) => phaseState(s.phases[0].id, progress) !== 'bloqueada' && !progress.worldsSeen.includes(s.world.id))
    if (w) setWorldIntro(w.world.id)
  }, [walking, progress, sections])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(t)
  }, [toast])

  const openChest = (id: string) => setChest({ id, xp: allChests().find((c) => c.id === id)?.xp ?? 0, opened: false, newItems: [] })
  const intro = WORLDS.find((w) => w.id === worldIntro)
  const introChars = intro
    ? [...new Set(sections.find((s) => s.world.id === intro.id)?.phases.flatMap((p) => p.experience.characters) ?? [])].slice(0, 6)
    : []
  const level = levelFromXp(progress.xp)

  return (
    <div className="story-map">
      <section className="map-hero">
        <ArtImage art="place-raheh" className="hero-bg" priority decorative />
        <div className="hero-shade" />
        <div className="container map-hero-inner">
          <div className="map-hero-char">
            <PlayerCharacter size={96} />
          </div>
          <div className="map-hero-info">
            <p className="eyebrow">Modo História · A grande jornada bíblica</p>
            <h1>{character.name}</h1>
            <p className="small">Nível {level} · {levelTitle(level)} · {progress.xp} XP</p>
            <ProgressBar value={Math.round(journeyCompletion(progress) * 1000)} max={1000} label="Conclusão da jornada completa" />
            <p className="small muted">{percent(journeyCompletion(progress))} da Bíblia · de Gênesis a Apocalipse</p>
          </div>
          {cont && (
            <Link to={`/historia/${cont.bookId}/${cont.id}`} className="btn btn-gold btn-lg map-hero-cta">
              Continuar: fase {STORY_SEQUENCE.findIndex((e) => e.id === cont.id) + 1} <Icon name="arrowRight" />
            </Link>
          )}
        </div>
      </section>

      <nav className="world-nav" aria-label="Mundos da jornada">
        <div className="world-nav-inner">
          {WORLDS.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`world-chip ${contentWorlds.has(w.id) ? '' : 'is-locked'}`}
              onClick={() => (contentWorlds.has(w.id) ? scrollTo(w.id) : document.getElementById('proximos-mundos')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }))}
            >
              <span className="world-chip-n">{w.number}</span> {w.title}
              {!contentWorlds.has(w.id) && <Icon name="lock" size={12} />}
            </button>
          ))}
        </div>
      </nav>

      <div className="map-column">
        {sections.map((s, i) => (
          <div key={s.world.id}>
            {i > 0 && (
              <div className="world-gate" aria-hidden="true">
                <span>Portal para o Mundo {s.world.number}</span>
              </div>
            )}
            <JourneyMap
              section={s}
              progress={progress}
              avatarAt={s.phases.some((p) => p.id === avatarAt) ? avatarAt : null}
              walking={walking}
              justUnlocked={justUnlocked}
              onLocked={setToast}
              onChest={openChest}
            />
          </div>
        ))}

        <section id="proximos-mundos" className="next-worlds" aria-labelledby="nw-t">
          <h2 id="nw-t">Próximos mundos</h2>
          <p className="muted small">A jornada continua até Apocalipse. Cada mundo é liberado quando o anterior estiver completo e suas fases estiverem prontas.</p>
          <ol className="next-world-list">
            {WORLDS.filter((w) => !contentWorlds.has(w.id)).map((w) => (
              <li key={w.id} className="next-world">
                <ArtImage art={w.art} className="next-world-img" sizes="160px" decorative />
                <div>
                  <p className="eyebrow">Mundo {w.number} · Em preparação</p>
                  <h3>{w.title}</h3>
                  <p className="small muted">{w.books.map((b) => getBook(b)?.name).join(', ')}</p>
                </div>
                <Icon name="lock" />
              </li>
            ))}
          </ol>
          <Link to="/historia/livros" className="btn btn-outline">Ver os 66 livros e o progresso</Link>
        </section>
      </div>

      <p className="map-toast" role="status" aria-live="polite">{toast && <span>{toast}</span>}</p>

      {chest && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="chest-t">
          <div className={`modal chest-modal ${chest.opened ? 'is-opened' : ''}`}>
            <div className="chest-stage">
              {chest.opened && <div className="chest-burst" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ ['--i' as string]: i }} />)}</div>}
              <ChestIcon open={chest.opened} size={120} />
            </div>
            <h2 id="chest-t">{chest.opened ? `+${chest.xp} XP` : 'Baú de recompensa'}</h2>
            <p className="muted">{chest.opened ? 'Recompensa recebida. Cada baú só pode ser aberto uma vez.' : 'Você concluiu as fases deste trecho do caminho.'}</p>
            {chest.opened ? (
              <button type="button" className="btn btn-gold" onClick={() => setChest(null)} autoFocus>Continuar</button>
            ) : (
              <button
                type="button"
                className="btn btn-gold"
                autoFocus
                onClick={() => {
                  const r = claimChest(chest.id)
                  setChest({ ...chest, xp: r.xp || chest.xp, opened: true, newItems: r.newItems })
                }}
              >
                Abrir baú
              </button>
            )}
          </div>
        </div>
      )}

      {intro && (
        <div className="modal-backdrop world-intro" role="dialog" aria-modal="true" aria-labelledby="wi-t">
          <ArtImage art={intro.art} className="hero-bg" decorative />
          <div className="hero-shade" />
          <div className="world-intro-body">
            <p className="eyebrow">Mundo {intro.number}</p>
            <h2 id="wi-t" className="display-sm">{intro.title}</h2>
            <p className="lead">{intro.subtitle}</p>
            {introChars.length > 0 && (
              <>
                <p className="small muted">Personagens que você vai conhecer:</p>
                <ul className="intro-chars">
                  {introChars.map((id) => {
                    const c = getCharacter(id)
                    return c ? <li key={id}><span className="portrait"><ArtImage art={c.image} className="portrait-img" sizes="56px" decorative /></span><span className="small">{c.name}</span></li> : null
                  })}
                </ul>
              </>
            )}
            <button
              type="button"
              className="btn btn-gold btn-lg"
              autoFocus
              onClick={() => {
                markWorldSeen(intro.id)
                setWorldIntro(null)
              }}
            >
              Entrar no mundo <Icon name="arrowRight" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
