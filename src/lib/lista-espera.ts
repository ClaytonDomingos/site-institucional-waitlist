/* ---------------------------------------------------------------------------
   Lista de espera: para onde vão as inscrições do formulário.

   O destino sai das variáveis de ambiente (.env.local no dev; painel da
   hospedagem em produção), nesta ordem:

   1. supabase       VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
                     Grava na tabela public.lista_espera
                     (supabase/migrations/20261013120000_lista_espera.sql).
                     A chave publicável só consegue INSERIR: ninguém lê a
                     lista pela internet. E-mail repetido volta 409.
   2. webhook        VITE_LISTA_ESPERA_WEBHOOK
                     POST de formulário (x-www-form-urlencoded, sem preflight
                     de CORS) para n8n, Make, Zapier ou Google Apps Script.
   3. demonstracao   nenhuma variável: guarda no localStorage deste navegador.
                     Serve para apresentar o site, não para captar inscrições.

   Passo a passo de cada opção em docs/LISTA-DE-ESPERA.md.

   const r = await entrarNaLista({ perfil: "viajante", nome, email });
   r === "inscrito" | "ja_inscrito"  ·  erro: Error com mensagem para a tela
--------------------------------------------------------------------------- */

export type Perfil = "viajante" | "agencia";

export interface Inscricao {
  perfil: Perfil;
  nome: string;
  email: string;
  whatsapp?: string;
  /** nome da agência (perfil "agencia") */
  agencia?: string;
  /** para onde quer viajar (perfil "viajante") */
  destino?: string;
}

export type Resultado = "inscrito" | "ja_inscrito";
export type Destino = "supabase" | "webhook" | "demonstracao";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
const WEBHOOK = (import.meta.env.VITE_LISTA_ESPERA_WEBHOOK ?? "").trim();

export const DESTINO: Destino = SUPABASE_URL && SUPABASE_KEY ? "supabase" : WEBHOOK ? "webhook" : "demonstracao";

const CHAVE_DEMO = "meuguia-lista-espera";
const TEMPO_LIMITE_MS = 12000;
const ERRO_REDE = "Não conseguimos falar com o servidor. Confira sua conexão e tente de novo.";
const ERRO_SERVIDOR = "A lista de espera não respondeu agora. Tente de novo em alguns minutos.";

/** a linha que é salva: os campos do formulário + de onde a pessoa veio (UTM) */
function linhaDe(d: Inscricao) {
  const url = new URLSearchParams(window.location.search);
  const utm = (k: string) => url.get(k)?.trim().slice(0, 100) || null;
  const texto = (v?: string) => v?.trim() || null;
  return {
    perfil: d.perfil,
    nome: d.nome.trim(),
    email: d.email.trim().toLowerCase(),
    whatsapp: texto(d.whatsapp),
    agencia: d.perfil === "agencia" ? texto(d.agencia) : null,
    destino: d.perfil === "viajante" ? texto(d.destino) : null,
    utm_source: utm("utm_source"),
    utm_medium: utm("utm_medium"),
    utm_campaign: utm("utm_campaign"),
  };
}

type Linha = ReturnType<typeof linhaDe>;

async function comTempoLimite(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), TEMPO_LIMITE_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch {
    throw new Error(ERRO_REDE);
  } finally {
    window.clearTimeout(timer);
  }
}

async function salvarNoSupabase(linha: Linha): Promise<Resultado> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
    /* sem devolver a linha: o papel anon não tem SELECT na tabela */
    Prefer: "return=minimal",
  };
  /* chave antiga (anon, um JWT) também vai no Authorization; a publicável (sb_publishable_…) só no apikey */
  if (SUPABASE_KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${SUPABASE_KEY}`;
  const res = await comTempoLimite(`${SUPABASE_URL}/rest/v1/lista_espera`, { method: "POST", headers, body: JSON.stringify(linha) });
  if (res.status === 409) return "ja_inscrito";
  if (!res.ok) {
    console.error("[lista de espera] Supabase respondeu", res.status, await res.text().catch(() => ""));
    throw new Error(ERRO_SERVIDOR);
  }
  return "inscrito";
}

async function enviarAoWebhook(linha: Linha): Promise<Resultado> {
  const corpo = new URLSearchParams({ criado_em: new Date().toISOString() });
  for (const [k, v] of Object.entries(linha)) if (v) corpo.set(k, v);
  const res = await comTempoLimite(WEBHOOK, { method: "POST", body: corpo });
  if (!res.ok) {
    console.error("[lista de espera] webhook respondeu", res.status);
    throw new Error(ERRO_SERVIDOR);
  }
  return "inscrito";
}

async function guardarNoNavegador(linha: Linha): Promise<Resultado> {
  await new Promise((r) => window.setTimeout(r, 500 + Math.random() * 400));
  const lista = lerDemonstracao();
  if (lista.some((l) => l.email === linha.email)) return "ja_inscrito";
  lista.push({ ...linha, criado_em: new Date().toISOString() });
  window.localStorage.setItem(CHAVE_DEMO, JSON.stringify(lista));
  console.info(`[lista de espera] modo demonstração: ${lista.length} inscrição(ões) em localStorage["${CHAVE_DEMO}"]. Configure o Supabase ou um webhook (docs/LISTA-DE-ESPERA.md).`);
  return "inscrito";
}

/** inscrições guardadas no modo demonstração (só deste navegador) */
export function lerDemonstracao(): Array<Linha & { criado_em: string }> {
  try {
    return JSON.parse(window.localStorage.getItem(CHAVE_DEMO) ?? "[]");
  } catch {
    return [];
  }
}

export async function entrarNaLista(dados: Inscricao): Promise<Resultado> {
  const linha = linhaDe(dados);
  if (DESTINO === "supabase") return salvarNoSupabase(linha);
  if (DESTINO === "webhook") return enviarAoWebhook(linha);
  return guardarNoNavegador(linha);
}
