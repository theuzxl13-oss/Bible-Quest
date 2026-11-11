import { LocalAuthService, type AuthService } from './auth'
import { BrowserLocalStore, type KeyValueStore } from './storage/keyValueStore'
import {
  LocalProgressRepository,
  LocalSettingsRepository,
  type ProgressRepository,
  type SettingsRepository,
} from './storage/repositories'
import { LocalProfileRepository } from './storage/repositories'

/** Conjunto de serviços injetado na aplicação. Trocar aqui para Supabase no futuro. */
export interface Services {
  auth: AuthService
  progress: ProgressRepository
  settings: SettingsRepository
}

export function createLocalServices(store: KeyValueStore = new BrowserLocalStore()): Services {
  return {
    auth: new LocalAuthService(new LocalProfileRepository(store)),
    progress: new LocalProgressRepository(store),
    settings: new LocalSettingsRepository(store),
  }
}
