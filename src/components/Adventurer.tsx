import type { CharacterConfig } from '../types'

/*
 * PERSONAGEM DO JOGADOR
 * Ilustração vetorial em camadas (corpo, roupa, cabelo, acessório).
 * O aventureiro acompanha a jornada; NÃO representa nenhum personagem bíblico.
 */

export const SKIN_TONES = ['#f3d2b3', '#e2b48c', '#c98e62', '#a8693f', '#7d4a2b', '#5a3520']
export const HAIR_COLORS = ['#2b1d14', '#5a3a22', '#8a5a2b', '#c49a5a', '#d9cdb8', '#141414']
export const OUTFIT_COLORS = ['#8b5e34', '#3e5c76', '#7a2e2e', '#4f6b3a', '#b38a3e', '#e8dcc0']

export const ARCHETYPES: { id: CharacterConfig['archetype']; label: string; description: string; preset: Partial<CharacterConfig> }[] = [
  { id: 'viajante', label: 'Viajante', description: 'Caminha leve, com cajado e túnica de viagem.', preset: { outfit: 'viagem', accessory: 'cajado', hair: 'curto', outfitColor: 0 } },
  { id: 'escriba', label: 'Escriba', description: 'Curioso, sempre com um pergaminho à mão.', preset: { outfit: 'escriba', accessory: 'pergaminho', hair: 'raspado', outfitColor: 5 } },
  { id: 'pastora', label: 'Pastora', description: 'Manto quente e cajado para os caminhos do campo.', preset: { outfit: 'manto', accessory: 'cajado', hair: 'tranca', outfitColor: 2 } },
  { id: 'exploradora', label: 'Exploradora', description: 'Bolsa de couro e passos firmes pelo deserto.', preset: { outfit: 'tunica', accessory: 'bolsa', hair: 'coque', outfitColor: 3 } },
]

export const HAIR_OPTIONS: { id: CharacterConfig['hair']; label: string }[] = [
  { id: 'curto', label: 'Curto' },
  { id: 'longo', label: 'Longo' },
  { id: 'cacheado', label: 'Cacheado' },
  { id: 'coque', label: 'Coque' },
  { id: 'tranca', label: 'Trança' },
  { id: 'raspado', label: 'Raspado' },
]

export const OUTFIT_OPTIONS: { id: CharacterConfig['outfit']; label: string }[] = [
  { id: 'tunica', label: 'Túnica com faixa' },
  { id: 'manto', label: 'Manto com capuz' },
  { id: 'viagem', label: 'Roupa de viagem' },
  { id: 'escriba', label: 'Veste de escriba' },
]

export const ACCESSORY_OPTIONS: { id: CharacterConfig['accessory']; label: string }[] = [
  { id: 'cajado', label: 'Cajado' },
  { id: 'bolsa', label: 'Bolsa de couro' },
  { id: 'pergaminho', label: 'Pergaminho' },
  { id: 'lamparina', label: 'Lamparina' },
  { id: 'nenhum', label: 'Nenhum' },
]

export const DEFAULT_CHARACTER: CharacterConfig = {
  name: '',
  archetype: 'viajante',
  skin: 1,
  hair: 'curto',
  hairColor: 1,
  outfit: 'viagem',
  outfitColor: 0,
  accessory: 'cajado',
}

