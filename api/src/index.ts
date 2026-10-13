import { existsSync } from "node:fs";
import { serve } from "@hono/node-server";
import { conectar, migrar } from "./banco.js";
import { criarApp } from "./app.js";

/* ---------------------------------------------------------------------------
   Sobe o servidor: conecta no Postgres, roda as migrações (api/sql) e serve
   a API em /api e o site compilado (dist/) no mesmo endereço.

   Variáveis (no Railway, em Variables do serviço):
   DATABASE_URL    obrigatória. No Railway: ${{Postgres.DATABASE_URL}}
   ADMIN_SENHA     libera o CSV em /api/lista-espera.csv (usuário: ADMIN_USUARIO, padrão admin)
   LIMITE_POR_IP   inscrições por IP a cada 10 minutos (padrão 10)
   PG_MAX          conexões com o banco (padrão 5; o pnpm db:local aceita 1)
   PORT            o Railway define sozinho (local: 8787)
--------------------------------------------------------------------------- */

const env = process.env;
if (!env.DATABASE_URL) {
  console.error("[api] falta DATABASE_URL. No Railway, use ${{Postgres.DATABASE_URL}}; local, rode pnpm db:local (veja .env.example).");
  process.exit(1);
}

const sql = conectar(env.DATABASE_URL, Number(env.PG_MAX) || 5);
const migracoes = await migrar(sql);
console.log(`[api] banco pronto (${migracoes.join(", ")})`);

const pastaSite = existsSync("dist/index.html") ? "./dist" : undefined;
if (!pastaSite) console.log("[api] sem dist/: servindo só a API (rode pnpm build para servir o site junto)");
if (!env.ADMIN_SENHA) console.log("[api] sem ADMIN_SENHA: o CSV em /api/lista-espera.csv fica desligado");

const app = criarApp(sql, {
  admin: env.ADMIN_SENHA ? { usuario: env.ADMIN_USUARIO || "admin", senha: env.ADMIN_SENHA } : undefined,
  limitePorIp: Number(env.LIMITE_POR_IP) || 10,
  pastaSite,
});

const porta = Number(env.PORT) || 8787;
/* "::" escuta em IPv6 e IPv4 (a rede interna do Railway é IPv6) */
const servidor = serve({ fetch: app.fetch, port: porta, hostname: env.HOST || "::" }, () => console.log(`[api] no ar em http://localhost:${porta}`));

/* o Railway manda SIGTERM a cada novo deploy: termina o que está em curso e fecha o banco */
for (const sinal of ["SIGTERM", "SIGINT"] as const) {
  process.once(sinal, () => {
    servidor.close();
    void sql.end({ timeout: 5 }).finally(() => process.exit(0));
  });
}
