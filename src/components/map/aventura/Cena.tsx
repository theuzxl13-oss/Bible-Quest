import { useId } from 'react'
import { Elemento, type TipoElemento } from './Elementos'

/*
 * CENA DE UM MAPA DE AVENTURA (2D em camadas, com sensação de profundidade)
 * - terreno pintado por regiões (cores que se misturam), manchas de grama e terra;
 * - desníveis entre regiões (paredão de pedra com escada onde o caminho passa);
 * - lagos com cachoeira, marcos temáticos e vegetação, sem cobrir o caminho;
 * - caminho de pedra ou de terra ligando as fases.
 * Tudo determinístico (mesma semente = mesmo mapa) e desenhado em código.
 */

export interface Ponto {
  id: string
  x: number
  y: number
}

export interface MarcoZona {
  tipo: TipoElemento
  escala?: number
  /** 'livre' procura o espaço mais vazio; 'topo' fica na parte de cima da região. */
  onde?: 'livre' | 'topo' | 'ceu'
}

export interface Zona {
  /** Índice do primeiro e do último ponto da região (inclusive). */
  de: number
  ate: number
  nome?: string
  chao: [string, string]
  marcos: MarcoZona[]
  agua?: 'lago' | 'cachoeira'
  /** Vegetação de enchimento. */
  vegetacao: TipoElemento[]
  densidade?: number
}

export interface EstiloCaminho {
  borda: string
  base: string
  pedras: string
  brilho: string
  tracejado: string
}

export const CAMINHO_TERRA: EstiloCaminho = { borda: 'rgba(70,40,15,.55)', base: '#b88f58', pedras: '#e2c78f', brilho: 'rgba(255,245,215,.55)', tracejado: '12 5' }
export const CAMINHO_PEDRA: EstiloCaminho = { borda: 'rgba(50,40,30,.6)', base: '#8f8576', pedras: '#d8cdb8', brilho: 'rgba(255,255,255,.45)', tracejado: '16 4' }

const RAIO: Partial<Record<TipoElemento, number>> = {
  arvore: 34, 'arvore-fruto': 34, oliveira: 28, palmeira: 28, arbusto: 22, flores: 14, pedras: 18, 'rocha-grande': 32, trigo: 18,
  sol: 40, altar: 22, ovelhas: 26, arca: 62, 'arco-iris': 70, pomba: 16, 'torre-babel': 56, tenda: 34, camelo: 30, poco: 26,
  'pilar-betel': 18, piramide: 56, celeiro: 28, 'casa-pedra': 30, ruina: 32, templo: 54, biblioteca: 50, 'pergaminho-pedestal': 20,
  ampulheta: 22, livros: 24, 'pedra-inscricao': 20, portal: 34, obelisco: 16, braseiro: 14,
}

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

