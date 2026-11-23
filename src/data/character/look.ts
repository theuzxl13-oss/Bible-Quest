import type { BeardStyle, BodyBuild, CharacterAppearance, Expressao } from '../../types'
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
  /** Cor dos olhos escolhida (v0.8); ausente = cor original do modelo. */
  eyes?: string
  expressao: Expressao
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
  const c = a.cores ?? {}
  const belt = getItem(a.equipped.cinto) as BeltItem | undefined
  const foot = (getItem(a.equipped.calcado) as FootwearItem | undefined) ?? (getItem('sandalias-simples') as FootwearItem)
  return {
    body: bodyOf(a),
    beard: beardOf(a),
    skin: SKIN_TONES[a.skin] ?? SKIN_TONES[1],
    hair: c.cabelo ?? HAIR_COLORS[a.hairColor] ?? HAIR_COLORS[1],
    hairStyle: a.hairStyle,
    face: a.face,
    tunic: { ...tunic, color: c.tunica ?? dyeT ?? tunic.color },
    mantle: mantle ? { ...mantle, color: c.manto ?? dyeM ?? mantle.color } : undefined,
    foot: c.couro ? { ...foot, color: c.couro } : foot,
    belt: belt && c.faixa ? { ...belt, color: c.faixa } : belt,
    accessories: a.equipped.acessorios.map((id) => getItem(id)).filter(Boolean) as AccessoryItem[],
    eyes: c.olhos,
    expressao: a.expressao ?? 'neutra',
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
  const cores = a.cores ? Object.entries(a.cores).filter(([, v]) => v).sort().map(([k, v]) => `${k}=${v}`).join(',') : ''
  const chave = [a.base, a.skin, a.face, a.hairStyle, a.hairColor, e.tunica, e.manto ?? '-', e.calcado, e.cinto ?? '-', e.acessorios.join(','), bodyOf(a), beardOf(a), dyes]
  // campos da v0.8 só entram quando usados: perfis antigos mantêm a mesma chave
  if (cores || a.expressao) chave.push(cores || '-', a.expressao ?? 'neutra')
  return chave.join('|')
}
