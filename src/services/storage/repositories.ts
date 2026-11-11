import type { Profile, Progress, Settings } from '../../types'
import type { KeyValueStore } from './keyValueStore'

/*
 * Repositórios: as telas nunca acessam o localStorage diretamente.
 * Para migrar para Supabase basta implementar estas interfaces com
 * chamadas ao Supabase Auth/PostgreSQL (ver docs/supabase/schema.sql).
 */
export interface ProfileRepository {
  load(): Profile | null
  save(profile: Profile): void
  clear(): void
}

export interface ProgressRepository {
  load(): Progress
  save(progress: Progress): void
  clear(): void
}

export interface SettingsRepository {
  load(): Settings
  save(settings: Settings): void
}

export const STORAGE_PREFIX = 'bible-quest:v1:'
const KEYS = {
  profile: `${STORAGE_PREFIX}profile`,
  progress: `${STORAGE_PREFIX}progress`,
  settings: `${STORAGE_PREFIX}settings`,
  customContent: `${STORAGE_PREFIX}custom-content`,
}

export const CUSTOM_CONTENT_KEY = KEYS.customContent

export function emptyProgress(): Progress {
  return {
    xp: 0,
    experiences: {},
    lastExperienceId: null,
    achievements: {},
    history: [],
    streak: { current: 0, best: 0, lastDay: null },
    daily: { lastCompletedDay: null, completedCount: 0, log: [] },
    practice: { day: null, xp: 0 },
    free: { matches: 0, byMode: {}, oneClueHits: 0, bestTimeAttack: 0 },
    stats: { answered: 0, correct: 0, perfectExperiences: 0, byType: {} },
  }
}

/**
 * Migração da versão 0.1 (jornadas/capítulos) para a 0.2 (livros/experiências).
 * Capítulos concluídos marcam a experiência correspondente; XP, histórico e
 * conquistas são preservados.
 */
export const LEGACY_CHAPTER_MAP: Record<string, string> = {
  'criacao-1': 'gn-criacao',
  'criacao-2': 'gn-criacao',
  'criacao-3': 'gn-homem-mulher',
  'criacao-4': 'gn-queda',
  'noe-1': 'gn-corrupcao',
  'noe-2': 'gn-arca',
  'noe-3': 'gn-diluvio',
  'noe-4': 'gn-alianca-noe',
  'abraao-1': 'gn-chamado-abraao',
  'abraao-2': 'gn-abraao-lo',
  'abraao-3': 'gn-isaque',
  'abraao-4': 'gn-moria',
  'jose-1': 'gn-jose-sonhos',
  'jose-2': 'gn-jose-egito',
  'jose-3': 'gn-jose-farao',
  'jose-4': 'gn-jose-perdao',
  'moises-1': 'ex-salvo',
  'moises-2': 'ex-sarca',
  'moises-3': 'ex-pragas',
  'moises-4': 'ex-mar-sinai',
}

type LegacyProgress = Partial<Progress> & {
  chapters?: Record<string, Progress['experiences'][string]>
  stats?: Partial<Progress['stats']> & { perfectChapters?: number }
}

export function migrateProgress(raw: LegacyProgress): Progress {
  const base = emptyProgress()
  const experiences: Progress['experiences'] = { ...(raw.experiences ?? {}) }
  for (const [old, cp] of Object.entries(raw.chapters ?? {})) {
    const id = LEGACY_CHAPTER_MAP[old]
    if (!id) continue
    const prev = experiences[id]
    experiences[id] = prev
      ? {
          completed: prev.completed || cp.completed,
          bestStars: Math.max(prev.bestStars, cp.bestStars),
          bestScore: Math.max(prev.bestScore, cp.bestScore),
          attempts: prev.attempts + cp.attempts,
        }
      : { ...cp }
  }
  const history = (Array.isArray(raw.history) ? raw.history : []).map((h) => {
    const legacy = h as unknown as { mode: string; chapterId?: string }
    if (legacy.mode === 'capitulo') {
      return { ...h, mode: 'historia' as const, experienceId: legacy.chapterId ? LEGACY_CHAPTER_MAP[legacy.chapterId] : undefined }
    }
    return h
  })
  return {
    xp: typeof raw.xp === 'number' && raw.xp >= 0 ? raw.xp : 0,
    experiences,
    lastExperienceId: raw.lastExperienceId ?? null,
    achievements: raw.achievements ?? {},
    history,
    streak: { ...base.streak, ...raw.streak },
    daily: { ...base.daily, ...raw.daily, log: Array.isArray(raw.daily?.log) ? raw.daily!.log : [] },
    practice: { ...base.practice, ...raw.practice },
    free: { ...base.free, ...raw.free, byMode: { ...raw.free?.byMode } },
    stats: {
      answered: raw.stats?.answered ?? 0,
      correct: raw.stats?.correct ?? 0,
      perfectExperiences: raw.stats?.perfectExperiences ?? raw.stats?.perfectChapters ?? 0,
      byType: { ...raw.stats?.byType },
    },
  }
}

export const DEFAULT_SETTINGS: Settings = {
  fontScale: 'normal',
  highContrast: false,
  reduceMotion: false,
  showTimer: false,
  readAloud: true,
  onboardingDone: false,
}

function readJson<T>(store: KeyValueStore, key: string): Partial<T> | null {
  const raw = store.get(key)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Partial<T>) : null
  } catch {
    return null
  }
}

export class LocalProfileRepository implements ProfileRepository {
  constructor(private store: KeyValueStore) {}
  load(): Profile | null {
    const p = readJson<Profile>(this.store, KEYS.profile)
    if (!p || typeof p.nickname !== 'string' || typeof p.id !== 'string') return null
    return {
      id: p.id,
      nickname: p.nickname,
      avatar: p.avatar ?? 'lamp',
      ageRange: p.ageRange ?? '18mais',
      createdAt: p.createdAt ?? new Date().toISOString(),
      storage: 'local',
    }
  }
  save(profile: Profile) {
    this.store.set(KEYS.profile, JSON.stringify(profile))
  }
  clear() {
    this.store.remove(KEYS.profile)
  }
}

export class LocalProgressRepository implements ProgressRepository {
  constructor(private store: KeyValueStore) {}
  load(): Progress {
    const p = readJson<LegacyProgress>(this.store, KEYS.progress)
    if (!p) return emptyProgress()
    return migrateProgress(p)
  }
  save(progress: Progress) {
    this.store.set(KEYS.progress, JSON.stringify(progress))
  }
  clear() {
    this.store.remove(KEYS.progress)
  }
}

export class LocalSettingsRepository implements SettingsRepository {
  constructor(private store: KeyValueStore) {}
  load(): Settings {
    return { ...DEFAULT_SETTINGS, ...readJson<Settings>(this.store, KEYS.settings) }
  }
  save(settings: Settings) {
    this.store.set(KEYS.settings, JSON.stringify(settings))
  }
}
