import { Hono, type Context } from "hono";
import { basicAuth } from "hono/basic-auth";
import { bodyLimit } from "hono/body-limit";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";
import { serveStatic } from "@hono/node-server/serve-static";
import type { Banco } from "./banco.js";
import { validarInscricao } from "./validar.js";

/* ---------------------------------------------------------------------------
   O servidor do site: a API da lista de espera e, se houver o site compilado
   (dist/), o próprio site, no mesmo endereço. Assim não precisa de CORS.

   GET  /api/saude              o Railway usa para saber se subiu (testa o banco)
   POST /api/lista-espera       inscreve; 204 tanto para inscrição nova quanto
                                repetida (não revela quem já está na lista)
   GET  /api/lista-espera.csv   a lista para abrir no Excel; pede usuário e
                                senha (ADMIN_USUARIO / ADMIN_SENHA)
   GET  /*                      o site (dist/)
--------------------------------------------------------------------------- */

export interface Config {
  /** usuário e senha do CSV; sem eles, a rota não existe */
  admin?: { usuario: string; senha: string };
  /** inscrições aceitas por IP a cada 10 minutos */
  limitePorIp: number;
  /** pasta do site já compilado; sem ela, só a API */
  pastaSite?: string;
}

const DEZ_MINUTOS = 10 * 60 * 1000;

/** Limite em memória, por processo. Basta para segurar robô numa lista de espera. */
function criarLimite(maximo: number) {
  const vistos = new Map<string, number[]>();
  return (chave: string): boolean => {
    const agora = Date.now();
    const recentes = (vistos.get(chave) ?? []).filter((t) => agora - t < DEZ_MINUTOS);
    const permitido = recentes.length < maximo;
    if (permitido) recentes.push(agora);
    vistos.set(chave, recentes);
    if (vistos.size > 5000) for (const [k, ts] of vistos) if (!ts.some((t) => agora - t < DEZ_MINUTOS)) vistos.delete(k);
    return permitido;
  };
}

/** IP de quem chamou. Atrás do proxy do Railway, o último X-Forwarded-For é o que o proxy viu (esse o cliente não forja). */
function ipDe(c: Context): string {
  return c.req.header("x-forwarded-for")?.split(",").at(-1)?.trim() || "local";
}

/** célula do CSV: separado por ; (o Excel em português usa ;), entre aspas quando precisa, e nada começa como fórmula */
function celula(valor: unknown): string {
  let t = valor == null ? "" : String(valor);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return /[;"\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

const COLUNAS = [
  "criado_em",
  "perfil",
  "nome",
  "email",
  "whatsapp",
  "agencia",
  "destino",
  "quando",
  "com_quem",
  "interesses",
  "viagens_mes",
  "utm_source",
  "utm_medium",
  "utm_campaign",
] as const;

export function criarApp(sql: Banco, cfg: Config) {
  const app = new Hono();
  const limite = criarLimite(cfg.limitePorIp);

  app.use("*", secureHeaders());

  app.get("/api/saude", async (c) => {
    await sql`select 1`;
    return c.json({ ok: true });
  });

  app.post("/api/lista-espera", bodyLimit({ maxSize: 8 * 1024, onError: (c) => c.json({ erro: "Inscrição grande demais." }, 413) }), async (c) => {
    if (!limite(ipDe(c))) return c.json({ erro: "Muitas inscrições seguidas deste endereço. Tente de novo em alguns minutos." }, 429);
    const v = validarInscricao(await c.req.json().catch(() => null));
    if (!v.ok) return c.json({ erro: v.erro }, 400);
    /* repetido: o banco ignora (on conflict do nothing) e a resposta é a mesma */
    await sql`insert into lista_espera ${sql(v.inscricao)} on conflict (email) do nothing`;
    return c.body(null, 204);
  });

  if (cfg.admin) {
    app.get("/api/lista-espera.csv", basicAuth({ username: cfg.admin.usuario, password: cfg.admin.senha, realm: "Lista de espera" }), async (c) => {
      const linhas = await sql`
        select to_char(criado_em at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') as criado_em,
               perfil, nome, email, whatsapp, agencia, destino,
               quando, com_quem, array_to_string(interesses, ', ') as interesses, viagens_mes,
               utm_source, utm_medium, utm_campaign
        from lista_espera
        order by id`;
      const csv = [COLUNAS.join(";"), ...linhas.map((l) => COLUNAS.map((k) => celula(l[k])).join(";"))].join("\r\n");
      /* o BOM faz o Excel abrir os acentos certo */
      return c.body(`﻿${csv}\r\n`, 200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="lista-de-espera-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      });
    });
  }

  app.all("/api/*", (c) => c.json({ erro: "Rota não encontrada." }, 404));

  if (cfg.pastaSite) {
    /* arquivos de dist/assets têm hash no nome: podem ficar em cache para sempre; o resto, não */
    const cache = (_arquivo: string, c: Context) => c.header("Cache-Control", c.req.path.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache");
    app.use("/*", serveStatic({ root: cfg.pastaSite, onFound: cache }));
    app.get("*", serveStatic({ path: `${cfg.pastaSite}/index.html`, onFound: cache }));
  }

  app.onError((erro, c) => {
    if (erro instanceof HTTPException) return erro.getResponse();
    console.error("[api]", erro);
    return c.json({ erro: "Erro interno. Tente de novo em alguns minutos." }, 500);
  });
  return app;
}
