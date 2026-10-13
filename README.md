# Seja Seu Guia · site institucional

Site de uma página que apresenta as funcionalidades do **Seja Seu Guia** (plataforma de roteiros de viagem com mapa, cliente: Clayton Domingos) e capta a **lista de espera** do lançamento. Segue o design do app do protótipo (`../clayton-ari-meu-guia`): mesmos tokens, mesmo kit de componentes, mesma fonte, tema claro e escuro.

O nome e as 6 funcionalidades principais vêm dos criativos da campanha de Instagram. **Ainda não há logo**: no cabeçalho e no rodapé a marca é só o nome, em texto, e a aba do navegador fica sem ícone. No protótipo do app o produto ainda se chama "Meu Guia". Para trocar o nome do site, mude `MARCA` em `src/conteudo/site.ts` e o título/meta do `index.html`.

## Como rodar

```bash
pnpm install
pnpm dev            # http://localhost:5211
pnpm build          # typecheck + build de produção (dist/, estático)
pnpm testar:sql     # aplica a migração da lista de espera num Postgres em memória e confere as regras
```

Sem configuração, a lista de espera roda em **modo demonstração** (guarda no `localStorage` do navegador, com um aviso no formulário durante o `pnpm dev`). Para captar de verdade, configure o Supabase ou um webhook: passo a passo em [`docs/LISTA-DE-ESPERA.md`](docs/LISTA-DE-ESPERA.md) e variáveis em `.env.example`.

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
supabase/migrations/   lista de espera: tabela fechada para a API + função de inscrição (a única porta do site)
scripts/           shot.mjs (capturas), e2e-lista.mjs (teste do formulário), servidor-teste.mjs (imita Supabase e webhook),
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
- **Deploy**: é um site estático (`dist/`). Na Vercel ou Netlify, cadastre as variáveis da lista de espera antes do build.
