# Seja Seu Guia · site institucional

Site de uma página que apresenta as funcionalidades do **Seja Seu Guia** (plataforma de roteiros de viagem com mapa, cliente: Clayton Domingos) e capta a **lista de espera** do lançamento. Segue o design do app do protótipo (`../clayton-ari-meu-guia`): mesmos tokens, mesmo kit de componentes, mesma fonte, tema claro e escuro.

O nome e as 6 funcionalidades principais vêm dos criativos da campanha de Instagram. **Ainda não há logo**: no cabeçalho e no rodapé a marca é só o nome, em texto, e a aba do navegador fica sem ícone. No protótipo do app o produto ainda se chama "Meu Guia". Para trocar o nome do site, mude `MARCA` em `src/conteudo/site.ts` e o título/meta do `index.html`.

## Como rodar

```bash
pnpm install
pnpm dev            # http://localhost:5211
pnpm build          # typecheck + build de produção (dist/, estático)
pnpm db:local       # Postgres em memória (para a API local, sem instalar nada)
pnpm dev:api        # API Hono da lista de espera em http://localhost:8787 (lê o .env.local)
pnpm start          # depois do build: o servidor de produção (site + API), como no Railway
pnpm testar:api     # testa a API contra um Postgres em memória
```

Sem configuração, a lista de espera roda em **modo demonstração** (guarda no `localStorage` do navegador, com um aviso no formulário durante o `pnpm dev`). Em produção as inscrições vão para um **PostgreSQL** por uma **API Hono** (`api/`), no mesmo servidor do site, tudo no **Railway**. Passo a passo do deploy e do desenvolvimento em [`docs/LISTA-DE-ESPERA.md`](docs/LISTA-DE-ESPERA.md); variáveis em `.env.example`.

## O que tem na página

1. **Hero** com o fecho da campanha ("O mundo do seu jeito") e o mapa real do roteiro de exemplo de Paris (Leaflet, o mesmo desenho do app): partida do hotel, um dia por cor, cada atração do lado certo do Sena.
2. **Funcionalidades**: as 6 da campanha, num resumo que leva a cada uma e em destaques com foto do Unsplash e uma miniatura da tela do app:
   1. Seu roteiro, suas escolhas (roteiro com os seus interesses)
   2. Se perder? Nunca mais (mapa com "você está aqui" e como chegar)
   3. Mudou de ideia? Tudo bem (arrastar, trocar e reajuste automático, na faixa com o visual noturno do modo viagem)
   4. Sua assistente de viagem (conversa com IA)
   5. Fotografou? Descubra (a foto vira história e curiosidades)
   6. Viajar junto começa no planejamento (compartilhar com amigos e família)

   Depois, os recursos de apoio: PDF com letra grande, gastos da comunidade, horários conferidos, ritmo, avisos e instalação na tela inicial.
3. **Curadoria**: o problema (IA erra a geografia), o Clayton e o checklist do especialista.
4. **Para agências**: marca própria, WhatsApp, viagem vendida, alertas e cobrança.
5. **Destinos**, **Planos** (viajantes e agências), **Lista de espera**, **Dúvidas** e rodapé com a política de privacidade.

Os botões "Entrar na lista", "Quero para minha agência" e "Sugerir um destino" levam ao formulário já com o perfil certo (`irParaLista()`).

## Onde está cada coisa

```
src/
  conteudo/        textos e números (site.ts), todas as URLs de imagem (imagens.ts), roteiro de exemplo (exemplo-paris.ts)
  lib/             lista-espera.ts (para onde vão as inscrições), validar.ts, texto.ts; format/hooks/store copiados do app
  components/
    ui/ charts/    o kit do app, copiado sem alteração
    secoes/        uma seção por arquivo, montadas em pages/Inicio.tsx
    MapaExemplo.tsx, MiniTelas.tsx (miniaturas das telas), FotoComTela.tsx, base.tsx, layout.tsx
api/               servidor Hono: a API da lista de espera (/api) e o site compilado (dist/) no mesmo endereço
  src/             app.ts (rotas), banco.ts (Postgres e migrações), validar.ts, index.ts (sobe o servidor)
  sql/             a tabela lista_espera (roda sozinha a cada subida)
railway.json       build, start e healthcheck do Railway
scripts/           shot.mjs (capturas), e2e-lista.mjs (teste do formulário), testar-api.ts, db-local.mjs (Postgres em memória),
                   exportar-exemplo.ts (gera o roteiro de exemplo a partir do app)
docs/LISTA-DE-ESPERA.md
```

## Checagens

Com `pnpm dev` rodando:

```bash
node scripts/shot.mjs 1440 900 .shots/topo.png                  # uma tela; PARTES=1 captura a página toda, tela a tela
node scripts/shot.mjs 390 844 .shots/lista.png dark lista       # celular, tema escuro, na âncora #lista
node scripts/e2e-lista.mjs http://localhost:5211/               # formulário de ponta a ponta
```

## Notas

- **Imagens**: Unsplash (`images.unsplash.com`), todas em `src/conteudo/imagens.ts`, validadas (HTTP 200) e conferidas. Capas de destino, fotos das atrações e o retrato do Clayton são as mesmas do app. O retrato é foto de banco: troque pela foto real antes de publicar.
- **Textos das funcionalidades**: título e resumo são os dos criativos (sem o ponto de exclamação; "Perdida?" virou "Se perder?"), em `FUNCIONALIDADES` (`src/conteudo/site.ts`), que alimenta o resumo e os destaques.
- **Números e preços** (10 destinos, 157 atrações verificadas, planos) vêm da base do protótipo e ficam em `src/conteudo/site.ts`. O roteiro de exemplo foi exportado do seed do app.
- **Contato** (e-mail, telefone, endereço) é fictício, como no protótipo: troque pelo real antes de publicar.
- **Mapa**: tiles Esri World Light Gray (sem chave; a CARTO passou a exigir), como no app.
- **Política de privacidade**: rascunho para revisão jurídica.
- **Deploy**: Railway, com um serviço (este repositório: `railway.json` faz o build do site e da API e sobe o servidor Hono) e um PostgreSQL. Variáveis: `DATABASE_URL` e `ADMIN_SENHA`. Veja `docs/LISTA-DE-ESPERA.md`.
