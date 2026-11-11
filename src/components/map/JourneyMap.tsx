import { Link } from 'react-router-dom'
import type { Progress } from '../../types'
import type { WorldSection } from '../../services/game/journeyMap'
import { chestState, phaseState } from '../../services/game/journeyMap'
import { ArtImage } from '../ArtImage'
import { PlayerCharacter } from '../character/PlayerCharacter'
import { Icon } from '../Icon'
import { ChestIcon, Decor } from './Scenery'

/*
 * Um trecho do caminho (um mundo). O SVG desenha o terreno, o caminho
 * sinuoso e o cenário; as fases e baús são botões posicionados por cima,
 * na mesma escala (porcentagens do viewBox), para continuarem clicáveis e
 * acessíveis por teclado.
 */

export const MAP_W = 400
const STEP = 118
const PAD = 90

export interface MapPoint {
  id: string
  x: number
  y: number
}

export function layoutSection(section: WorldSection) {
  const points: MapPoint[] = section.nodes.map((n, i) => ({
    id: n.id,
    x: MAP_W / 2 + Math.sin(i * 0.92 + 0.6) * 120,
    y: PAD + i * STEP,
  }))
  const H = PAD * 2 + (points.length - 1) * STEP
  let d = `M ${points[0].x} ${points[0].y - PAD + 10} L ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    d += ` C ${a.x} ${a.y + STEP * 0.55}, ${b.x} ${b.y - STEP * 0.55}, ${b.x} ${b.y}`
  }
  const last = points[points.length - 1]
  d += ` L ${last.x} ${H}`
  // cenário: entre cada par de pontos, do lado oposto ao caminho
  const decor = points.slice(0, -1).map((p, i) => {
    const mid = (p.y + points[i + 1].y) / 2
    const midX = (p.x + points[i + 1].x) / 2
    const side = midX > MAP_W / 2 ? 1 : -1
    return {
      kind: section.world.decor[i % section.world.decor.length],
      x: midX > MAP_W / 2 ? 62 + ((i * 37) % 30) : MAP_W - 62 - ((i * 23) % 30),
      y: mid + (i % 2 ? 10 : -6),
      s: 0.85 + ((i * 13) % 5) / 10,
      side,
    }
  })
  return { W: MAP_W, H, points, d, decor }
}

interface Props {
  section: WorldSection
  progress: Progress
  /** Fase onde o avatar está desenhado agora. */
  avatarAt: string | null
  walking: boolean
  /** Fase recém-liberada (animação de desbloqueio). */
  justUnlocked: string | null
  onLocked: (message: string) => void
  onChest: (chestId: string) => void
}

const pct = (v: number, total: number) => `${(v / total) * 100}%`

export function JourneyMap({ section, progress, avatarAt, walking, justUnlocked, onLocked, onChest }: Props) {
  const { world } = section
  const { W, H, points, d, decor } = layoutSection(section)
  const pos = new Map(points.map((p) => [p.id, p]))
  const avatarPoint = avatarAt ? pos.get(avatarAt) : undefined
  const prevPhase = (i: number) => section.phases[i - 1]

  return (
    <section className="world" id={world.id} aria-labelledby={`${world.id}-t`} style={{ ['--ground' as string]: world.theme.ground, ['--ground-deep' as string]: world.theme.groundDeep, ['--path' as string]: world.theme.path, ['--accent' as string]: world.theme.accent }}>
      <header className="world-banner">
        <ArtImage art={world.art} className="world-banner-img" sizes="(min-width: 900px) 900px, 100vw" decorative />
        <div className="world-banner-shade" />
        <div className="world-banner-body">
          <p className="eyebrow">Mundo {world.number}</p>
          <h2 id={`${world.id}-t`}>{world.title}</h2>
          <p className="small">{world.subtitle}</p>
        </div>
      </header>

      <div className="map-board">
        <ArtImage art={world.art} className="map-texture" sizes="(min-width: 900px) 900px, 100vw" decorative />
        <div className="map-canvas">
          <svg className="map-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              <radialGradient id={`${world.id}-glow`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffe7a3" stopOpacity=".55" />
                <stop offset="100%" stopColor="#ffe7a3" stopOpacity="0" />
              </radialGradient>
            </defs>
            {decor.map((dc, i) => (
              <Decor key={i} kind={dc.kind} x={dc.x} y={dc.y} s={dc.s} theme={world.theme} />
            ))}
            <path d={d} className="map-path-edge" />
            <path d={d} className="map-path" />
            <path d={d} className="map-path-dash" />
            {avatarPoint && <circle cx={avatarPoint.x} cy={avatarPoint.y} r="70" fill={`url(#${world.id}-glow)`} className="map-light" />}
          </svg>

          {section.nodes.map((n) => {
            const p = pos.get(n.id)!
            const style = { left: pct(p.x, W), top: pct(p.y, H) }
            const labelSide = p.x > W / 2 ? 'left' : 'right'
            if (n.kind === 'chest') {
              const st = chestState(n, progress)
              return (
                <div key={n.id} data-node={n.id} className={`map-node map-chest is-${st}`} style={style}>
                  <button
                    type="button"
                    className="chest-btn"
                    aria-label={st === 'aberto' ? 'Baú já aberto' : st === 'disponivel' ? `Abrir baú de recompensa (+${n.xp} XP)` : 'Baú bloqueado: conclua as fases anteriores'}
                    onClick={() => (st === 'disponivel' ? onChest(n.id) : onLocked(st === 'aberto' ? 'Você já abriu este baú.' : 'Conclua as fases anteriores para abrir este baú.'))}
                  >
                    <ChestIcon open={st === 'aberto'} size={n.final ? 54 : 44} />
                  </button>
                  {st === 'disponivel' && <span className={`node-label label-${labelSide} small`}>Baú disponível!</span>}
                </div>
              )
            }
            const st = phaseState(n.id, progress)
            const ep = progress.experiences[n.id]
            const idx = section.phases.findIndex((x) => x.id === n.id)
            const cls = `map-node map-phase is-${st} ${justUnlocked === n.id ? 'just-unlocked' : ''}`
            const inner = (
              <>
                <span className="node-number">{st === 'bloqueada' ? <Icon name="lock" size={18} /> : n.number}</span>
                {st === 'concluida' && (
                  <span className="node-stars" aria-hidden="true">
                    {[0, 1, 2].map((i) => <Icon key={i} name="star" size={14} className={i < (ep?.bestStars ?? 0) ? 'star-on' : 'star-off'} />)}
                  </span>
                )}
              </>
            )
            const label = `Fase ${n.number}: ${n.experience.title}. ${st === 'concluida' ? `Concluída, ${ep?.bestStars ?? 0} de 3 estrelas` : st === 'atual' ? 'Fase atual' : 'Bloqueada'}`
            return (
              <div key={n.id} data-node={n.id} className={cls} style={style}>
                {st === 'bloqueada' ? (
                  <button type="button" className="node-btn" aria-label={label} onClick={() => onLocked(idx > 0 ? `Conclua a fase ${prevPhase(idx).number} (${prevPhase(idx).experience.title}) para liberar esta.` : 'Conclua a fase anterior para liberar esta.')}>
                    {inner}
                  </button>
                ) : (
                  <Link to={`/historia/${n.experience.bookId}/${n.id}`} className="node-btn" aria-label={label}>
                    {inner}
                  </Link>
                )}
                <span className={`node-label label-${labelSide}`}>{n.experience.title}</span>
              </div>
            )
          })}

          {avatarPoint && (
            <div className={`map-avatar ${walking ? 'is-walking' : ''}`} style={{ left: pct(avatarPoint.x, W), top: pct(avatarPoint.y, H) }} aria-hidden="true">
              <PlayerCharacter size={58} pose={walking ? 'walk' : 'idle'} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
