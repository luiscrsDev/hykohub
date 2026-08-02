-- 004_video_posts_multi_platform.sql
--
-- OBJETIVO
-- Permitir que a seção de vídeos receba conteúdo de outras plataformas além do
-- YouTube (a primeira é o Instagram/Reels) e guardar a classificação editorial
-- produzida pela esteira de transcrição: qual problema o vídeo resolve, qual a
-- solução apresentada e para qual nível de público.
--
-- CONTEXTO
-- Hoje video_posts exige youtube_id e youtube_url (NOT NULL) e a interface monta
-- player e capa a partir do youtube_id. Não havia como cadastrar um Reel.
--
-- NADA É REMOVIDO NESTA MIGRATION: só colunas novas e afrouxamento de duas
-- obrigatoriedades. As linhas existentes do YouTube continuam válidas.

-- 1. De onde vem o vídeo -------------------------------------------------------

alter table video_posts
  add column if not exists platform text not null default 'youtube';

alter table video_posts
  drop constraint if exists video_posts_platform_check;

alter table video_posts
  add constraint video_posts_platform_check
  check (platform in ('youtube', 'instagram'));

-- YouTube deixa de ser obrigatório (continua obrigatório PARA vídeos do YouTube,
-- garantido pela constraint no fim do arquivo).
alter table video_posts alter column youtube_id  drop not null;
alter table video_posts alter column youtube_url drop not null;

-- 2. Dados de origem, válidos para qualquer plataforma ------------------------

alter table video_posts add column if not exists source_url       text;      -- link do post original
alter table video_posts add column if not exists external_id      text;      -- código do post na plataforma (ex: DbZCpBlOwCn)
alter table video_posts add column if not exists author_handle    text;      -- @ do criador
alter table video_posts add column if not exists posted_at        timestamptz;
alter table video_posts add column if not exists thumbnail_url    text;      -- capa própria (o Instagram não expõe capa pública)
alter table video_posts add column if not exists duration_seconds integer;

-- 3. Classificação editorial (produzida pela esteira) -------------------------

alter table video_posts add column if not exists problem_category  text; -- código do gabarito: A1..A5, B1..B7, C1..C4, D1..D2
alter table video_posts add column if not exists problem_statement text; -- a dor em uma frase, na linguagem do cliente
alter table video_posts add column if not exists solution_summary  text; -- o que o vídeo ensina a fazer
alter table video_posts add column if not exists level             text; -- iniciante | intermediario | avancado

alter table video_posts drop constraint if exists video_posts_level_check;
alter table video_posts
  add constraint video_posts_level_check
  check (level is null or level in ('iniciante', 'intermediario', 'avancado'));

alter table video_posts drop constraint if exists video_posts_problem_category_check;
alter table video_posts
  add constraint video_posts_problem_category_check
  check (
    problem_category is null
    or problem_category in (
      'A1','A2','A3','A4','A5',                 -- negócio / loja
      'B1','B2','B3','B4','B5','B6','B7',       -- técnica de impressão
      'C1','C2','C3','C4',                      -- modelagem / criação digital
      'D1','D2'                                 -- outros
    )
  );

comment on column video_posts.problem_category is
  'Código do gabarito de categorias (ver analise-instagram/categorias.md). Para acrescentar categorias, edite esta constraint.';

-- 4. Preenche a origem das linhas que já existem ------------------------------

update video_posts
   set source_url = youtube_url
 where source_url is null
   and youtube_url is not null;

update video_posts
   set external_id = youtube_id
 where external_id is null
   and youtube_id is not null;

-- 5. Evita cadastrar o mesmo vídeo duas vezes ---------------------------------
-- Importante porque a esteira pode ser executada de novo sobre a mesma lista.

create unique index if not exists video_posts_platform_external_id_key
  on video_posts (platform, external_id)
  where external_id is not null;

-- 6. Coerência por plataforma -------------------------------------------------
-- YouTube precisa de id/url do YouTube; qualquer outra plataforma precisa do
-- link original. Impede registro pela metade.

alter table video_posts drop constraint if exists video_posts_platform_fields_check;
alter table video_posts
  add constraint video_posts_platform_fields_check
  check (
    (platform = 'youtube'  and youtube_id is not null and youtube_url is not null)
    or
    (platform <> 'youtube' and source_url is not null)
  );

-- OBSERVAÇÃO SOBRE PERMISSÕES
-- Nenhuma policy precisa mudar: a esteira grava usando a service_role
-- (policy "video_service_all"), o público continua vendo só status='approved'
-- (policy "video_approved_visible") e o admin segue com acesso total
-- (policy "video_admin_all").
