-- Atualiza trigger para incluir pais no cadastro
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, nome, email, pais, cidade, estado, tem_impressora, lgpd_aceito)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'pais', ''),
    coalesce(new.raw_user_meta_data->>'cidade', ''),
    coalesce(new.raw_user_meta_data->>'estado', ''),
    coalesce((new.raw_user_meta_data->>'tem_impressora')::boolean, false),
    true
  );
  return new;
end;
$$ language plpgsql security definer;
