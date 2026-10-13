/* pnpm db:local — Postgres em memória (PGlite) para desenvolver sem instalar
   nem configurar nada. Fala o protocolo do Postgres na porta 54320:
     DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54320/postgres
     PG_MAX=1   (o PGlite atende uma conexão por vez)
   Os dados somem quando o processo para. Em produção é o Postgres do Railway. */
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const porta = Number(process.env.PORTA ?? 54320);
const db = await PGlite.create();
const servidor = new PGLiteSocketServer({ db, port: porta, host: "127.0.0.1", maxConnections: 4 });
await servidor.start();
console.log(`Postgres em memória em postgres://postgres:postgres@127.0.0.1:${porta}/postgres (Ctrl+C para parar)`);

for (const sinal of ["SIGINT", "SIGTERM"]) {
  process.once(sinal, async () => {
    await servidor.stop();
    await db.close();
    process.exit(0);
  });
}
