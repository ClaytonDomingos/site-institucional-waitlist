# Seja Seu Guia · site institucional

Site de uma página (React 19 + Vite 7 + TypeScript + Tailwind v4) que apresenta o Seja Seu Guia e capta a lista de espera. O nome está em `MARCA` (`src/conteudo/site.ts`) e no `index.html`; nunca escreva o nome do produto direto num texto. **Não coloque logo por enquanto** (nem ícone ao lado do nome, nem favicon): a marca é só o nome em texto (`Marca` em `components/layout.tsx`). No protótipo do app ele ainda se chama "Meu Guia". Como rodar e onde está cada coisa: `README.md`. Lista de espera: `docs/LISTA-DE-ESPERA.md`.

## Design = o do app

O visual é o do app do protótipo (`../clayton-ari-meu-guia`, template Tech Standard, estilo ReUI). As regras de design de lá valem aqui: tokens de cor (nunca cor crua), escala tipográfica (`text-title-*`, `text-body`…, sem `text-sm/lg` nem `tracking-*`), classes de receita (`tile`, `frame`, `control`, `field`, `floating`…), um `Button variant="primary"` por área, `money` só para dinheiro, `purple` para IA, Card nunca dentro de Card.

- O kit (`src/components/ui`, `src/components/charts`) e `src/lib/format.ts`, `hooks.ts`, `store.tsx` são **cópias sem alteração** do app. Não edite: se precisar de algo novo, escreva fora deles. Se o kit do app mudar, copie de novo.
- Importe o kit de `@/components/ui`. Foto: `SafeImage`. Foto com miniatura de tela por cima: `FotoComTela`. Miniaturas: `MiniTelas.tsx` (spans no lugar de botões: são ilustrações).
- Aqui **pode** usar breakpoints (`sm:`, `md:`, `lg:`): é um site, não o app mobile. Confira em 390 px sem rolagem horizontal, e nos temas claro e escuro.
- `cn()` só junta classes: para trocar a altura de um `Button`, use `[&_button]:h-11` no pai (o `h-9` do kit não sai com `className`).
- Movimento: só a entrada do hero. Nada de fade em cada seção.

## Conteúdo

- As 6 funcionalidades principais vêm dos criativos da campanha de Instagram, na mesma ordem: `FUNCIONALIDADES` em `src/conteudo/site.ts` alimenta o resumo e os destaques (foto e miniatura de cada uma em `secoes/Funcionalidades.tsx`; "ajustes" na faixa escura de `secoes/ModoViagem.tsx`).
- Textos, números, destinos, planos e dúvidas: `src/conteudo/site.ts`. URLs de imagem: `src/conteudo/imagens.ts` (só `images.unsplash.com`, com `w`/`h` na proporção do lugar; valide com curl). Não espalhe dados pelas seções.
- Português do Brasil, frases curtas, sem ponto de exclamação; botões dizem a ação.
- Roteiro de exemplo (`exemplo-paris.ts`) vem do seed do app: não edite à mão, gere com `scripts/exportar-exemplo.ts`.

## Lista de espera

PostgreSQL + API Hono (`api/`), tudo no Railway, num serviço só: o servidor Hono serve o site (`dist/`) e a API (`/api`). **Não use Supabase** (decisão do cliente). No site, `src/lib/lista-espera.ts` manda para `VITE_LISTA_ESPERA_API` (`/api`, de `.env.production`) ou, sem ela, guarda no localStorage (modo demonstração); a tela só chama `entrarNaLista()`. Duas regras de segurança, no site e na API: e-mail repetido recebe a mesma resposta de um novo (não revelar quem está na lista) e texto livre passa por `semFormula()` (nada começando com `= + - @`, que vira fórmula em planilha; o banco também recusa).

Mudou um campo? Atualize junto: o formulário, `linhaDe()`, `api/src/validar.ts`, um novo `api/sql/00N_….sql` idempotente, os testes (`scripts/testar-api.ts`) e o doc.

## Checagens antes de entregar

`pnpm build` · `pnpm testar:api` se mexer na API ou no SQL · `node scripts/e2e-lista.mjs` com o `pnpm dev` rodando (com `ADMIN_SENHA` e a API no ar, confere no Postgres) · capturas com `scripts/shot.mjs` (desktop e 390 px, claro e escuro).
