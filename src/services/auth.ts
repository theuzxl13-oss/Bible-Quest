import type { AgeRange, Profile } from '../types'
import type { ProfileRepository } from './storage/repositories'

/**
 * Contrato de autenticação. A versão estática usa apenas um perfil local,
 * sem senha e sem e-mail (minimização de dados). Não é um sistema seguro de
 * autenticação: qualquer pessoa com acesso ao dispositivo vê o perfil.
 * Futuro: SupabaseAuthService (e-mail/OTP, consentimento dos responsáveis
 * para menores) implementando a mesma interface.
 */
export interface AuthService {
  readonly kind: 'local' | 'supabase'
  current(): Profile | null
  createLocalProfile(input: { nickname: string; avatar: string; ageRange: AgeRange }): Profile
  update(profile: Profile): Profile
  signOut(): void
}

export function sanitizeNickname(raw: string): string {
  return raw
    .replace(/[<>{}\[\]\\/@]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20)
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export class LocalAuthService implements AuthService {
  readonly kind = 'local' as const
  constructor(private repo: ProfileRepository) {}

  current() {
    return this.repo.load()
  }

  createLocalProfile(input: { nickname: string; avatar: string; ageRange: AgeRange }): Profile {
    const nickname = sanitizeNickname(input.nickname)
    if (nickname.length < 2) throw new Error('O apelido precisa ter pelo menos 2 caracteres.')
    const profile: Profile = {
      id: newId(),
      nickname,
      avatar: input.avatar,
      ageRange: input.ageRange,
      createdAt: new Date().toISOString(),
      storage: 'local',
    }
    this.repo.save(profile)
    return profile
  }

  update(profile: Profile) {
    const next = { ...profile, nickname: sanitizeNickname(profile.nickname) || profile.nickname }
    this.repo.save(next)
    return next
  }

  signOut() {
    this.repo.clear()
  }
}
