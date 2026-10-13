# Lista de espera: onde as inscrições ficam salvas

O formulário (`src/components/secoes/ListaEspera.tsx`) grava por `src/lib/lista-espera.ts`, que escolhe o destino pelas variáveis de ambiente:

| Variáveis | Destino | Para quê |
|---|---|---|
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` | tabela `lista_espera` no Supabase | **recomendado** para captar de verdade |
| `VITE_LISTA_ESPERA_WEBHOOK` | POST para um webhook (n8n, Make, Zapier, Google Apps Script) | quando a lista deve cair direto numa planilha, CRM ou automação |
| nenhuma | `localStorage` do navegador | **só demonstração**: cada visitante só vê o que ele mesmo enviou |

Em qualquer destino, cada inscrição tem: `perfil` (viajante ou agência), `nome`, `email` (em minúsculas), `whatsapp`, `agencia`, `destino` (para onde quer ir) e a origem da visita (`utm_source`, `utm_medium`, `utm_campaign`, lidos da URL). Isso mostra quais campanhas do Instagram trazem inscrições: use links como `https://site/?utm_source=instagram&utm_medium=pago&utm_campaign=lancamento`.

Proteções que valem para todos:
- validação no formulário e campo-armadilha para robôs (preenchido, o envio finge sucesso e não manda nada);
- **sem fórmula na planilha**: textos que começam com `=`, `+`, `-` ou `@` virariam fórmula ao abrir o CSV no Excel ou no Google Planilhas (e uma fórmula pode vazar os dados da planilha). O site tira esses caracteres do começo antes de enviar, e o banco e a planilha se protegem de novo (abaixo), porque quem quiser pode mandar direto para a API;
- **não revela quem está na lista**: e-mail repetido recebe a mesma confirmação de um novo;
- tempo limite de 12 s na requisição.

## Comparação

| | Supabase | Webhook n8n | Planilha Google (Apps Script) |
|---|---|---|---|
| Custo | grátis no plano Free | o do n8n que vocês já usam | grátis |
| Quem vê a lista | painel do Supabase, exporta CSV | onde o fluxo gravar | a planilha |
| E-mail repetido | ignorado pelo banco | trate no fluxo | trate na planilha |
| Segurança | a chave do site só consegue chamar a inscrição; ninguém lê pela internet | URL do webhook fica pública no site | URL do script fica pública no site |
| Avisar o Clayton a cada inscrição | Database Webhook → n8n/e-mail | no próprio fluxo | notificação da planilha |
| Esforço | 10 min | 15 min | 10 min |

Recomendação: **Supabase**, porque guarda num banco de verdade, já com e-mail único, limpeza dos campos e regras de acesso, e a mesma tabela pode ser lida depois pelo painel admin do app. Se quiser também uma planilha ou um aviso no WhatsApp, ligue um Database Webhook do Supabase a um fluxo do n8n (passo 6).

## Opção 1: Supabase (recomendada)

