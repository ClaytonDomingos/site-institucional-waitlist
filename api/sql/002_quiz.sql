-- =============================================================================
-- Respostas do quiz da lista de espera (a inscrição virou uma pergunta por
-- vez). Todas opcionais: as inscrições de antes do quiz ficam sem elas.
--
-- Idempotente: se a coluna já existe, o "add column if not exists" pula a
-- coluna e a regra junto. Os valores aceitos são os ids das opções em
-- src/conteudo/lista-espera.ts (e de RESPOSTAS em api/src/validar.ts).
-- =============================================================================

-- viajante: quando viaja, com quem e o que mais quer usar (as 6 funcionalidades da campanha)
alter table lista_espera add column if not exists quando text
  check (quando in ('3-meses', '6-meses', 'mais-tarde', 'sem-data'));

alter table lista_espera add column if not exists com_quem text
  check (com_quem in ('so-eu', 'casal', 'familia', 'amigos'));

alter table lista_espera add column if not exists interesses text[]
  check (cardinality(interesses) between 1 and 6
         and interesses <@ array['personalizado', 'mapa', 'ajustes', 'assistente', 'foto', 'compartilhar']);

-- agência: quantas viagens vende por mês (as faixas dos planos para agências)
alter table lista_espera add column if not exists viagens_mes text
  check (viagens_mes in ('ate-10', '11-30', '31-100', 'mais-100'));
