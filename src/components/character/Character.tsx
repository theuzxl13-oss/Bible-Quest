import type { CharacterAppearance } from '../../types'
import { HAIR_COLORS, SKIN_TONES } from '../../data/character/bases'
import { getItem, type AccessoryItem, type BeltItem, type FootwearItem, type MantleItem, type TunicItem } from '../../data/character/items'

/*
 * RENDERIZADOR ÚNICO DO PERSONAGEM (composição por camadas)
 * Camadas, de trás para a frente: sombra → manto (costas) → cabelo (costas)
 * → pernas e calçado → túnica → cinto → manto (frente) → braços → acessório
 * de cintura → cabeça e rosto → cabelo → acessório de cabeça → colar →
 * acessório de mão. Trocar um item muda só a sua camada.
 */

export type CharacterPose = 'idle' | 'walk' | 'celebrate' | 'react' | 'still'

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + amount * 255)))
  return `#${((ch((n >> 16) & 255) << 16) | (ch((n >> 8) & 255) << 8) | ch(n & 255)).toString(16).padStart(6, '0')}`
}

export interface CharacterProps {
  appearance: CharacterAppearance
  size?: number
  pose?: CharacterPose
  /** Só cabeça e ombros (retrato). */
  portrait?: boolean
  className?: string
  title?: string
}

