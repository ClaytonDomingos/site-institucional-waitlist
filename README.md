# Meu Guia · site institucional

Site de uma página que apresenta as funcionalidades do Meu Guia (plataforma de roteiros de viagem com mapa, cliente: Clayton Domingos) e capta a **lista de espera** do lançamento. Segue o design do app do protótipo (`../clayton-ari-meu-guia`): mesmos tokens, mesmo kit de componentes, mesma fonte, tema claro e escuro.

## Como rodar

```bash
pnpm install
pnpm dev            # http://localhost:5211
pnpm build          # typecheck + build de produção (dist/, estático)
pnpm testar:sql     # aplica a migração da lista de espera num Postgres em memória e confere as regras
```

Sem configuração, a lista de espera roda em **modo demonstração** (guarda no `localStorage` do navegador, com um aviso no formulário durante o `pnpm dev`). Para captar de verdade, configure o Supabase ou um webhook: passo a passo em [`docs/LISTA-DE-ESPERA.md`](docs/LISTA-DE-ESPERA.md) e variáveis em `.env.example`.

## O que tem na página

1. **Hero** com o mapa real do roteiro de exemplo de Paris (Leaflet, o mesmo desenho do app): partida do hotel, um dia por cor, cada atração do lado certo do Sena.
2. **Funcionalidades**: o fluxo em 3 passos e os destaques, cada um com foto do Unsplash e uma miniatura da tela do app: como chegar, PDF com letra grande, modo viagem (faixa com o visual noturno que o app assume na viagem), gastos da comunidade, assistente com IA e mais seis recursos.
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
- **Números e preços** (10 destinos, 157 atrações verificadas, planos) vêm da base do protótipo e ficam em `src/conteudo/site.ts`. O roteiro de exemplo foi exportado do seed do app.
- **Mapa**: tiles Esri World Light Gray (sem chave; a CARTO passou a exigir), como no app.
- **Política de privacidade**: rascunho para revisão jurídica.
- **Deploy**: é um site estático (`dist/`). Na Vercel ou Netlify, cadastre as variáveis da lista de espera antes do build.
