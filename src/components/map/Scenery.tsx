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
