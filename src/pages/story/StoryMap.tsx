import { useEffect, useMemo, useRef, useState } from 'react'
import { AjudaMapa, CabecalhoMapa, ContadorEstrelas, PlacaRegiao } from '../../components/map/aventura/Interface'
import { JanelaFaseHistoria } from '../../components/map/aventura/JanelaFaseHistoria'
import { ArtImage } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { JourneyMap } from '../../components/map/JourneyMap'
import { ChestIcon } from '../../components/map/Scenery'
import { getCharacter } from '../../data/library/characters'
import { STORY_SEQUENCE } from '../../data/story'
import { WORLDS } from '../../data/worlds'
import { avatarPhaseId, allChests, chestState, phaseState, worldSections, type PhaseNode } from '../../services/game/journeyMap'
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
  const [fase, setFase] = useState<PhaseNode | null>(null)
  const [ajuda, setAjuda] = useState(false)
  const [mundoVisivel, setMundoVisivel] = useState<string | null>(null)
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

  // placa da região: mundo que está no meio da tela
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setMundoVisivel((e.target as HTMLElement).dataset.mundo ?? null)),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    document.querySelectorAll('[data-mundo]').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

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
  const totalFases = STORY_SEQUENCE.length
  const estrelas = STORY_SEQUENCE.reduce((t, e) => t + (progress.experiences[e.id]?.bestStars ?? 0), 0)
  const bausProntos = allChests().filter((c) => chestState(c, progress) === 'disponivel')
  const secaoVisivel = sections.find((s) => s.world.id === mundoVisivel) ?? sections.find((s) => s.phases.some((p) => p.id === avatarAt)) ?? sections[0]
  const feitasNoMundo = secaoVisivel.phases.filter((p) => phaseState(p.id, progress) === 'concluida').length
  const abrirFase = (n: PhaseNode) => setFase(n)
  const ordem = [...sections].reverse() // o caminho sobe: o primeiro mundo fica embaixo

  return (
    <div className="av-mapa av-historia story-map">
      <CabecalhoMapa titulo="Modo História" subtitulo="Explore as Escrituras" icone="book" onAjuda={() => setAjuda(true)}>
        <PlacaRegiao nome={secaoVisivel.world.title} feitas={feitasNoMundo} total={secaoVisivel.phases.length} />
        <ContadorEstrelas estrelas={estrelas} max={totalFases * 3} baus={bausProntos.length} onBau={() => (bausProntos[0] ? scrollTo(bausProntos[0].id) : setToast('Nenhum baú pronto. Conclua as fases para liberar o próximo.'))} />
      </CabecalhoMapa>

      <div className="av-coluna" role="region" aria-label="Mapa da jornada">
        {proximo && (
          <div className="av-portao">
            <span className="av-portao-cadeado" aria-hidden="true"><Icon name="lock" size={26} /></span>
            <p>Próximo mundo: <strong>{proximo.title}</strong></p>
            <p className="small">Em preparação</p>
          </div>
        )}
        {ordem.map((s, i) => (
          <JourneyMap
            key={s.world.id}
            section={s}
            progress={progress}
            topoDoMapa={i === 0}
            avatarAt={s.phases.some((p) => p.id === avatarAt) ? avatarAt : null}
            walking={walking}
            justUnlocked={justUnlocked}
            onFase={abrirFase}
            onLocked={setToast}
            onChest={openChest}
          />
        ))}
      </div>

      {fase && <JanelaFaseHistoria node={fase} onFechar={() => setFase(null)} />}
      {ajuda && (
        <AjudaMapa
          onFechar={() => setAjuda(false)}
          itens={[
            { icone: 'flag', texto: 'O caminho começa embaixo e sobe. Toque numa fase para ver a apresentação e começar.' },
            { icone: 'star', texto: 'Cada fase dá até 3 estrelas, pelo seu aproveitamento nas perguntas.' },
            { icone: 'lock', texto: 'Fases com cadeado abrem quando você conclui a anterior.' },
            { icone: 'bau', texto: 'Os baús do caminho abrem uma única vez, depois das fases antes deles.' },
            { icone: 'map', texto: 'O progresso do Modo História é separado do Modo Quiz. Os dois somam XP e nível.' },
          ]}
        />
      )}

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
