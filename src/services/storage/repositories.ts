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
}

export function emptyProgress(): Progress {
  return {
    xp: 0,
    chapters: {},
    achievements: {},
    history: [],
    streak: { current: 0, best: 0, lastDay: null },
    daily: { lastCompletedDay: null, completedCount: 0 },
    stats: { answered: 0, correct: 0, perfectChapters: 0, byType: {} },
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
    const base = emptyProgress()
    const p = readJson<Progress>(this.store, KEYS.progress)
    if (!p) return base
    return {
      xp: typeof p.xp === 'number' && p.xp >= 0 ? p.xp : 0,
      chapters: p.chapters ?? {},
      achievements: p.achievements ?? {},
      history: Array.isArray(p.history) ? p.history : [],
      streak: { ...base.streak, ...p.streak },
      daily: { ...base.daily, ...p.daily },
      stats: { ...base.stats, ...p.stats, byType: { ...p.stats?.byType } },
    }
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
