# Meu Guia · site institucional

Site de uma página (React 19 + Vite 7 + TypeScript + Tailwind v4) que apresenta o Meu Guia e capta a lista de espera. Como rodar e onde está cada coisa: `README.md`. Lista de espera: `docs/LISTA-DE-ESPERA.md`.

## Design = o do app

O visual é o do app do protótipo (`../clayton-ari-meu-guia`, template Tech Standard, estilo ReUI). As regras de design de lá valem aqui: tokens de cor (nunca cor crua), escala tipográfica (`text-title-*`, `text-body`…, sem `text-sm/lg` nem `tracking-*`), classes de receita (`tile`, `frame`, `control`, `field`, `floating`…), um `Button variant="primary"` por área, `money` só para dinheiro, `purple` para IA, Card nunca dentro de Card.

- O kit (`src/components/ui`, `src/components/charts`) e `src/lib/format.ts`, `hooks.ts`, `store.tsx` são **cópias sem alteração** do app. Não edite: se precisar de algo novo, escreva fora deles. Se o kit do app mudar, copie de novo.
- Importe o kit de `@/components/ui`. Foto: `SafeImage`. Foto com miniatura de tela por cima: `FotoComTela`. Miniaturas: `MiniTelas.tsx` (spans no lugar de botões: são ilustrações).
- Aqui **pode** usar breakpoints (`sm:`, `md:`, `lg:`): é um site, não o app mobile. Confira em 390 px sem rolagem horizontal, e nos temas claro e escuro.
- `cn()` só junta classes: para trocar a altura de um `Button`, use `[&_button]:h-11` no pai (o `h-9` do kit não sai com `className`).
- Movimento: só a entrada do hero. Nada de fade em cada seção.

## Conteúdo

- Textos, números, destinos, planos e dúvidas: `src/conteudo/site.ts`. URLs de imagem: `src/conteudo/imagens.ts` (só `images.unsplash.com`, com `w`/`h` na proporção do lugar; valide com curl). Não espalhe dados pelas seções.
- Português do Brasil, frases curtas, sem ponto de exclamação; botões dizem a ação.
- Roteiro de exemplo (`exemplo-paris.ts`) vem do seed do app: não edite à mão, gere com `scripts/exportar-exemplo.ts`.

## Lista de espera

`src/lib/lista-espera.ts` decide o destino pelas variáveis (Supabase → webhook → localStorage). A tela só chama `entrarNaLista()`. Duas regras de segurança: e-mail repetido recebe a mesma confirmação de um novo (não revelar quem está na lista) e texto livre passa por `semFormula()` (nada começando com `= + - @`, que vira fórmula em planilha). No Supabase a tabela é fechada; o site só chama a função `entrar_na_lista_espera`.

Mudou um campo? Atualize junto: o formulário, `linhaDe()`, a migração em `supabase/migrations`, o `servidor-teste.mjs` e o doc.

## Checagens antes de entregar

`pnpm build` · `pnpm testar:sql` se mexer na migração · `node scripts/e2e-lista.mjs` com o `pnpm dev` rodando · capturas com `scripts/shot.mjs` (desktop e 390 px, claro e escuro).
