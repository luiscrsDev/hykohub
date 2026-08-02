-- 0025_baseline_tabelas_criadas_no_painel.sql
--
-- POR QUE ESTE ARQUIVO EXISTE
-- Várias tabelas foram criadas direto no painel do Supabase e nunca entraram em
-- migration. O banco tinha coisas que a "planta baixa" do projeto não mostrava,
-- e um ambiente novo (ou uma restauração) não conseguiria ser reconstruído.
--
-- Este arquivo documenta o que já existe em produção. Ele foi reconstruído a
-- partir do catálogo do próprio banco (colunas, constraints, índices e policies)
-- e marcado como já aplicado no histórico de migrations.
--
-- Numerado como 0025 de propósito: precisa rodar depois de 001 (que cria
-- profiles, referenciada por chaves estrangeiras daqui) e antes de 004 (que
-- altera video_posts).
--
-- Tudo aqui é idempotente: rodar de novo não quebra nem duplica nada.

-- Busca por similaridade (embeddings) usada por video_chunks
create extension if not exists vector;

-- ============================================================ partner_offers
-- Ofertas de parceiros exibidas para membros logados.

create table if not exists partner_offers (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz default now(),
  produto             text not null,
  parceiro            text not null,
  descricao           text,
  preco_original      numeric,
  preco_oferta        numeric,
  pais                text not null,
  link_compra         text,
  imagem_url          text,
  ativo               boolean not null default true,
  destaque            boolean not null default false,
  prazo_fim           timestamptz,
  categoria           text,
  desconto_percentual numeric
);

alter table partner_offers drop constraint if exists partner_offers_desconto_percentual_check;
alter table partner_offers add constraint partner_offers_desconto_percentual_check
  check (desconto_percentual > 0 and desconto_percentual <= 100);

alter table partner_offers enable row level security;

drop policy if exists "Admins can manage partner_offers" on partner_offers;
create policy "Admins can manage partner_offers" on partner_offers
  for all to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

drop policy if exists "Authenticated users can read active partner_offers" on partner_offers;
create policy "Authenticated users can read active partner_offers" on partner_offers
  for select to authenticated
  using (ativo = true);

-- ================================================================= stl_posts
-- Modelos STL enviados por membros. Fluxo de moderação: pending -> approved.
-- (Não confundir com stl_files, criada em 001 e hoje sem uso no código.)

create table if not exists stl_posts (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  title           text not null,
  description     text,
  external_link   text,
  file_url        text,
  thumbnail_url   text,
  tags            text[] default '{}'::text[],
  compatibilidade text[] default '{}'::text[],
  status          text not null default 'pending',
  submitted_by    uuid references profiles(id) on delete set null,
  is_featured     boolean default false,
  download_count  integer default 0
);

alter table stl_posts drop constraint if exists stl_posts_status_check;
alter table stl_posts add constraint stl_posts_status_check
  check (status in ('pending', 'approved', 'rejected'));

alter table stl_posts enable row level security;

drop policy if exists stl_admin_all on stl_posts;
create policy stl_admin_all on stl_posts
  for all to authenticated
  using ((select profiles.is_admin from profiles where profiles.id = auth.uid()) = true)
  with check ((select profiles.is_admin from profiles where profiles.id = auth.uid()) = true);

drop policy if exists stl_approved_visible on stl_posts;
create policy stl_approved_visible on stl_posts
  for select to authenticated
  using (status = 'approved');

drop policy if exists stl_member_submit on stl_posts;
create policy stl_member_submit on stl_posts
  for insert to authenticated
  with check (status = 'pending' and submitted_by = auth.uid());

drop policy if exists stl_service_all on stl_posts;
create policy stl_service_all on stl_posts
  for all to service_role
  using (true) with check (true);

-- =============================================================== video_posts
-- Vídeos curados. As colunas de plataforma e de curadoria são acrescentadas
-- pela migration 004 — aqui elas já aparecem porque este arquivo retrata o
-- estado atual do banco. A 004 é idempotente e continua válida.

