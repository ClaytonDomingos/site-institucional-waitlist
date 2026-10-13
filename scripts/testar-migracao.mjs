/* pnpm testar:sql — aplica a migração da lista de espera num Postgres em
   memória (PGlite, sem instalar nada) e confere as regras como os papéis da
   API do Supabase (anon, authenticated): só a função de inscrição funciona,
   a tabela fica fechada, repetido é ignorado e nada começa com fórmula. */
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const sqlPath = new URL("../supabase/migrations/20261013120000_lista_espera.sql", import.meta.url);
const db = new PGlite();

// o que o Supabase já tem: os papéis da API e os privilégios padrão no schema public
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
`);
await db.exec(readFileSync(sqlPath, "utf8"));
console.log("ok   migração aplicada");
await db.exec(readFileSync(sqlPath, "utf8"));
console.log("ok   migração aplicada de novo (idempotente)");

let falhas = 0;
async function caso(nome, sql, espera, papel = "anon") {
  try {
    await db.exec(`begin; ${papel ? `set local role ${papel};` : ""}`);
    await db.query(sql);
    await db.exec("commit;");
    if (espera === "ok") console.log("ok  ", nome);
    else {
      falhas++;
      console.log("FALHOU", nome, "— passou, mas devia dar", espera);
    }
  } catch (e) {
    await db.exec("rollback;").catch(() => {});
    const codigo = e.code ?? "?";
    if (espera !== "ok" && codigo === espera) console.log("ok  ", nome, `(${codigo}: ${e.message.split("\n")[0]})`);
    else {
      falhas++;
      console.log("FALHOU", nome, `— ${codigo}: ${e.message.split("\n")[0]}`);
    }
  }
}

const rpc = (args) => `select public.entrar_na_lista_espera(${args})`;
// como o PostgREST chama: parâmetros por nome
await caso("anon entra como viajante", rpc(`p_perfil => 'viajante', p_nome => 'Marina Lopes', p_email => 'marina@exemplo.com', p_whatsapp => '(11) 98765-4321', p_destino => 'Lisboa', p_utm_source => 'instagram', p_utm_medium => 'pago', p_utm_campaign => 'lancamento'`), "ok");
await caso("anon entra como agência", rpc(`p_perfil => 'agencia', p_nome => 'Juliana Martins', p_email => 'juliana@rotasul.com.br', p_whatsapp => '(51) 99876-5432', p_agencia => 'Rota Sul Viagens'`), "ok");
await caso("e-mail repetido (outra caixa) é ignorado sem erro", rpc(`p_perfil => 'viajante', p_nome => 'Outra Pessoa', p_email => '  MARINA@Exemplo.com '`), "ok");
await caso("fórmulas no começo são tiradas pela função", rpc(`p_perfil => 'viajante', p_nome => '=HYPERLINK("x") Ana', p_email => 'ana@exemplo.com', p_destino => '+Roma', p_utm_source => '@ig'`), "ok");
await caso("destino de agência e agência de viajante são descartados", rpc(`p_perfil => 'viajante', p_nome => 'Bruno', p_email => 'bruno@exemplo.com', p_agencia => 'Não devia', p_destino => 'Lisboa'`), "ok");
await caso("agência sem WhatsApp é recusada", rpc(`p_perfil => 'agencia', p_nome => 'Teste', p_email => 'teste1@exemplo.com', p_agencia => 'Agência X'`), "23514");
await caso("perfil inválido é recusado", rpc(`p_perfil => 'admin', p_nome => 'Teste', p_email => 'teste2@exemplo.com'`), "23514");
await caso("e-mail inválido é recusado", rpc(`p_perfil => 'viajante', p_nome => 'Teste', p_email => 'sem-arroba.com'`), "23514");
await caso("nome só de símbolos vira vazio e é recusado", rpc(`p_perfil => 'viajante', p_nome => '===', p_email => 'teste3@exemplo.com'`), "23502");
await caso("anon não lê a lista", `select * from public.lista_espera`, "42501");
await caso("anon não grava direto na tabela", `insert into public.lista_espera (perfil, nome, email) values ('viajante','Teste','teste4@exemplo.com')`, "42501");
await caso("anon não altera", `update public.lista_espera set nome = 'x'`, "42501");
await caso("anon não apaga", `delete from public.lista_espera`, "42501");
await caso("anon não chama a função de limpeza", `select public.lista_espera_limpar('x')`, "42501");
await caso("authenticated não chama a função de inscrição", rpc(`p_perfil => 'viajante', p_nome => 'Teste', p_email => 'teste5@exemplo.com'`), "42501", "authenticated");
// mesmo gravando por fora da função (painel, script), nada começa com fórmula: o CSV exportado é seguro
await caso("CHECK barra fórmula gravada direto pelo dono", `insert into public.lista_espera (perfil, nome, email) values ('viajante','=1+1','teste6@exemplo.com')`, "23514", null);
await caso("CHECK barra e-mail em maiúsculas gravado direto", `insert into public.lista_espera (perfil, nome, email) values ('viajante','Teste','Teste7@exemplo.com')`, "23514", null);

const r = await db.query("select perfil, nome, email, whatsapp, agencia, destino, utm_source, utm_medium, utm_campaign from public.lista_espera order by criado_em, email");
console.log("\nna tabela (lida como dono, como no painel do Supabase):");
for (const l of r.rows) console.log("  ", JSON.stringify(l));
const esperado = {
  "marina@exemplo.com": { nome: "Marina Lopes", destino: "Lisboa", utm_source: "instagram" },
  "juliana@rotasul.com.br": { agencia: "Rota Sul Viagens", whatsapp: "(51) 99876-5432" },
  "ana@exemplo.com": { nome: 'HYPERLINK("x") Ana', destino: "Roma", utm_source: "ig" },
  "bruno@exemplo.com": { agencia: null, destino: "Lisboa" },
};
if (r.rows.length !== 4) {
  falhas++;
  console.log("FALHOU esperava 4 linhas, veio", r.rows.length);
}
for (const [email, campos] of Object.entries(esperado)) {
  const l = r.rows.find((x) => x.email === email);
  for (const [k, v] of Object.entries(campos)) {
    if (l?.[k] !== v) {
      falhas++;
      console.log(`FALHOU ${email}.${k}: ${JSON.stringify(l?.[k])} ≠ ${JSON.stringify(v)}`);
    }
  }
}
console.log(falhas ? `\n${falhas} falha(s)` : "\ntudo certo");
process.exit(falhas ? 1 : 0);
