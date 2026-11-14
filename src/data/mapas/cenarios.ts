import type { Zona } from '../../components/map/aventura/Cena'

/*
 * CENÁRIOS DOS MAPAS DE AVENTURA
 * Cada trecho do mapa é dividido em regiões (zonas) pelos acontecimentos:
 * cores do chão, marcos temáticos (arca, torre, tendas, pirâmides) e vegetação.
 * As zonas são definidas pela ordem das FASES (1, 2, 3...); os baús ficam na
 * região da fase anterior. Para um mundo sem cenário próprio, usa-se o genérico.
 */

/** Zona descrita por número de fase (1 = primeira fase do mundo). */
export interface ZonaPorFase extends Omit<Zona, 'de' | 'ate'> {
  fases: [number, number]
}

const VEG_VERDE = ['arvore', 'arvore', 'arbusto', 'flores', 'pedras'] as Zona['vegetacao']

export const CENARIO_MUNDO: Record<string, ZonaPorFase[]> = {
  'mundo-genesis': [
    { fases: [1, 2], nome: 'A criação', chao: ['#bfe67a', '#7fc451'], marcos: [{ tipo: 'arvore-fruto', escala: 1.15 }, { tipo: 'flores' }, { tipo: 'flores' }, { tipo: 'ovelhas', escala: 0.8 }], agua: 'lago', vegetacao: VEG_VERDE, densidade: 3.6 },
    { fases: [3, 4], nome: 'O jardim do Éden', chao: ['#9fd862', '#4f9e3c'], marcos: [{ tipo: 'arvore-fruto', escala: 1.25 }, { tipo: 'arvore-fruto' }, { tipo: 'oliveira' }], agua: 'cachoeira', vegetacao: ['arvore', 'arvore-fruto', 'arbusto', 'flores'], densidade: 4 },
    { fases: [5, 5], nome: 'Caim e Abel', chao: ['#d6df86', '#a9bf5a'], marcos: [{ tipo: 'altar' }, { tipo: 'ovelhas' }, { tipo: 'trigo' }, { tipo: 'trigo' }], vegetacao: ['trigo', 'arbusto', 'pedras'], densidade: 3 },
    { fases: [6, 10], nome: 'Noé e o dilúvio', chao: ['#a6d98a', '#5c9f6e'], marcos: [{ tipo: 'arca', escala: 1.05 }, { tipo: 'arco-iris', escala: 0.8 }, { tipo: 'pomba', onde: 'ceu' }, { tipo: 'rocha-grande' }], agua: 'cachoeira', vegetacao: ['arvore', 'pedras', 'arbusto', 'oliveira'], densidade: 3 },
    { fases: [11, 11], nome: 'A torre de Babel', chao: ['#e6cf94', '#c9a868'], marcos: [{ tipo: 'torre-babel', escala: 1 }, { tipo: 'ruina' }, { tipo: 'casa-pedra' }], vegetacao: ['pedras', 'palmeira', 'arbusto'], densidade: 2.4 },
    { fases: [12, 14], nome: 'Abraão', chao: ['#d3d88e', '#a7b45e'], marcos: [{ tipo: 'tenda' }, { tipo: 'tenda', escala: 0.85 }, { tipo: 'camelo' }, { tipo: 'altar' }, { tipo: 'oliveira', escala: 1.2 }], vegetacao: ['oliveira', 'arbusto', 'pedras', 'palmeira'], densidade: 3 },
    { fases: [15, 18], nome: 'Isaque e Jacó', chao: ['#b9df7e', '#79b553'], marcos: [{ tipo: 'poco' }, { tipo: 'pilar-betel' }, { tipo: 'ovelhas' }, { tipo: 'tenda' }], agua: 'lago', vegetacao: ['arvore', 'oliveira', 'arbusto', 'flores', 'pedras'], densidade: 3.4 },
    { fases: [19, 20], nome: 'José no Egito', chao: ['#f3dc9c', '#e0bb6c'], marcos: [{ tipo: 'piramide', onde: 'topo' }, { tipo: 'celeiro' }, { tipo: 'casa-pedra' }, { tipo: 'palmeira' }], agua: 'lago', vegetacao: ['palmeira', 'palmeira', 'pedras'], densidade: 2.6 },
  ],
  // Êxodo: o Nilo, Midiã, o Egito das pragas, o mar e o Sinai
  'mundo-exodo': [
    { fases: [1, 1], nome: 'O rio Nilo', chao: ['#cfe08e', '#9cbf5e'], marcos: [{ tipo: 'cesto-juncos' }, { tipo: 'juncos' }, { tipo: 'piramide', onde: 'topo' }, { tipo: 'palmeira' }], agua: 'lago', vegetacao: ['palmeira', 'juncos', 'arbusto', 'pedras'], densidade: 3 },
    { fases: [2, 2], nome: 'O deserto de Midiã', chao: ['#ecd496', '#c9a868'], marcos: [{ tipo: 'sarca', escala: 1.2 }, { tipo: 'ovelhas' }, { tipo: 'rocha-grande' }, { tipo: 'tenda' }], vegetacao: ['pedras', 'arbusto', 'palmeira'], densidade: 2.6 },
    { fases: [3, 3], nome: 'As pragas no Egito', chao: ['#f0d898', '#d6b06a'], marcos: [{ tipo: 'porta-pascoa' }, { tipo: 'obelisco' }, { tipo: 'casa-pedra' }, { tipo: 'piramide', onde: 'topo' }], vegetacao: ['palmeira', 'pedras'], densidade: 2.4 },
    { fases: [4, 4], nome: 'O mar e o monte Sinai', chao: ['#e2c98c', '#b99a62'], marcos: [{ tipo: 'mar-aberto', escala: 1.05 }, { tipo: 'monte-sinai', onde: 'topo' }, { tipo: 'tabuas' }, { tipo: 'coluna-fogo' }], agua: 'lago', vegetacao: ['pedras', 'palmeira', 'arbusto'], densidade: 2.4 },
  ],
}

