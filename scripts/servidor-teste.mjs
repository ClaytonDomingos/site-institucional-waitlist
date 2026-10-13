/* Servidor local que imita os dois destinos reais da lista de espera, para
   testar o formulário sem credenciais:
   - POST /rest/v1/rpc/entrar_na_lista_espera   como a função do Supabase: exige
     apikey, limpa os campos como o SQL, ignora e-mail repetido e responde 204
   - POST /webhook                               como um webhook do n8n / Apps Script (form-urlencoded)
   - GET  /inscricoes                            o que ficou gravado (para conferir no teste)
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

/* o mesmo que public.lista_espera_limpar() */
const limpar = (v) => (typeof v === "string" ? v.trim().replace(/^[\s=+@-]+/, "") || null : null);

createServer(async (req, res) => {
  if (req.method === "OPTIONS") return responder(res, 204);
  if (req.method === "GET" && req.url === "/inscricoes") return responder(res, 200, inscricoes);

  let texto = "";
  for await (const parte of req) texto += parte;

  if (req.method === "POST" && req.url === "/rest/v1/rpc/entrar_na_lista_espera") {
    const cab = { apikey: req.headers.apikey, authorization: req.headers.authorization ?? null, contentType: req.headers["content-type"] };
    console.log("[supabase]", JSON.stringify(cab), texto);
    if (!req.headers.apikey) return responder(res, 401, { message: "No API key found in request" });
    let p;
    try {
      p = JSON.parse(texto);
    } catch {
      return responder(res, 400, { message: "JSON inválido" });
    }
    const email = String(p.p_email ?? "").trim().toLowerCase();
    if (!p.p_perfil || !limpar(p.p_nome) || !email) return responder(res, 400, { code: "23502", message: "campo obrigatório vazio" });
    /* on conflict (email) do nothing: repetido some sem erro */
    if (!inscricoes.some((i) => i.via === "supabase" && i.email === email)) {
      inscricoes.push({
        via: "supabase",
        perfil: p.p_perfil,
        nome: limpar(p.p_nome),
        email,
        whatsapp: limpar(p.p_whatsapp),
        agencia: p.p_perfil === "agencia" ? limpar(p.p_agencia) : null,
        destino: p.p_perfil === "viajante" ? limpar(p.p_destino) : null,
        utm_source: limpar(p.p_utm_source),
        utm_medium: limpar(p.p_utm_medium),
        utm_campaign: limpar(p.p_utm_campaign),
        cabecalhos: cab,
      });
    }
    return responder(res, 204);
  }

  if (req.method === "POST" && req.url === "/webhook") {
    const campos = Object.fromEntries(new URLSearchParams(texto));
    console.log("[webhook]", req.headers["content-type"], JSON.stringify(campos));
    inscricoes.push({ via: "webhook", ...campos });
    return responder(res, 200, { ok: true });
  }

  responder(res, 404, { message: "não encontrado" });
}).listen(PORTA, () => console.log(`servidor de teste em http://localhost:${PORTA}`));
