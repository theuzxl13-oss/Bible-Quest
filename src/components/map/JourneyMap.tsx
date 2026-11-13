import { Link } from 'react-router-dom'
import type { Progress } from '../../types'
import type { WorldSection } from '../../services/game/journeyMap'
import { chestState, phaseState } from '../../services/game/journeyMap'
import { estiloTrecho } from '../../data/paletasMapa'
import { PlayerCharacter } from '../character/PlayerCharacter'
import { Icon } from '../Icon'
import { ChestIcon } from './Scenery'
import { CenarioPrado, caminhoSuave, type Ponto } from './Prado'

/*
 * Um trecho do caminho (um mundo), no estilo de trilha de fases: campo
 * colorido, caminho listrado e botões redondos numerados. Sem textos extras:
 * o título de cada fase fica só no nome acessível do botão.
 */

export const MAP_W = 400
const STEP = 108
const TOPO = 150
const BASE = 110

export function layoutSection(section: WorldSection) {
  const points: Ponto[] = section.nodes.map((n, i) => ({
    id: n.id,
    x: MAP_W / 2 + Math.sin(i * 0.92 + 0.6) * 112,
    y: TOPO + i * STEP,
  }))
  const H = TOPO + BASE + (points.length - 1) * STEP
  return { W: MAP_W, H, points, d: caminhoSuave(points, H, 96) }
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
  const { W, H, points, d } = layoutSection(section)
  const estilo = estiloTrecho(world.id)
  const pos = new Map(points.map((p) => [p.id, p]))
  const avatarPoint = avatarAt ? pos.get(avatarAt) : undefined
  const prevPhase = (i: number) => section.phases[i - 1]

  return (
    <section className="saga-trecho" id={world.id} aria-labelledby={`${world.id}-t`} style={{ ['--ceu' as string]: estilo.paleta.ceu, ['--campo' as string]: estilo.paleta.campo, ['--campo-fundo' as string]: estilo.paleta.campoFundo }}>
      <div className="saga-canvas" style={{ aspectRatio: `${W} / ${H}` }}>
        <CenarioPrado W={W} H={H} pts={points} d={d} paleta={estilo.paleta} enfeites={estilo.enfeites} semente={world.id} />

        <h2 id={`${world.id}-t`} className="prado-fita" style={{ ['--fita' as string]: estilo.fita }}>
          <span>{world.title}</span>
        </h2>

        {section.nodes.map((n) => {
          const p = pos.get(n.id)!
          const style = { left: pct(p.x, W), top: pct(p.y, H) }
          if (n.kind === 'chest') {
            const st = chestState(n, progress)
            return (
              <div key={n.id} data-node={n.id} className={`saga-no saga-bau is-${st}`} style={style}>
                <button
                  type="button"
                  className="chest-btn"
                  aria-label={st === 'aberto' ? 'Baú já aberto' : st === 'disponivel' ? `Abrir baú de recompensa (+${n.xp} XP)` : 'Baú bloqueado: conclua as fases anteriores'}
                  onClick={() => (st === 'disponivel' ? onChest(n.id) : onLocked(st === 'aberto' ? 'Você já abriu este baú.' : 'Conclua as fases anteriores para abrir este baú.'))}
                >
                  <ChestIcon open={st === 'aberto'} size={n.final ? 58 : 48} />
                </button>
              </div>
            )
          }
          const st = phaseState(n.id, progress)
          const ep = progress.experiences[n.id]
          const idx = section.phases.findIndex((x) => x.id === n.id)
          const cls = `saga-no is-${st} cor-${n.number % 4} ${justUnlocked === n.id ? 'just-unlocked' : ''}`
          const inner = (
            <>
              <span className="saga-num">{st === 'bloqueada' ? <Icon name="lock" size={20} /> : n.number}</span>
              {st === 'concluida' && <Estrelas n={ep?.bestStars ?? 0} />}
            </>
          )
          const label = `Fase ${n.number}: ${n.experience.title}. ${st === 'concluida' ? `Concluída, ${ep?.bestStars ?? 0} de 3 estrelas` : st === 'atual' ? 'Fase atual' : 'Bloqueada'}`
          return (
            <div key={n.id} data-node={n.id} className={cls} style={style}>
              {st === 'bloqueada' ? (
                <button type="button" className="saga-btn" aria-label={label} onClick={() => onLocked(idx > 0 ? `Conclua a fase ${prevPhase(idx).number} para liberar esta.` : 'Conclua a fase anterior para liberar esta.')}>
                  {inner}
                </button>
              ) : (
                <Link to={`/historia/${n.experience.bookId}/${n.id}`} className="saga-btn" aria-label={label}>
                  {inner}
                </Link>
              )}
            </div>
          )
        })}

        {avatarPoint && (
          <div className={`saga-avatar ${avatarPoint.x > W / 2 ? 'lado-esq' : 'lado-dir'} ${walking ? 'is-walking' : ''}`} style={{ left: pct(avatarPoint.x, W), top: pct(avatarPoint.y, H) }} aria-hidden="true">
            <PlayerCharacter size={64} pose={walking ? 'walk' : 'idle'} />
          </div>
        )}
      </div>
    </section>
  )
}

/** Três estrelas pequenas sob o botão da fase. */
export function Estrelas({ n }: { n: number }) {
  return (
    <span className="saga-estrelas" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width="17" height="17" className={i < n ? 'on' : 'off'}>
          <path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.5l1.3-6.6L2.5 9.3l6.6-.8z" />
        </svg>
      ))}
    </span>
  )
}