/** Cenário genérico (mundos ainda sem cenário próprio), pelos elementos do mundo. */
export function cenarioGenerico(fases: number): ZonaPorFase[] {
  const meio = Math.max(1, Math.ceil(fases / 2))
  return [
    { fases: [1, meio], nome: 'Deserto', chao: ['#f1d898', '#d9b26a'], marcos: [{ tipo: 'piramide', onde: 'topo' }, { tipo: 'palmeira' }, { tipo: 'tenda' }], agua: 'lago', vegetacao: ['palmeira', 'pedras', 'arbusto'], densidade: 2.6 },
    { fases: [meio + 1, Math.max(meio + 1, fases)], nome: 'Monte', chao: ['#e2c98c', '#b99a62'], marcos: [{ tipo: 'rocha-grande', escala: 1.3 }, { tipo: 'tenda' }, { tipo: 'altar' }], vegetacao: ['pedras', 'palmeira', 'arbusto'], densidade: 2.4 },
  ]
}

/** Regiões do mapa do Modo Quiz: conhecimento, templos e enigmas. */
export const CENARIO_QUIZ: Record<string, ZonaPorFase[]> = {
  vale: [
    { fases: [1, 2], nome: 'Pátio dos pergaminhos', chao: ['#c9dd8a', '#8fb862'], marcos: [{ tipo: 'pergaminho-pedestal' }, { tipo: 'livros' }, { tipo: 'braseiro' }], agua: 'lago', vegetacao: ['arvore', 'arbusto', 'pedras', 'flores'], densidade: 3 },
    { fases: [3, 4], nome: 'Jardim dos enigmas', chao: ['#d9d895', '#b0b56a'], marcos: [{ tipo: 'ampulheta', escala: 1.2 }, { tipo: 'pedra-inscricao' }, { tipo: 'obelisco' }], vegetacao: ['oliveira', 'pedras', 'arbusto'], densidade: 2.8 },
    { fases: [5, 6], nome: 'Biblioteca antiga', chao: ['#e3d4a2', '#c2ab76'], marcos: [{ tipo: 'biblioteca', onde: 'topo' }, { tipo: 'portal' }, { tipo: 'livros' }, { tipo: 'braseiro' }], agua: 'cachoeira', vegetacao: ['palmeira', 'pedras', 'arbusto'], densidade: 2.6 },
  ],
  planicie: [
    { fases: [1, 3], nome: 'Campos do saber', chao: ['#ecd88e', '#d1b062'], marcos: [{ tipo: 'pedra-inscricao' }, { tipo: 'ampulheta' }, { tipo: 'trigo' }], vegetacao: ['trigo', 'oliveira', 'pedras'], densidade: 3 },
    { fases: [4, 6], nome: 'Templo da planície', chao: ['#e6cf94', '#c9a868'], marcos: [{ tipo: 'templo', onde: 'topo' }, { tipo: 'obelisco' }, { tipo: 'braseiro' }], agua: 'lago', vegetacao: ['palmeira', 'pedras'], densidade: 2.6 },
  ],
  montanhas: [
    { fases: [1, 3], nome: 'Trilha dos sábios', chao: ['#c8d6b0', '#94a882'], marcos: [{ tipo: 'rocha-grande', escala: 1.2 }, { tipo: 'pergaminho-pedestal' }, { tipo: 'portal' }], agua: 'cachoeira', vegetacao: ['pedras', 'oliveira', 'arvore'], densidade: 3 },
    { fases: [4, 6], nome: 'Biblioteca da montanha', chao: ['#d6d0c0', '#aaa08c'], marcos: [{ tipo: 'biblioteca', onde: 'topo' }, { tipo: 'livros' }, { tipo: 'ampulheta' }], vegetacao: ['pedras', 'rocha-grande', 'oliveira'], densidade: 2.4 },
  ],
  torre: [
    { fases: [1, 3], nome: 'Escadaria', chao: ['#e2c9a4', '#bf9f74'], marcos: [{ tipo: 'obelisco' }, { tipo: 'braseiro' }, { tipo: 'pedra-inscricao' }], vegetacao: ['pedras', 'palmeira'], densidade: 2.4 },
    { fases: [4, 6], nome: 'Torre dos especialistas', chao: ['#d9b98c', '#b48f62'], marcos: [{ tipo: 'templo', onde: 'topo' }, { tipo: 'portal' }, { tipo: 'braseiro' }], agua: 'lago', vegetacao: ['pedras', 'palmeira'], densidade: 2.2 },
  ],
}