/** Caminho suave ligando os pontos (curvas de Bézier verticais). */
export function caminhoSuave(pts: Ponto[], inicioY: number, fimY: number) {
  let d = `M ${pts[0].x} ${inicioY} L ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const k = (b.y - a.y) * 0.55
    d += ` C ${a.x} ${a.y + k}, ${b.x} ${b.y - k}, ${b.x} ${b.y}`
  }
  const u = pts[pts.length - 1]
  return `${d} L ${u.x} ${fimY}`
}

function amostrar(pts: Ponto[]) {
  const out: { x: number; y: number }[] = []
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const k = (b.y - a.y) * 0.55
    for (let s = 0; s <= 16; s++) {
      const t = s / 16
      const u = 1 - t
      out.push({
        x: u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x,
        y: u * u * u * a.y + 3 * u * u * t * (a.y + k) + 3 * u * t * t * (b.y - k) + t * t * t * b.y,
      })
    }
  }
  return out
}

/** Contorno orgânico (lago, mancha) em volta de (cx, cy). */
function bolha(cx: number, cy: number, rx: number, ry: number, r: () => number, n = 10) {
  const p = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const k = 0.82 + r() * 0.3
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]
  })
  let d = `M ${(p[0][0] + p[n - 1][0]) / 2} ${(p[0][1] + p[n - 1][1]) / 2}`
  for (let i = 0; i < n; i++) {
    const a = p[i]
    const b = p[(i + 1) % n]
    d += ` Q ${a[0]} ${a[1]} ${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2}`
  }
  return d + ' Z'
}

interface Props {
  W: number
  H: number
  pts: Ponto[]
  d: string
  zonas: Zona[]
  /** y de cada ponto define as faixas das zonas; passo entre pontos. */
  passo: number
  caminho: EstiloCaminho
  semente: string
  /** Montanhas e céu no topo do trecho. */
  horizonte?: { ceu: [string, string]; montanhas: string }
}

export function CenaMapa({ W, H, pts, d, zonas, passo, caminho, semente, horizonte }: Props) {
  const uid = useId().replace(/:/g, '')
  const r = sorteador(semente)
  const amostras = amostrar(pts)
  const ocupados: { x: number; y: number; r: number }[] = []
  const livre = (x: number, y: number, raio: number) =>
    x > raio * 0.5 && x < W - raio * 0.5 &&
    amostras.every((p) => (p.x - x) ** 2 + (p.y - y) ** 2 > (raio + 26) ** 2) &&
    pts.every((p) => (p.x - x) ** 2 + (p.y - y) ** 2 > (raio + 44) ** 2) &&
    ocupados.every((o) => (o.x - x) ** 2 + (o.y - y) ** 2 > (o.r + raio) ** 2 * 0.7)

  // faixa vertical de cada zona (o caminho sobe: índice maior = mais acima)
  const faixa = (z: Zona) => {
    const baixo = Math.min(H, pts[z.de].y + passo / 2)
    const cima = Math.max(0, pts[z.ate].y - passo / 2)
    return { cima: z.ate === pts.length - 1 ? 0 : cima, baixo: z.de === 0 ? H : baixo }
  }

  // gradiente do chão: cada zona com suas cores
  const paradas = zonas.flatMap((z) => {
    const f = faixa(z)
    return [
      { o: f.cima / H, c: z.chao[0] },
      { o: (f.cima + f.baixo) / 2 / H, c: z.chao[1] },
    ]
  }).sort((a, b) => a.o - b.o)

  const desenhados: { el: TipoElemento; x: number; y: number; s: number; esp: boolean; ceu?: boolean }[] = []
  const lagos: { d: string; borda: string; cx: number; cy: number; rx: number; cachoeira: boolean; topo: number }[] = []
  const desniveis: { y: number; d: string; face: string }[] = []
  const manchas: { d: string; cor: string }[] = []

  zonas.forEach((z, zi) => {
    const f = faixa(z)
    const alt = f.baixo - f.cima
    // manchas de grama/terra para textura
    for (let i = 0; i < Math.round(alt / 35); i++) {
      manchas.push({ d: bolha(-W * 0.5 + r() * W * 2, f.cima + r() * alt, 40 + r() * 50, 14 + r() * 16, r, 8), cor: i % 3 === 0 ? 'rgba(120,80,30,.12)' : 'rgba(255,255,255,.08)' })
    }
    // desnível no topo da zona (menos na última)
    if (zi < zonas.length - 1) {
      const y0 = f.cima
      let lin = `M ${-W} ${y0}`
      for (let x = -W; x <= W * 2; x += 40) lin += ` Q ${x + 20} ${y0 + (r() - 0.5) * 10} ${x + 40} ${y0}`
      desniveis.push({ y: y0, d: lin, face: z.chao[1] })
    }
    // água
    if (z.agua) {
      for (let t = 0; t < 60; t++) {
        const rx = 58 + r() * 18
        const cx = r() < 0.5 ? rx * 0.7 + r() * 30 : W - rx * 0.7 - r() * 30
        const cy = f.cima + 50 + r() * Math.max(10, alt - 100)
        if (livre(cx, cy, rx * 0.9)) {
          ocupados.push({ x: cx, y: cy, r: rx })
          lagos.push({ d: bolha(cx, cy, rx, rx * 0.42, r, 12), borda: '', cx, cy, rx, cachoeira: z.agua === 'cachoeira', topo: f.cima })
          break
        }
      }
    }
    // marcos temáticos
    for (const m of z.marcos) {
      const raio = (RAIO[m.tipo] ?? 26) * (m.escala ?? 1)
      if (m.onde === 'ceu') {
        desenhados.push({ el: m.tipo, x: 60 + r() * (W - 120), y: f.cima + 40, s: m.escala ?? 1, esp: false, ceu: true })
        continue
      }
      let feito = false
      for (let t = 0; t < 140 && !feito; t++) {
        const x = raio * 0.6 + r() * (W - raio * 1.2)
        const y = m.onde === 'topo' ? f.cima + raio + r() * Math.min(80, alt * 0.4) : f.cima + raio * 0.8 + r() * Math.max(10, alt - raio * 1.4)
        if (livre(x, y - raio * 0.5, raio)) {
          ocupados.push({ x, y: y - raio * 0.5, r: raio })
          desenhados.push({ el: m.tipo, x, y, s: m.escala ?? 1, esp: r() > 0.5 })
          feito = true
        }
      }
    }
    // vegetação de enchimento
    const n = Math.round((alt / 100) * (z.densidade ?? 3.2))
    for (let i = 0, t = 0; i < n && t < n * 12; t++) {
      const el = z.vegetacao[Math.floor(r() * z.vegetacao.length)]
      const s = 0.75 + r() * 0.4
      const raio = (RAIO[el] ?? 22) * s
      const x = r() * W
      const y = f.cima + 20 + r() * (alt - 20)
      if (livre(x, y - raio * 0.5, raio)) {
        ocupados.push({ x, y: y - raio * 0.5, r: raio })
        desenhados.push({ el, x, y, s, esp: r() > 0.5 })
        i++
      }
    }
    // enchimento nas laterais, visível só em telas largas
    for (let i = 0; i < Math.round(alt / 90); i++) {
      const el = z.vegetacao[Math.floor(r() * z.vegetacao.length)]
      const lado = r() < 0.5 ? -1 : 1
      const x = lado < 0 ? -30 - r() * 170 : W + 30 + r() * 170
      desenhados.push({ el, x, y: f.cima + 30 + r() * (alt - 40), s: 0.8 + r() * 0.5, esp: r() > 0.5 })
    }
  })

  // desenha de trás para a frente (y menor primeiro), céu antes
  desenhados.sort((a, b) => (a.ceu === b.ceu ? a.y - b.y : a.ceu ? -1 : 1))

  // onde o caminho cruza cada desnível: escada
  const escadas = desniveis.map((dv) => {
    const p = amostras.reduce((m, q) => (Math.abs(q.y - dv.y) < Math.abs(m.y - dv.y) ? q : m), amostras[0])
    return { x: p.x, y: dv.y }
  })

  return (
    <svg className="av-cena" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-chao`} x1="0" y1="0" x2="0" y2="1">
          {paradas.map((p, i) => <stop key={i} offset={Math.max(0, Math.min(1, p.o))} stopColor={p.c} />)}
        </linearGradient>
        <radialGradient id={`${uid}-luz`} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#fff3c4" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-agua`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fd0f0" />
          <stop offset="1" stopColor="#2a86c4" />
        </linearGradient>
        <linearGradient id={`${uid}-ceu`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={horizonte?.ceu[0] ?? '#8fc8f0'} />
          <stop offset="1" stopColor={horizonte?.ceu[1] ?? '#dff0f8'} />
        </linearGradient>
        <radialGradient id="av-brilho-portal" cx="50%" cy="60%" r="60%">
          <stop offset="0" stopColor="#e9fbff" />
          <stop offset="1" stopColor="#5ac8f0" />
        </radialGradient>
      </defs>

      <rect x={-W} y="0" width={W * 3} height={H} fill={`url(#${uid}-chao)`} />
      {manchas.map((m, i) => <path key={i} d={m.d} fill={m.cor} />)}

      {horizonte && (
        <g>
          <rect x={-W} y="0" width={W * 3} height="150" fill={`url(#${uid}-ceu)`} />
          <path d={`M ${-W} 120 L -40 70 L 30 96 L 90 40 L 150 92 L 210 56 L 270 98 L 330 50 L 400 88 L 470 60 L ${W * 2} 110 L ${W * 2} 150 L ${-W} 150 Z`} fill={horizonte.montanhas} opacity=".75" />
          <path d="M 90 40 L 104 56 L 96 58 L 84 50 Z M 330 50 L 344 64 L 334 66 L 322 58 Z M 210 56 L 222 70 L 212 70 Z" fill="#fff" opacity=".85" />
          <path d={`M ${-W} 150 Q 0 112 100 134 T 300 128 T ${W * 2} 132 L ${W * 2} 170 L ${-W} 170 Z`} fill={zonas[zonas.length - 1].chao[0]} />
        </g>
      )}

      {desniveis.map((dv, i) => (
        <g key={i}>
          <path d={`${dv.d} L ${W * 2 + 40} ${dv.y + 22} L ${-W} ${dv.y + 22} Z`} fill="#8c7558" />
          {Array.from({ length: 34 }, (_, k) => <path key={k} d={`M ${k * 36 - W + (i * 13) % 20} ${dv.y + 6} l 10 12`} stroke="#6e5a40" strokeWidth="2" opacity=".6" />)}
          <path d={`M ${-W} ${dv.y + 22} H ${W * 2}`} stroke="rgba(40,25,10,.35)" strokeWidth="4" />
          <path d={dv.d} stroke={dv.face} strokeWidth="7" fill="none" />
          <path d={dv.d} stroke="rgba(255,255,255,.35)" strokeWidth="2" fill="none" transform="translate(0 -3)" />
        </g>
      ))}

      {lagos.map((l, i) => (
        <g key={i}>
          {l.cachoeira && (
            <g>
              <rect x={l.cx - 12} y={l.topo} width="24" height={Math.max(0, l.cy - l.topo - l.rx * 0.3)} fill={`url(#${uid}-agua)`} opacity=".9" />
              <path className="av-cachoeira" d={`M ${l.cx - 8} ${l.topo} V ${l.cy - l.rx * 0.3} M ${l.cx} ${l.topo} V ${l.cy - l.rx * 0.3} M ${l.cx + 8} ${l.topo} V ${l.cy - l.rx * 0.3}`} stroke="rgba(255,255,255,.75)" strokeWidth="2" strokeDasharray="8 10" />
            </g>
          )}
          <path d={l.d} fill="#7a6a4a" transform="translate(0 4)" />
          <path d={l.d} fill={`url(#${uid}-agua)`} stroke="#e9d9a8" strokeWidth="4" />
          <ellipse className="av-reflexo" cx={l.cx - l.rx * 0.25} cy={l.cy - 6} rx={l.rx * 0.35} ry="3" fill="rgba(255,255,255,.55)" />
          {l.cachoeira && <ellipse cx={l.cx} cy={l.cy - l.rx * 0.28} rx="18" ry="5" fill="rgba(255,255,255,.8)" />}
        </g>
      ))}

      <ellipse cx={W / 2} cy={H / 2} rx={W} ry={H / 2} fill={`url(#${uid}-luz)`} />

      {desenhados.filter((e) => e.ceu).map((e, i) => <Elemento key={`c${i}`} tipo={e.el} x={e.x} y={e.y} s={e.s} />)}

      {/* caminho */}
      <path d={d} fill="none" stroke={caminho.borda} strokeWidth="38" strokeLinecap="round" transform="translate(0 4)" />
      <path d={d} fill="none" stroke={caminho.base} strokeWidth="34" strokeLinecap="round" />
      <path d={d} fill="none" stroke={caminho.pedras} strokeWidth="26" strokeDasharray={caminho.tracejado} strokeLinecap="butt" />
      <path d={d} fill="none" stroke={caminho.brilho} strokeWidth="3" strokeLinecap="round" transform="translate(-5 -2)" />
      {escadas.map((e, i) => (
        <g key={i}>
          {[0, 7, 14].map((dy) => <rect key={dy} x={e.x - 18} y={e.y + dy} width="36" height="6" rx="2" fill={caminho.pedras} stroke="rgba(60,40,20,.5)" strokeWidth="1.2" />)}
        </g>
      ))}

      {desenhados.filter((e) => !e.ceu).map((e, i) => <Elemento key={i} tipo={e.el} x={e.x} y={e.y} s={e.s} espelho={e.esp} />)}
    </svg>
  )
}
