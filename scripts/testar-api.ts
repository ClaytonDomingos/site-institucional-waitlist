/* pnpm testar:api — testa a API da lista de espera contra um Postgres de
   verdade em memória (PGlite falando o protocolo do Postgres, pela mesma
   biblioteca postgres.js da produção): migração, inscrição, respostas do
   quiz, repetido, limpeza de fórmula, validação, limite por IP, CSV com
   senha e as regras do banco. Não precisa de nada rodando. */
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { conectar, migrar } from "../api/src/banco.js";
import { criarApp } from "../api/src/app.js";
import { RESPOSTAS } from "../api/src/validar.js";
import { COM_QUEM, INTERESSES, QUANDO, VIAGENS_MES } from "../src/conteudo/lista-espera.js";

const PORTA = 54329;
const db = await PGlite.create();
const servidor = new PGLiteSocketServer({ db, port: PORTA, host: "127.0.0.1" });
await servidor.start();
const sql = conectar(`postgres://postgres:postgres@127.0.0.1:${PORTA}/postgres`, 1);

let falhas = 0;
async function caso(nome: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log("ok  ", nome);
  } catch (e) {
    falhas++;
    console.log("FALHOU", nome, "\n     ", e instanceof Error ? e.message : e);
  }
}
function esperar(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

await caso("migração roda e é idempotente", async () => {
  await migrar(sql);
  const arquivos = await migrar(sql);
  esperar(arquivos.join() === "001_lista_espera.sql,002_quiz.sql", `migrações: ${arquivos}`);
});

await caso("as opções do quiz (site) são as que a API aceita", async () => {
  const ids = (opcoes: readonly { id: string }[]) => opcoes.map((o) => o.id).join();
  for (const [nome, site, api] of [
    ["quando", QUANDO, RESPOSTAS.quando],
    ["com_quem", COM_QUEM, RESPOSTAS.com_quem],
    ["interesses", INTERESSES, RESPOSTAS.interesses],
    ["viagens_mes", VIAGENS_MES, RESPOSTAS.viagens_mes],
  ] as const) {
    esperar(ids(site) === api.join(), `${nome}: site ${ids(site)} · API ${api.join()}`);
  }
});

const app = criarApp(sql, { admin: { usuario: "admin", senha: "segredo" }, limitePorIp: 50 });
const inscrever = (corpo: unknown, ip = "200.1.1.1") =>
  app.request("/api/lista-espera", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: typeof corpo === "string" ? corpo : JSON.stringify(corpo) });
const linhas = async (email: string) => sql`select * from lista_espera where email = ${email}`;

await caso("GET /api/saude responde 200", async () => {
  const r = await app.request("/api/saude");
  esperar(r.status === 200, `status ${r.status}`);
});

await caso("viajante válido: 204 e linha gravada, com UTM", async () => {
  const r = await inscrever({ perfil: "viajante", nome: "Marina Lopes", email: "Marina@Exemplo.com", whatsapp: "(11) 98765-4321", destino: "Lisboa", utm_source: "instagram", utm_campaign: "lancamento" });
  esperar(r.status === 204, `status ${r.status}`);
  const [l] = await linhas("marina@exemplo.com");
  esperar(!!l && l.destino === "Lisboa" && l.utm_source === "instagram" && l.agencia === null, JSON.stringify(l));
});

await caso("agência válida: 204, sem destino", async () => {
  const r = await inscrever({ perfil: "agencia", nome: "Juliana Martins", email: "juliana@rotasul.com.br", whatsapp: "(51) 99876-5432", agencia: "Rota Sul Viagens", destino: "não vale" });
  esperar(r.status === 204, `status ${r.status}`);
  const [l] = await linhas("juliana@rotasul.com.br");
  esperar(l?.agencia === "Rota Sul Viagens" && l.destino === null, JSON.stringify(l));
});

