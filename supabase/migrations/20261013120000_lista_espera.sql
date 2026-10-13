-- =============================================================================
-- Lista de espera do site institucional do Meu Guia
--
-- O site grava com a chave publicável do Supabase (papel `anon`), que só pode
-- INSERIR as colunas do formulário. Ninguém lê a lista pela API pública:
-- consulte e exporte pelo painel (Table Editor → lista_espera → Export → CSV)
-- ou, num servidor, com a chave secreta.
--
-- Como aplicar: Supabase → SQL Editor → cole este arquivo → Run
-- (ou `supabase db push`, se o projeto usar a CLI).
-- =============================================================================

create table if not exists public.lista_espera (
  id           uuid primary key default gen_random_uuid(),
  criado_em    timestamptz not null default now(),
  perfil       text not null check (perfil in ('viajante', 'agencia')),
  nome         text not null check (char_length(btrim(nome)) between 2 and 120),
  email        text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  whatsapp     text check (char_length(whatsapp) <= 20),
  agencia      text check (char_length(agencia) <= 120),
  destino      text check (char_length(destino) <= 120),
  utm_source   text check (char_length(utm_source) <= 100),
  utm_medium   text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  -- agência precisa de nome e WhatsApp (o comercial chama por lá)
  constraint lista_espera_agencia_completa check (perfil <> 'agencia' or (agencia is not null and whatsapp is not null))
);

comment on table public.lista_espera is 'Inscrições da lista de espera do site institucional (viajantes e agências).';

-- cada e-mail entra uma vez só, sem diferenciar maiúsculas; repetido devolve 409 e o site responde "você já está na lista"
create unique index if not exists lista_espera_email_unico on public.lista_espera (lower(email));
create index if not exists lista_espera_criado_em on public.lista_espera (criado_em desc);

alter table public.lista_espera enable row level security;

-- a chave publicável (anon) só insere, e só as colunas do formulário: id e criado_em ficam por conta do banco
revoke all on table public.lista_espera from anon, authenticated;
grant insert (perfil, nome, email, whatsapp, agencia, destino, utm_source, utm_medium, utm_campaign) on table public.lista_espera to anon;

drop policy if exists "site insere na lista de espera" on public.lista_espera;
create policy "site insere na lista de espera"
  on public.lista_espera
  for insert
  to anon
  with check (true);
