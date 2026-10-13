import { readdir, readFile } from "node:fs/promises";
import postgres from "postgres";

/* Conexão com o Postgres e as migrações (os arquivos de api/sql, em ordem). */

export type Banco = postgres.Sql;

export function conectar(url: string, maxConexoes: number): Banco {
  return postgres(url, {
    max: maxConexoes,
    idle_timeout: 30,
    connect_timeout: 10,
    /* os "already exists, skipping" do if not exists não interessam */
    onnotice: () => {},
  });
}

/** Roda os .sql de api/sql em ordem. São idempotentes: dá para rodar a cada subida. */
export async function migrar(sql: Banco): Promise<string[]> {
  const pasta = new URL("../sql/", import.meta.url);
  const arquivos = (await readdir(pasta)).filter((f) => f.endsWith(".sql")).sort();
  for (const arquivo of arquivos) {
    /* simple: o arquivo tem vários comandos (o protocolo "extended" aceita só um) */
    await sql.unsafe(await readFile(new URL(arquivo, pasta), "utf8")).simple();
  }
  return arquivos;
}
