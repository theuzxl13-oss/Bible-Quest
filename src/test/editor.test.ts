import { describe, expect, it } from 'vitest'
import { newAppearance } from '../data/character/bases'
import { appearanceKey, resolveLook } from '../data/character/look'
import { equipItem, isEquipped, unequipItem } from '../services/game/items'
import { REGIOES_COR, definirCor, definirExpressao, restaurarOriginal } from '../services/game/aparencia'
import { MemoryStore } from '../services/storage/keyValueStore'
import { STORAGE_PREFIX } from '../services/storage/repositories'
import { createLocalServices } from '../services'

/* Editor de personagem (v0.8): operações, salvamento e recuperação. */

describe('editor de personagem', () => {
  it('seleção de cabelo: estilo e cor mudam a aparência resolvida', () => {
    const a = newAppearance('viajante', 'Tobias')
    const b = { ...a, hairStyle: 'longo' as const, hairColor: 4 }
    expect(resolveLook(b).hairStyle).toBe('longo')
    expect(resolveLook(b).hair).not.toBe(resolveLook(a).hair)
    expect(appearanceKey(b)).not.toBe(appearanceKey(a))
  })

  it('troca de cores: cor livre por região, validação e retirada', () => {
    const a = newAppearance('viajante', 'Tobias')
    const b = definirCor(definirCor(a, 'cabelo', '#D8B26A'), 'tunica', '#2f4766')
    expect(b.cores).toEqual({ cabelo: '#d8b26a', tunica: '#2f4766' })
    const look = resolveLook(b)
    expect(look.hair).toBe('#d8b26a')
    expect(look.tunic.color).toBe('#2f4766')
    // a cor livre vence o tingimento
    expect(resolveLook({ ...b, dyes: { tunica: 0 } }).tunic.color).toBe('#2f4766')
    // cor inválida é ignorada; retirar volta à cor original
    expect(definirCor(b, 'manto', 'vermelho')).toBe(b)
    const c = definirCor(definirCor(b, 'cabelo', undefined), 'tunica', undefined)
    expect(c.cores).toBeUndefined()
    expect(resolveLook(c).tunic.color).toBe(resolveLook(a).tunic.color)
    // toda região do editor tem paleta com cores válidas
    for (const r of REGIOES_COR) for (const cor of r.paleta) expect(cor).toMatch(/^#[0-9a-f]{6}$/)
    // a mudança de cor muda a chave de identidade visual (todas as telas atualizam)
    expect(appearanceKey(b)).not.toBe(appearanceKey(a))
  })

  it('seleção de roupas e acessórios', () => {
    const a = newAppearance('viajante', 'Tobias')
    const b = equipItem(a, 'tunica-azul')
    expect(b.equipped.tunica).toBe('tunica-azul')
    const c = equipItem(b, 'manto-marrom')
    expect(isEquipped(c, 'manto-marrom')).toBe(true)
    const d = equipItem(unequipItem(c, 'cajado'), 'pergaminho')
    expect(d.equipped.acessorios).toContain('pergaminho')
    expect(d.equipped.acessorios).not.toContain('cajado')
    expect(resolveLook(d).accessories.map((x) => x.kind)).toContain('pergaminho')
  })

  it('expressão de repouso', () => {
    const a = newAppearance('pastora', 'Ana')
    expect(resolveLook(a).expressao).toBe('neutra')
    const b = definirExpressao(a, 'sorriso')
    expect(resolveLook(b).expressao).toBe('sorriso')
    expect(definirExpressao(b, 'neutra').expressao).toBeUndefined()
  })

  it('salvamento local e recuperação depois de "fechar o navegador"', () => {
    const store = new MemoryStore()
    const s = createLocalServices(store)
    const p = s.auth.createLocalProfile({ nickname: 'Tobias', avatar: 'lamp', ageRange: '18mais' })
    const look = definirExpressao(definirCor(equipItem(newAppearance('viajante', 'Tobias'), 'tunica-azul'), 'cabelo', '#9a2f1f'), 'alegria')
    s.auth.update({ ...p, character: look })
    // só identificadores, cores e configurações: nada de modelo no armazenamento
    const salvo = store.get(`${STORAGE_PREFIX}profile`) ?? ''
    expect(salvo.length).toBeLessThan(4000)
    expect(salvo).not.toMatch(/glb|data:/)
    const de_novo = createLocalServices(store).auth.current()?.character
    expect(de_novo).toEqual(look)
  })

  it('valores corrompidos no armazenamento são descartados', () => {
    const store = new MemoryStore()
    const s = createLocalServices(store)
    const p = s.auth.createLocalProfile({ nickname: 'Tobias', avatar: 'lamp', ageRange: '18mais' })
    const bad = { ...newAppearance('viajante', 'Tobias'), cores: { cabelo: 'javascript:alert(1)', tunica: '#2f4766', xyz: '#000000' }, expressao: 'raiva' }
    store.set(`${STORAGE_PREFIX}profile`, JSON.stringify({ ...p, character: bad }))
    const c = createLocalServices(store).auth.current()?.character
    expect(c?.cores).toEqual({ tunica: '#2f4766' })
    expect(c?.expressao).toBeUndefined()
  })

  it('restaurar a aparência original mantém nome e identidade', () => {
    const a = newAppearance('exploradora', 'Lia')
    const mexida = definirExpressao(definirCor(equipItem({ ...a, skin: 5, hairStyle: 'curto' }, 'manto-marrom'), 'faixa', '#8e3328'), 'surpresa')
    const r = restaurarOriginal(mexida)
    const original = newAppearance('exploradora', 'Lia')
    expect(r.id).toBe(a.id)
    expect(r.name).toBe('Lia')
    expect({ ...r, id: '' }).toEqual({ ...original, id: '' })
    expect(r.cores).toBeUndefined()
    expect(r.expressao).toBeUndefined()
  })
})
