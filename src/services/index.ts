import { LocalAuthService, type AuthService } from './auth'
import { BrowserLocalStore, type KeyValueStore } from './storage/keyValueStore'
import {
  LocalProgressRepository,
  LocalSettingsRepository,
  type ProgressRepository,
  type SettingsRepository,
} from './storage/repositories'
import { LocalProfileRepository } from './storage/repositories'
import { LocalContentRepository, type ContentRepository } from './content'
import { LocalDailyService, type DailyService } from './game/daily'

/** Conjunto de serviços injetado na aplicação. Trocar aqui para Supabase no futuro. */
export interface Services {
  auth: AuthService
  progress: ProgressRepository
  settings: SettingsRepository
  content: ContentRepository
  daily: DailyService
}

export function createLocalServices(store: KeyValueStore = new BrowserLocalStore(), now?: () => Date): Services {
  return {
    content: new LocalContentRepository(store),
    daily: new LocalDailyService(now),
    auth: new LocalAuthService(new LocalProfileRepository(store)),
    progress: new LocalProgressRepository(store),
    settings: new LocalSettingsRepository(store),
  }
}
