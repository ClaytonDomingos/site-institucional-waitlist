# Lista de espera: onde as inscrições ficam salvas

As inscrições vão para um **PostgreSQL**, por uma **API em Hono** que roda no mesmo servidor do site. Tudo fica no **Railway**: um serviço com este repositório (site + API) e um banco PostgreSQL.

```
navegador ── POST /api/lista-espera ──▶ servidor Hono (api/) ──▶ PostgreSQL (tabela lista_espera)
          ◀──────── o site (dist/) ──────────┘
```

Site e API no mesmo endereço: não precisa de CORS nem de um segundo repositório. Se um dia o site for para outro lugar, a API continua igual (aí é só liberar CORS para o domínio do site).

## O quiz

A inscrição é um quiz, uma pergunta por tela, como o `/formulario` do site da Upside. Ele tem endereço próprio, `/lista-de-espera`:
- quando alguém clica num botão da lista, abre por cima da página;
- serve de link direto para anúncios e para a bio do Instagram (`https://<domínio>/lista-de-espera?utm_source=instagram&utm_campaign=lancamento`);
- o Voltar do navegador e o Esc fecham o quiz, e abrir de novo continua de onde a pessoa parou.

| Para quem | Perguntas |
|---|---|
| todos | viajante ou agência de viagens |
| viajante | destino (opcional, com os destinos do lançamento como sugestão), quando viaja, com quem vai, o que mais quer usar (opcional, várias) |
| agência | nome da agência, quantas viagens vende por mês |
| todos | nome, e-mail, WhatsApp (opcional para viajante, obrigatório para agência) |

Escolha única avança sozinha. No computador, Enter confirma e as letras A, B, C… escolhem a opção. Onde está cada parte:
- perguntas, textos e opções: `src/conteudo/lista-espera.ts`;
- a tela: `src/components/lista/QuizListaEspera.tsx`;
- o endereço e o `irParaLista()`: `src/lib/rota-lista.ts`.

## O que é gravado

`perfil` (viajante ou agência), `nome`, `email` (em minúsculas), `whatsapp`, `agencia` (para agência) ou `destino` (para viajante), as respostas do quiz, a origem da visita (`utm_source`, `utm_medium`, `utm_campaign`, lidos do link) e `criado_em`. Use links como `https://site/?utm_source=instagram&utm_medium=pago&utm_campaign=lancamento` nos anúncios para saber qual campanha trouxe cada inscrição. O convite por WhatsApp da confirmação já vem com `utm_source=convite`.

As respostas do quiz ficam como códigos curtos, fáceis de filtrar na planilha:

| Coluna | Perfil | Valores |
|---|---|---|
| `quando` | viajante | `3-meses`, `6-meses` (de 3 a 6 meses), `mais-tarde` (mais de 6 meses), `sem-data` |
| `com_quem` | viajante | `so-eu`, `casal`, `familia`, `amigos` |
| `interesses` | viajante | as 6 funcionalidades da campanha: `personalizado`, `mapa`, `ajustes`, `assistente`, `foto`, `compartilhar` (lista no banco; no CSV, separadas por vírgula) |
| `viagens_mes` | agência | `ate-10`, `11-30`, `31-100`, `mais-100` (as faixas batem com os planos para agências) |

A tabela está em `api/sql/001_lista_espera.sql` e as colunas do quiz em `api/sql/002_quiz.sql`. A API roda esses arquivos toda vez que sobe (tudo é `if not exists`), então não existe passo manual de criar tabela. Num banco que já tem inscrições, as colunas novas entram vazias nas antigas.

## A API

| Rota | O que faz |
|---|---|
| `GET /api/saude` | responde `{"ok":true}` se o banco responde (o Railway usa como healthcheck) |
| `POST /api/lista-espera` | grava a inscrição. `204` para nova **e** para repetida; `400` com o motivo se algo estiver inválido; `429` se o mesmo IP passar do limite |
| `GET /api/lista-espera.csv` | baixa a lista inteira. O navegador pede usuário e senha (`ADMIN_USUARIO` / `ADMIN_SENHA`). Separado por `;` e com acentos certos: abre direto no Excel |

