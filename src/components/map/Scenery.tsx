import type { DecorKind, World } from '../../data/worlds'

/*
 * Elementos de cenário do mapa, desenhados em SVG (sem emojis nem imagens
 * externas). Cada mundo escolhe quais elementos aparecem ao longo do caminho.
 */
export function Decor({ kind, x, y, s = 1, theme }: { kind: DecorKind; x: number; y: number; s?: number; theme: World['theme'] }) {
  const t = `translate(${x} ${y}) scale(${s})`
  switch (kind) {
    case 'arvore':
      return (
        <g transform={t}>
          <rect x="-3" y="2" width="6" height="18" rx="2" fill="#5b3b22" />
          <circle cx="0" cy="-6" r="14" fill={theme.accent} opacity=".85" />
          <circle cx="-9" cy="2" r="9" fill={theme.accent} opacity=".7" />
          <circle cx="9" cy="1" r="10" fill={theme.accent} opacity=".75" />
        </g>
      )
    case 'oliveira':
      return (
        <g transform={t}>
          <path d="M0 20 Q-2 8 2 0 Q-4 -4 0 -8" stroke="#6b4a2b" strokeWidth="4" fill="none" />
          <ellipse cx="-6" cy="-10" rx="12" ry="7" fill="#8ea37a" />
          <ellipse cx="8" cy="-6" rx="11" ry="6" fill="#7c9468" />
          <ellipse cx="0" cy="-18" rx="10" ry="6" fill="#9db48a" />
        </g>
      )
    case 'palmeira':
      return (
        <g transform={t}>
          <path d="M0 22 Q3 4 0 -14" stroke="#7a5230" strokeWidth="4" fill="none" />
          {[-60, -25, 15, 50, 85].map((a) => (
            <path key={a} d="M0 -14 Q14 -22 26 -14" stroke="#5f8a4a" strokeWidth="4" fill="none" strokeLinecap="round" transform={`rotate(${a} 0 -14)`} />
          ))}
        </g>
      )
    case 'flor':
      return (
        <g transform={t}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx="0" cy="-5" r="3.5" fill="#f2c4a8" transform={`rotate(${a})`} />
          ))}
          <circle r="3" fill="#ecc96e" />
        </g>
      )
    case 'montanha':
      return (
        <g transform={t}>
          <path d="M-40 20 L-8 -26 L6 -8 L18 -20 L44 20 Z" fill={theme.groundDeep} opacity=".9" />
          <path d="M-8 -26 L-1 -16 L-12 -12 Z M18 -20 L24 -11 L14 -12 Z" fill="#efe3c4" opacity=".75" />
        </g>
      )
    case 'rio':
      return (
        <g transform={t}>
          <path d="M-46 0 Q-22 -12 0 0 T46 0" stroke="#6fa8c8" strokeWidth="9" fill="none" strokeLinecap="round" opacity=".75" />
          <path d="M-36 -2 Q-22 -8 -10 -2" stroke="#d6ecf5" strokeWidth="2" fill="none" opacity=".6" />
        </g>
      )
    case 'onda':
      return (
        <g transform={t}>
          <path d="M-40 6 Q-30 -6 -20 6 T0 6 T20 6 T40 6" stroke="#7fb5cf" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M-30 16 Q-20 6 -10 16 T10 16 T30 16" stroke="#5d93b0" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".8" />
        </g>
      )
    case 'duna':
      return (
        <g transform={t}>
          <path d="M-46 14 Q-18 -14 10 8 Q26 -6 46 14 Z" fill="#c99a5b" opacity=".8" />
        </g>
      )
    case 'tenda':
      return (
        <g transform={t}>
          <path d="M-22 16 L0 -16 L22 16 Z" fill="#a8693f" />
          <path d="M0 -16 L-6 16 L6 16 Z" fill="#5b3b22" />
          <path d="M-22 16 L22 16" stroke="#3d2812" strokeWidth="2" />
        </g>
      )
    case 'piramide':
      return (
        <g transform={t}>
          <path d="M-34 18 L0 -24 L34 18 Z" fill="#d9b26a" />
          <path d="M0 -24 L34 18 L6 18 Z" fill="#b38a3e" />
        </g>
      )
    case 'coluna':
      return (
        <g transform={t}>
          {[-14, 0, 14].map((cx) => (
            <rect key={cx} x={cx - 3.5} y="-18" width="7" height="34" fill="#e8dcc0" opacity=".85" />
          ))}
          <rect x="-22" y="-24" width="44" height="7" fill="#efe3c4" />
          <rect x="-22" y="16" width="44" height="5" fill="#cbbd9b" />
        </g>
      )
    case 'cidade':
      return (
        <g transform={t}>
          <rect x="-34" y="-6" width="68" height="22" fill="#cbb48a" />
          <rect x="-28" y="-20" width="16" height="16" fill="#bfa77c" />
          <rect x="8" y="-26" width="18" height="22" fill="#bfa77c" />
          <path d="M-34 -6 h6 v-4 h6 v4 h6 v-4 h6 v4 h6 v-4 h6 v4 h6 v-4 h6 v4 h6 v-4 h4 v4" stroke="#a78f63" strokeWidth="2" fill="none" />
          <rect x="-5" y="4" width="10" height="12" rx="5" fill="#5b3b22" />
        </g>
      )
    case 'arca':
      return (
        <g transform={t}>
          <path d="M-36 0 L36 0 L28 16 L-28 16 Z" fill="#7a5230" />
          <rect x="-20" y="-14" width="40" height="14" fill="#8b5e34" />
          <path d="M-24 -14 L0 -24 L24 -14 Z" fill="#6b4423" />
          <path d="M-30 6 H30" stroke="#5b3b22" strokeWidth="1.5" />
        </g>
      )
    case 'torre':
      return (
        <g transform={t}>
          <path d="M-26 22 L-20 6 L20 6 L26 22 Z" fill="#c4945a" />
          <path d="M-18 6 L-13 -8 L13 -8 L18 6 Z" fill="#b8874f" />
          <path d="M-11 -8 L-7 -20 L7 -20 L11 -8 Z" fill="#ab7b45" />
          <path d="M-5 -20 L-3 -28 L3 -28 L5 -20 Z" fill="#9f6f3c" />
        </g>
      )
    case 'estrela':
      return (
        <g transform={t} className="map-twinkle">
          <path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="#f7e3a3" />
        </g>
      )
    case 'pergaminho':
      return (
        <g transform={t}>
          <rect x="-16" y="-10" width="32" height="20" rx="3" fill="#efe3c4" />
          <rect x="-20" y="-12" width="6" height="24" rx="3" fill="#cbb48a" />
          <rect x="14" y="-12" width="6" height="24" rx="3" fill="#cbb48a" />
          <path d="M-9 -4 H9 M-9 1 H9 M-9 6 H4" stroke="#8b6a3e" strokeWidth="1.5" />
        </g>
      )
    default:
      return null
  }
}

/** Ícone de baú de recompensa. */
export function ChestIcon({ open, size = 44 }: { open?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={`chest-icon ${open ? 'is-open' : ''}`}>
      <rect x="6" y="22" width="36" height="20" rx="3" fill="#8b5e34" stroke="#3d2812" strokeWidth="1.5" />
      <rect x="6" y="28" width="36" height="4" fill="#d4af5a" />
      <g className="chest-lid">
        <path d="M6 22 Q6 8 24 8 Q42 8 42 22 Z" fill="#a8693f" stroke="#3d2812" strokeWidth="1.5" />
        <path d="M6 22 Q6 8 24 8 Q42 8 42 22" fill="none" stroke="#d4af5a" strokeWidth="3" opacity=".9" />
      </g>
      <rect x="21" y="25" width="6" height="8" rx="1.5" fill="#ecc96e" stroke="#3d2812" strokeWidth="1" />
      {open && <path d="M10 22 Q24 12 38 22" fill="#ffe7a3" opacity=".8" />}
    </svg>
  )
}
