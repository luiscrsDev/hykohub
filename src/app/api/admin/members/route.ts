import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'

/**
 * PATCH /api/admin/members
 *
 * Altera campos privilegiados do perfil de um membro (tier, is_pro, is_admin,
 * admin_notes). Esses campos não podem ser alterados pelo navegador: a policy
 * "profiles_update_own" só permite editar o próprio perfil, e o trigger
 * trg_prevent_privileged_profile_changes (migration 003) bloqueia colunas de
 * privilégio para qualquer role que não seja o service_role.
 *
 * Fluxo:
 *   1. confirma que existe sessão válida (cookie)
 *   2. confirma no banco que quem pediu é admin
 *   3. valida o corpo da requisição
 *   4. só então aplica a alteração usando a service role
 */

const TIERS = ['level0', 'level1', 'level2', 'level3'] as const

const bodySchema = z.object({
  id: z.string().uuid(),
  changes: z
    .object({
      tier: z.enum(TIERS).optional(),
      is_pro: z.boolean().optional(),
      is_admin: z.boolean().optional(),
      admin_notes: z.string().max(2000).nullable().optional(),
    })
    .strict()
    .refine(c => Object.keys(c).length > 0, {
      message: 'Nenhuma alteração enviada',
    }),
})

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  // 1. Sessão
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // 2. É admin mesmo? (lido do banco, não do que o navegador afirma)
  const { data: me } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!me?.is_admin) {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  }

  // 3. Corpo válido?
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Requisição inválida' },
      { status: 400 },
    )
  }

  const { id, changes } = parsed.data

  // Trava de segurança: ninguém remove o próprio acesso admin
  // (evita ficar sem nenhum administrador no sistema por engano).
  if (id === user.id && changes.is_admin === false) {
    return NextResponse.json(
      { error: 'Você não pode remover seu próprio acesso de administrador' },
      { status: 400 },
    )
  }

  // 4. Aplica com a service role
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('profiles')
    .update(changes as Database['public']['Tables']['profiles']['Update'])
    .eq('id', id)
    .select('id, tier, is_pro, is_admin, admin_notes')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Membro não encontrado' },
      { status: error ? 500 : 404 },
    )
  }

  return NextResponse.json({ member: data })
}
