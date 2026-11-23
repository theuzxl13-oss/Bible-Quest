import { useId } from 'react'
import type { CenarioPartida } from '../../../data/mapas/cenarios'
import { Elemento, type TipoElemento } from './Elementos'

/*
 * Paisagem de fundo das telas de jogo (perguntas e resultado): céu, montanhas,
 * colinas e o chão da região da fase, com os marcos dela (a arca nas fases de
 * Noé, a torre em Babel, a biblioteca no Quiz). Fica fixa atrás do conteúdo.
 */

export function CenarioFundo({ cenario, noite = false }: { cenario: CenarioPartida; noite?: boolean }) {
  const uid = useId().replace(/:/g, '')
  const marcos = cenario.marcos.filter((m) => m.onde !== 'ceu').map((m) => m.tipo)
  const veg = cenario.vegetacao
  // posições fixas: marcos grandes nos cantos, vegetação no meio e na frente
  const lugares: { tipo: TipoElemento; x: number; y: number; s: number; esp?: boolean }[] = [
    { tipo: marcos[0] ?? veg[0], x: 70, y: 548, s: 1.15 },
    { tipo: marcos[1] ?? veg[1] ?? veg[0], x: 338, y: 560, s: 1 },
    { tipo: veg[0], x: 196, y: 532, s: 0.75, esp: true },
    { tipo: marcos[2] ?? veg[2] ?? veg[0], x: 268, y: 640, s: 0.9, esp: true },
    { tipo: veg[1] ?? veg[0], x: 26, y: 690, s: 1.1 },
    { tipo: marcos[3] ?? veg[2] ?? veg[0], x: 120, y: 720, s: 0.9 },
    { tipo: veg[2] ?? veg[0], x: 382, y: 730, s: 1.1, esp: true },
    // laterais (aparecem em telas largas)
    { tipo: veg[0], x: -120, y: 600, s: 1.3 },
    { tipo: marcos[3] ?? veg[1] ?? veg[0], x: 540, y: 610, s: 1.2, esp: true },
    { tipo: veg[1] ?? veg[0], x: -300, y: 720, s: 1.4 },
    { tipo: veg[2] ?? veg[0], x: 700, y: 730, s: 1.4, esp: true },
    { tipo: veg[0], x: -460, y: 640, s: 1.2 },
    { tipo: veg[0], x: 860, y: 650, s: 1.2 },
  ]
  return (
    <svg className="av-fundo" viewBox="0 0 400 800" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-ceu`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={noite ? '#1e2f5a' : '#5fa8e6'} />
          <stop offset="0.55" stopColor={noite ? '#4a4a7a' : '#bfe0f5'} />
          <stop offset="1" stopColor={noite ? '#c08a6a' : '#fdf0cf'} />
        </linearGradient>
        <linearGradient id={`${uid}-chao`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={cenario.chao[0]} />
          <stop offset="1" stopColor={cenario.chao[1]} />
        </linearGradient>
        <radialGradient id={`${uid}-sol`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff8d8" />
          <stop offset="0.35" stopColor="#ffe9a0" stopOpacity=".8" />
          <stop offset="1" stopColor="#ffe9a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-1200" y="-600" width="2800" height="1400" fill={`url(#${uid}-ceu)`} />
      <circle cx="300" cy="300" r="140" fill={`url(#${uid}-sol)`} />
      <g fill="#ffffff" opacity=".85">
        <ellipse cx="80" cy="150" rx="46" ry="14" /><ellipse cx="110" cy="140" rx="30" ry="16" />
        <ellipse cx="320" cy="96" rx="40" ry="12" /><ellipse cx="294" cy="88" rx="24" ry="12" />
      </g>
      <path d="M -800 430 L -200 380 L -60 330 L 40 386 L 120 300 L 210 380 L 290 320 L 380 392 L 460 330 L 600 400 L 1600 380 L 1600 520 L -1200 520 L -1200 430 Z" fill="#8f9fc6" opacity=".8" />
      <path d="M 120 300 L 140 324 L 128 328 L 112 318 Z M 290 320 L 308 340 L 296 342 L 282 334 Z" fill="#fff" opacity=".85" />
      <path d="M -800 470 Q -100 420 60 456 T 260 446 T 520 450 T 1600 452 L 1600 900 L -1200 900 L -1200 470 Z" fill={cenario.chao[1]} opacity=".75" />
      <path d="M -800 500 Q -60 470 120 492 T 380 486 T 1600 490 L 1600 900 L -1200 900 L -1200 500 Z" fill={`url(#${uid}-chao)`} />
      <path d="M 170 800 Q 180 680 210 600 Q 230 540 200 505" stroke="#c8a26a" strokeWidth="46" fill="none" strokeLinecap="round" opacity=".9" />
      <path d="M 170 800 Q 180 680 210 600 Q 230 540 200 505" stroke="#e6cd98" strokeWidth="30" fill="none" strokeDasharray="12 6" strokeLinecap="round" opacity=".9" />
      {cenario.agua && (
        <g>
          <ellipse cx="320" cy="660" rx="78" ry="22" fill="#7a6a4a" />
          <ellipse cx="320" cy="656" rx="76" ry="21" fill="#4aa8dc" stroke="#e9d9a8" strokeWidth="4" />
          <ellipse cx="300" cy="650" rx="26" ry="3" fill="#fff" opacity=".6" />
        </g>
      )}
      {lugares.map((l, i) => <Elemento key={i} tipo={l.tipo} x={l.x} y={l.y} s={l.s} espelho={l.esp} />)}
    </svg>
  )
}
