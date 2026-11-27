import type { ReactNode } from 'react'
import type { IconName } from '../../Icon'
import { PlayerCharacter } from '../../character/PlayerCharacter'
import { ChestIcon } from '../Scenery'
import { Estandarte } from './Estandarte'
import { PinturaRegiao } from './PinturaRegiao'
import type { EstadoMarco } from '../../../services/game/marcos'
import type { ArteRegiao } from '../../../data/mapas/artes'

/*
 * MOTOR COMPARTILHADO DA TRILHA (Modo História e Modo Quiz)
 * Uma região do mapa é um quadro com proporção fixa. O fundo é um cenário pintado
 * (imagem pré-renderizada, com os pontos do caminho vindos da própria cena) ou, onde ainda
 * não há pintura, o cenário vetorial antigo. Por cima ficam os marcos, que são botões HTML
 * de verdade: a arte nunca cobre um marco e nunca recebe toque (pointer-events: none).
 * Os dois modos usam as mesmas peças; muda só a identidade visual (classe do mapa) e o conteúdo.
 * A pintura é carregada sob demanda (PinturaRegiao + pinturas.ts): miniatura sempre embaixo,
 * pintura definitiva só perto da tela, no máximo três ao mesmo tempo.
 */

export interface MarcoFase {
  tipo: 'fase'
  id: string
  numero: number
  estado: EstadoMarco
  estrelas: number
  rotulo: string
  icone?: IconName
  destaque?: boolean
  onClick: () => void
}

export interface MarcoBau {
  tipo: 'bau'
  id: string
  estado: 'aberto' | 'disponivel' | 'fechado'
  final: boolean
  rotulo: string
  onClick: () => void
}

export type Marco = MarcoFase | MarcoBau

export interface PontoMarco { id: string; x: number; y: number }

interface Props {
  W: number
  H: number
  /** Atributo de dados dos marcos (data-node na História, data-qnode no Quiz). */
  atributo: 'data-node' | 'data-qnode'
  marcos: Marco[]
  pontos: PontoMarco[]
  /** Cenário pintado (com versão leve) ou o cenário vetorial de reserva. */
  arte?: { regiao: ArteRegiao; leve: boolean }
  fundo?: ReactNode
  avatar?: { id: string; andando?: boolean } | null
  classe?: string
  children?: ReactNode
}

const pct = (v: number, t: number) => `${(v / t) * 100}%`

export function RegiaoTrilha({ W, H, atributo, marcos, pontos, arte, fundo, avatar, classe = '', children }: Props) {
  const pos = new Map(pontos.map((p) => [p.id, p]))
  const pAv = avatar ? pos.get(avatar.id) : undefined
  return (
    <div className={`av-canvas tr-regiao ${arte ? 'tr-pintada' : 'tr-vetorial'} ${classe}`} style={{ aspectRatio: `${W} / ${H}` }}>
      {arte ? (
        <PinturaRegiao regiao={arte.regiao} leve={arte.leve} />
      ) : (
        fundo
      )}
      {children}
      {marcos.map((m) => {
        const p = pos.get(m.id)
        if (!p) return null
        const attr = { [atributo]: m.id }
        const style = { left: pct(p.x, W), top: pct(p.y, H) }
        if (m.tipo === 'bau') {
          return (
            <div key={m.id} {...attr} className={`av-no av-bau tr-bau is-${m.estado}`} style={style}>
              <span className="tr-clareira" aria-hidden="true" />
              <button type="button" className="chest-btn" aria-label={m.rotulo} onClick={m.onClick}>
                <ChestIcon open={m.estado === 'aberto'} size={m.final ? 62 : 54} />
              </button>
            </div>
          )
        }
        return (
          <div key={m.id} {...attr} className={`av-no tr-no is-${m.estado} ${m.destaque ? 'just-unlocked' : ''}`} style={style}>
            <button type="button" className="av-medalhao tr-botao" aria-label={m.rotulo} onClick={m.onClick}>
              <Estandarte numero={m.numero} estado={m.estado} estrelas={m.estrelas} icone={m.icone} />
            </button>
          </div>
        )
      })}
      {pAv && (
        <div className={`av-avatar tr-avatar ${pAv.x > W / 2 ? 'lado-esq' : 'lado-dir'} ${avatar?.andando ? 'is-walking' : ''}`} style={{ left: pct(pAv.x, W), top: pct(pAv.y, H) }} aria-hidden="true">
          <PlayerCharacter size={78} pose={avatar?.andando ? 'walk' : 'idle'} />
        </div>
      )}
    </div>
  )
}