Proteções:
- **Validação:** as mesmas regras do quiz, repetidas na API, porque a API é pública. As respostas de escolha só aceitam os códigos da tabela acima (`RESPOSTAS` em `api/src/validar.ts`), e o banco recusa qualquer outro.
- **E-mail repetido:** é ignorado, com a mesma resposta de uma inscrição nova. Assim ninguém descobre quem já está na lista.
- **Sem fórmula:** textos que começam com `=`, `+`, `-` ou `@` são limpos na API, e o banco recusa mesmo gravação direta. Assim o CSV não vira fórmula no Excel ou no Google Planilhas.
- **Limite por IP:** 10 inscrições a cada 10 minutos (`LIMITE_POR_IP`), corpo de até 8 KB e cabeçalhos de segurança.

## Deploy no Railway

1. **New Project → Deploy from GitHub repo** → escolha este repositório. O Railway lê o `railway.json`: build `pnpm build` (site + API), start `node api/dist/index.js` e healthcheck em `/api/saude`.
2. No mesmo projeto: **+ New → Database → PostgreSQL**.
3. No serviço do site, aba **Variables**:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (referência ao banco, pela rede interna do Railway)
   - `ADMIN_SENHA` = uma senha forte (libera o CSV; sem ela, a rota fica desligada)
   - `ADMIN_USUARIO` (opcional, padrão `admin`) e `LIMITE_POR_IP` (opcional, padrão 10)
4. **Settings → Networking → Generate Domain** (ou ligue o domínio próprio).
5. Abra o domínio, faça uma inscrição de teste e baixe a lista em `https://<domínio>/api/lista-espera.csv`.

Para ver os dados sem baixar nada: no Railway, abra o serviço do PostgreSQL → aba **Data** → tabela `lista_espera`. Guarde o CSV de tempos em tempos, ou configure backup do banco, para não depender de um lugar só.

## Desenvolver no computador

Não precisa instalar Postgres: o `pnpm db:local` sobe um Postgres em memória (PGlite) que fala o protocolo do Postgres. Os dados somem quando ele para.

```bash
cp .env.example .env.local      # e preencha ADMIN_SENHA
pnpm db:local                   # Postgres em memória na porta 54320
pnpm dev:api                    # API na porta 8787 (lê o .env.local)
pnpm dev                        # site na 5211; o Vite repassa /api para a 8787
```

Sem `.env.local`, o `pnpm dev` roda em **modo demonstração**: as inscrições ficam só no `localStorage` do navegador, e o quiz avisa com o selo "Modo demonstração" no alto.

Para simular o Railway inteiro, rode `pnpm build` e depois `node api/dist/index.js`, com as mesmas variáveis: o servidor serve o site e a API na porta 8787.

No **Git Bash**, não passe `VITE_LISTA_ESPERA_API=/api` na linha de comando: ele troca `/api` por `C:/Program Files/Git/api`. Use o `.env.local` (ou o PowerShell).

## Testes

```bash
pnpm testar:api                                   # a API contra um Postgres em memória: gravação, respostas do quiz, repetido, fórmula, validação, limite, CSV
ADMIN_SENHA=… node scripts/e2e-lista.mjs http://localhost:8787/   # o quiz no navegador, conferindo no CSV o que o Postgres gravou
```

## LGPD

O quiz pede só o necessário para o lançamento: as perguntas de perfil servem para priorizar destinos e planos, e as opcionais podem ser puladas. O site não tem política de privacidade publicada: inclua uma (revisada pelo jurídico) antes de abrir a lista ao público. Pedidos de exclusão chegam no e-mail de `EMPRESA` (`src/conteudo/site.ts`, hoje um endereço fictício). Para atender, apague a linha pela aba **Data** do Postgres no Railway.
