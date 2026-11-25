import { describe, expect, it } from 'vitest'
import { BASES, BASES_ANTIGAS, newAppearance } from '../data/character/bases'
import { bodyOf, beardOf, converterParaBasesAtuais, desfazerConversao, resolveLook } from '../data/character/look'
import { equipItem } from '../services/game/items'
import { definirCor, definirExpressao } from '../services/game/aparencia'
import { MemoryStore } from '../services/storage/keyValueStore'
import { BACKUP_BASES_KEY, STORAGE_PREFIX, emptyProgress } from '../services/storage/repositories'
import { createLocalServices } from '../services'
import type { CharacterAppearance } from '../types'

/*
 * Reformulação visual, entrega 1 (personagens): os oito personagens-base antigos viram
 * as duas bases atuais (masculino e feminino) sem perder nada do perfil salvo.
 * A conversão é segura (cópia do perfil original), testada e reversível.
 */

function perfilAntigo(baseId: string): CharacterAppearance {
  // aparência personalizada: itens, tingimento, cores livres, expressão e barba explícita (quando houver)
  let a = newAppearance(baseId, `Teste ${baseId}`)
  a = equipItem(a, 'tunica-azul')
  a = definirCor(a, 'cabelo', '#9a2f1f')
  a = definirExpressao(a, 'sorriso')
  return { ...a, dyes: { manto: 2 }, hairColor: 3, skin: 4 }
}

describe('conversão das oito bases antigas para as duas atuais', () => {
  it('só existem duas bases para escolher, e as oito antigas continuam conhecidas', () => {
    expect(BASES.map((b) => b.id)).toEqual(['masculino', 'feminino'])
    expect(BASES_ANTIGAS.map((b) => b.id)).toEqual(['viajante', 'pastora', 'escriba', 'exploradora', 'mensageiro', 'guardia', 'peregrino', 'contadora'])
  })

  for (const antiga of ['viajante', 'pastora', 'escriba', 'exploradora', 'mensageiro', 'guardia', 'peregrino', 'contadora']) {
    it(`perfil "${antiga}": converte sem perder itens, cores, cabelo, pele, barba, expressão nem progresso`, () => {
      const store = new MemoryStore()
      const s = createLocalServices(store)
      const p = s.auth.createLocalProfile({ nickname: 'Teste', avatar: 'lamp', ageRange: '18mais' })
      const original = perfilAntigo(antiga)
      const anterior = newAppearance(antiga, 'Antes')
      const progresso = { ...emptyProgress(), xp: 1234, items: { unlocked: { 'manto-azul': '2026-11-11T00:00:00.000Z' }, unseen: [] } }
      s.progress.save(progresso)
      // grava como uma versão antiga do jogo gravaria (sem passar pela conversão)
      const bruto = JSON.stringify({ ...p, character: original, previousCharacter: anterior })
      store.set(`${STORAGE_PREFIX}profile`, bruto)

      const de_novo = createLocalServices(store)
      const c = de_novo.auth.current()!.character!
      const corpo = bodyOf(original)
      expect(c.base).toBe(corpo)
      expect(c.body).toBe(corpo)
      expect(c.baseOriginal).toBe(antiga)
      expect(c.beard).toBe(beardOf(original))
      // o que aparece no personagem é exatamente o mesmo (o rosto "barba" antigo vira "suave" com a barba explícita)
      const semRosto = (x: CharacterAppearance) => ({ ...resolveLook(x), face: null })
      expect(semRosto(c)).toEqual(semRosto(original))
      expect(c.face).toBe(original.face === 'barba' ? 'suave' : original.face)
      expect(c.equipped).toEqual(original.equipped)
      expect(c.cores).toEqual(original.cores)
      expect(c.dyes).toEqual(original.dyes)
      expect(c.expressao).toBe('sorriso')
      expect([c.skin, c.hairStyle, c.hairColor, c.name, c.id]).toEqual([original.skin, original.hairStyle, original.hairColor, original.name, original.id])
      // a aparência anterior ("restaurar aparência anterior") também é convertida
      expect(de_novo.auth.current()!.previousCharacter!.baseOriginal).toBe(antiga)
      // progresso e itens intactos
      expect(de_novo.progress.load()).toEqual(s.progress.load())
      expect(de_novo.progress.load().xp).toBe(1234)
      // cópia de segurança do perfil original, byte a byte
      expect(store.get(BACKUP_BASES_KEY)).toBe(bruto)
      // reversível: desfazer volta ao personagem-base antigo, com o resto igual
      const volta = desfazerConversao(c)
      expect(volta.base).toBe(antiga)
      expect(volta.baseOriginal).toBeUndefined()
      expect(semRosto(volta)).toEqual(semRosto(original))
    })
  }

  it('a conversão é idempotente e a cópia de segurança não é sobrescrita', () => {
    const store = new MemoryStore()
    const s = createLocalServices(store)
    const p = s.auth.createLocalProfile({ nickname: 'Teste', avatar: 'lamp', ageRange: '18mais' })
    const bruto = JSON.stringify({ ...p, character: perfilAntigo('escriba') })
    store.set(`${STORAGE_PREFIX}profile`, bruto)
    const a = createLocalServices(store)
    const c = a.auth.current()!.character!
    expect(converterParaBasesAtuais(c)).toBe(c)
    // o jogo salva o perfil convertido; carregar de novo não muda nada nem mexe na cópia
    a.auth.update(a.auth.current()!)
    const b = createLocalServices(store)
    expect(b.auth.current()!.character).toEqual(c)
    expect(store.get(BACKUP_BASES_KEY)).toBe(bruto)
  })

  it('o escriba (rosto "barba") continua com barba e com o rosto suave', () => {
    const c = converterParaBasesAtuais(newAppearance('escriba', 'Esdras'))
    expect(c).toMatchObject({ base: 'masculino', body: 'masculino', beard: 'curta', face: 'suave', baseOriginal: 'escriba' })
  })

  it('perfis novos (bases atuais) não ganham cópia de segurança nem baseOriginal', () => {
    const store = new MemoryStore()
    const s = createLocalServices(store)
    const p = s.auth.createLocalProfile({ nickname: 'Teste', avatar: 'lamp', ageRange: '18mais' })
    s.auth.update({ ...p, character: newAppearance('feminino', 'Ana') })
    const c = createLocalServices(store).auth.current()!.character!
    expect(c.baseOriginal).toBeUndefined()
    expect(store.get(BACKUP_BASES_KEY)).toBeNull()
  })

  it('baseOriginal inválido vindo do armazenamento é descartado', () => {
    const store = new MemoryStore()
    const s = createLocalServices(store)
    const p = s.auth.createLocalProfile({ nickname: 'Teste', avatar: 'lamp', ageRange: '18mais' })
    store.set(`${STORAGE_PREFIX}profile`, JSON.stringify({ ...p, character: { ...newAppearance('masculino', 'Jo'), baseOriginal: '<script>' } }))
    expect(createLocalServices(store).auth.current()!.character!.baseOriginal).toBeUndefined()
  })
})