create table if not exists video_posts (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz default now(),
  title             text not null,
  description       text,
  youtube_url       text,
  youtube_id        text,
  tags              text[] default '{}'::text[],
  status            text not null default 'pending',
  submitted_by      uuid references profiles(id) on delete set null,
  is_featured       boolean default false,
  platform          text not null default 'youtube',
  source_url        text,
  external_id       text,
  author_handle     text,
  posted_at         timestamptz,
  thumbnail_url     text,
  duration_seconds  integer,
  problem_category  text,
  problem_statement text,
  solution_summary  text,
  level             text
);

alter table video_posts drop constraint if exists video_posts_status_check;
alter table video_posts add constraint video_posts_status_check
  check (status in ('pending', 'approved', 'rejected'));

alter table video_posts enable row level security;

drop policy if exists video_admin_all on video_posts;
create policy video_admin_all on video_posts
  for all to authenticated
  using ((select profiles.is_admin from profiles where profiles.id = auth.uid()) = true)
  with check ((select profiles.is_admin from profiles where profiles.id = auth.uid()) = true);

drop policy if exists video_approved_visible on video_posts;
create policy video_approved_visible on video_posts
  for select to authenticated
  using (status = 'approved');

drop policy if exists video_member_submit on video_posts;
create policy video_member_submit on video_posts
  for insert to authenticated
  with check (status = 'pending' and submitted_by = auth.uid());

drop policy if exists video_service_all on video_posts;
create policy video_service_all on video_posts
  for all to service_role
  using (true) with check (true);

-- ========================================================= video_transcripts
-- Texto completo do que é falado em cada vídeo.

create table if not exists video_transcripts (
  id               uuid primary key default gen_random_uuid(),
  video_id         uuid not null references video_posts(id) on delete cascade,
  source           text not null default 'youtube_api',
  language         text not null default 'pt',
  full_text        text not null,
  duration_seconds integer,
  created_at       timestamptz default now()
);

alter table video_transcripts drop constraint if exists video_transcripts_source_check;
alter table video_transcripts add constraint video_transcripts_source_check
  check (source in ('youtube_api', 'whisper', 'manual'));

alter table video_transcripts enable row level security;

-- Concedidas ao papel "public" (todos os papéis). O que barra o visitante não
-- logado é a própria expressão da regra, não o papel. Ver observação no fim.
drop policy if exists admins_all_transcripts on video_transcripts;
create policy admins_all_transcripts on video_transcripts
  for all to public
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

drop policy if exists authenticated_read_transcripts on video_transcripts;
create policy authenticated_read_transcripts on video_transcripts
  for select to public
  using (auth.role() = 'authenticated');

-- ============================================================== video_chunks
-- Transcrição fatiada em pedaços com marcação de tempo e vetor de embedding,
-- para busca por significado.

create table if not exists video_chunks (
  id            uuid primary key default gen_random_uuid(),
  video_id      uuid not null references video_posts(id) on delete cascade,
  transcript_id uuid not null references video_transcripts(id) on delete cascade,
  chunk_index   integer not null,
  start_seconds double precision,
  end_seconds   double precision,
  text          text not null,
  embedding     vector(1536),
  created_at    timestamptz default now()
);

create index if not exists video_chunks_embedding_idx
  on video_chunks using hnsw (embedding vector_cosine_ops);

alter table video_chunks enable row level security;

drop policy if exists admins_all_chunks on video_chunks;
create policy admins_all_chunks on video_chunks
  for all to public
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

drop policy if exists authenticated_read_chunks on video_chunks;
create policy authenticated_read_chunks on video_chunks
  for select to public
  using (auth.role() = 'authenticated');

-- ========================================================= whatsapp_messages
-- Arquivo de mensagens de WhatsApp (telefones, nomes, texto, mídia e
-- transcrições). NÃO é usada por nenhum ponto do código do site — aparenta ser
-- de uma integração externa.
--
-- RLS ligada e SEM NENHUMA POLICY: com isso o Postgres nega tudo por padrão.
-- Na prática só o service_role (que ignora RLS) e o painel enxergam esta
-- tabela. É o comportamento desejado para dado pessoal de terceiros.
--
-- Contém dado pessoal sensível sob LGPD. Ver observação 4 no fim do arquivo.

