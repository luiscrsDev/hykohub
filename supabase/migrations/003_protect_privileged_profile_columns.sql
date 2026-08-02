-- 003_protect_privileged_profile_columns.sql
--
-- PROBLEMA QUE ESTA MIGRATION RESOLVE
-- A policy "profiles_update_own" permite que cada pessoa edite o próprio perfil,
-- mas não limita QUAIS colunas. Como praticamente toda a segurança do sistema
-- pergunta "profiles.is_admin = true?" (partner_offers, stl_posts, video_posts,
-- video_chunks, video_transcripts e profiles_select_admin), qualquer usuário
-- autenticado poderia se auto-promover a admin pelo próprio navegador e, a partir
-- daí, ler o perfil completo de todos os membros (cnpj_cpf, endereco_completo,
-- whatsapp) e gerenciar ofertas e posts.
--
-- SOLUÇÃO
-- Um trigger BEFORE UPDATE que rejeita qualquer alteração nas colunas de
-- privilégio quando a requisição vem de um usuário (roles "authenticated"/"anon").
-- Requisições feitas pelo servidor com a SERVICE_ROLE_KEY continuam liberadas —
-- é por elas que o painel admin deve alterar tier/is_pro/is_admin.

create or replace function public.prevent_privileged_profile_changes()
returns trigger
language plpgsql
as $$
begin
  -- O servidor (service_role) e manutenções feitas direto no banco passam direto.
  -- Função é SECURITY INVOKER (padrão) justamente para que current_user
  -- reflita o papel real de quem fez a requisição.
  if current_user in ('service_role', 'supabase_admin', 'postgres') then
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin then
    raise exception 'Campo is_admin só pode ser alterado pelo servidor'
      using errcode = '42501';
  end if;

  if new.is_pro is distinct from old.is_pro then
    raise exception 'Campo is_pro só pode ser alterado pelo servidor'
      using errcode = '42501';
  end if;

  if new.tier is distinct from old.tier then
    raise exception 'Campo tier só pode ser alterado pelo servidor'
      using errcode = '42501';
  end if;

  if new.trust_score is distinct from old.trust_score then
    raise exception 'Campo trust_score só pode ser alterado pelo servidor'
      using errcode = '42501';
  end if;

  if new.pro_qualified_at is distinct from old.pro_qualified_at then
    raise exception 'Campo pro_qualified_at só pode ser alterado pelo servidor'
      using errcode = '42501';
  end if;

  -- Trava extra: ninguém "muda de dono" do próprio registro.
  if new.id is distinct from old.id then
    raise exception 'Campo id não pode ser alterado'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.prevent_privileged_profile_changes() is
  'Bloqueia auto-promoção: impede que usuários autenticados alterem colunas de privilégio em profiles.';

drop trigger if exists trg_prevent_privileged_profile_changes on public.profiles;

create trigger trg_prevent_privileged_profile_changes
  before update on public.profiles
  for each row
  execute function public.prevent_privileged_profile_changes();

-- COMO TESTAR (rodar logado como um usuário comum, não pelo SQL Editor):
--   supabase.from('profiles').update({ is_admin: true }).eq('id', <meu id>)
-- Resultado esperado: erro "Campo is_admin só pode ser alterado pelo servidor".
--
-- E o fluxo normal deve continuar funcionando:
--   supabase.from('profiles').update({ bio: 'teste' }).eq('id', <meu id>)  -> OK