/**
 * Converte zonas por fase em zonas por índice de nó (o mapa tem baús entre as
 * fases). `fasesDosNos[i]` é o número da fase do nó i (baús herdam a anterior).
 */
export function zonasPorNo(zonas: ZonaPorFase[], fasesDosNos: number[]): Zona[] {
  return zonas
    .map(({ fases: [a, b], ...z }) => {
      const de = fasesDosNos.findIndex((f) => f >= a)
      let ate = -1
      fasesDosNos.forEach((f, i) => { if (f <= b) ate = i })
      return { ...z, de, ate }
    })
    .filter((z) => z.de >= 0 && z.ate >= z.de)
    .map((z, i, arr) => ({ ...z, de: i === 0 ? 0 : arr[i - 1].ate + 1, ate: i === arr.length - 1 ? fasesDosNos.length - 1 : z.ate }))
}

/** Cenário de fundo de uma partida: as cores e os marcos da região. */
export interface CenarioPartida {
  nome: string
  chao: [string, string]
  marcos: Zona['marcos']
  vegetacao: Zona['vegetacao']
  agua?: Zona['agua']
}

const PARA_PARTIDA = (z: ZonaPorFase): CenarioPartida => ({ nome: z.nome ?? '', chao: z.chao, marcos: z.marcos, vegetacao: z.vegetacao, agua: z.agua })

/** Biblioteca antiga: cenário padrão do treino livre e do desafio diário. */
export const CENARIO_BIBLIOTECA: CenarioPartida = PARA_PARTIDA(CENARIO_QUIZ.vale[2])

/** Região do mapa do Modo História em que fica a fase (n = posição da fase no mundo, a partir de 1). */
export function cenarioDaFaseNoMundo(mundoId: string, n: number, totalFases: number): CenarioPartida {
  const zonas = CENARIO_MUNDO[mundoId] ?? cenarioGenerico(totalFases)
  return PARA_PARTIDA(zonas.find((z) => n >= z.fases[0] && n <= z.fases[1]) ?? zonas[0])
}

/** Região do mapa do Modo Quiz em que fica o desafio (n a partir de 1). */
export function cenarioDoDesafio(regiaoId: string, n: number): CenarioPartida {
  const zonas = CENARIO_QUIZ[regiaoId] ?? CENARIO_QUIZ.vale
  return PARA_PARTIDA(zonas.find((z) => n >= z.fases[0] && n <= z.fases[1]) ?? zonas[0])
}

/** Paisagens das telas do acampamento. */
export const CENARIO_PAGINAS: Record<'biblioteca' | 'conquistas' | 'perfil', CenarioPartida> = {
  biblioteca: CENARIO_BIBLIOTECA,
  conquistas: { nome: 'Salão das conquistas', chao: ['#e6cf94', '#c9a868'], marcos: [{ tipo: 'templo' }, { tipo: 'obelisco' }, { tipo: 'braseiro' }, { tipo: 'pergaminho-pedestal' }], vegetacao: ['palmeira', 'pedras', 'oliveira'] },
  perfil: { nome: 'Acampamento', chao: ['#cfe08e', '#9cbf5e'], marcos: [{ tipo: 'tenda' }, { tipo: 'tenda' }, { tipo: 'braseiro' }, { tipo: 'ovelhas' }], vegetacao: ['oliveira', 'arbusto', 'flores'] },
}
