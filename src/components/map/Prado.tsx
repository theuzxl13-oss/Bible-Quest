import { useId, type ReactNode } from 'react'

/*
 * CENÁRIO DOS MAPAS (estilo "trilha de fases" de jogo de celular)
 * Campo claro e colorido, caminho sinuoso listrado, ilhas de grama com
 * árvores, flores, borboletas, pombas e nuvens. Tudo em SVG, desenhado no
 * código (sem imagens externas) e posicionado de forma determinística, para o
 * mapa ficar igual a cada visita.
 */

export interface PaletaMapa {
  /** Topo do campo (céu claro). */
  ceu: string
  /** Grama clara e grama mais escura (fim do trecho). */
  campo: string
  campoFundo: string
  /** Folhagem das árvores e arbustos. */
  folha: string
  /** Copa florida (amendoeira). */
  flor: string
  /** Cor das listras do caminho. */
  listra: string
  /** Montanhas ao longe. */
  montanha: string
}

export interface Ponto {
  id: string
  x: number
  y: number
}

/** Caminho suave (curvas de Bézier) que liga os pontos, de cima a baixo. */
export function caminhoSuave(pts: Ponto[], H: number, topo: number) {
  let d = `M ${pts[0].x} ${topo} L ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const k = (b.y - a.y) * 0.55
    d += ` C ${a.x} ${a.y + k}, ${b.x} ${b.y - k}, ${b.x} ${b.y}`
  }
  const u = pts[pts.length - 1]
  return `${d} L ${u.x} ${H}`
}

/** Gerador pseudoaleatório simples e determinístico. */
function sorteador(semente: string) {
  let h = 2166136261
  for (let i = 0; i < semente.length; i++) h = Math.imul(h ^ semente.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

export type EnfeitePrado = 'amendoeira' | 'arvore' | 'oliveira' | 'palmeira' | 'arbusto' | 'tenda' | 'ovelha' | 'poco' | 'pedras' | 'cidade' | 'coluna' | 'piramide' | 'torre' | 'pergaminho'

interface Props {
  W: number
  H: number
  pts: Ponto[]
  d: string
  paleta: PaletaMapa
  enfeites: EnfeitePrado[]
  semente: string
  /** Conteúdo extra desenhado acima do caminho (ex.: brilho do avatar). */
  children?: ReactNode
}

/** Largura extra desenhada dos lados, para o campo cobrir telas largas. */
const L = 1400

function montanhas(W: number) {
  let d = `M ${-L} 60`
  const picos = [28, 58, 14, 60, 30, 64, 22, 56, 36, 62]
  for (let x = -L, i = 0; x <= W + L; x += 60, i++) d += ` L ${x} ${picos[i % picos.length]}`
  return `${d} L ${W + L} 110 L ${-L} 110 Z`
}

function colinas(W: number) {
  let d = `M ${-L} 90`
  for (let x = -L; x < W + L; x += 180) d += ` Q ${x + 90} ${x % 360 === 0 ? 58 : 74} ${x + 180} 88`
  return `${d} L ${W + L} 130 L ${-L} 130 Z`
}

const CORES_FLOR = ['#ff8fb1', '#ffd34d', '#ffffff', '#c58bff', '#ff9f5a', '#7ad0ff']

export function CenarioPrado({ W, H, pts, d, paleta, enfeites, semente, children }: Props) {
  const uid = useId().replace(/:/g, '')
  const r = sorteador(semente)
  // pontos amostrados do caminho, para não pôr enfeites em cima dele
  const amostras: { x: number; y: number }[] = []
  for (let i = 1; i < pts.length; i++) {
    for (let k = 0; k <= 10; k++) {
      const t = k / 10
      const s = t * t * (3 - 2 * t)
      amostras.push({ x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * s, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t })
    }
  }
  const livre = (x: number, y: number, dist: number) => amostras.every((p) => (p.x - x) ** 2 + (p.y - y) ** 2 > dist * dist)

  // ilhas de grama com um enfeite, entre cada par de fases, do lado vazio
  const ilhas = pts.slice(0, -1).map((p, i) => {
    const q = pts[i + 1]
    const meioX = (p.x + q.x) / 2
    const lado = meioX > W / 2 ? -1 : 1
    return {
      x: W / 2 + lado * (118 + r() * 34),
      y: (p.y + q.y) / 2 + (r() - 0.5) * 30,
      s: 0.9 + r() * 0.35,
      tipo: enfeites[i % enfeites.length],
      espelho: r() > 0.5,
    }
  })

  const flores: { x: number; y: number; c: string; s: number }[] = []
  const tufos: { x: number; y: number; s: number }[] = []
  for (let n = 0; n < Math.round(H / 14) && flores.length < 60; n++) {
    const x = 14 + r() * (W - 28)
    const y = 30 + r() * (H - 70)
    if (!livre(x, y, 34)) continue
    if (r() > 0.45) flores.push({ x, y, c: CORES_FLOR[Math.floor(r() * CORES_FLOR.length)], s: 0.7 + r() * 0.6 })
    else tufos.push({ x, y, s: 0.7 + r() * 0.6 })
  }
  const borboletas = Array.from({ length: Math.max(2, Math.round(H / 420)) }, (_, i) => ({
    x: 30 + r() * (W - 60),
    y: 60 + ((i + r()) / Math.max(2, Math.round(H / 420))) * (H - 140),
    c: CORES_FLOR[(i * 2 + 1) % CORES_FLOR.length],
    atraso: r() * 3,
  }))

  return (
    <svg className="prado-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" preserveAspectRatio="xMidYMin meet">
      <defs>
        <linearGradient id={`${uid}-campo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={paleta.ceu} />
          <stop offset={Math.min(0.2, 110 / H)} stopColor={paleta.campo} />
          <stop offset="1" stopColor={paleta.campoFundo} />
        </linearGradient>
        <radialGradient id={`${uid}-luz`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fffbe0" stopOpacity=".9" />
          <stop offset="1" stopColor="#fffbe0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x={-L} y="0" width={W + 2 * L} height={H} fill={`url(#${uid}-campo)`} />
      {/* montanhas e colinas ao longe, no topo */}
      <path d={montanhas(W)} fill={paleta.montanha} opacity=".55" />
      <path d={colinas(W)} fill={paleta.campo} />
      <ellipse cx={W / 2} cy={H * 0.45} rx={W * 0.6} ry={H * 0.4} fill={`url(#${uid}-luz)`} opacity=".35" />

      {tufos.map((t, i) => (
        <path key={`t${i}`} transform={`translate(${t.x} ${t.y}) scale(${t.s})`} d="M-7 4 Q-6 -4 -3 -8 Q-3 -1 0 3 Q1 -6 4 -10 Q3 -1 2 4 Q5 -3 8 -5 Q6 1 6 4 Z" fill={paleta.campoFundo} opacity=".75" />
      ))}
      {flores.map((f, i) => (
        <g key={`f${i}`} transform={`translate(${f.x} ${f.y}) scale(${f.s})`}>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx="0" cy="-3.6" r="3" fill={f.c} stroke="rgba(0,0,0,.12)" strokeWidth=".6" transform={`rotate(${a})`} />)}
          <circle r="2.2" fill="#ffcf3a" />
        </g>
      ))}

      {ilhas.map((il, i) => (
        <g key={`i${i}`} transform={`translate(${il.x} ${il.y}) scale(${il.s})`}>
          <ellipse cx="0" cy="22" rx="52" ry="15" fill="rgba(60,90,20,.28)" />
          <ellipse cx="0" cy="16" rx="50" ry="16" fill={paleta.campoFundo} />
          <ellipse cx="0" cy="12" rx="48" ry="14" fill={paleta.campo} stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
          <g transform={il.espelho ? 'scale(-1 1)' : undefined}>
            <Enfeite tipo={il.tipo} paleta={paleta} />
          </g>
        </g>
      ))}

      {/* caminho listrado */}
      <path d={d} className="prado-borda" />
      <path d={d} className="prado-caminho" />
      <path d={d} className="prado-listras" style={{ stroke: paleta.listra }} />
      <path d={d} className="prado-brilho" />

      {children}

      {borboletas.map((b, i) => (
        <g key={`b${i}`} transform={`translate(${b.x} ${b.y})`}>
          <g className="prado-borboleta" style={{ animationDelay: `${b.atraso}s` }}>
            <path d="M0 0 Q-9 -10 -11 -2 Q-10 5 0 1 Z" fill={b.c} stroke="rgba(0,0,0,.25)" strokeWidth=".8" />
            <path d="M0 0 Q9 -10 11 -2 Q10 5 0 1 Z" fill={b.c} stroke="rgba(0,0,0,.25)" strokeWidth=".8" />
            <rect x="-.8" y="-4" width="1.6" height="8" rx=".8" fill="#4a3328" />
          </g>
        </g>
      ))}

      {/* nuvens no fim do trecho */}
      <g className="prado-nuvens" fill="#ffffff">
        {Array.from({ length: 47 }, (_, i) => {
          const x = -L + i * 70
          const rr = 34 + ((i * 17) % 20)
          return <circle key={i} cx={x} cy={H + 8 - ((i * 13) % 14)} r={rr} opacity=".92" />
        })}
      </g>
    </svg>
  )
}