1. Crie um projeto em [supabase.com](https://supabase.com) (região São Paulo, `sa-east-1`).
2. **SQL Editor** → cole `supabase/migrations/20261013120000_lista_espera.sql` → **Run**. O script pode rodar de novo sem estragar nada. Ele cria:
   - a tabela `lista_espera`, **fechada para a API** (RLS ligado, nenhuma política, nenhum privilégio para `anon`/`authenticated`);
   - a função `entrar_na_lista_espera(...)`, a única porta de entrada: limpa os textos, põe o e-mail em minúsculas e insere; e-mail repetido é ignorado sem erro;
   - regras no próprio banco (CHECK): perfil válido, e-mail válido e em minúsculas, tamanhos máximos, agência com nome e WhatsApp e **nenhum campo começando com `=` `+` `-` `@`**, nem se alguém gravar pelo painel. Assim o CSV exportado nunca vira fórmula.
3. **Project Settings → API Keys**: copie a URL do projeto e a **publishable key** (`sb_publishable_…`). A antiga `anon` também funciona. Nunca coloque a `secret`/`service_role` no site.
4. Local: crie `.env.local` com
   ```
   VITE_SUPABASE_URL=https://<projeto>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   Na hospedagem (Vercel, Netlify…): cadastre as mesmas duas variáveis e faça um novo deploy. As variáveis `VITE_` entram no build.
5. Para ver as inscrições: **Table Editor → lista_espera** (dá para filtrar e **Export → CSV**).
6. Opcional: aviso a cada inscrição. Em **Database Webhooks** (no menu Database ou Integrations, conforme a versão do painel), crie um na tabela `lista_espera`, evento `INSERT`, apontando para um webhook do n8n (que manda e-mail, WhatsApp ou grava numa planilha).

Como a gravação funciona: o site faz `POST /rest/v1/rpc/entrar_na_lista_espera` com o cabeçalho `apikey` e os campos com prefixo `p_` (`p_nome`, `p_email`…). A resposta é a mesma para inscrição nova e repetida. O **Security Advisor** do Supabase pode apontar que uma função `security definer` está liberada para `anon`: é de propósito, ela só insere na lista e tem o `search_path` travado.

O que `pnpm testar:sql` confere (Postgres em memória, como os papéis da API do Supabase): a migração roda duas vezes; `anon` inscreve viajante e agência pela função; repetido (com outra caixa e espaços) é ignorado sem erro; `=`, `+` e `@` no começo são tirados; destino de agência e agência de viajante são descartados; perfil, e-mail, nome vazio e agência sem WhatsApp são recusados; `anon` não lê, não grava direto, não altera e não apaga a tabela; `authenticated` não chama a função; gravando direto como dono, o banco recusa fórmula e e-mail com maiúscula.

## Opção 2: webhook do n8n

1. No n8n, crie um fluxo com o nó **Webhook**: método `POST`, caminho `lista-espera`, *Respond* "Immediately". Em *Options → Allowed Origins (CORS)*, coloque o domínio do site (ou `*` enquanto testa).
2. O site manda um formulário (`application/x-www-form-urlencoded`), que o n8n já entrega em `{{$json.body}}` com os campos `criado_em, perfil, nome, email, whatsapp, agencia, destino, utm_source, utm_medium, utm_campaign` (os vazios não vão).
3. Ligue o próximo nó: Google Sheets (*Append or Update* usando `email` como chave, o que já evita repetidos), Postgres, CRM, e-mail para o Clayton… No Google Sheets, deixe o formato da célula como **RAW** ("Use format from n8n"), para que nada vire fórmula. A URL do webhook fica pública: qualquer um pode chamá-la sem passar pelo site.
4. Ative o fluxo e use a **Production URL** em `VITE_LISTA_ESPERA_WEBHOOK`.

## Opção 3: planilha do Google, sem servidor

1. Crie uma planilha com uma aba **Lista de espera** e, na linha 1: `criado_em, perfil, nome, email, whatsapp, agencia, destino, utm_source, utm_medium, utm_campaign`.
2. **Extensões → Apps Script**, cole e salve:
   ```js
   const CAMPOS = ["criado_em", "perfil", "nome", "email", "whatsapp", "agencia", "destino", "utm_source", "utm_medium", "utm_campaign"];

   /* texto que começa com = + - @ vira fórmula na planilha: o apóstrofo faz a célula guardar como texto */
   function seguro(v) {
     const t = String(v || "").slice(0, 254);
     return /^[=+\-@\t\r]/.test(t) ? "'" + t : t;
   }

   function doPost(e) {
     const trava = LockService.getScriptLock();
     trava.waitLock(10000);
     try {
       const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Lista de espera");
       aba.appendRow(CAMPOS.map((c) => seguro(e.parameter[c])));
       return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
     } finally {
       trava.releaseLock();
     }
   }
   ```
3. **Implantar → Nova implantação → App da Web**: executar como *você*, acesso *Qualquer pessoa*. Autorize e copie a URL (`https://script.google.com/macros/s/…/exec`).
4. Use essa URL em `VITE_LISTA_ESPERA_WEBHOOK`. E-mails repetidos ficam na planilha; filtre por `email` na hora de exportar.

## Testar sem credenciais

`scripts/servidor-teste.mjs` imita a função do Supabase (limpeza dos campos e e-mail repetido ignorado) e um webhook, e `scripts/e2e-lista.mjs` preenche o formulário de ponta a ponta (erros, máscara, viajante, repetido, texto com fórmula, agência, armadilha) e confere o que foi gravado.

```bash
node scripts/servidor-teste.mjs                                   # porta 54321
VITE_SUPABASE_URL=http://localhost:54321 VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_teste pnpm dev --port 5212
CONFERIR=http://localhost:54321/inscricoes node scripts/e2e-lista.mjs "http://localhost:5212/?utm_source=instagram"

VITE_LISTA_ESPERA_WEBHOOK=http://localhost:54321/webhook pnpm dev --port 5213
CONFERIR=http://localhost:54321/inscricoes node scripts/e2e-lista.mjs http://localhost:5213/

node scripts/e2e-lista.mjs http://localhost:5211/                 # modo demonstração (localStorage)
```

## LGPD

O formulário pede só o necessário e linka a política de privacidade (`src/components/secoes/Privacidade.tsx`). O texto é um **rascunho**: passe pelo jurídico antes de publicar. Pedidos de exclusão chegam no e-mail de `EMPRESA` (`src/conteudo/site.ts`; hoje um endereço fictício); no Supabase, apague a linha pelo Table Editor.