/** Escurece/clareia uma cor hexadecimal. */
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + amount * 255)))
  const r = ch((n >> 16) & 255)
  const g = ch((n >> 8) & 255)
  const b = ch(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

interface Props {
  config: CharacterConfig
  size?: number
  /** Animação de caminhada (no mapa). */
  walking?: boolean
  /** Mostra só a cabeça e os ombros (retrato). */
  portrait?: boolean
  className?: string
  title?: string
}

export function Adventurer({ config, size = 120, walking, portrait, className, title }: Props) {
  const skin = SKIN_TONES[config.skin] ?? SKIN_TONES[1]
  const hair = HAIR_COLORS[config.hairColor] ?? HAIR_COLORS[1]
  const cloth = OUTFIT_COLORS[config.outfitColor] ?? OUTFIT_COLORS[0]
  const clothDark = shade(cloth, -0.16)
  const clothLight = shade(cloth, 0.12)
  const skinDark = shade(skin, -0.12)
  const long = config.outfit !== 'viagem'
  const hem = long ? 140 : 126
  const viewBox = portrait ? '22 14 76 76' : '0 0 120 160'
  const height = portrait ? size : (size * 160) / 120

  return (
    <svg
      className={`adventurer ${walking ? 'is-walking' : ''} ${portrait ? 'is-portrait' : ''} ${className ?? ''}`}
      width={size}
      height={height}
      viewBox={viewBox}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {!portrait && <ellipse cx="60" cy="152" rx="30" ry="5" fill="rgba(0,0,0,.28)" />}

      <g className="adv-body">
        {/* cabelo de trás (longo/trança) e capuz */}
        {config.outfit === 'manto' && <path d="M34 54 Q60 16 86 54 L90 86 L30 86 Z" fill={clothDark} />}
        {config.hair === 'longo' && <path d="M38 44 Q60 20 82 44 L86 88 Q60 96 34 88 Z" fill={hair} />}
        {config.hair === 'tranca' && (
          <g fill={hair}>
            <circle cx="78" cy="70" r="5" />
            <circle cx="80" cy="79" r="4.5" />
            <circle cx="81" cy="87" r="4" />
            <rect x="77" y="90" width="8" height="5" rx="2" fill={shade(cloth, 0.2)} />
          </g>
        )}

        {/* pernas e sandálias */}
        <g className="adv-legs">
          <g className="adv-leg-l">
            <rect x="47" y={hem - 8} width="9" height={152 - hem} rx="3" fill={long ? skinDark : clothDark} />
            <rect x="44" y="146" width="14" height="5" rx="2.5" fill="#4a3220" />
          </g>
          <g className="adv-leg-r">
            <rect x="64" y={hem - 8} width="9" height={152 - hem} rx="3" fill={long ? skinDark : clothDark} />
            <rect x="62" y="146" width="14" height="5" rx="2.5" fill="#4a3220" />
          </g>
        </g>

        {/* corpo / veste */}
        <path d={`M42 72 Q60 64 78 72 L${long ? 90 : 86} ${hem} Q60 ${hem + 6} ${long ? 30 : 34} ${hem} Z`} fill={cloth} />
        <path d={`M60 70 L60 ${hem + 2}`} stroke={clothDark} strokeWidth="1.2" opacity=".45" />
        {config.outfit === 'tunica' && <rect x="40" y="98" width="40" height="7" rx="3" fill={shade(cloth, 0.28)} />}
        {config.outfit === 'viagem' && (
          <>
            <rect x="40" y="96" width="40" height="5" rx="2.5" fill="#5b3b22" />
            <path d="M44 72 L78 112" stroke="#5b3b22" strokeWidth="4" strokeLinecap="round" />
          </>
        )}
        {config.outfit === 'escriba' && (
          <>
            <path d={`M56 72 L64 72 L66 ${hem} L54 ${hem} Z`} fill="#c9a24a" opacity=".85" />
            <path d="M46 72 Q60 82 74 72" fill="none" stroke={clothLight} strokeWidth="3" />
          </>
        )}
        {config.outfit === 'manto' && (
          <>
            <path d={`M40 74 Q36 110 34 ${hem} L46 ${hem - 4} Q48 100 52 78 Z`} fill={clothDark} />
            <path d={`M80 74 Q84 110 86 ${hem} L74 ${hem - 4} Q72 100 68 78 Z`} fill={clothDark} />
          </>
        )}

        {/* braços */}
        <g className="adv-arm-l">
          <rect x="31" y="76" width="11" height="34" rx="5.5" fill={clothDark} transform="rotate(8 36 78)" />
          <circle cx="33" cy="111" r="5.2" fill={skin} />
        </g>
        <g className="adv-arm-r">
          <rect x="78" y="76" width="11" height="34" rx="5.5" fill={clothDark} transform="rotate(-8 84 78)" />
          <circle cx="87" cy="111" r="5.2" fill={skin} />
        </g>

        {/* pescoço e cabeça */}
        <rect x="55" y="62" width="10" height="10" rx="3" fill={skinDark} />
        <circle cx="60" cy="48" r="19" fill={skin} />
        <circle cx="41.5" cy="50" r="3.5" fill={skinDark} />
        <circle cx="78.5" cy="50" r="3.5" fill={skinDark} />
        {/* rosto */}
        <circle cx="53" cy="50" r="2.3" fill="#2a1a10" />
        <circle cx="67" cy="50" r="2.3" fill="#2a1a10" />
        <circle cx="53.8" cy="49.2" r=".7" fill="#fff" opacity=".8" />
        <circle cx="67.8" cy="49.2" r=".7" fill="#fff" opacity=".8" />
        <path d="M49 44 Q53 42 56 44 M64 44 Q67 42 71 44" stroke={shade(hair, 0.05)} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <circle cx="49" cy="56" r="3" fill="#e07a6a" opacity=".22" />
        <circle cx="71" cy="56" r="3" fill="#e07a6a" opacity=".22" />
        <path d="M55 57 Q60 61 65 57" stroke="#6b3a2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />

        {/* cabelo da frente */}
        {config.hair === 'curto' && <path d="M41 46 Q42 26 60 27 Q79 26 79 46 Q72 36 60 37 Q48 36 41 46 Z" fill={hair} />}
        {config.hair === 'longo' && <path d="M40 50 Q40 26 60 27 Q80 26 80 50 Q74 36 60 36 Q46 36 40 50 Z" fill={hair} />}
        {config.hair === 'cacheado' && (
          <g fill={hair}>
            {[[44, 40], [50, 32], [59, 29], [68, 31], [75, 38], [79, 46], [41, 47]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="7" />
            ))}
          </g>
        )}
        {config.hair === 'coque' && (
          <g fill={hair}>
            <path d="M41 46 Q42 27 60 28 Q78 27 79 46 Q71 37 60 38 Q49 37 41 46 Z" />
            <circle cx="60" cy="25" r="8" />
          </g>
        )}
        {config.hair === 'tranca' && <path d="M41 47 Q42 27 60 28 Q78 27 79 47 Q74 37 62 37 Q50 38 41 47 Z" fill={hair} />}
        {config.hair === 'raspado' && <path d="M43 40 Q48 30 60 30 Q72 30 77 40" stroke={hair} strokeWidth="3" fill="none" opacity=".55" />}
        {config.outfit === 'manto' && <path d="M38 52 Q38 22 60 22 Q82 22 82 52 Q76 30 60 30 Q44 30 38 52 Z" fill={cloth} />}

        {/* acessórios */}
        {config.accessory === 'cajado' && (
          <g>
            <path d="M92 150 L92 52 Q92 40 100 40 Q106 40 106 48" stroke="#6b4423" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="87" cy="111" r="5.2" fill={skin} />
          </g>
        )}
        {config.accessory === 'bolsa' && (
          <g>
            <path d="M44 74 Q66 90 80 104" stroke="#5b3b22" strokeWidth="3" fill="none" />
            <rect x="74" y="102" width="16" height="14" rx="3" fill="#7a5230" />
            <rect x="74" y="102" width="16" height="5" rx="2" fill="#5b3b22" />
          </g>
        )}
        {config.accessory === 'pergaminho' && (
          <g>
            <rect x="81" y="100" width="7" height="22" rx="3" fill="#efe3c4" transform="rotate(-20 84 111)" />
            <rect x="80" y="98" width="9" height="4" rx="2" fill="#b38a3e" transform="rotate(-20 84 111)" />
            <circle cx="87" cy="111" r="5.2" fill={skin} />
          </g>
        )}
        {config.accessory === 'lamparina' && (
          <g>
            <path d="M80 118 Q87 124 98 116 L96 114 Q88 118 82 114 Z" fill="#b38a3e" />
            <path className="adv-flame" d="M97 113 Q95 107 98 103 Q101 108 99 113 Z" fill="#ffcf6b" />
            <circle cx="87" cy="111" r="5.2" fill={skin} />
          </g>
        )}
      </g>
    </svg>
  )
}
