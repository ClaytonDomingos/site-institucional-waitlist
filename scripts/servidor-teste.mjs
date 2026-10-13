/* Servidor local que imita os dois destinos reais da lista de espera, para
   testar o formulário sem credenciais:
   - POST /rest/v1/lista_espera   como a API REST do Supabase (PostgREST): exige
     apikey, responde 201 e 409 para e-mail repetido (unique em lower(email))
   - POST /webhook                como um webhook do n8n / Apps Script (form-urlencoded)
   - GET  /inscricoes             o que chegou até agora (para conferir no teste)
   Responde ao preflight de CORS como o Supabase.

   node scripts/servidor-teste.mjs            (porta 54321)
   VITE_SUPABASE_URL=http://localhost:54321 VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_teste pnpm dev
   VITE_LISTA_ESPERA_WEBHOOK=http://localhost:54321/webhook pnpm dev */
import { createServer } from "node:http";

const PORTA = Number(process.env.PORTA ?? 54321);
const inscricoes = [];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type, prefer, x-client-info",
};

function responder(res, status, corpo) {
  res.writeHead(status, { ...cors, ...(corpo ? { "Content-Type": "application/json" } : {}) });
  res.end(corpo ? JSON.stringify(corpo) : undefined);
}

createServer(async (req, res) => {
  if (req.method === "OPTIONS") return responder(res, 204);
  if (req.method === "GET" && req.url === "/inscricoes") return responder(res, 200, inscricoes);

  let texto = "";
  for await (const parte of req) texto += parte;

  if (req.method === "POST" && req.url === "/rest/v1/lista_espera") {
    const cab = { apikey: req.headers.apikey, authorization: req.headers.authorization ?? null, prefer: req.headers.prefer, contentType: req.headers["content-type"] };
    console.log("[supabase]", JSON.stringify(cab), texto);
    if (!req.headers.apikey) return responder(res, 401, { message: "No API key found in request" });
    let linha;
    try {
      linha = JSON.parse(texto);
    } catch {
      return responder(res, 400, { message: "JSON inválido" });
    }
    if (inscricoes.some((i) => i.email?.toLowerCase() === linha.email?.toLowerCase())) {
      return responder(res, 409, { code: "23505", message: 'duplicate key value violates unique constraint "lista_espera_email_unico"' });
    }
    inscricoes.push({ via: "supabase", ...linha, cabecalhos: cab });
    return responder(res, 201);
  }

  if (req.method === "POST" && req.url === "/webhook") {
    const campos = Object.fromEntries(new URLSearchParams(texto));
    console.log("[webhook]", req.headers["content-type"], JSON.stringify(campos));
    inscricoes.push({ via: "webhook", ...campos });
    return responder(res, 200, { ok: true });
  }

  responder(res, 404, { message: "não encontrado" });
}).listen(PORTA, () => console.log(`servidor de teste em http://localhost:${PORTA}`));
