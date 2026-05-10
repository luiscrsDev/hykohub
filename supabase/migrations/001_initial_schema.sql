-- Enable extensions
create extension if not exists "uuid-ossp";

-- Printer models (reference table)
create table printer_models (
  id uuid primary key default uuid_generate_v4(),
  marca text not null,
  modelo text not null,
  slug text not null unique,
  bed_size text not null
);

insert into printer_models (marca, modelo, slug, bed_size) values
  ('Bambu Lab', 'A1', 'bambu-a1', '256x256x256mm'),
  ('Bambu Lab', 'A1 Mini', 'bambu-a1-mini', '180x180x180mm'),
  ('Bambu Lab', 'P1S', 'bambu-p1s', '256x256x256mm'),
  ('Bambu Lab', 'X1C', 'bambu-x1c', '256x256x256mm'),
  ('Creality', 'K1', 'creality-k1', '220x220x250mm'),
  ('Creality', 'K1 Max', 'creality-k1-max', '300x300x300mm'),
  ('Creality', 'Ender 3 V3', 'creality-ender3-v3', '220x220x250mm'),
  ('Prusa', 'MK4', 'prusa-mk4', '250x210x220mm'),
  ('Prusa', 'Mini', 'prusa-mini', '180x180x180mm'),
  ('Anycubic', 'Kobra', 'anycubic-kobra', '220x220x250mm'),
  ('Anycubic', 'Kobra Max', 'anycubic-kobra-max', '400x400x450mm');

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Level 0
  nome text not null,
  email text not null,
  cidade text not null,
  estado text not null,
  tem_impressora boolean not null default false,
  lgpd_aceito boolean not null default false,
  -- Level 1
  avatar_url text,
  bio text check (char_length(bio) <= 140),
  qtd_impressoras integer check (qtd_impressoras >= 0),
  nivel_experiencia text check (nivel_experiencia in ('iniciante', 'intermediario', 'avancado')),
  whatsapp text,
  tier text not null default 'level0' check (tier in ('level0', 'level1', 'level2', 'level3')),
  trust_score integer not null default 0 check (trust_score >= 0 and trust_score <= 100),
  -- Level 2
  consumo_mensal_kg numeric(5,2) check (consumo_mensal_kg >= 0),
  tipos_filamento text[],
  bed_size_max text,
  horas_semana integer check (horas_semana >= 0 and horas_semana <= 80),
  faz_pos_processamento text[],
  perfil_operacao text check (perfil_operacao in ('hobby', 'varejo_eventual', 'atacado')),
  interesse_pool text check (interesse_pool in ('sim', 'nao', 'talvez')),
  -- Level 3 (dados sensíveis)
  cnpj_cpf text,
  endereco_completo jsonb,
  acordo_pro_assinado boolean not null default false,
  foto_bancada_url text,
  video_impressao_url text,
  is_pro boolean not null default false,
  pro_qualified_at timestamptz
);

-- User printers (many-to-many)
create table user_printers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  printer_model_id uuid not null references printer_models(id),
  created_at timestamptz not null default now(),
  unique(user_id, printer_model_id)
);

-- Alerts & tips
create table alerts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  titulo text not null,
  descricao text not null check (char_length(descricao) <= 280),
  categoria text not null check (categoria in ('firmware', 'manutencao', 'otimizacao', 'seguranca')),
  printer_model_slug text references printer_models(slug),
  link_externo text,
  is_featured boolean not null default false
);

-- Group purchases
create table group_purchases (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  produto text not null,
  fornecedor text not null,
  preco_cheio numeric(10,2) not null,
  preco_grupo numeric(10,2) not null,
  preco_pro numeric(10,2),
  prazo_dias integer not null,
  minimo_adesoes integer not null default 10,
  atual_adesoes integer not null default 0,
  ativo boolean not null default true,
  imagem_url text
);

-- STL files catalog
create table stl_files (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  titulo text not null,
  descricao text,
  imagem_url text,
  download_url text not null,
  licenca text not null default 'CC-BY-NC',
  tags text[] not null default '{}',
  downloads integer not null default 0
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, nome, email, cidade, estado, tem_impressora, lgpd_aceito)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'cidade', ''),
    coalesce(new.raw_user_meta_data->>'estado', ''),
    coalesce((new.raw_user_meta_data->>'tem_impressora')::boolean, false),
    true
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table user_printers enable row level security;
alter table alerts enable row level security;
alter table group_purchases enable row level security;
alter table stl_files enable row level security;
alter table printer_models enable row level security;

-- Profiles: read own, update own, service role full access
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- User printers
create policy "user_printers_select_own" on user_printers for select using (auth.uid() = user_id);
create policy "user_printers_insert_own" on user_printers for insert with check (auth.uid() = user_id);
create policy "user_printers_delete_own" on user_printers for delete using (auth.uid() = user_id);

-- Public read for reference data
create policy "alerts_public_read" on alerts for select using (true);
create policy "group_purchases_public_read" on group_purchases for select using (true);
create policy "stl_files_public_read" on stl_files for select using (true);
create policy "printer_models_public_read" on printer_models for select using (true);
