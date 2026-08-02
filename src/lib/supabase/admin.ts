import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Cliente Supabase com SERVICE_ROLE_KEY — ignora todas as políticas de RLS.
 *
 * ATENÇÃO: use SOMENTE em código que roda no servidor (route handlers,
 * server actions, server components). Nunca importe este arquivo em um
 * componente com 'use client' — a chave vazaria para o navegador.
 *
 * A checagem abaixo garante que, se isso acontecer por engano, o build/execução
 * falha em vez de expor a chave silenciosamente.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient() não pode ser usado no navegador')
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidas',
    )
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
