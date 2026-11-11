/*
 * Configuração futura do Supabase.
 * Apenas a URL do projeto e a chave PÚBLICA (anon) podem existir no frontend,
 * via variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no momento do build.
 * NUNCA coloque a service_role key, senhas ou tokens no código do cliente.
 * A segurança real depende das políticas RLS em docs/supabase/schema.sql.
 */
export interface SupabaseConfig {
  url: string
  anonKey: string
}

export function readSupabaseConfig(env: Record<string, unknown> = import.meta.env): SupabaseConfig | null {
  const url = typeof env.VITE_SUPABASE_URL === 'string' ? env.VITE_SUPABASE_URL : ''
  const anonKey = typeof env.VITE_SUPABASE_ANON_KEY === 'string' ? env.VITE_SUPABASE_ANON_KEY : ''
  if (!url || !anonKey) return null
  return { url, anonKey }
}

export const isBackendConnected = (): boolean => readSupabaseConfig() !== null
