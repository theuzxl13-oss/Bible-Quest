import type { CharacterAppearance, Expressao, RegiaoCor } from '../../types'
import { newAppearance } from '../../data/character/bases'

/*
 * EDITOR DE PERSONAGEM (v0.8): operações puras sobre a aparência.
 * As telas só chamam estas funções; o salvamento continua pelo saveCharacter
 * (repositório local), que guarda apenas identificadores, cores e configurações.
 */

const HEX = /^#[0-9a-f]{6}$/i

/** Regiões com cor livre, na ordem em que aparecem no editor. */
export const REGIOES_COR: { id: RegiaoCor; label: string; paleta: string[] }[] = [
  { id: 'cabelo', label: 'Cabelo', paleta: ['#1f1510', '#3b2414', '#5a3a22', '#8a5a2b', '#b07a3a', '#d8b26a', '#e9d2a0', '#9a2f1f', '#6e6a66'] },
  { id: 'tunica', label: 'Túnica', paleta: ['#efe4cc', '#e3d3ae', '#b5893f', '#8b5e34', '#5c7046', '#3e5c76', '#2f4766', '#8e3328', '#5b2c5e'] },
  { id: 'manto', label: 'Manto', paleta: ['#6e4426', '#8b5e34', '#4a3324', '#b07a3a', '#5c7046', '#2f4766', '#8e3328', '#5b2c5e', '#3a3532'] },
  { id: 'faixa', label: 'Faixa e cinto', paleta: ['#2b7a8c', '#1e3b4c', '#3e5c76', '#8e3328', '#b5893f', '#5c7046', '#6e4426', '#e3d3ae', '#5b2c5e'] },
  { id: 'couro', label: 'Couro (sandálias e braçadeiras)', paleta: ['#432818', '#5a3a22', '#7a4f2a', '#9a6a3a', '#2e2620', '#6b4a36'] },
]

export const EXPRESSOES: { id: Expressao; label: string }[] = [
  { id: 'neutra', label: 'Serena' },
  { id: 'sorriso', label: 'Sorriso' },
  { id: 'alegria', label: 'Alegre' },
  { id: 'surpresa', label: 'Curiosa' },
]

/** Define (ou, com `undefined`, retira) a cor livre de uma região. Cor inválida é ignorada. */
export function definirCor(a: CharacterAppearance, regiao: RegiaoCor, hex: string | undefined): CharacterAppearance {
  if (hex !== undefined && !HEX.test(hex)) return a
  const cores = { ...a.cores }
  if (hex === undefined) delete cores[regiao]
  else cores[regiao] = hex.toLowerCase()
  const out: CharacterAppearance = { ...a, cores }
  if (Object.keys(cores).length === 0) delete out.cores
  return out
}

export function definirExpressao(a: CharacterAppearance, e: Expressao): CharacterAppearance {
  const out: CharacterAppearance = { ...a, expressao: e }
  if (e === 'neutra') delete out.expressao
  return out
}

/** Aparência original do personagem-base, mantendo a identidade (id) e o nome. */
export function restaurarOriginal(a: CharacterAppearance): CharacterAppearance {
  const base = newAppearance(a.base, a.name)
  return { ...base, id: a.id, name: a.name }
}