/** Um enfeite sobre a ilha de grama (base no y≈12). */
function Enfeite({ tipo, paleta }: { tipo: EnfeitePrado; paleta: PaletaMapa }) {
  const contorno = { stroke: 'rgba(40,30,20,.35)', strokeWidth: 1.4 }
  switch (tipo) {
    case 'amendoeira':
    case 'arvore': {
      const copa = tipo === 'amendoeira' ? paleta.flor : paleta.folha
      return (
        <g>
          <path d="M-5 14 Q-3 -6 -8 -16 M5 14 Q3 -4 9 -14" stroke="#7a4a2a" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="-16" cy="-22" r="17" fill={copa} {...contorno} />
          <circle cx="15" cy="-24" r="18" fill={copa} {...contorno} />
          <circle cx="0" cy="-38" r="20" fill={copa} {...contorno} />
          <circle cx="-6" cy="-44" r="7" fill="#fff" opacity=".35" />
          {tipo === 'amendoeira' && [[-18, -26], [10, -30], [2, -46], [20, -18], [-10, -36]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r="2.6" fill="#fff" opacity=".85" />)}
        </g>
      )
    }
    case 'oliveira':
      return (
        <g>
          <path d="M0 14 Q-4 0 2 -8 Q-5 -14 -1 -20" stroke="#6b4a2b" strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="-12" cy="-22" rx="17" ry="10" fill="#9fbf7a" {...contorno} />
          <ellipse cx="12" cy="-18" rx="15" ry="9" fill="#8bae68" {...contorno} />
          <ellipse cx="0" cy="-32" rx="15" ry="9" fill="#b2cf8e" {...contorno} />
        </g>
      )
    case 'palmeira':
      return (
        <g>
          <path d="M0 14 Q6 -8 2 -30" stroke="#8a5a30" strokeWidth="6" fill="none" strokeLinecap="round" />
          {[-150, -115, -70, -30, 5].map((a) => (
            <path key={a} d="M0 0 Q14 -10 30 -2 Q14 -4 0 0 Z" fill="#4fae4a" stroke="rgba(30,60,20,.4)" strokeWidth="1" transform={`translate(2 -30) rotate(${a})`} />
          ))}
          <circle cx="2" cy="-28" r="4" fill="#7a4a2a" />
        </g>
      )
    case 'arbusto':
      return (
        <g>
          <circle cx="-14" cy="2" r="12" fill={paleta.folha} {...contorno} />
          <circle cx="12" cy="2" r="13" fill={paleta.folha} {...contorno} />
          <circle cx="0" cy="-8" r="14" fill={paleta.folha} {...contorno} />
          <circle cx="-6" cy="-6" r="2.5" fill="#ff6b7a" /><circle cx="8" cy="-2" r="2.5" fill="#ff6b7a" /><circle cx="-14" cy="0" r="2.5" fill="#ff6b7a" />
        </g>
      )
    case 'tenda':
      return (
        <g>
          <path d="M-30 12 L0 -30 L30 12 Z" fill="#e9c98f" {...contorno} />
          <path d="M-30 12 L0 -30 L-8 12 Z" fill="#d7a861" />
          <path d="M0 -30 L-7 12 L7 12 Z" fill="#6b3f22" />
          <path d="M-22 1 L22 1" stroke="#c0503e" strokeWidth="4" />
          <path d="M0 -30 L0 -40 L12 -36 L0 -33" fill="#c0503e" stroke="#6b3f22" strokeWidth="1" />
        </g>
      )
    case 'ovelha':
      return (
        <g>
          {[[-12, 0], [14, 4]].map(([x, y], k) => (
            <g key={k} transform={`translate(${x} ${y}) scale(${k ? 0.85 : 1})`}>
              <ellipse cx="0" cy="0" rx="13" ry="9" fill="#fff" {...contorno} />
              <circle cx="-8" cy="-6" r="5" fill="#fff" /><circle cx="2" cy="-8" r="5" fill="#fff" />
              <ellipse cx="13" cy="-3" rx="5" ry="6" fill="#4a3a32" />
              <path d="M-6 8 v6 M6 8 v6" stroke="#4a3a32" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ))}
        </g>
      )
    case 'poco':
      return (
        <g>
          <ellipse cx="0" cy="4" rx="20" ry="7" fill="#9c8a74" {...contorno} />
          <path d="M-20 4 V-10 H20 V4" fill="#bfae94" {...contorno} />
          <ellipse cx="0" cy="-10" rx="20" ry="7" fill="#d9cbb3" {...contorno} />
          <ellipse cx="0" cy="-10" rx="14" ry="4" fill="#3d6f9a" />
          <path d="M-16 -10 V-34 M16 -10 V-34 M-20 -34 H20" stroke="#7a4a2a" strokeWidth="4" strokeLinecap="round" />
          <rect x="-5" y="-30" width="10" height="9" rx="2" fill="#8a5a30" />
        </g>
      )
    case 'pedras':
      return (
        <g>
          <ellipse cx="-10" cy="4" rx="16" ry="11" fill="#b9b0a4" {...contorno} />
          <ellipse cx="12" cy="6" rx="12" ry="8" fill="#a59c90" {...contorno} />
          <ellipse cx="0" cy="-8" rx="11" ry="9" fill="#cfc7bb" {...contorno} />
        </g>
      )
    case 'cidade':
      return (
        <g>
          <rect x="-34" y="-12" width="68" height="24" fill="#f0d9a8" {...contorno} />
          <rect x="-30" y="-30" width="18" height="20" fill="#e7c98f" {...contorno} />
          <rect x="10" y="-36" width="20" height="26" fill="#e7c98f" {...contorno} />
          <path d="M-30 -30 h4 v-4 h5 v4 h5 v-4 h4 v4 M10 -36 h5 v-4 h5 v4 h5 v-4 h5 v4" stroke="rgba(40,30,20,.35)" strokeWidth="1.4" fill="none" />
          <path d="M-7 12 V2 a7 7 0 0 1 14 0 V12 Z" fill="#7a4a2a" />
          <rect x="-24" y="-24" width="5" height="6" fill="#7a4a2a" /><rect x="17" y="-28" width="5" height="6" fill="#7a4a2a" />
        </g>
      )
    case 'coluna':
      return (
        <g>
          {[-16, 0, 16].map((cx) => <rect key={cx} x={cx - 4} y="-26" width="8" height="38" fill="#fbf2dc" {...contorno} />)}
          <path d="M-26 -26 L0 -40 L26 -26 Z" fill="#f3e6c4" {...contorno} />
          <rect x="-26" y="10" width="52" height="5" fill="#e3d2a8" {...contorno} />
        </g>
      )
    case 'piramide':
      return (
        <g>
          <path d="M-40 12 L0 -36 L40 12 Z" fill="#f2cf7c" {...contorno} />
          <path d="M0 -36 L40 12 L8 12 Z" fill="#d9a94e" />
        </g>
      )
    case 'torre':
      return (
        <g>
          <path d="M-28 12 L-22 -2 L22 -2 L28 12 Z" fill="#e9b979" {...contorno} />
          <path d="M-20 -2 L-15 -16 L15 -16 L20 -2 Z" fill="#dfa967" {...contorno} />
          <path d="M-13 -16 L-9 -30 L9 -30 L13 -16 Z" fill="#d49a58" {...contorno} />
          <path d="M-7 -30 L-4 -40 L4 -40 L7 -30 Z" fill="#c98b4a" {...contorno} />
        </g>
      )
    case 'pergaminho':
      return (
        <g transform="translate(0 -6)">
          <rect x="-20" y="-12" width="40" height="24" rx="3" fill="#fff4d6" {...contorno} />
          <rect x="-25" y="-15" width="8" height="30" rx="4" fill="#d9b26a" {...contorno} />
          <rect x="17" y="-15" width="8" height="30" rx="4" fill="#d9b26a" {...contorno} />
          <path d="M-12 -5 H12 M-12 0 H12 M-12 5 H6" stroke="#9a7a4e" strokeWidth="1.6" />
        </g>
      )
    default:
      return null
  }
}
