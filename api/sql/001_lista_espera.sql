-- =============================================================================
-- Lista de espera do site (Seja Seu Guia).
--
-- A API (api/src) roda todos os arquivos desta pasta, em ordem, toda vez que
-- sobe. Por isso tudo aqui é idempotente (if not exists): rodar de novo não
-- muda nada. Mudança nova? Crie o 002_… também idempotente.
--
-- As regras abaixo repetem as da API de propósito: mesmo que alguém grave
-- direto no banco, nenhum campo começa com = + - @ (nem tab/CR), então o CSV
-- exportado não vira fórmula no Excel ou no Google Planilhas.
-- =============================================================================

create table if not exists lista_espera (
  id           bigint generated always as identity primary key,
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
  -- cada e-mail entra uma vez só (a API ignora o repetido sem avisar)
  constraint lista_espera_email_unico unique (email)
);

comment on table lista_espera is 'Inscrições da lista de espera do site institucional (viajantes e agências).';

create index if not exists lista_espera_criado_em on lista_espera (criado_em desc);
