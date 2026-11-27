export type { EstadoMarco } from '../../../services/game/marcos'
import { Icon } from '../../Icon'
import { GameIcon } from '../../GameIcon'
import type { IconName } from '../../Icon'

/*
 * MARCO DE FASE: ESTANDARTE (reformulação visual, entrega 2: mapa)
 * Um estandarte de pano num mastro de madeira, fincado num marco de pedra no caminho.
 * Quatro estados, legíveis pela forma e não só pela cor:
 * - concluída: pano dourado, número em marfim e selo de conferido;
 * - atual: pano cor de fogueira, maior, com brilho pulsante (onde o personagem está);
 * - disponível: pano azul (História) ou verde (Quiz), número em marfim;
 * - bloqueada: pano de pedra, cadeado no lugar do número.
 * Embaixo, a plaquinha com as três estrelas mostra o melhor resultado real.
 */

import type { EstadoMarco } from '../../../services/game/marcos'

const ESTRELA = 'M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.5l1.3-6.6L2.5 9.3l6.6-.8z'

export function Estandarte({ numero, estado, estrelas, icone }: { numero: number; estado: EstadoMarco; estrelas: number; icone?: IconName }) {
  return (
    <span className={`tr-estandarte is-${estado}`} aria-hidden="true">
      {estado === 'atual' && <span className="tr-brilho" />}
      <svg className="tr-mastro" viewBox="0 0 64 104" width="64" height="104">
        {/* marco de pedra e sombra no chão */}
        <ellipse cx="32" cy="98" rx="20" ry="5" fill="rgba(43,29,16,.35)" />
        <path d="M16 96 q16 -9 32 0 q-16 6 -32 0z" className="tr-pedra" />
        {/* mastro e travessa */}
        <rect x="30" y="6" width="4" height="90" rx="2" className="tr-madeira" />
        <rect x="12" y="10" width="40" height="4" rx="2" className="tr-madeira" />
        <circle cx="32" cy="6" r="4" className="tr-ponta" />
        {/* pano com rabo de andorinha e barra */}
        <path d="M14 14 H50 V56 L32 66 L14 56 Z" className="tr-pano" />
        <path d="M14 14 H50 V20 H14 Z" className="tr-barra" />
        <path d="M16 52 L32 61 L48 52" className="tr-costura" fill="none" />
        <path d="M14 14 H50 V56 L32 66 L14 56 Z" className="tr-contorno" fill="none" />
      </svg>
      <span className="tr-num">{estado === 'bloqueada' ? <Icon name="lock" size={20} /> : numero}</span>
      {estado === 'concluida' && <span className="tr-selo"><Icon name="check" size={14} /></span>}
      {icone && estado !== 'bloqueada' && <span className="tr-tipo"><GameIcon name={icone} size={18} /></span>}
      <span className="tr-estrelas">
        {[0, 1, 2].map((i) => (
          <svg key={i} viewBox="0 0 24 24" className={i < estrelas ? 'on' : 'off'}><path d={ESTRELA} /></svg>
        ))}
      </span>
    </span>
  )
}
