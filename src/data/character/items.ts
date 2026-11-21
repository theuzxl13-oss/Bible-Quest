/*
 * CATÁLOGO DE ITENS DO PERSONAGEM
 * Vestimentas inspiradas em tecidos e roupas dos períodos bíblicos: túnicas
 * de linho e lã, mantos, xales, sandálias de couro, cintos de corda, couro
 * ou tecido. Nada moderno. Cada item tem uma forma visual real (renderizada
 * em components/character/Character.tsx) e um requisito de desbloqueio
 * conquistado jogando. Não existe compra com dinheiro.
 */

export type ItemSlot = 'tunica' | 'manto' | 'calcado' | 'cinto' | 'acessorio'
/** Acessórios ocupam posições diferentes; só um por posição. */
export type AccessoryPlace = 'mao' | 'cintura' | 'cabeca' | 'pescoco'

export type Requirement =
  | { kind: 'inicial' }
  | { kind: 'nivel'; value: number }
  | { kind: 'estrelas'; value: number }
  | { kind: 'conquista'; id: string }
  | { kind: 'livro'; id: string }
  | { kind: 'bau'; id: string }
  | { kind: 'quiz-regiao'; id: string }
  | { kind: 'sequencia'; value: number }

interface ItemBase {
  id: string
  slot: ItemSlot
  name: string
  description: string
  unlock: Requirement
}

export interface TunicItem extends ItemBase {
  slot: 'tunica'
  color: string
  trim?: string
  stripes?: string
  short?: boolean
}
export interface MantleItem extends ItemBase {
  slot: 'manto'
  color: string
  style: 'manto' | 'capuz' | 'xale' | 'longo'
  trim?: string
  stripes?: string
}
export interface FootwearItem extends ItemBase {
  slot: 'calcado'
  color: string
  style: 'simples' | 'tiras' | 'botas'
}
export interface BeltItem extends ItemBase {
  slot: 'cinto'
  color: string
  style: 'corda' | 'couro' | 'faixa'
  buckle?: string
}
export interface AccessoryItem extends ItemBase {
  slot: 'acessorio'
  place: AccessoryPlace
  kind: 'cajado' | 'bolsa' | 'pergaminho' | 'lamparina' | 'odre' | 'lenco' | 'louros' | 'colar' | 'cesto'
  color?: string
}

export type CharacterItem = TunicItem | MantleItem | FootwearItem | BeltItem | AccessoryItem

