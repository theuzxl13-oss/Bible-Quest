import { useId, type ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

/*
 * ÍCONES ILUSTRADOS (v0.12): versões coloridas, com contorno escuro, brilho e
 * volume, no estilo de jogo de aventura. Aceitam os mesmos nomes de <Icon>;
 * quando não há versão ilustrada, usam o ícone de traço.
 * Desenhados à mão neste arquivo (SVG), sem imagens externas.
 */

const O = '#3a2410'
const sw = { stroke: O, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

type Desenho = (g: (n: string) => string) => ReactNode

/** Gradiente vertical simples. */
function lin(id: string, a: string, b: string) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  )
}

const brilho = (d: string) => <path d={d} fill="#fff" opacity="0.45" />

const DESENHOS: Partial<Record<IconName, Desenho>> = {
  tenda: (g) => (
    <>
      <defs>{lin(g('t'), '#f6ead0', '#d9c39a')}</defs>
      <ellipse cx="24" cy="42" rx="19" ry="3" fill="#000" opacity="0.18" />
      <path d="M24 6 4 40h40z" fill={`url(#${g('t')})`} {...sw} />
      <path d="M24 6 14 40M24 6l10 34" stroke="#b5562f" strokeWidth="3" fill="none" />
      <path d="M24 6 4 40h40z" fill="none" {...sw} />
      <path d="M24 18 18 40h12z" fill="#4a2c18" {...sw} />
      <path d="M24 3v6" {...sw} />
      <path d="M24 3l7 2-7 2" fill="#d9432f" {...sw} strokeWidth={1.5} />
    </>
  ),
  tunica: (g) => (
    <>
      <defs>{lin(g('t'), '#e7c48a', '#b98a4c')}</defs>
      <path d="M17 6 6 11l-3 10 7 3 3-5v23h22V19l3 5 7-3-3-10-11-5c-1 3-4 5-7 5s-6-2-7-5z" fill={`url(#${g('t')})`} {...sw} />
      <path d="M17 6c1 3 4 5 7 5s6-2 7-5" fill="none" {...sw} />
      <rect x="13" y="25" width="22" height="5" rx="1.5" fill="#8a3427" {...sw} />
      <rect x="21" y="24" width="6" height="7" rx="1.5" fill="#f2c14e" {...sw} strokeWidth={1.5} />
      {brilho('M10 12l4-2 1 7-4 3z')}
    </>
  ),
  trophy: (g) => (
    <>
      <defs>{lin(g('o'), '#ffe58a', '#e0a128')}</defs>
      <path d="M14 8c-7 0-9 4-8 8 1 5 6 7 10 7M34 8c7 0 9 4 8 8-1 5-6 7-10 7" fill="none" stroke={O} strokeWidth="5" strokeLinecap="round" />
      <path d="M14 8c-7 0-9 4-8 8 1 5 6 7 10 7M34 8c7 0 9 4 8 8-1 5-6 7-10 7" fill="none" stroke="#f2b53a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 5h24v8c0 9-5 15-12 15S12 22 12 13z" fill={`url(#${g('o')})`} {...sw} />
      <path d="M20 28h8v6h-8z" fill="#e0a128" {...sw} />
      <rect x="13" y="34" width="22" height="8" rx="2" fill="#7a4a24" {...sw} />
      <rect x="18" y="36.5" width="12" height="3" rx="1" fill="#f2c14e" />
      {brilho('M16 8h4v9c0 3 1 6 2 7-4-1-6-5-6-9z')}
    </>
  ),
  book: () => (
    <>
      <ellipse cx="24" cy="43" rx="18" ry="2.5" fill="#000" opacity="0.18" />
      <rect x="6" y="31" width="34" height="9" rx="2" fill="#8e3328" {...sw} />
      <path d="M8 34h30" stroke="#f2c14e" strokeWidth="1.6" />
      <rect x="9" y="22" width="32" height="9" rx="2" fill="#2f7f8c" {...sw} />
      <path d="M11 25h28" stroke="#f2c14e" strokeWidth="1.6" />
      <path d="M38 22v9" stroke="#f3ead2" strokeWidth="3" />
      <rect x="7" y="13" width="30" height="9" rx="2" fill="#5c7046" {...sw} />
      <path d="M9 16h26" stroke="#f2c14e" strokeWidth="1.6" />
      <path d="M8 22v9" stroke="#f3ead2" strokeWidth="3" />
      <circle cx="30" cy="9" r="4" fill="#f2c14e" {...sw} strokeWidth={1.5} />
    </>
  ),
  user: (g) => (
    <>
      <defs>{lin(g('p'), '#ffcf7a', '#e08a2a')}</defs>
      <path d="M8 43c0-10 7-16 16-16s16 6 16 16z" fill={`url(#${g('p')})`} {...sw} />
      <circle cx="24" cy="16" r="10" fill={`url(#${g('p')})`} {...sw} />
      {brilho('M18 11c2-3 6-4 8-3-3 1-5 3-6 6z')}
    </>
  ),
  users: (g) => (
    <>
      <defs>{lin(g('p'), '#ffcf7a', '#e08a2a')}{lin(g('q'), '#9fd3dc', '#3f8fa0')}</defs>
      <path d="M22 43c0-8 5-13 12-13s12 5 12 13z" fill={`url(#${g('q')})`} {...sw} />
      <circle cx="34" cy="21" r="7" fill={`url(#${g('q')})`} {...sw} />
      <path d="M3 43c0-9 6-15 14-15s14 6 14 15z" fill={`url(#${g('p')})`} {...sw} />
      <circle cx="17" cy="17" r="9" fill={`url(#${g('p')})`} {...sw} />
    </>
  ),
  star: (g) => (
    <>
      <defs>{lin(g('s'), '#fff0a0', '#f0a51e')}</defs>
      <path d="M24 4l6 12 13 2-9.5 9 2.3 13L24 34l-11.8 6 2.3-13L5 18l13-2z" fill={`url(#${g('s')})`} {...sw} />
      {brilho('M24 9l3 7-6 1z')}
    </>
  ),
  flame: (g) => (
    <>
      <defs>{lin(g('f'), '#ffb347', '#e0441b')}</defs>
      <path d="M24 44c9 0 15-6 15-14 0-9-7-13-9-22-4 4-5 8-5 12-2-2-4-4-4-8-5 5-12 11-12 18 0 8 6 14 15 14z" fill={`url(#${g('f')})`} {...sw} />
      <path d="M24 42c5 0 8-3 8-8 0-5-4-7-5-12-3 3-4 6-4 9-1-1-2-2-2-4-3 3-5 5-5 8 0 4 3 7 8 7z" fill="#ffe08a" />
    </>
  ),
  bau: (g) => (
    <>
      <defs>{lin(g('m'), '#b07a42', '#7a4a24')}</defs>
      <ellipse cx="24" cy="43" rx="19" ry="2.5" fill="#000" opacity="0.18" />
      <path d="M5 20c0-9 8-13 19-13s19 4 19 13z" fill={`url(#${g('m')})`} {...sw} />
      <rect x="5" y="20" width="38" height="21" rx="2" fill={`url(#${g('m')})`} {...sw} />
      <path d="M12 9v32M36 9v32" stroke="#f2c14e" strokeWidth="3.5" />
      <path d="M5 20h38" {...sw} />
      <rect x="19" y="17" width="10" height="11" rx="2" fill="#f2c14e" {...sw} />
      <circle cx="24" cy="22" r="1.6" fill={O} />
      {brilho('M9 14c3-3 8-4 12-4-5 2-8 4-9 7z')}
    </>
  ),
  scroll: (g) => (
    <>
      <defs>{lin(g('p'), '#fbf1d6', '#e3cd98')}</defs>
      <path d="M12 8h24v30H12z" fill={`url(#${g('p')})`} {...sw} />
      <rect x="8" y="5" width="32" height="6" rx="3" fill="#c89b5a" {...sw} />
      <rect x="8" y="35" width="32" height="6" rx="3" fill="#c89b5a" {...sw} />
      <path d="M17 16h14M17 21h14M17 26h9" stroke="#8a6238" strokeWidth="2" strokeLinecap="round" />
      <circle cx="31" cy="30" r="4" fill="#c0392b" {...sw} strokeWidth={1.5} />
    </>
  ),
  map: () => (
    <>
      <path d="M4 10l13-4 14 4 13-4v32l-13 4-14-4-13 4z" fill="#ead7aa" {...sw} />
      <path d="M17 6v32M31 10v32" stroke="#b89a64" strokeWidth="1.5" />
      <path d="M6 30c4-2 6 2 10 0" fill="none" stroke="#5c8f4a" strokeWidth="3" />
      <circle cx="37" cy="17" r="4" fill="#4f8fb8" />
      <path d="M10 15c6 2 10 8 16 10s6 6 10 8" fill="none" stroke="#c0392b" strokeWidth="2.2" strokeDasharray="3 3" />
      <path d="M33 30l5 5M38 30l-5 5" stroke="#c0392b" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  calendar: () => (
    <>
      <rect x="6" y="9" width="36" height="33" rx="4" fill="#fbf1d6" {...sw} />
      <path d="M6 13a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v6H6z" fill="#c0392b" {...sw} />
      <path d="M15 5v8M33 5v8" stroke={O} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M24 24l2.4 4.8 5.3.8-3.9 3.7.9 5.2-4.7-2.5-4.7 2.5.9-5.2-3.9-3.7 5.3-.8z" fill="#f2b53a" {...sw} strokeWidth={1.4} />
    </>
  ),
  laurel: () => (
    <>
      <path d="M24 42c-9-3-15-11-15-22M24 42c9-3 15-11 15-22" fill="none" stroke="#3f6a35" strokeWidth="2.5" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <ellipse cx={10 + i * 1.2} cy={34 - i * 6} rx="3.5" ry="6" transform={`rotate(${-50 + i * 8} ${10 + i * 1.2} ${34 - i * 6})`} fill="#6fae4a" {...sw} strokeWidth={1.4} />
          <ellipse cx={38 - i * 1.2} cy={34 - i * 6} rx="3.5" ry="6" transform={`rotate(${50 - i * 8} ${38 - i * 1.2} ${34 - i * 6})`} fill="#6fae4a" {...sw} strokeWidth={1.4} />
        </g>
      ))}
      <path d="M17 41l7-3 7 3-3 4-4-2-4 2z" fill="#f2b53a" {...sw} strokeWidth={1.5} />
    </>
  ),
  crown: (g) => (
    <>
      <defs>{lin(g('c'), '#ffe58a', '#e0a128')}</defs>
      <path d="M5 16l9 8 10-14 10 14 9-8-4 22H9z" fill={`url(#${g('c')})`} {...sw} />
      <rect x="9" y="36" width="30" height="6" rx="2" fill="#e0a128" {...sw} />
      <circle cx="24" cy="29" r="3.5" fill="#c0392b" {...sw} strokeWidth={1.4} />
      <circle cx="15" cy="31" r="2.5" fill="#2f7f8c" {...sw} strokeWidth={1.2} />
      <circle cx="33" cy="31" r="2.5" fill="#2f7f8c" {...sw} strokeWidth={1.2} />
    </>
  ),
  shield: (g) => (
    <>
      <defs>{lin(g('e'), '#4f8fc0', '#24507e')}</defs>
      <path d="M24 4l17 6v12c0 10-7 17-17 22C14 39 7 32 7 22V10z" fill="#f2c14e" {...sw} />
      <path d="M24 9l12 4v9c0 8-5 13-12 17-7-4-12-9-12-17v-9z" fill={`url(#${g('e')})`} {...sw} strokeWidth={1.5} />
      <path d="M24 15l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="#ffe08a" />
    </>
  ),
  compass: (g) => (
    <>
      <defs>{lin(g('b'), '#f6d58a', '#b8862f')}</defs>
      <circle cx="24" cy="25" r="19" fill={`url(#${g('b')})`} {...sw} />
      <circle cx="24" cy="25" r="14" fill="#fbf1d6" {...sw} strokeWidth={1.5} />
      <path d="M24 13l4 12h-8z" fill="#c0392b" {...sw} strokeWidth={1.3} />
      <path d="M24 37l4-12h-8z" fill="#e8e1d0" {...sw} strokeWidth={1.3} />
      <circle cx="24" cy="25" r="2" fill={O} />
      <rect x="21" y="2" width="6" height="5" rx="2" fill="#b8862f" {...sw} strokeWidth={1.5} />
    </>
  ),
  lamp: () => (
    <>
      <path d="M34 14c-3-4-2-8 1-11 1 4 4 6 2 10" fill="#ffb347" {...sw} strokeWidth={1.5} />
      <path d="M4 26c0-4 8-7 18-7h10l11-5c0 8-6 16-17 16H10c-4 0-6-1-6-4z" fill="#c4683a" {...sw} />
      <path d="M12 34h18" {...sw} strokeWidth={3} />
      <path d="M8 26h22" stroke="#e8955a" strokeWidth="2" />
    </>
  ),
  dove: () => (
    <>
      <path d="M6 26c8 0 14-5 18-13 2 6 8 10 18 9-4 9-12 14-22 14l-8 7v-8c-4-2-6-5-6-9z" fill="#fbfaf5" {...sw} />
      <path d="M24 13c-2 7-6 11-12 13" fill="none" stroke="#c9c2b0" strokeWidth="2" />
      <circle cx="33" cy="22" r="1.6" fill={O} />
      <path d="M41 21l5-1-4 4" fill="#f2b53a" {...sw} strokeWidth={1.3} />
    </>
  ),
  mountain: () => (
    <>
      <path d="M2 42l15-26 9 14 6-8 14 20z" fill="#7f84a6" {...sw} />
      <path d="M17 16l-5 9 5-2 4 3z" fill="#fff" />
      <path d="M2 42c10-6 30-6 44 0z" fill="#6fae4a" {...sw} />
    </>
  ),
  clock: () => (
    <>
      <path d="M12 4h24M12 44h24" stroke="#7a4a24" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 6c0 10 10 12 10 18S14 32 14 42h20c0-10-10-12-10-18S34 16 34 6z" fill="#dff1f5" {...sw} />
      <path d="M17 41c2-6 5-7 7-7s5 1 7 7zM19 12h10c-1 4-5 6-5 9-0-3-4-5-5-9z" fill="#f2b53a" />
    </>
  ),
  flag: () => (
    <>
      <path d="M10 44V5" {...sw} strokeWidth={3} />
      <path d="M12 6h26l-5 8 5 8H12z" fill="#c0392b" {...sw} />
      <circle cx="10" cy="5" r="3" fill="#f2c14e" {...sw} strokeWidth={1.5} />
    </>
  ),
  heart: (g) => (
    <>
      <defs>{lin(g('h'), '#ff7a6b', '#c0392b')}</defs>
      <path d="M24 42S5 30 5 17c0-6 4-10 10-10 4 0 7 2 9 6 2-4 5-6 9-6 6 0 10 4 10 10 0 13-19 25-19 25z" fill={`url(#${g('h')})`} {...sw} />
      {brilho('M12 12c2-2 5-2 6 0-3 0-5 2-6 4z')}
    </>
  ),
  lock: () => (
    <>
      <path d="M15 21v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#8e8a84" strokeWidth="5" />
      <path d="M15 21v-6a9 9 0 0 1 18 0v6" fill="none" {...sw} />
      <rect x="9" y="20" width="30" height="22" rx="4" fill="#f2b53a" {...sw} />
      <path d="M24 28v6" stroke={O} strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  check: () => (
    <>
      <circle cx="24" cy="24" r="19" fill="#4fae6a" {...sw} />
      <path d="M15 24l6 6 12-13" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  settings: (g) => (
    <>
      <defs>{lin(g('g'), '#c9c4bc', '#76716a')}</defs>
      <path
        d="M21 4h6l1 5 4 2 4-3 4 4-3 4 2 4 5 1v6l-5 1-2 4 3 4-4 4-4-3-4 2-1 5h-6l-1-5-4-2-4 3-4-4 3-4-2-4-5-1v-6l5-1 2-4-3-4 4-4 4 3 4-2z"
        fill={`url(#${g('g')})`}
        {...sw}
      />
      <circle cx="24" cy="24" r="6" fill="#3b3835" {...sw} />
    </>
  ),
  cerebro: (g) => (
    <>
      <defs>{lin(g('b'), '#ffe1b8', '#e8a96a')}</defs>
      <path d="M23 7c-3-3-9-2-10 3-5 0-8 5-6 9-3 3-2 9 2 11 0 5 5 8 9 6 2 3 5 4 5 4zM25 7c3-3 9-2 10 3 5 0 8 5 6 9 3 3 2 9-2 11 0 5-5 8-9 6-2 3-5 4-5 4z" fill={`url(#${g('b')})`} {...sw} />
      <path d="M13 16c3 0 5 2 5 5M35 16c-3 0-5 2-5 5M12 28c3-1 6 0 7 3M36 28c-3-1-6 0-7 3" fill="none" stroke="#b8763a" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  key: () => (
    <>
      <circle cx="15" cy="17" r="10" fill="#f2c14e" {...sw} />
      <circle cx="15" cy="17" r="4" fill="#7a4a24" {...sw} strokeWidth={1.5} />
      <path d="M22 24l18 18M33 35l4-4M37 39l4-4" stroke={O} strokeWidth="6" strokeLinecap="round" />
      <path d="M22 24l18 18M33 35l4-4M37 39l4-4" stroke="#f2c14e" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  anchor: () => (
    <>
      <circle cx="24" cy="9" r="5" fill="none" stroke={O} strokeWidth="5" />
      <circle cx="24" cy="9" r="5" fill="none" stroke="#9aa6b5" strokeWidth="2.5" />
      <path d="M24 14v28M8 30c2 8 8 12 16 12s14-4 16-12M16 22h16" fill="none" stroke={O} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M24 14v28M8 30c2 8 8 12 16 12s14-4 16-12M16 22h16" fill="none" stroke="#9aa6b5" strokeWidth="2.8" strokeLinecap="round" />
    </>
  ),
}
DESENHOS.home = DESENHOS.tenda

export function temIlustracao(name: IconName) {
  return Boolean(DESENHOS[name])
}

/** Ícone ilustrado e colorido; cai para o ícone de traço quando não há ilustração. */
export function GameIcon({ name, size = 28, title, className }: { name: IconName; size?: number; title?: string; className?: string }) {
  const base = useId().replace(/:/g, '')
  const desenho = DESENHOS[name]
  if (!desenho) return <Icon name={name} size={size} title={title} className={className} />
  return (
    <svg
      className={`game-icon ${className ?? ''}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {desenho((n) => `${base}-${n}`)}
    </svg>
  )
}