await caso("viajante com as respostas do quiz: interesses sem repetir, na ordem das opções", async () => {
  const r = await inscrever({
    perfil: "viajante",
    nome: "Paula Reis",
    email: "paula@exemplo.com",
    destino: "Roma",
    quando: "3-meses",
    com_quem: "familia",
    interesses: ["foto", "mapa", "foto"],
    viagens_mes: "31-100",
  });
  esperar(r.status === 204, `status ${r.status}`);
  const [l] = await linhas("paula@exemplo.com");
  esperar(l?.quando === "3-meses" && l.com_quem === "familia" && l.viagens_mes === null, JSON.stringify(l));
  esperar(JSON.stringify(l.interesses) === '["mapa","foto"]', `interesses ${JSON.stringify(l.interesses)}`);
});

await caso("agência com o quiz: viagens por mês gravada, respostas de viajante ignoradas", async () => {
  const r = await inscrever({
    perfil: "agencia",
    nome: "Caio Prado",
    email: "caio@viajebem.com.br",
    whatsapp: "(21) 99876-1234",
    agencia: "Viaje Bem",
    viagens_mes: "31-100",
    quando: "3-meses",
    interesses: ["mapa"],
  });
  esperar(r.status === 204, `status ${r.status}`);
  const [l] = await linhas("caio@viajebem.com.br");
  esperar(l?.viagens_mes === "31-100" && l.quando === null && l.interesses === null, JSON.stringify(l));
});

await caso("repetido (outra caixa e espaços): mesma resposta 204 e continua 1 linha", async () => {
  const r = await inscrever({ perfil: "viajante", nome: "Outra Pessoa", email: "  MARINA@exemplo.com " });
  esperar(r.status === 204, `status ${r.status}`);
  const ls = await linhas("marina@exemplo.com");
  esperar(ls.length === 1 && ls[0].nome === "Marina Lopes", `${ls.length} linha(s), nome ${ls[0]?.nome}`);
});

await caso("= + - @ no começo são tirados antes de gravar", async () => {
  const r = await inscrever({ perfil: "viajante", nome: '=HYPERLINK("x") Ana', email: "ana@exemplo.com", destino: "+Roma", utm_source: "@ig" });
  esperar(r.status === 204, `status ${r.status}`);
  const [l] = await linhas("ana@exemplo.com");
  esperar(l?.nome === 'HYPERLINK("x") Ana' && l.destino === "Roma" && l.utm_source === "ig", JSON.stringify(l));
});

for (const [nome, corpo, esperado] of [
  ["perfil inválido", { perfil: "admin", nome: "Teste", email: "t1@exemplo.com" }, 400],
  ["e-mail inválido", { perfil: "viajante", nome: "Teste", email: "sem-arroba.com" }, 400],
  ["e-mail começando com fórmula", { perfil: "viajante", nome: "Teste", email: "=cmd@exemplo.com" }, 400],
  ["nome só de símbolos", { perfil: "viajante", nome: "===", email: "t2@exemplo.com" }, 400],
  ["WhatsApp curto", { perfil: "viajante", nome: "Teste", email: "t3@exemplo.com", whatsapp: "1198" }, 400],
  ["agência sem WhatsApp", { perfil: "agencia", nome: "Teste", email: "t4@exemplo.com", agencia: "Agência X" }, 400],
  ["quando fora da lista", { perfil: "viajante", nome: "Teste", email: "t7@exemplo.com", quando: "ontem" }, 400],
  ["interesse desconhecido", { perfil: "viajante", nome: "Teste", email: "t8@exemplo.com", interesses: ["mapa", "hack"] }, 400],
  ["interesses que não são lista", { perfil: "viajante", nome: "Teste", email: "t9@exemplo.com", interesses: "mapa" }, 400],
  ["viagens por mês fora da lista", { perfil: "agencia", nome: "Teste", email: "t10@exemplo.com", whatsapp: "(11) 98765-4321", agencia: "Agência X", viagens_mes: "999" }, 400],
  ["corpo que não é JSON", "isto não é json", 400],
  ["corpo maior que 8 KB", { perfil: "viajante", nome: "x".repeat(9000), email: "t5@exemplo.com" }, 413],
] as const) {
  await caso(`recusa: ${nome} (${esperado})`, async () => {
    const r = await inscrever(corpo);
    esperar(r.status === esperado, `status ${r.status}`);
  });
}