create table if not exists whatsapp_messages (
  -- id não tem default no banco; assumido identity ao reconstruir
  id                    bigint primary key generated by default as identity,
  whatsapp_owner        text not null,
  chat_type             text not null,
  chat_id               text,
  chat_name             text,
  contact_phone         text,
  sender_phone          text not null,
  sender_name           text,
  recipient_phone       text,
  direction             text not null,
  message_type          text not null default 'text',
  message               text,
  caption               text,
  media_url             text,
  media_mime_type       text,
  media_file_name       text,
  media_sha256          text,
  media_size_bytes      bigint,
  transcription         text,
  message_id            text not null unique,
  external_message_id   text,
  reply_to_message_id   text,
  forwarded             boolean default false,
  is_edited             boolean default false,
  reaction              text,
  reacted_to_message_id text,
  status                text not null default 'sent',
  is_deleted            boolean not null default false,
  message_created_at    timestamptz not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_messages_contact_phone on whatsapp_messages using btree (contact_phone);
create index if not exists idx_messages_direction    on whatsapp_messages using btree (direction);
create index if not exists idx_messages_created_at   on whatsapp_messages using btree (message_created_at);

alter table whatsapp_messages enable row level security;

-- ================================================================== funções

-- Usada por policies para evitar recursão ao checar se quem pede é admin.
create or replace function public.is_admin()
returns boolean
language sql
stable security definer
as $$
  select coalesce(is_admin, false) from profiles where id = auth.uid()
$$;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_update_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.increment_download_count(post_id uuid)
returns void
language sql
security definer
as $$
  update stl_posts set download_count = download_count + 1 where id = post_id;
$$;

-- Busca por significado: recebe a pergunta já convertida em vetor e devolve os
-- trechos de vídeo mais parecidos, com o tempo em que aparecem.
create or replace function public.match_video_chunks(
  query_embedding vector,
  match_threshold double precision default 0.5,
  match_count integer default 5
)
returns table (
  chunk_id uuid,
  video_id uuid,
  video_title text,
  youtube_id text,
  chunk_text text,
  start_seconds double precision,
  end_seconds double precision,
  similarity double precision
)
language sql
stable
as $$
  select
    vc.id          as chunk_id,
    vc.video_id,
    vp.title       as video_title,
    vp.youtube_id,
    vc.text        as chunk_text,
    vc.start_seconds,
    vc.end_seconds,
    1 - (vc.embedding <=> query_embedding) as similarity
  from video_chunks vc
  join video_posts vp on vp.id = vc.video_id
  where 1 - (vc.embedding <=> query_embedding) > match_threshold
  order by vc.embedding <=> query_embedding
  limit match_count;
$$;

-- OBSERVAÇÕES PARA O FUTURO (não são mudanças, são pontos a decidir)
--
-- 1. As policies de video_transcripts e video_chunks foram concedidas ao papel
--    "public" em vez de "authenticated". Hoje isso é seguro porque a expressão
--    de cada regra exige sessão autenticada, mas o correto seria restringir
--    também o papel, para não depender de uma única linha de lógica.
--
-- 2. Não existe restrição de unicidade em video_transcripts.video_id: o banco
--    permitiria duas transcrições para o mesmo vídeo. Hoje isso é evitado pelo
--    script de ingestão, não pelo banco.
--
-- 3. match_video_chunks devolve youtube_id. Para conteúdo de outras plataformas
--    (Instagram), o retorno precisará incluir platform e source_url.
--
-- 4. whatsapp_messages guarda dado pessoal de terceiros (telefones, nomes e
--    conteúdo de mensagens) e não é usada pelo site. Enquanto existir, é dado
--    pessoal sob guarda do projeto: precisa de finalidade declarada, prazo de
--    retenção e base legal. Se for resquício de experimento, o certo é apagar.
