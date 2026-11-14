/*
 * ELEMENTOS ILUSTRADOS DOS MAPAS DE AVENTURA
 * Desenhos em SVG com volume (tom claro, médio e escuro, brilho e contorno),
 * no estilo de RPG de aventura das referências. Cada elemento é desenhado com
 * a base (ponto de contato com o chão) em (0, 0); o mapa só posiciona e escala.
 * Nada aqui é imagem externa.
 */

export type TipoElemento =
  // natureza
  | 'arvore' | 'arvore-fruto' | 'oliveira' | 'palmeira' | 'arbusto' | 'flores' | 'pedras' | 'rocha-grande' | 'trigo'
  // Gênesis
  | 'sol' | 'altar' | 'ovelhas' | 'arca' | 'arco-iris' | 'pomba' | 'torre-babel' | 'tenda' | 'camelo' | 'poco'
  | 'pilar-betel' | 'piramide' | 'celeiro' | 'casa-pedra' | 'ruina'
  // Quiz
  | 'templo' | 'biblioteca' | 'pergaminho-pedestal' | 'ampulheta' | 'livros' | 'pedra-inscricao' | 'portal' | 'obelisco' | 'braseiro'

const C = { contorno: '#3b2414', sombra: 'rgba(30,20,10,.28)' }
const traco = { stroke: C.contorno, strokeWidth: 1.6, strokeLinejoin: 'round' as const }

function Sombra({ rx = 24, ry = 6 }: { rx?: number; ry?: number }) {
  return <ellipse cx="0" cy="1" rx={rx} ry={ry} fill={C.sombra} />
}

function Copa({ x, y, r, cores }: { x: number; y: number; r: number; cores: [string, string, string] }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={cores[2]} {...traco} />
      <circle cx={x - r * 0.12} cy={y - r * 0.12} r={r * 0.82} fill={cores[1]} />
      <circle cx={x - r * 0.3} cy={y - r * 0.32} r={r * 0.42} fill={cores[0]} />
    </g>
  )
}

const VERDE: [string, string, string] = ['#a6d86a', '#5fae3e', '#2f6e2a']