export function Character({ appearance: a, size = 120, pose = 'idle', portrait, className, title }: CharacterProps) {
  const skin = SKIN_TONES[a.skin] ?? SKIN_TONES[1]
  const skinDark = shade(skin, -0.12)
  const hair = HAIR_COLORS[a.hairColor] ?? HAIR_COLORS[1]
  const tunic = (getItem(a.equipped.tunica) as TunicItem | undefined) ?? { color: '#e6d6b4' } as TunicItem
  const mantle = getItem(a.equipped.manto) as MantleItem | undefined
  const foot = (getItem(a.equipped.calcado) as FootwearItem | undefined) ?? ({ color: '#5b3b22', style: 'simples' } as FootwearItem)
  const belt = getItem(a.equipped.cinto) as BeltItem | undefined
  const acc = a.equipped.acessorios.map((id) => getItem(id)).filter(Boolean) as AccessoryItem[]
  const hand = acc.find((x) => x.place === 'mao')
  const waist = acc.find((x) => x.place === 'cintura')
  const head = acc.find((x) => x.place === 'cabeca')
  const neck = acc.find((x) => x.place === 'pescoco')

  const cloth = tunic.color
  const clothDark = shade(cloth, -0.16)
  const hem = tunic.short ? 128 : 140
  const mDark = mantle ? shade(mantle.color, -0.14) : ''
  const hood = mantle?.style === 'capuz'
  const viewBox = portrait ? '22 12 76 76' : '0 0 120 160'
  const height = portrait ? size : (size * 160) / 120

  return (
    <svg
      className={`character pose-${pose} ${portrait ? 'is-portrait' : ''} ${className ?? ''}`}
      width={size}
      height={height}
      viewBox={viewBox}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-appearance={`${a.base}|${a.skin}|${a.face}|${a.hairStyle}|${a.hairColor}|${a.equipped.tunica}|${a.equipped.manto ?? '-'}|${a.equipped.calcado}|${a.equipped.cinto ?? '-'}|${a.equipped.acessorios.join(',')}`}
    >
      {!portrait && <ellipse cx="60" cy="152" rx="30" ry="5" fill="rgba(0,0,0,.28)" />}
      <g className="ch-body">
        {/* manto: costas */}
        {mantle && (mantle.style === 'manto' || mantle.style === 'longo' || hood) && (
          <path d={`M36 70 Q60 60 84 70 L${mantle.style === 'longo' ? 92 : 88} ${mantle.style === 'longo' ? 142 : 128} L${mantle.style === 'longo' ? 28 : 32} ${mantle.style === 'longo' ? 142 : 128} Z`} fill={mDark} />
        )}
        {hood && <path d="M34 54 Q60 14 86 54 L90 84 L30 84 Z" fill={mDark} />}
        {/* cabelo: costas */}
        {!hood && (a.hairStyle === 'longo' || a.hairStyle === 'ondulado') && (
          <path d={a.hairStyle === 'ondulado' ? 'M37 44 Q60 20 83 44 Q88 64 84 76 Q88 84 82 90 Q60 98 38 90 Q32 84 36 76 Q32 64 37 44 Z' : 'M38 44 Q60 20 82 44 L86 88 Q60 96 34 88 Z'} fill={hair} />
        )}
        {!hood && a.hairStyle === 'tranca' && (
          <g fill={hair}>
            <circle cx="78" cy="70" r="5" />
            <circle cx="80" cy="79" r="4.5" />
            <circle cx="81" cy="87" r="4" />
            <rect x="77" y="90" width="8" height="5" rx="2" fill={shade(hair, 0.25)} />
          </g>
        )}

        {/* pernas e calçado */}
        <g className="ch-legs">
          {[{ x: 47, cls: 'ch-leg-l' }, { x: 64, cls: 'ch-leg-r' }].map(({ x, cls }) => (
            <g key={cls} className={cls}>
              <rect x={x} y={hem - 8} width="9" height={152 - hem} rx="3" fill={skinDark} />
              {foot.style === 'botas' ? (
                <rect x={x - 2} y="136" width="13" height="16" rx="3" fill={foot.color} />
              ) : (
                <>
                  <rect x={x - 3} y="146" width="14" height="5" rx="2.5" fill={foot.color} />
                  <path d={`M${x} 147 L${x + 4.5} 142 L${x + 9} 147`} stroke={foot.color} strokeWidth="2" fill="none" />
                  {foot.style === 'tiras' && <path d={`M${x} 140 L${x + 9} 144 M${x + 9} 138 L${x} 142`} stroke={foot.color} strokeWidth="1.8" />}
                </>
              )}
            </g>
          ))}
        </g>

        {/* túnica */}
        <path className="ch-tunic" d={`M42 72 Q60 64 78 72 L90 ${hem} Q60 ${hem + 6} 30 ${hem} Z`} fill={cloth} />
        {tunic.stripes && (
          <g stroke={tunic.stripes} strokeWidth="2.2" opacity=".8">
            <path d={`M50 74 L45 ${hem + 1}`} />
            <path d={`M70 74 L75 ${hem + 1}`} />
          </g>
        )}
        <path d={`M60 70 L60 ${hem + 2}`} stroke={clothDark} strokeWidth="1.2" opacity=".45" />
        {tunic.trim && <path d={`M31 ${hem - 4} Q60 ${hem + 2} 89 ${hem - 4}`} stroke={tunic.trim} strokeWidth="3.5" fill="none" />}
        {tunic.trim && <path d="M48 72 Q60 80 72 72" stroke={tunic.trim} strokeWidth="2.5" fill="none" />}

        {/* cinto */}
        {belt && belt.style === 'faixa' && <rect x="39" y="95" width="42" height="9" rx="3" fill={belt.color} />}
        {belt && belt.style === 'couro' && (
          <g>
            <rect x="40" y="97" width="40" height="5" rx="2.5" fill={belt.color} />
            {belt.buckle ? <rect x="56" y="95.5" width="8" height="8" rx="1.5" fill={belt.buckle} stroke={shade(belt.buckle, -0.3)} /> : <path d="M60 101 L57 110 M60 101 L63 109" stroke={belt.color} strokeWidth="2.2" strokeLinecap="round" />}
          </g>
        )}
        {belt && belt.style === 'corda' && (
          <g>
            <path d="M40 99 Q60 103 80 99" stroke={belt.color} strokeWidth="3" fill="none" strokeDasharray="3 1.5" />
            <path d="M62 101 L60 112 M62 101 L65 111" stroke={belt.color} strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* manto: frente */}
        {mantle && (mantle.style === 'manto' || hood) && (
          <>
            <path d="M40 74 Q36 104 34 126 L46 124 Q48 98 52 78 Z" fill={mantle.color} />
            <path d="M80 74 Q84 104 86 126 L74 124 Q72 98 68 78 Z" fill={mantle.color} />
          </>
        )}
        {mantle?.style === 'longo' && (
          <>
            <path d="M40 72 Q34 110 30 142 L46 140 Q48 100 53 76 Z" fill={mantle.color} />
            <path d="M80 72 Q86 110 90 142 L74 140 Q72 100 67 76 Z" fill={mantle.color} />
            {mantle.trim && <path d="M46 140 Q48 100 53 76 M74 140 Q72 100 67 76" stroke={mantle.trim} strokeWidth="2.5" fill="none" />}
          </>
        )}
        {mantle?.style === 'xale' && (
          <g>
            <path d="M38 72 Q60 92 82 72 L86 86 Q60 108 34 86 Z" fill={mantle.color} />
            {mantle.stripes && <path d="M36 82 Q60 101 84 82" stroke={mantle.stripes} strokeWidth="2.5" fill="none" />}
          </g>
        )}

        {/* braços */}
        <g className="ch-arm-l">
          <rect x="31" y="76" width="11" height="34" rx="5.5" fill={mantle && mantle.style !== 'xale' ? mantle.color : clothDark} transform="rotate(8 36 78)" />
          <circle cx="33" cy="111" r="5.2" fill={skin} />
        </g>
        <g className="ch-arm-r">
          <rect x="78" y="76" width="11" height="34" rx="5.5" fill={mantle && mantle.style !== 'xale' ? mantle.color : clothDark} transform="rotate(-8 84 78)" />
          <circle cx="87" cy="111" r="5.2" fill={skin} />
        </g>

        {/* acessório de cintura */}
        {waist?.kind === 'bolsa' && (
          <g>
            <path d="M44 74 Q66 90 80 104" stroke="#5b3b22" strokeWidth="3" fill="none" />
            <rect x="74" y="102" width="16" height="14" rx="3" fill="#7a5230" />
            <rect x="74" y="102" width="16" height="5" rx="2" fill="#5b3b22" />
          </g>
        )}
        {waist?.kind === 'odre' && (
          <g>
            <path d="M76 74 Q56 90 40 104" stroke="#6b4a2b" strokeWidth="3" fill="none" />
            <path d="M30 104 Q28 120 38 124 Q48 122 46 106 Q40 100 30 104 Z" fill="#8b5e34" />
            <rect x="35" y="99" width="6" height="6" rx="2" fill="#5b3b22" />
          </g>
        )}

        {/* pescoço, cabeça e rosto */}
        <rect x="55" y="62" width="10" height="10" rx="3" fill={skinDark} />
        <circle cx="60" cy="48" r="19" fill={skin} />
        <circle cx="41.5" cy="50" r="3.5" fill={skinDark} />
        <circle cx="78.5" cy="50" r="3.5" fill={skinDark} />
        <circle cx="53" cy="50" r="2.3" fill="#2a1a10" />
        <circle cx="67" cy="50" r="2.3" fill="#2a1a10" />
        <circle cx="53.8" cy="49.2" r=".7" fill="#fff" opacity=".8" />
        <circle cx="67.8" cy="49.2" r=".7" fill="#fff" opacity=".8" />
        <path d="M49 44 Q53 42 56 44 M64 44 Q67 42 71 44" stroke={shade(hair, 0.05)} strokeWidth={a.face === 'marcante' ? 2.4 : 1.4} fill="none" strokeLinecap="round" />
        {a.face === 'sardas' && <g fill={shade(skin, -0.25)} opacity=".7">{[[50, 55], [53, 57], [47, 57], [70, 55], [67, 57], [73, 57]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r=".9" />)}</g>}
        {a.face !== 'barba' && (
          <>
            <circle cx="49" cy="56" r="3" fill="#e07a6a" opacity=".22" />
            <circle cx="71" cy="56" r="3" fill="#e07a6a" opacity=".22" />
          </>
        )}
        {a.face === 'barba' ? (
          <>
            <path d="M43 52 Q44 68 60 70 Q76 68 77 52 Q72 62 60 62 Q48 62 43 52 Z" fill={hair} />
            <path d="M55 60 Q60 63 65 60" stroke="#6b3a2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <path className="ch-mouth" d="M55 57 Q60 61 65 57" stroke="#6b3a2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        )}

        {/* cabelo: frente */}
        {!hood && a.hairStyle === 'curto' && <path d="M41 46 Q42 26 60 27 Q79 26 79 46 Q72 36 60 37 Q48 36 41 46 Z" fill={hair} />}
        {!hood && (a.hairStyle === 'longo' || a.hairStyle === 'ondulado') && <path d="M40 50 Q40 26 60 27 Q80 26 80 50 Q74 36 60 36 Q46 36 40 50 Z" fill={hair} />}
        {!hood && a.hairStyle === 'cacheado' && (
          <g fill={hair}>{[[44, 40], [50, 32], [59, 29], [68, 31], [75, 38], [79, 46], [41, 47]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" />)}</g>
        )}
        {!hood && a.hairStyle === 'coque' && (
          <g fill={hair}>
            <path d="M41 46 Q42 27 60 28 Q78 27 79 46 Q71 37 60 38 Q49 37 41 46 Z" />
            <circle cx="60" cy="25" r="8" />
          </g>
        )}
        {!hood && a.hairStyle === 'tranca' && <path d="M41 47 Q42 27 60 28 Q78 27 79 47 Q74 37 62 37 Q50 38 41 47 Z" fill={hair} />}
        {!hood && a.hairStyle === 'raspado' && <path d="M43 40 Q48 30 60 30 Q72 30 77 40" stroke={hair} strokeWidth="3" fill="none" opacity=".55" />}
        {hood && <path d="M38 52 Q38 22 60 22 Q82 22 82 52 Q76 30 60 30 Q44 30 38 52 Z" fill={mantle!.color} />}

        {/* acessório de cabeça */}
        {head?.kind === 'lenco' && !hood && (
          <g>
            <path d="M39 44 Q40 24 60 24 Q80 24 81 44 Q72 34 60 34 Q48 34 39 44 Z" fill={head.color ?? '#d9c7a0'} />
            <path d="M40 40 Q60 30 80 40" stroke={shade(head.color ?? '#d9c7a0', -0.2)} strokeWidth="2" fill="none" />
            <path d="M80 42 Q86 56 82 66" stroke={head.color ?? '#d9c7a0'} strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
        )}
        {head?.kind === 'louros' && (
          <g fill="#6f8f4e">
            {[-1, 1].map((side) => [0, 1, 2, 3].map((i) => <ellipse key={`${side}${i}`} cx={60 + side * (8 + i * 5)} cy={30 + i * 3.5} rx="4" ry="2" transform={`rotate(${side * (20 + i * 12)} ${60 + side * (8 + i * 5)} ${30 + i * 3.5})`} />))}
          </g>
        )}
        {neck?.kind === 'colar' && (
          <g>
            <path d="M50 70 Q60 80 70 70" stroke="#6b4a2b" strokeWidth="1" fill="none" />
            {[52, 56, 60, 64, 68].map((x, i) => <circle key={x} cx={x} cy={i === 2 ? 76.5 : i % 4 === 0 ? 72 : 74.5} r="2" fill={i % 2 ? '#3e7c8c' : '#b9772f'} />)}
          </g>
        )}

        {/* acessório de mão */}
        <g className="ch-hand-item">
          {hand?.kind === 'cajado' && (
            <g>
              <path d="M92 150 L92 52 Q92 40 100 40 Q106 40 106 48" stroke="#6b4423" strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="87" cy="111" r="5.2" fill={skin} />
            </g>
          )}
          {hand?.kind === 'pergaminho' && (
            <g>
              <rect x="81" y="100" width="7" height="22" rx="3" fill="#efe3c4" transform="rotate(-20 84 111)" />
              <rect x="80" y="98" width="9" height="4" rx="2" fill="#b38a3e" transform="rotate(-20 84 111)" />
              <circle cx="87" cy="111" r="5.2" fill={skin} />
            </g>
          )}
          {hand?.kind === 'lamparina' && (
            <g>
              <path d="M80 118 Q87 124 98 116 L96 114 Q88 118 82 114 Z" fill="#b38a3e" />
              <path className="ch-flame" d="M97 113 Q95 107 98 103 Q101 108 99 113 Z" fill="#ffcf6b" />
              <circle cx="87" cy="111" r="5.2" fill={skin} />
            </g>
          )}
          {hand?.kind === 'cesto' && (
            <g>
              <path d="M80 116 L98 116 L95 130 L83 130 Z" fill="#b38a3e" />
              <path d="M81 120 H97 M82 125 H96" stroke="#7a5230" strokeWidth="1.2" />
              <path d="M83 116 Q89 104 95 116" stroke="#7a5230" strokeWidth="2" fill="none" />
              <circle cx="87" cy="111" r="5.2" fill={skin} />
            </g>
          )}
        </g>
      </g>
    </svg>
  )
}
