import { useEffect, useMemo, useRef, useState } from 'react'
import { MapaTopo } from '../../components/map/MapaTopo'
import { ArtImage } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { JourneyMap } from '../../components/map/JourneyMap'
import { ChestIcon } from '../../components/map/Scenery'
import { getCharacter } from '../../data/library/characters'
import { STORY_SEQUENCE } from '../../data/story'
import { WORLDS } from '../../data/worlds'
import { avatarPhaseId, allChests, phaseState, worldSections } from '../../services/game/journeyMap'
import { useGame } from '../../state/GameContext'

const STEP_MS = 700

export default function StoryMap() {
  const { progress, settings, setMapCursor, claimChest, markWorldSeen } = useGame()
  const sections = useMemo(() => worldSections(), [])
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
      window.setTimeout(() => scrollTo(target, false), 80)
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
  const proximo = WORLDS.find((w) => !contentWorlds.has(w.id))
  const estrelas = STORY_SEQUENCE.reduce((t, e) => t + (progress.experiences[e.id]?.bestStars ?? 0), 0)

  return (
    <div className="saga story-map">
      <MapaTopo voltar="/painel" estrelas={estrelas} />

      <div className="saga-coluna" role="region" aria-label="Mapa da jornada">
        {sections.map((s) => (
          <JourneyMap
            key={s.world.id}
            section={s}
            progress={progress}
            avatarAt={s.phases.some((p) => p.id === avatarAt) ? avatarAt : null}
            walking={walking}
            justUnlocked={justUnlocked}
            onLocked={setToast}
            onChest={openChest}
          />
        ))}
        {proximo && (
          <div className="saga-fim">
            <span className="saga-cadeado" aria-hidden="true"><Icon name="lock" size={22} /></span>
            <p>Próximo mundo: <strong>{proximo.title}</strong></p>
            <p className="small">Em preparação</p>
          </div>
        )}
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
