import type { CharacterAppearance } from '../../types'

/*
 * PERSONAGENS-BASE
 * Pontos de partida diversos para o aventureiro do jogador. Nenhum deles é
 * um personagem bíblico. Todos usam apenas itens iniciais.
 */
export interface CharacterBase {
  id: string
  label: string
  description: string
  preset: Omit<CharacterAppearance, 'version' | 'id' | 'name' | 'base'>
}

export const SKIN_TONES = ['#f3d2b3', '#e2b48c', '#c98e62', '#a8693f', '#7d4a2b', '#5a3520']
export const HAIR_COLORS = ['#2b1d14', '#5a3a22', '#8a5a2b', '#b9772f', '#d9cdb8', '#141414']
export const HAIR_COLOR_LABEL = ['Castanho-escuro', 'Castanho', 'Castanho-claro', 'Ruivo', 'Grisalho', 'Preto']

export const BASES: CharacterBase[] = [
  { id: 'viajante', label: 'Viajante', description: 'Passos leves e cajado na mão.', preset: { skin: 1, face: 'suave', hairStyle: 'curto', hairColor: 1, equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: ['cajado'] } } },
  { id: 'pastora', label: 'Pastora', description: 'Manto quente para os campos.', preset: { skin: 3, face: 'suave', hairStyle: 'tranca', hairColor: 5, equipped: { tunica: 'tunica-linho', manto: 'manto-marrom', calcado: 'sandalias-simples', cinto: 'cinto-corda', acessorios: ['cajado'] } } },
  { id: 'escriba', label: 'Escriba', description: 'Curioso, sempre com um pergaminho.', preset: { skin: 4, face: 'barba', hairStyle: 'raspado', hairColor: 0, equipped: { tunica: 'tunica-linho', manto: null, calcado: 'sandalias-claras', cinto: 'cinto-corda', acessorios: ['pergaminho'] } } },
  { id: 'exploradora', label: 'Exploradora', description: 'Bolsa de couro e olhar atento.', preset: { skin: 2, face: 'sardas', hairStyle: 'coque', hairColor: 3, equipped: { tunica: 'tunica-azul', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: ['bolsa'] } } },
  { id: 'mensageiro', label: 'Mensageiro', description: 'Leva notícias de vila em vila.', preset: { skin: 5, face: 'suave', hairStyle: 'cacheado', hairColor: 5, equipped: { tunica: 'tunica-linho', manto: 'manto-marrom', calcado: 'sandalias-claras', cinto: 'cinto-couro', acessorios: ['bolsa'] } } },
  { id: 'guardia', label: 'Guardiã da lâmpada', description: 'Ilumina o caminho à noite.', preset: { skin: 0, face: 'suave', hairStyle: 'longo', hairColor: 3, equipped: { tunica: 'tunica-terra', manto: 'manto-marrom', calcado: 'sandalias-simples', cinto: 'cinto-corda', acessorios: ['lamparina'] } } },
  { id: 'peregrino', label: 'Peregrino', description: 'Muitos caminhos já percorridos.', preset: { skin: 2, face: 'barba', hairStyle: 'curto', hairColor: 4, equipped: { tunica: 'tunica-terra', manto: 'manto-marrom', calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: ['cajado'] } } },
  { id: 'contadora', label: 'Contadora de histórias', description: 'Guarda na memória tudo o que ouve.', preset: { skin: 4, face: 'marcante', hairStyle: 'ondulado', hairColor: 0, equipped: { tunica: 'tunica-azul', manto: null, calcado: 'sandalias-claras', cinto: 'cinto-corda', acessorios: ['pergaminho'] } } },
]

export function newAppearance(baseId: string, name: string): CharacterAppearance {
  const b = BASES.find((x) => x.id === baseId) ?? BASES[0]
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `aventureiro-${Date.now().toString(36)}`
  return { version: 2, id, name, base: b.id, ...structuredClone(b.preset) }
}