export const ITEMS: CharacterItem[] = [
  // Túnicas
  { id: 'tunica-linho', slot: 'tunica', name: 'Túnica de linho', description: 'Linho claro, tecido comum no antigo Oriente Médio.', color: '#e6d6b4', unlock: { kind: 'inicial' } },
  { id: 'tunica-terra', slot: 'tunica', name: 'Túnica cor de terra', description: 'Lã tingida em tons de terra, prática para viagens.', color: '#8b5e34', unlock: { kind: 'inicial' } },
  { id: 'tunica-azul', slot: 'tunica', name: 'Túnica azul', description: 'Tingida com corantes vegetais.', color: '#3e5c76', unlock: { kind: 'inicial' } },
  { id: 'tunica-oliva', slot: 'tunica', name: 'Túnica oliva', description: 'Verde dos olivais.', color: '#5c7046', unlock: { kind: 'nivel', value: 2 } },
  { id: 'tunica-vinho', slot: 'tunica', name: 'Túnica cor de vinho', description: 'Um tom profundo, tingido com raízes.', color: '#7a2e2e', unlock: { kind: 'nivel', value: 3 } },
  { id: 'tunica-listrada', slot: 'tunica', name: 'Túnica listrada', description: 'Linho com listras tecidas no tear.', color: '#e2d0a8', stripes: '#8b5e34', unlock: { kind: 'estrelas', value: 15 } },
  { id: 'tunica-bordada', slot: 'tunica', name: 'Túnica com barra bordada', description: 'Barra dourada para quem completou Gênesis.', color: '#efe3c4', trim: '#c9a24a', unlock: { kind: 'livro', id: 'genesis' } },
  { id: 'tunica-purpura', slot: 'tunica', name: 'Túnica púrpura', description: 'A púrpura era um corante raro e valioso.', color: '#5b2c5e', trim: '#d4af5a', unlock: { kind: 'nivel', value: 8 } },
  // Mantos
  { id: 'manto-marrom', slot: 'manto', name: 'Manto marrom', description: 'Manto de lã para os dias frios.', color: '#6b4a2b', style: 'manto', unlock: { kind: 'inicial' } },
  { id: 'manto-azul', slot: 'manto', name: 'Manto azul-escuro', description: 'Lã densa, tingida de anil.', color: '#2c3f5c', style: 'manto', unlock: { kind: 'nivel', value: 2 } },
  { id: 'manto-capuz', slot: 'manto', name: 'Manto com capuz', description: 'Proteção contra o sol e a areia do deserto.', color: '#b9a27a', style: 'capuz', unlock: { kind: 'conquista', id: 'primeiro-passo' } },
  { id: 'xale-listrado', slot: 'manto', name: 'Xale listrado', description: 'Xale de lã com listras escuras.', color: '#efe3c4', style: 'xale', stripes: '#3e5c76', unlock: { kind: 'estrelas', value: 30 } },
  { id: 'manto-pastor', slot: 'manto', name: 'Manto de pastor', description: 'Lã crua, presente do baú do fim de Gênesis.', color: '#f1ead8', style: 'longo', trim: '#8b5e34', unlock: { kind: 'bau', id: 'bau-mundo-genesis-20' } },
  { id: 'manto-viajante', slot: 'manto', name: 'Manto verde de viajante', description: 'Conquistado no Vale dos Iniciantes do Modo Quiz.', color: '#3f5a3a', style: 'capuz', unlock: { kind: 'quiz-regiao', id: 'vale' } },
  { id: 'manto-vermelho', slot: 'manto', name: 'Manto carmesim', description: 'Tingido de carmesim, cor citada na construção do tabernáculo.', color: '#8e2a2a', style: 'longo', unlock: { kind: 'nivel', value: 5 } },
  { id: 'manto-dourado', slot: 'manto', name: 'Manto com bordas douradas', description: 'Para quem completou Êxodo.', color: '#2b2b44', style: 'longo', trim: '#d4af5a', unlock: { kind: 'livro', id: 'exodo' } },
  // Calçados
  { id: 'sandalias-simples', slot: 'calcado', name: 'Sandálias simples', description: 'Sola de couro presa por uma tira.', color: '#5b3b22', style: 'simples', unlock: { kind: 'inicial' } },
  { id: 'sandalias-claras', slot: 'calcado', name: 'Sandálias claras', description: 'Couro curtido em tom claro.', color: '#a8794a', style: 'simples', unlock: { kind: 'inicial' } },
  { id: 'sandalias-tiras', slot: 'calcado', name: 'Sandálias de tiras', description: 'Tiras cruzadas até o tornozelo.', color: '#6b4423', style: 'tiras', unlock: { kind: 'nivel', value: 2 } },
  { id: 'sandalias-escuras', slot: 'calcado', name: 'Sandálias de couro escuro', description: 'Para quem mantém a constância por 3 dias.', color: '#2e1f14', style: 'tiras', unlock: { kind: 'sequencia', value: 3 } },
  { id: 'botas-viagem', slot: 'calcado', name: 'Botas de viagem', description: 'Couro envolvendo os pés para longas caminhadas.', color: '#4a3220', style: 'botas', unlock: { kind: 'quiz-regiao', id: 'planicie' } },
  // Cintos
  { id: 'cinto-corda', slot: 'cinto', name: 'Cinto de corda', description: 'Corda de fibra trançada.', color: '#c4a46a', style: 'corda', unlock: { kind: 'inicial' } },
  { id: 'cinto-couro', slot: 'cinto', name: 'Cinto de couro', description: 'Couro simples com nó.', color: '#5b3b22', style: 'couro', unlock: { kind: 'inicial' } },
  { id: 'faixa-vermelha', slot: 'cinto', name: 'Faixa de tecido vermelha', description: 'Faixa larga enrolada na cintura.', color: '#9b3a2a', style: 'faixa', unlock: { kind: 'nivel', value: 3 } },
  { id: 'cinto-bronze', slot: 'cinto', name: 'Cinto com fivela de bronze', description: 'Encontrado no baú da metade de Gênesis.', color: '#4a3220', style: 'couro', buckle: '#c08a3e', unlock: { kind: 'bau', id: 'bau-mundo-genesis-10' } },
  { id: 'faixa-dourada', slot: 'cinto', name: 'Faixa dourada', description: 'Para quem brilhou com 3 estrelas em 5 fases.', color: '#c9a24a', style: 'faixa', unlock: { kind: 'conquista', id: 'tres-estrelas' } },
  // Acessórios
  { id: 'cajado', slot: 'acessorio', place: 'mao', kind: 'cajado', name: 'Cajado', description: 'Bordão de madeira para os caminhos.', unlock: { kind: 'inicial' } },
  { id: 'pergaminho', slot: 'acessorio', place: 'mao', kind: 'pergaminho', name: 'Pergaminho', description: 'Rolo para registrar o que aprendeu.', unlock: { kind: 'inicial' } },
  { id: 'lamparina', slot: 'acessorio', place: 'mao', kind: 'lamparina', name: 'Lamparina de barro', description: 'Lamparina de óleo, comum nas casas antigas.', unlock: { kind: 'inicial' } },
  { id: 'bolsa', slot: 'acessorio', place: 'cintura', kind: 'bolsa', name: 'Bolsa de couro', description: 'Levada a tiracolo.', unlock: { kind: 'inicial' } },
  { id: 'odre', slot: 'acessorio', place: 'cintura', kind: 'odre', name: 'Odre de água', description: 'Recipiente de couro para água. Achado no primeiro baú.', unlock: { kind: 'bau', id: 'bau-mundo-genesis-5' } },
  { id: 'cesto', slot: 'acessorio', place: 'mao', kind: 'cesto', name: 'Cesto de vime', description: 'Para quem concluiu o primeiro desafio diário.', unlock: { kind: 'conquista', id: 'diario-1' } },
  { id: 'lenco', slot: 'acessorio', place: 'cabeca', kind: 'lenco', name: 'Lenço de cabeça', description: 'Tecido que protege do sol.', color: '#d9c7a0', unlock: { kind: 'nivel', value: 4 } },
  { id: 'colar', slot: 'acessorio', place: 'pescoco', kind: 'colar', name: 'Colar de contas', description: 'Contas de barro e pedra. Para colecionadores de histórias.', unlock: { kind: 'conquista', id: 'colecionador' } },
  { id: 'louros', slot: 'acessorio', place: 'cabeca', kind: 'louros', name: 'Coroa de folhas', description: 'Ramos entrelaçados para quem vence a Torre dos Especialistas.', unlock: { kind: 'quiz-regiao', id: 'torre' } },
]

export function getItem(id: string | null | undefined): CharacterItem | undefined {
  return id ? ITEMS.find((i) => i.id === id) : undefined
}

export const SLOT_LABEL: Record<ItemSlot, string> = {
  tunica: 'Túnicas',
  manto: 'Mantos',
  calcado: 'Calçados',
  cinto: 'Cintos',
  acessorio: 'Acessórios',
}

export const PLACE_LABEL: Record<AccessoryPlace, string> = {
  mao: 'na mão',
  cintura: 'na cintura',
  cabeca: 'na cabeça',
  pescoco: 'no pescoço',
}