await caso("limite por IP: a 6ª inscrição em 10 min volta 429", async () => {
  const apertado = criarApp(sql, { limitePorIp: 5 });
  const status: number[] = [];
  for (let i = 0; i < 6; i++) {
    const r = await apertado.request("/api/lista-espera", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0.9, 177.10.10.10" },
      body: JSON.stringify({ perfil: "viajante", nome: "Robô Teste", email: `robo${i}@exemplo.com` }),
    });
    status.push(r.status);
  }
  esperar(status.join() === "204,204,204,204,204,429", status.join());
});

await caso("CSV sem senha: 401 pedindo login", async () => {
  const r = await app.request("/api/lista-espera.csv");
  esperar(r.status === 401 && (r.headers.get("www-authenticate") ?? "").startsWith("Basic"), `status ${r.status}`);
});

await caso("CSV com senha: separado por ;, com BOM, sem fórmula", async () => {
  const r = await app.request("/api/lista-espera.csv", { headers: { authorization: `Basic ${btoa("admin:segredo")}` } });
  esperar(r.status === 200 && (r.headers.get("content-type") ?? "").includes("text/csv"), `status ${r.status}`);
  /* o BOM está nos bytes (o .text() do fetch o remove ao decodificar) */
  const bytes = new Uint8Array(await r.arrayBuffer());
  esperar(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf, "sem BOM");
  const texto = new TextDecoder().decode(bytes);
  esperar(texto.startsWith("criado_em;perfil;nome;email;whatsapp;agencia;destino;quando;com_quem;interesses;viagens_mes;utm_source"), texto.slice(0, 120));
  const corpo = texto.split("\r\n").slice(1).filter(Boolean);
  esperar(corpo.length === 10, `${corpo.length} linhas`);
  esperar(corpo.every((l) => l.split(";").every((cel) => !/^[=+\-@]/.test(cel))), "célula começando com fórmula");
  const paula = corpo.find((l) => l.includes("paula@exemplo.com")) ?? "";
  esperar(paula.includes(";3-meses;familia;mapa, foto;;"), paula);
});

await caso("CSV desligado sem ADMIN_SENHA: 404", async () => {
  const r = await criarApp(sql, { limitePorIp: 5 }).request("/api/lista-espera.csv");
  esperar(r.status === 404, `status ${r.status}`);
});

await caso("rota desconhecida em /api: 404 em JSON", async () => {
  const r = await app.request("/api/nada");
  esperar(r.status === 404 && (await r.json()).erro === "Rota não encontrada.", `status ${r.status}`);
});

await caso("o banco recusa fórmula e e-mail com maiúscula mesmo gravando direto", async () => {
  for (const [nome, email] of [
    ["=1+1", "t6@exemplo.com"],
    ["Teste", "Maiuscula@exemplo.com"],
  ]) {
    const erro = await sql`insert into lista_espera (perfil, nome, email) values ('viajante', ${nome}, ${email})`.then(
      () => null,
      (e: { code?: string }) => e.code,
    );
    esperar(erro === "23514", `${nome} / ${email}: ${erro}`);
  }
});

await caso("o banco recusa resposta do quiz fora da lista mesmo gravando direto", async () => {
  const tentativas = [
    sql`insert into lista_espera (perfil, nome, email, quando) values ('viajante', 'Teste', 't11@exemplo.com', 'ontem')`,
    sql`insert into lista_espera (perfil, nome, email, interesses) values ('viajante', 'Teste', 't12@exemplo.com', ${sql.array(["mapa", "hack"])})`,
    sql`insert into lista_espera (perfil, nome, email, interesses) values ('viajante', 'Teste', 't13@exemplo.com', '{}')`,
  ];
  for (const [i, t] of tentativas.entries()) {
    const erro = await t.then(
      () => null,
      (e: { code?: string }) => e.code,
    );
    esperar(erro === "23514", `tentativa ${i + 1}: ${erro}`);
  }
});

await sql.end();
await servidor.stop();
await db.close();
console.log(falhas ? `\n${falhas} falha(s)` : "\ntudo certo");
process.exit(falhas ? 1 : 0);
