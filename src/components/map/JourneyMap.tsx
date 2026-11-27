import type { Progress } from '../../types'
import type { MapNode, PhaseNode, WorldSection } from '../../services/game/journeyMap'
import { chestState, phaseState } from '../../services/game/journeyMap'
import { estadoDoMarco, rotuloDoEstado } from '../../services/game/marcos'
import { CENARIO_MUNDO, cenarioGenerico, zonasPorNo } from '../../data/mapas/cenarios'
import { ARTES_DO_MUNDO } from '../../data/mapas/artes'
import { CAMINHO_TERRA, CenaMapa, caminhoSuave, type Ponto } from './aventura/Cena'
import { RegiaoTrilha, type Marco } from './trilha/Trilha'

/*
 * Um trecho do mapa do Modo História (um mundo), no estilo de aventura: o
 * caminho sobe da fase 1 (embaixo) para as seguintes. Onde há cenário pintado
 * (protótipo: Jardim do Éden, fases 1 a 5 e o primeiro baú), o trecho começa por
 * ele; os nós seguintes usam o cenário vetorial. Fases e baús são botões de verdade
 * sobre o desenho, montados pelo motor compartilhado da trilha (o mesmo do Quiz).
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

/** Divide os nós do trecho entre as regiões pintadas (do começo) e o restante vetorial. */
export function dividirTrecho(section: WorldSection) {
  const artes = ARTES_DO_MUNDO[section.world.id] ?? []
  let i = 0
  const pintadas = artes.map((arte) => {
    const nos = section.nodes.slice(i, i + arte.pontos.length)
    i += nos.length
    return { arte, nos }
  }).filter((r) => r.nos.length > 0)
  return { pintadas, resto: section.nodes.slice(i) }
}

interface Props {
  section: WorldSection
  progress: Progress
  /** Trecho mais alto do mapa (mostra céu e montanhas). */
  topoDoMapa: boolean
  avatarAt: string | null
  /** Fase onde o personagem deve ficar (a próxima da jornada). */
  alvo: string
  walking: boolean
  justUnlocked: string | null
  /** Usa as imagens leves (qualidade leve ou 2D). */
  leve: boolean
  onFase: (node: PhaseNode) => void
  onLocked: (message: string) => void
  onChest: (chestId: string) => void
}

export function JourneyMap({ section, progress, topoDoMapa, avatarAt, alvo, walking, justUnlocked, leve, onFase, onLocked, onChest }: Props) {
  const { world } = section
  const { pintadas, resto } = dividirTrecho(section)

  const marco = (n: MapNode): Marco => {
    if (n.kind === 'chest') {
      const st = chestState(n, progress)
      return {
        tipo: 'bau', id: n.id, estado: st, final: n.final,
        rotulo: st === 'aberto' ? 'Baú já aberto' : st === 'disponivel' ? `Abrir baú de recompensa (+${n.xp} XP)` : 'Baú bloqueado: conclua as fases anteriores',
        onClick: () => (st === 'disponivel' ? onChest(n.id) : onLocked(st === 'aberto' ? 'Você já abriu este baú.' : 'Conclua as fases anteriores para abrir este baú.')),
      }
    }
    const estrelas = progress.experiences[n.id]?.bestStars ?? 0
    const estado = estadoDoMarco(phaseState(n.id, progress), n.id === alvo)
    return {
      tipo: 'fase', id: n.id, numero: n.number, estado, estrelas, destaque: justUnlocked === n.id,
      rotulo: `Fase ${n.number}: ${n.experience.title}. ${rotuloDoEstado(estado, estrelas, 'historia')}`,
      onClick: () => onFase(n),
    }
  }
  const avatarDe = (nos: MapNode[]) => (avatarAt && nos.some((n) => n.id === avatarAt) ? { id: avatarAt, andando: walking } : null)

  // restante do trecho no cenário vetorial (com as zonas do mundo a partir da fase certa)
  let vetorial = null
  if (resto.length) {
    const sub: WorldSection = { ...section, nodes: resto }
    const { W, H, points, d } = layoutSection(sub, topoDoMapa)
    let ultimaFase = 0
    const fasesDosNos = section.nodes.map((n) => (n.kind === 'phase' ? (ultimaFase = section.phases.indexOf(n) + 1) : ultimaFase))
    const zonas = zonasPorNo(CENARIO_MUNDO[world.id] ?? cenarioGenerico(section.phases.length), fasesDosNos.slice(section.nodes.length - resto.length))
    vetorial = (
      <RegiaoTrilha
        W={W}
        H={H}
        atributo="data-node"
        pontos={points}
        marcos={resto.map(marco)}
        avatar={avatarDe(resto)}
        classe={pintadas.length ? 'tr-emenda' : ''}
        fundo={<CenaMapa W={W} H={H} pts={points} d={d} zonas={zonas} passo={PASSO} caminho={CAMINHO_TERRA} semente={world.id} horizonte={topoDoMapa ? { ceu: ['#7cc0ee', '#e8f4fb'], montanhas: '#8fa3c8' } : undefined} />}
      />
    )
  }

  return (
    <section className="av-trecho" id={world.id} data-mundo={world.id} aria-labelledby={`${world.id}-t`}>
      <h2 id={`${world.id}-t`} className="sr-only">Mundo {world.number}: {world.title}</h2>
      {vetorial}
      {[...pintadas].reverse().map(({ arte, nos }) => (
        <RegiaoTrilha
          key={arte.id}
          W={arte.largura}
          H={arte.altura}
          atributo="data-node"
          arte={{ regiao: arte, leve }}
          pontos={nos.map((n, k) => ({ id: n.id, x: arte.pontos[k].x * arte.largura, y: arte.pontos[k].y * arte.altura }))}
          marcos={nos.map(marco)}
          avatar={avatarDe(nos)}
          classe={`tr-regiao-${arte.id}`}
        />
      ))}
    </section>
  )
}
