import { describe, expect, it } from 'vitest'
import { MemoryStore } from '../services/storage/keyValueStore'
import { LocalProgressRepository, LocalSettingsRepository, STORAGE_PREFIX, emptyProgress, DEFAULT_SETTINGS } from '../services/storage/repositories'
import { createLocalServices } from '../services'
import { sanitizeNickname } from '../services/auth'
import { DemoMultiplayerService } from '../services/multiplayer/demoMultiplayer'
import { generateRoomCode, isValidRoomCode } from '../services/multiplayer/contracts'
import { readSupabaseConfig } from '../services/supabase/config'

describe('persistência local', () => {
  it('salva e recarrega progresso', () => {
    const store = new MemoryStore()
    const repo = new LocalProgressRepository(store)
    const p = emptyProgress()
    p.xp = 120
    p.chapters['criacao-1'] = { completed: true, bestStars: 2, bestScore: 40, attempts: 1 }
    repo.save(p)
    expect(new LocalProgressRepository(store).load()).toEqual(p)
  })

  it('ignora dados corrompidos sem quebrar', () => {
    const store = new MemoryStore()
    store.set(`${STORAGE_PREFIX}progress`, '{nao é json')
    store.set(`${STORAGE_PREFIX}settings`, 'null')
    expect(new LocalProgressRepository(store).load()).toEqual(emptyProgress())
    expect(new LocalSettingsRepository(store).load()).toEqual(DEFAULT_SETTINGS)
  })

  it('perfil local sem senha, com apelido saneado', () => {
    const s = createLocalServices(new MemoryStore())
    expect(s.auth.current()).toBeNull()
    const p = s.auth.createLocalProfile({ nickname: '  <b>Ana</b>  ', avatar: 'lamp', ageRange: '13a17' })
    expect(p.nickname).toBe('bAnab')
    expect(p.storage).toBe('local')
    expect(Object.keys(p)).not.toContain('password')
    expect(s.auth.current()?.id).toBe(p.id)
    s.auth.signOut()
    expect(s.auth.current()).toBeNull()
  })

  it('rejeita apelidos curtos e limita o tamanho', () => {
    const s = createLocalServices(new MemoryStore())
    expect(() => s.auth.createLocalProfile({ nickname: ' a ', avatar: 'lamp', ageRange: '18mais' })).toThrow()
    expect(sanitizeNickname('x'.repeat(40))).toHaveLength(20)
  })
})

describe('multiplayer (demonstração)', () => {
  it('gera códigos válidos sem caracteres ambíguos', () => {
    for (let i = 0; i < 50; i++) {
      const c = generateRoomCode()
      expect(isValidRoomCode(c)).toBe(true)
      expect(c).not.toMatch(/[01OI]/)
    }
  })

  it('cria sala com participantes fictícios identificados e não simula entrada online', async () => {
    const svc = new DemoMultiplayerService()
    expect(svc.mode).toBe('demo')
    const room = await svc.createRoom({ hostNickname: 'Ana', journeyId: 'noe', questionCount: 5 })
    expect(room.questionIds).toHaveLength(5)
    expect(room.players.filter((p) => p.isDemoBot)).toHaveLength(3)
    expect(room.players.every((p) => p.isDemoBot === p.nickname.startsWith('Participante fictício'))).toBe(true)
    await expect(svc.joinRoom('ABCDEF', 'Ana')).rejects.toThrow(/servidor/)
  })

  it('termina a partida quando todos respondem', async () => {
    const svc = new DemoMultiplayerService()
    const room = await svc.createRoom({ hostNickname: 'Ana', journeyId: 'todas', questionCount: 3 })
    const events: string[] = []
    svc.subscribe(room.id, (e) => events.push(e.type))
    await svc.startMatch(room.id)
    for (const q of room.questionIds) await svc.submitAnswer(room.id, 'you', q, true, 10)
    expect(events).toContain('match-finished')
  })
})

describe('configuração do Supabase', () => {
  it('fica desconectado sem variáveis públicas', () => {
    expect(readSupabaseConfig({})).toBeNull()
    expect(readSupabaseConfig({ VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_ANON_KEY: 'anon' })).toEqual({ url: 'https://x.supabase.co', anonKey: 'anon' })
  })
})
