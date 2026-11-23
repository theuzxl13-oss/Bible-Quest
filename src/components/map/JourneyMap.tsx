import type { Progress } from '../../types'
import type { PhaseNode, WorldSection } from '../../services/game/journeyMap'
import { chestState, phaseState } from '../../services/game/journeyMap'
import { CENARIO_MUNDO, cenarioGenerico, zonasPorNo } from '../../data/mapas/cenarios'
import { PlayerCharacter } from '../character/PlayerCharacter'
import { ChestIcon } from './Scenery'
import { CAMINHO_TERRA, CenaMapa, caminhoSuave, type Ponto } from './aventura/Cena'
import { Medalhao } from './aventura/Interface'

/*
 * Um trecho do mapa do Modo História (um mundo), no estilo de aventura: o
 * caminho sobe da fase 1 (embaixo) para as seguintes, por regiões ilustradas
 * com os acontecimentos. Fases e baús são botões de verdade sobre o desenho.
 */

export const MAP_W = 400
const PASSO = 104
const BASE = 120
const TOPO = 120

export function layoutSection(section: WorldSection, primeiro: boolean) {
  const topo = primeiro ? TOPO + 70 : TOPO
  const H = BASE + topo + (section.nodes.length - 1) * PASSO
  const points: Ponto[] = section.nodes.map((n, i) => ({
    id: n.id,
    x: MAP_W / 2 + Math.sin(i * 0.95 + 0.5) * 108,
    y: H - BASE - i * PASSO,
  }))
  return { W: MAP_W, H, points, d: caminhoSuave(points, H + 10, -10) }
}

interface Props {
  section: WorldSection
  progress: Progress
  /** Trecho mais alto do mapa (mostra céu e montanhas). */
  topoDoMapa: boolean
  avatarAt: string | null
  walking: boolean
  justUnlocked: string | null
  onFase: (node: PhaseNode) => void
  onLocked: (message: string) => void
  onChest: (chestId: string) => void
}

const pct = (v: number, total: number) => `${(v / total) * 100}%`

export function JourneyMap({ section, progress, topoDoMapa, avatarAt, walking, justUnlocked, onFase, onLocked, onChest }: Props) {
  const { world } = section
  const { W, H, points, d } = layoutSection(section, topoDoMapa)
  const pos = new Map(points.map((p) => [p.id, p]))
  const avatarPoint = avatarAt ? pos.get(avatarAt) : undefined
  let ultimaFase = 0
  const fasesDosNos = section.nodes.map((n) => (n.kind === 'phase' ? (ultimaFase = section.phases.indexOf(n) + 1) : ultimaFase))
  const zonas = zonasPorNo(CENARIO_MUNDO[world.id] ?? cenarioGenerico(section.phases.length), fasesDosNos)

  return (
    <section className="av-trecho" id={world.id} data-mundo={world.id} aria-labelledby={`${world.id}-t`}>
      <h2 id={`${world.id}-t`} className="sr-only">Mundo {world.number}: {world.title}</h2>
      <div className="av-canvas" style={{ aspectRatio: `${W} / ${H}` }}>
        <CenaMapa W={W} H={H} pts={points} d={d} zonas={zonas} passo={PASSO} caminho={CAMINHO_TERRA} semente={world.id} horizonte={topoDoMapa ? { ceu: ['#7cc0ee', '#e8f4fb'], montanhas: '#8fa3c8' } : undefined} />

        {section.nodes.map((n) => {
          const p = pos.get(n.id)!
          const style = { left: pct(p.x, W), top: pct(p.y, H) }
          if (n.kind === 'chest') {
            const st = chestState(n, progress)
            return (
              <div key={n.id} data-node={n.id} className={`av-no av-bau is-${st}`} style={style}>
                <button
                  type="button"
                  className="chest-btn"
                  aria-label={st === 'aberto' ? 'Baú já aberto' : st === 'disponivel' ? `Abrir baú de recompensa (+${n.xp} XP)` : 'Baú bloqueado: conclua as fases anteriores'}
                  onClick={() => (st === 'disponivel' ? onChest(n.id) : onLocked(st === 'aberto' ? 'Você já abriu este baú.' : 'Conclua as fases anteriores para abrir este baú.'))}
                >
                  <ChestIcon open={st === 'aberto'} size={n.final ? 62 : 52} />
                </button>
              </div>
            )
          }
          const st = phaseState(n.id, progress)
          const ep = progress.experiences[n.id]
          const label = `Fase ${n.number}: ${n.experience.title}. ${st === 'concluida' ? `Concluída, ${ep?.bestStars ?? 0} de 3 estrelas` : st === 'atual' ? 'Fase atual' : 'Bloqueada'}`
          return (
            <div key={n.id} data-node={n.id} className={`av-no is-${st} ${justUnlocked === n.id ? 'just-unlocked' : ''}`} style={style}>
              <button type="button" className="av-medalhao" aria-label={label} onClick={() => onFase(n)}>
                <Medalhao numero={n.number} estado={st} estrelas={ep?.bestStars ?? 0} />
              </button>
            </div>
          )
        })}

        {avatarPoint && (
          <div className={`av-avatar ${avatarPoint.x > W / 2 ? 'lado-esq' : 'lado-dir'} ${walking ? 'is-walking' : ''}`} style={{ left: pct(avatarPoint.x, W), top: pct(avatarPoint.y, H) }} aria-hidden="true">
            <PlayerCharacter size={78} pose={walking ? 'walk' : 'idle'} />
          </div>
        )}
      </div>
    </section>
  )
}