export function Elemento({ tipo, x, y, s = 1, espelho = false }: { tipo: TipoElemento; x: number; y: number; s?: number; espelho?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${espelho ? -s : s} ${s})`}>{desenho(tipo)}</g>
}

function desenho(tipo: TipoElemento) {
  switch (tipo) {
    case 'arvore':
    case 'arvore-fruto':
      return (
        <g>
          <Sombra rx={30} ry={8} />
          <path d="M-6 0 Q-4 -18 -9 -30 L-3 -32 Q2 -20 2 -10 Q4 -22 10 -30 L14 -27 Q6 -16 6 0 Z" fill="#7a4a26" {...traco} />
          <Copa x={-16} y={-40} r={18} cores={VERDE} />
          <Copa x={16} y={-42} r={19} cores={VERDE} />
          <Copa x={0} y={-58} r={22} cores={VERDE} />
          {tipo === 'arvore-fruto' && [[-18, -38], [12, -46], [2, -62], [20, -34], [-6, -50]].map(([a, b], i) => (
            <g key={i}><circle cx={a} cy={b} r="3.6" fill="#e2483a" stroke="#7a1f16" strokeWidth="1" /><circle cx={a - 1} cy={b - 1} r="1.1" fill="#ffd0c4" /></g>
          ))}
        </g>
      )
    case 'oliveira':
      return (
        <g>
          <Sombra rx={26} ry={7} />
          <path d="M-4 0 Q-8 -14 -2 -22 Q-10 -28 -6 -36 M0 -22 Q6 -28 10 -34" stroke="#6b4a2b" strokeWidth="6" fill="none" strokeLinecap="round" />
          <Copa x={-14} y={-38} r={13} cores={['#c5d9a0', '#93b071', '#56703f']} />
          <Copa x={12} y={-40} r={14} cores={['#c5d9a0', '#93b071', '#56703f']} />
          <Copa x={-1} y={-50} r={15} cores={['#c5d9a0', '#93b071', '#56703f']} />
        </g>
      )
    case 'palmeira':
      return (
        <g>
          <Sombra rx={20} ry={6} />
          <path d="M-3 0 Q2 -30 6 -62 L11 -61 Q8 -30 4 0 Z" fill="#9a6a3a" {...traco} />
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d="M0 -1 Q-1 -6 -2 -11" stroke="#6e4826" strokeWidth="1.2" transform={`translate(${3 + i * 0.6} ${-8 - i * 9})`} />)}
          {[-160, -125, -85, -45, -10, 25].map((a) => (
            <path key={a} d="M0 0 Q18 -12 40 -4 Q20 -2 0 3 Z" fill={a % 2 ? '#4fae4a' : '#3d9440'} {...traco} transform={`translate(8 -62) rotate(${a})`} />
          ))}
          <circle cx="6" cy="-58" r="4" fill="#7a4a26" {...traco} />
        </g>
      )
    case 'arbusto':
      return (
        <g>
          <Sombra rx={22} ry={6} />
          <Copa x={-12} y={-10} r={12} cores={VERDE} />
          <Copa x={12} y={-10} r={13} cores={VERDE} />
          <Copa x={0} y={-18} r={14} cores={VERDE} />
          {[[-8, -16], [9, -12], [-14, -8], [4, -24]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r="2.4" fill={i % 2 ? '#ffd34d' : '#ff6b7a'} />)}
        </g>
      )
    case 'flores':
      return (
        <g>
          {[[-10, 0, '#ff8fb1'], [0, -4, '#ffd34d'], [10, 1, '#ffffff'], [4, 5, '#c58bff']].map(([a, b, c], i) => (
            <g key={i} transform={`translate(${a} ${b})`}>
              <path d="M0 0 V6" stroke="#3f7a2a" strokeWidth="1.4" />
              {[0, 72, 144, 216, 288].map((r) => <circle key={r} cx="0" cy="-3" r="2.6" fill={c as string} stroke="rgba(0,0,0,.2)" strokeWidth=".5" transform={`rotate(${r})`} />)}
              <circle r="1.8" fill="#f5b81e" />
            </g>
          ))}
        </g>
      )
    case 'pedras':
      return (
        <g>
          <Sombra rx={20} ry={5} />
          <path d="M-20 0 Q-22 -12 -10 -14 Q0 -16 2 -6 L4 0 Z" fill="#a49a8c" {...traco} />
          <path d="M0 0 Q2 -10 12 -10 Q22 -9 20 0 Z" fill="#8f8577" {...traco} />
          <path d="M-14 -11 Q-8 -13 -4 -10" stroke="#d6cdbf" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'rocha-grande':
      return (
        <g>
          <Sombra rx={34} ry={8} />
          <path d="M-32 0 L-28 -26 L-12 -40 L8 -38 L26 -22 L32 0 Z" fill="#9c8f7c" {...traco} />
          <path d="M-12 -40 L-4 -14 L-28 -26 Z" fill="#b8ab96" />
          <path d="M8 -38 L26 -22 L32 0 L4 0 L-4 -14 Z" fill="#7d7160" />
        </g>
      )
    case 'trigo':
      return (
        <g>
          {[-14, -7, 0, 7, 14].map((dx, i) => (
            <g key={i} transform={`translate(${dx} 0) rotate(${(i - 2) * 5})`}>
              <path d="M0 0 V-22" stroke="#b58b2e" strokeWidth="1.6" />
              <ellipse cx="0" cy="-26" rx="3" ry="7" fill="#e8bf4a" stroke="#9a7020" strokeWidth="1" />
            </g>
          ))}
        </g>
      )
    case 'sol':
      return (
        <g className="av-sol">
          {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -30 L4 -46 L-4 -46 Z" fill="#ffd84d" opacity=".85" transform={`rotate(${i * 30})`} />)}
          <circle r="26" fill="#ffe27a" stroke="#e0a21c" strokeWidth="2" />
          <circle cx="-7" cy="-8" r="9" fill="#fff6c8" opacity=".8" />
        </g>
      )
    case 'altar':
      return (
        <g>
          <Sombra rx={22} ry={6} />
          <path d="M-18 0 L-16 -10 L16 -10 L18 0 Z" fill="#9c8f7c" {...traco} />
          <path d="M-14 -10 L-12 -20 L12 -20 L14 -10 Z" fill="#b2a690" {...traco} />
          <path d="M-8 -20 Q-2 -28 0 -22 Q4 -30 8 -20 Z" fill="#ff9a2e" stroke="#c4501a" strokeWidth="1" />
          <path className="av-fumaca" d="M0 -26 Q-6 -36 2 -44 Q10 -52 4 -62" stroke="rgba(230,230,230,.75)" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'ovelhas':
      return (
        <g>
          {[[-14, 0, 1], [12, 4, 0.85], [0, -10, 0.75]].map(([dx, dy, k], i) => (
            <g key={i} transform={`translate(${dx} ${dy}) scale(${k})`}>
              <ellipse cx="0" cy="2" rx="14" ry="3" fill={C.sombra} />
              <path d="M-6 0 V6 M6 0 V6" stroke="#3a2c26" strokeWidth="2.6" strokeLinecap="round" />
              <ellipse cx="0" cy="-6" rx="13" ry="9" fill="#fbf8f0" {...traco} />
              <circle cx="-7" cy="-12" r="5" fill="#fff" /><circle cx="3" cy="-14" r="5" fill="#fff" />
              <ellipse cx="13" cy="-9" rx="5" ry="6" fill="#4a3a32" {...traco} />
            </g>
          ))}
        </g>
      )
    case 'arca':
      return (
        <g>
          <Sombra rx={64} ry={10} />
          <path d="M-62 -18 L62 -18 L48 4 L-48 4 Z" fill="#8a5a30" {...traco} />
          <path d="M-62 -18 L62 -18 L58 -12 L-58 -12 Z" fill="#a8723f" />
          {[-8, -2].map((dy) => <path key={dy} d={`M-56 ${dy} H56`} stroke="#5e3a1c" strokeWidth="1.2" opacity=".7" />)}
          <rect x="-40" y="-40" width="72" height="22" fill="#9a6838" {...traco} />
          {[-30, -14, 2, 18].map((dx) => <rect key={dx} x={dx} y="-34" width="8" height="7" rx="1" fill="#3f2512" />)}
          <path d="M-46 -40 L-4 -56 L38 -40 Z" fill="#7a4a24" {...traco} />
          <path d="M-46 -40 L-4 -56 L-4 -48 L-30 -40 Z" fill="#956035" />
        </g>
      )
    case 'arco-iris':
      return (
        <g opacity=".85">
          {['#ff5a4e', '#ffa53a', '#ffe14d', '#62c95a', '#4aa3e8', '#7a5ad8'].map((c, i) => (
            <path key={c} d={`M${-90 + i * 6} 0 A${90 - i * 6} ${74 - i * 5} 0 0 1 ${90 - i * 6} 0`} stroke={c} strokeWidth="6.5" fill="none" />
          ))}
        </g>
      )
    case 'pomba':
      return (
        <g className="av-pomba">
          <path d="M-12 0 Q-4 -10 6 -4 Q14 -14 22 -12 Q16 -4 8 2 Q0 6 -12 0 Z" fill="#ffffff" {...traco} />
          <path d="M-12 0 L-18 -2 L-14 3 Z" fill="#fff" {...traco} />
          <path d="M8 -2 L12 -2" stroke="#e8a23a" strokeWidth="2" />
          <path d="M10 -1 Q16 2 20 0" stroke="#4f8a32" strokeWidth="2" fill="none" />
        </g>
      )
    case 'torre-babel':
      return (
        <g>
          <Sombra rx={58} ry={10} />
          {[[54, 0], [44, -22], [34, -44], [24, -66], [14, -86]].map(([w, y], i) => (
            <g key={i}>
              <path d={`M${-w} ${y} L${-w + 6} ${y - 22} L${w - 6} ${y - 22} L${w} ${y} Z`} fill={['#d9a467', '#cf975a', '#c58a4e', '#ba7d43', '#ae713a'][i]} {...traco} />
              <path d={`M${-w + 6} ${y - 22} L${-w + 10} ${y - 18} L${w - 10} ${y - 18} L${w - 6} ${y - 22} Z`} fill="#e9c08a" opacity=".7" />
              {Array.from({ length: Math.floor(w / 9) }, (_, k) => <rect key={k} x={-w + 12 + k * 18} y={y - 15} width="5" height="8" rx="2" fill="#5a3418" opacity=".8" />)}
            </g>
          ))}
          <path d="M-14 -108 L-8 -118 L8 -118 L14 -108" fill="#9e6532" {...traco} />
        </g>
      )
    case 'tenda':
      return (
        <g>
          <Sombra rx={34} ry={7} />
          <path d="M-34 0 L0 -44 L34 0 Z" fill="#e8c88a" {...traco} />
          <path d="M-34 0 L0 -44 L-12 0 Z" fill="#d4a95f" />
          <path d="M-22 -14 L22 -14" stroke="#b5452f" strokeWidth="4" />
          <path d="M0 -44 L-8 0 L8 0 Z" fill="#5a3418" {...traco} />
          <path d="M0 -44 V-54 L13 -50 L0 -47" fill="#c24a32" {...traco} />
        </g>
      )
    case 'camelo':
      return (
        <g>
          <Sombra rx={26} ry={5} />
          <path d="M-16 0 V-18 M-8 0 V-18 M10 0 V-18 M16 0 V-18" stroke="#9a6a3a" strokeWidth="4" strokeLinecap="round" />
          <path d="M-22 -16 Q-22 -30 -12 -32 Q-6 -46 2 -32 Q8 -44 14 -30 Q20 -26 20 -16 Z" fill="#c99a5b" {...traco} />
          <path d="M18 -22 Q26 -30 26 -42 Q30 -46 36 -42 L36 -38 L30 -38 Q30 -26 22 -14 Z" fill="#c99a5b" {...traco} />
          <circle cx="32" cy="-42" r="1.2" fill="#2a1a10" />
          <path d="M-10 -30 Q0 -24 10 -30" stroke="#b5452f" strokeWidth="3" fill="none" />
        </g>
      )
    case 'poco':
      return (
        <g>
          <Sombra rx={26} ry={7} />
          <path d="M-22 0 V-18 H22 V0 Z" fill="#b0a28a" {...traco} />
          {[-16, -2, 12].map((dx) => <path key={dx} d={`M${dx} -18 v18`} stroke="#8a7d68" strokeWidth="1" />)}
          <ellipse cx="0" cy="-18" rx="22" ry="7" fill="#cfc2a8" {...traco} />
          <ellipse cx="0" cy="-18" rx="15" ry="4" fill="#2f6f9a" />
          <path d="M-18 -18 V-46 M18 -18 V-46 M-22 -46 H22" stroke="#7a4a26" strokeWidth="4" strokeLinecap="round" />
          <path d="M0 -46 V-34" stroke="#5a3418" strokeWidth="1.4" />
          <rect x="-5" y="-34" width="10" height="9" rx="2" fill="#8a5a30" {...traco} />
        </g>
      )
    case 'pilar-betel':
      return (
        <g>
          <Sombra rx={16} ry={5} />
          <path d="M-9 0 L-11 -40 Q0 -46 11 -40 L9 0 Z" fill="#a89c88" {...traco} />
          <path d="M-11 -40 Q0 -46 11 -40 Q0 -36 -11 -40 Z" fill="#c9bea9" />
          <path d="M-6 -30 Q0 -32 6 -30" stroke="#d6a84a" strokeWidth="2" fill="none" />
          {Array.from({ length: 5 }, (_, i) => <path key={i} d="M0 -48 L0 -60" stroke="#ffe7a3" strokeWidth="2" opacity=".7" transform={`rotate(${(i - 2) * 22} 0 -46)`} />)}
        </g>
      )
    case 'piramide':
      return (
        <g>
          <Sombra rx={60} ry={8} />
          <path d="M-58 0 L0 -70 L58 0 Z" fill="#f0c873" {...traco} />
          <path d="M0 -70 L58 0 L12 0 Z" fill="#cf9f4a" />
          {[14, 28, 42, 56].map((h) => <path key={h} d={`M${-58 + h * 0.83} ${-h} H${-h * 0.17 + 0}`} stroke="#c28f3c" strokeWidth="1" opacity=".6" />)}
        </g>
      )
    case 'celeiro':
      return (
        <g>
          <Sombra rx={30} ry={6} />
          <path d="M-26 0 V-26 Q0 -50 26 -26 V0 Z" fill="#e3c38a" {...traco} />
          <path d="M-26 -26 Q0 -50 26 -26" fill="none" stroke="#b98a45" strokeWidth="3" />
          <rect x="-7" y="-16" width="14" height="16" rx="7" fill="#5a3418" />
          {[-16, 16].map((dx) => <rect key={dx} x={dx - 3} y="-20" width="6" height="6" fill="#5a3418" />)}
        </g>
      )
    case 'casa-pedra':
      return (
        <g>
          <Sombra rx={30} ry={6} />
          <rect x="-26" y="-28" width="52" height="28" fill="#d9c49e" {...traco} />
          <rect x="-26" y="-34" width="52" height="7" fill="#bfa77c" {...traco} />
          {[[-20, -22], [-6, -14], [8, -24], [14, -10]].map(([a, b], i) => <rect key={i} x={a} y={b} width="9" height="5" rx="1" fill="#c4ae86" />)}
          <path d="M-6 0 V-14 a6 6 0 0 1 12 0 V0 Z" fill="#5a3418" />
          <rect x="12" y="-24" width="7" height="7" fill="#5a3418" />
        </g>
      )
    case 'ruina':
      return (
        <g>
          <Sombra rx={34} ry={6} />
          <path d="M-30 0 V-30 H-18 V-22 H-10 V0 Z" fill="#cdbb98" {...traco} />
          <path d="M6 0 V-40 H16 V-34 H22 V0 Z" fill="#c0ad88" {...traco} />
          <path d="M-10 -8 H6" stroke="#a8946d" strokeWidth="5" />
          <path d="M-26 -18 H-20 M10 -26 H18" stroke="#a8946d" strokeWidth="1.5" />
        </g>
      )
    case 'templo':
      return (
        <g>
          <Sombra rx={58} ry={9} />
          <rect x="-52" y="-8" width="104" height="8" fill="#d8c6a0" {...traco} />
          <rect x="-46" y="-14" width="92" height="7" fill="#e6d6b2" {...traco} />
          {[-36, -18, 0, 18, 36].map((dx) => (
            <g key={dx}>
              <rect x={dx - 5} y="-56" width="10" height="42" fill="#f2e6c8" {...traco} />
              <path d={`M${dx - 2} -54 V-16`} stroke="#d6c39b" strokeWidth="2" />
            </g>
          ))}
          <rect x="-48" y="-64" width="96" height="8" fill="#e6d6b2" {...traco} />
          <path d="M-52 -64 L0 -88 L52 -64 Z" fill="#d8c6a0" {...traco} />
          <circle cx="0" cy="-73" r="5" fill="#d4a84a" {...traco} />
        </g>
      )
    case 'biblioteca':
      return (
        <g>
          <Sombra rx={52} ry={8} />
          <rect x="-46" y="-50" width="92" height="50" fill="#d9b98a" {...traco} />
          <path d="M-50 -50 H50 L44 -58 H-44 Z" fill="#b88d58" {...traco} />
          <path d="M-20 -58 A20 22 0 0 1 20 -58 Z" fill="#6e8fc0" {...traco} />
          {[-30, -10, 10, 30].map((dx) => (
            <g key={dx}>
              <path d={`M${dx - 7} -12 V-32 a7 7 0 0 1 14 0 V-12 Z`} fill="#4a2c18" />
              {[0, 1, 2].map((k) => <rect key={k} x={dx - 5} y={-30 + k * 6} width="10" height="3" fill={['#c0392b', '#2e86c1', '#d4ac0d'][k]} />)}
            </g>
          ))}
          <rect x="-50" y="-4" width="100" height="4" fill="#b88d58" />
        </g>
      )
    case 'pergaminho-pedestal':
      return (
        <g>
          <Sombra rx={20} ry={5} />
          <path d="M-12 0 L-9 -26 L9 -26 L12 0 Z" fill="#cdbb98" {...traco} />
          <rect x="-15" y="-30" width="30" height="5" fill="#b8a47c" {...traco} />
          <g transform="translate(0 -40) rotate(-8)">
            <rect x="-16" y="-9" width="32" height="18" rx="2" fill="#fbefcf" {...traco} />
            <rect x="-20" y="-11" width="6" height="22" rx="3" fill="#d6a84a" {...traco} />
            <rect x="14" y="-11" width="6" height="22" rx="3" fill="#d6a84a" {...traco} />
            <path d="M-10 -3 H10 M-10 2 H6" stroke="#9a7a4e" strokeWidth="1.3" />
          </g>
        </g>
      )
    case 'ampulheta':
      return (
        <g>
          <Sombra rx={20} ry={5} />
          <rect x="-18" y="-6" width="36" height="6" rx="1" fill="#8a5a30" {...traco} />
          <rect x="-18" y="-62" width="36" height="6" rx="1" fill="#8a5a30" {...traco} />
          <path d="M-14 -6 V-56 M14 -6 V-56" stroke="#6b4423" strokeWidth="3" />
          <path d="M-11 -56 Q-11 -38 0 -31 Q11 -38 11 -56 Z M-11 -6 Q-11 -24 0 -31 Q11 -24 11 -6 Z" fill="rgba(210,235,255,.55)" stroke="#4a6a80" strokeWidth="1.2" />
          <path d="M-7 -49 Q0 -42 7 -49 Z M-9 -6 Q0 -18 9 -6 Z" fill="#e2b04a" />
          <path className="av-areia" d="M0 -31 V-12" stroke="#e2b04a" strokeWidth="1.6" />
        </g>
      )
    case 'livros':
      return (
        <g>
          <Sombra rx={24} ry={5} />
          {[['#7a2f2f', -22, 0], ['#2f5f7a', -20, -8], ['#3f6e3a', -24, -16], ['#7a5a2f', -18, -24]].map(([c, x, y], i) => (
            <g key={i}>
              <rect x={x as number} y={(y as number) - 8} width="40" height="8" rx="1.5" fill={c as string} {...traco} />
              <rect x={(x as number) + 34} y={(y as number) - 7} width="5" height="6" fill="#fbefcf" />
              <path d={`M${(x as number) + 6} ${(y as number) - 4} h16`} stroke="#e6c26a" strokeWidth="1.4" />
            </g>
          ))}
        </g>
      )
    case 'pedra-inscricao':
      return (
        <g>
          <Sombra rx={22} ry={6} />
          <path d="M-18 0 L-18 -34 Q0 -46 18 -34 L18 0 Z" fill="#b6aa94" {...traco} />
          <path d="M-12 -30 Q0 -38 12 -30" stroke="#d4c8b2" strokeWidth="2" fill="none" />
          {[-24, -17, -10].map((y) => <path key={y} d={`M-10 ${y} h${y === -10 ? 12 : 20}`} stroke="#6e6252" strokeWidth="1.6" strokeDasharray="3 2" />)}
        </g>
      )
    case 'portal':
      return (
        <g>
          <Sombra rx={36} ry={7} />
          <path d="M-32 0 V-46 A32 30 0 0 1 32 -46 V0 H20 V-44 A20 18 0 0 0 -20 -44 V0 Z" fill="#c9b48c" {...traco} />
          <path d="M-20 0 V-44 A20 18 0 0 1 20 -44 V0 Z" fill="url(#av-brilho-portal)" />
          {[-28, -14, 0, 14, 28].map((dx, i) => <rect key={i} x={dx - 3} y={-72 + Math.abs(dx) * 0.55} width="6" height="5" fill="#a8946d" />)}
        </g>
      )
    case 'obelisco':
      return (
        <g>
          <Sombra rx={16} ry={5} />
          <path d="M-9 0 L-6 -62 L0 -72 L6 -62 L9 0 Z" fill="#d9c49e" {...traco} />
          <path d="M0 -72 L6 -62 L9 0 L2 0 Z" fill="#bfa77c" />
          {[-50, -40, -30].map((y) => <path key={y} d={`M-3 ${y} h5`} stroke="#8a7550" strokeWidth="1.4" />)}
        </g>
      )
    case 'braseiro':
      return (
        <g>
          <Sombra rx={14} ry={4} />
          <path d="M-3 0 L-1 -22 H1 L3 0 Z" fill="#6b4423" {...traco} />
          <path d="M-10 -22 H10 L7 -30 H-7 Z" fill="#8a5a30" {...traco} />
          <path className="av-chama" d="M-6 -30 Q-8 -40 0 -48 Q2 -40 6 -42 Q8 -36 6 -30 Z" fill="#ff9a2e" stroke="#c4501a" strokeWidth="1" />
          <path d="M-2 -30 Q-3 -36 1 -40 Q3 -34 2 -30 Z" fill="#ffe27a" />
        </g>
      )
    default:
      return null
  }
}
