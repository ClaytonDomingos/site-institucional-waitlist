-- =============================================================================
-- Lista de espera do site institucional do Meu Guia
--
-- A tabela fica fechada para a API pública: nem a chave publicável do site
-- (papel `anon`) lê ou grava nela direto. O site chama uma única função,
-- entrar_na_lista_espera(), que limpa os campos e insere. E-mail repetido é
-- ignorado em silêncio, com a mesma resposta de uma inscrição nova: assim
-- ninguém descobre pelo formulário se um e-mail já está na lista.
--
-- Veja e exporte pelo painel (Table Editor → lista_espera → Export → CSV).
-- Nenhum campo começa com = + - @ (nem tab/CR), então o CSV não vira fórmula
-- ao abrir no Excel ou no Google Planilhas.
--
-- Como aplicar: Supabase → SQL Editor → cole este arquivo → Run
-- (ou `supabase db push`, se o projeto usar a CLI). Pode rodar de novo.
-- =============================================================================

create table if not exists public.lista_espera (
  id           uuid primary key default gen_random_uuid(),
  criado_em    timestamptz not null default now(),
  perfil       text not null check (perfil in ('viajante', 'agencia')),
  nome         text not null check (char_length(nome) between 2 and 120 and nome !~ '^[=+@\t\r-]'),
  email        text not null check (email = lower(email) and char_length(email) <= 254 and email ~ '^[^@\s=+@\t\r-][^@\s]*@[^@\s]+\.[^@\s]{2,}$'),
  whatsapp     text check (char_length(whatsapp) <= 20 and whatsapp !~ '^[=+@\t\r-]'),
  agencia      text check (char_length(agencia) <= 120 and agencia !~ '^[=+@\t\r-]'),
  destino      text check (char_length(destino) <= 120 and destino !~ '^[=+@\t\r-]'),
  utm_source   text check (char_length(utm_source) <= 100 and utm_source !~ '^[=+@\t\r-]'),
  utm_medium   text check (char_length(utm_medium) <= 100 and utm_medium !~ '^[=+@\t\r-]'),
  utm_campaign text check (char_length(utm_campaign) <= 100 and utm_campaign !~ '^[=+@\t\r-]'),
  -- agência precisa de nome e WhatsApp (o comercial chama por lá)
  constraint lista_espera_agencia_completa check (perfil <> 'agencia' or (agencia is not null and whatsapp is not null)),
  constraint lista_espera_email_unico unique (email)
);

comment on table public.lista_espera is 'Inscrições da lista de espera do site institucional (viajantes e agências).';

create index if not exists lista_espera_criado_em on public.lista_espera (criado_em desc);

-- fechada: RLS ligado e nenhuma política, nenhum privilégio para os papéis da API
alter table public.lista_espera enable row level security;
revoke all on table public.lista_espera from anon, authenticated;

-- tira espaços e os caracteres que fariam a célula virar fórmula numa planilha; vazio vira null
create or replace function public.lista_espera_limpar(valor text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(regexp_replace(btrim(valor), '^[\s=+@-]+', ''), '')
$$;

revoke execute on function public.lista_espera_limpar(text) from public, anon, authenticated;

-- a única porta de entrada do site
create or replace function public.entrar_na_lista_espera(
  p_perfil       text,
  p_nome         text,
  p_email        text,
  p_whatsapp     text default null,
  p_agencia      text default null,
  p_destino      text default null,
  p_utm_source   text default null,
  p_utm_medium   text default null,
  p_utm_campaign text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.lista_espera (perfil, nome, email, whatsapp, agencia, destino, utm_source, utm_medium, utm_campaign)
  values (
    p_perfil,
    public.lista_espera_limpar(p_nome),
    lower(btrim(p_email)),
    public.lista_espera_limpar(p_whatsapp),
    case when p_perfil = 'agencia' then public.lista_espera_limpar(p_agencia) end,
    case when p_perfil = 'viajante' then public.lista_espera_limpar(p_destino) end,
    left(public.lista_espera_limpar(p_utm_source), 100),
    left(public.lista_espera_limpar(p_utm_medium), 100),
    left(public.lista_espera_limpar(p_utm_campaign), 100)
  )
  on conflict (email) do nothing
$$;

comment on function public.entrar_na_lista_espera is 'Inscreve na lista de espera. E-mail repetido é ignorado sem erro.';

revoke execute on function public.entrar_na_lista_espera(text, text, text, text, text, text, text, text, text) from public, authenticated;
grant execute on function public.entrar_na_lista_espera(text, text, text, text, text, text, text, text, text) to anon;
