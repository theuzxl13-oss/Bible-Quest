import type { BeardStyle, BodyBuild, CharacterAppearance } from '../../types'
import { HAIR_COLORS, SKIN_TONES } from './bases'
import { getItem, type AccessoryItem, type BeltItem, type FootwearItem, type MantleItem, type TunicItem } from './items'

/*
 * APARÊNCIA RESOLVIDA
 * Ponto único que transforma a configuração salva do jogador nos valores
 * concretos usados pelos renderizadores (3D e 2D). Campos novos (v0.5) têm
 * valores padrão deduzidos, para que perfis antigos continuem iguais.
 */

/** Tingimentos naturais disponíveis para túnicas e mantos (corantes conhecidos na Antiguidade). */
export const DYES: { label: string; color: string }[] = [
  { label: 'Linho cru', color: '#e3d3ae' },
  { label: 'Terra', color: '#8b5e34' },
  { label: 'Ocre', color: '#b5893f' },
  { label: 'Oliva', color: '#5c7046' },
  { label: 'Índigo', color: '#2f4766' },
  { label: 'Garança (vermelho)', color: '#8e3328' },
  { label: 'Púrpura', color: '#5b2c5e' },
  { label: 'Carvão', color: '#3a3532' },
]

/** Bases cujo padrão é a estrutura feminina. */
const FEMININE_BASES = new Set(['pastora', 'exploradora', 'guardia', 'contadora'])

export interface ResolvedLook {
  body: BodyBuild
  beard: BeardStyle
  skin: string
  hair: string
  hairStyle: CharacterAppearance['hairStyle']
  face: CharacterAppearance['face']
  tunic: TunicItem & { color: string }
  mantle?: MantleItem & { color: string }
  foot: FootwearItem
  belt?: BeltItem
  accessories: AccessoryItem[]
}

export function bodyOf(a: CharacterAppearance): BodyBuild {
  return a.body ?? (FEMININE_BASES.has(a.base) ? 'feminino' : 'masculino')
}

export function beardOf(a: CharacterAppearance): BeardStyle {
  if (bodyOf(a) === 'feminino') return 'nenhuma'
  return a.beard ?? (a.face === 'barba' ? 'curta' : 'nenhuma')
}

export function resolveLook(a: CharacterAppearance): ResolvedLook {
  const tunic = (getItem(a.equipped.tunica) as TunicItem | undefined) ?? (getItem('tunica-linho') as TunicItem)
  const mantle = getItem(a.equipped.manto) as MantleItem | undefined
  const dyeT = a.dyes?.tunica !== undefined ? DYES[a.dyes.tunica]?.color : undefined
  const dyeM = a.dyes?.manto !== undefined ? DYES[a.dyes.manto]?.color : undefined
  return {
    body: bodyOf(a),
    beard: beardOf(a),
    skin: SKIN_TONES[a.skin] ?? SKIN_TONES[1],
    hair: HAIR_COLORS[a.hairColor] ?? HAIR_COLORS[1],
    hairStyle: a.hairStyle,
    face: a.face,
    tunic: { ...tunic, color: dyeT ?? tunic.color },
    mantle: mantle ? { ...mantle, color: dyeM ?? mantle.color } : undefined,
    foot: (getItem(a.equipped.calcado) as FootwearItem | undefined) ?? (getItem('sandalias-simples') as FootwearItem),
    belt: getItem(a.equipped.cinto) as BeltItem | undefined,
    accessories: a.equipped.acessorios.map((id) => getItem(id)).filter(Boolean) as AccessoryItem[],
  }
}

/**
 * Identidade visual completa do personagem, em texto. É exposta no atributo
 * `data-appearance` de todo personagem desenhado, o que permite verificar
 * (nos testes e na auditoria) que todas as telas mostram exatamente o mesmo.
 */
export function appearanceKey(a: CharacterAppearance): string {
  const e = a.equipped
  const dyes = `${a.dyes?.tunica ?? '-'}/${a.dyes?.manto ?? '-'}`
  return [a.base, a.skin, a.face, a.hairStyle, a.hairColor, e.tunica, e.manto ?? '-', e.calcado, e.cinto ?? '-', e.acessorios.join(','), bodyOf(a), beardOf(a), dyes].join('|')
}
