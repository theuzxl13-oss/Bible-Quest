import type { MultiplayerService } from './contracts'
import { DemoMultiplayerService } from './demoMultiplayer'
import { readSupabaseConfig } from '../supabase/config'

/**
 * Ponto único de criação do serviço de multiplayer.
 * Enquanto não houver backend configurado (VITE_SUPABASE_URL/ANON_KEY) e a
 * implementação online não existir, retorna o modo demonstração.
 *
 * Implementação futura (ver ROADMAP.md e docs/supabase/schema.sql):
 *   - createRoom  → insert em `rooms` + RPC que gera o código no servidor
 *   - joinRoom    → RPC `join_room(code)` com verificação de idade e limite de jogadores
 *   - subscribe   → canal Realtime `room:<id>` (presence + broadcast)
 *   - submitAnswer→ Edge Function que valida a resposta e grava em `room_answers`
 */
export function createMultiplayerService(): MultiplayerService {
  const config = readSupabaseConfig()
  if (config) {
    // A versão online ainda não foi implementada; mantemos a demonstração
    // para não simular uma conexão real inexistente.
    console.info('[Bible Quest] Supabase configurado, mas o multiplayer online ainda não foi implementado.')
  }
  return new DemoMultiplayerService()
}
