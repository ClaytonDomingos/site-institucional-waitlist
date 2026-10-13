/* ---------------------------------------------------------------------------
   Lista de espera: para onde vão as inscrições do formulário.

   O destino sai das variáveis de ambiente (.env.local no dev; painel da
   hospedagem em produção), nesta ordem:

   1. supabase       VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
                     Chama a função entrar_na_lista_espera()
                     (supabase/migrations/20261013120000_lista_espera.sql).
                     A tabela fica fechada para a API: ninguém lê a lista
                     pela internet.
   2. webhook        VITE_LISTA_ESPERA_WEBHOOK
                     POST de formulário (x-www-form-urlencoded, sem preflight
                     de CORS) para n8n, Make, Zapier ou Google Apps Script.
   3. demonstracao   nenhuma variável: guarda no localStorage deste navegador.
                     Serve para apresentar o site, não para captar inscrições.

   E-mail repetido recebe a mesma resposta de um novo (o Supabase ignora em
   silêncio), para o formulário não revelar quem já está na lista.
   Passo a passo de cada opção em docs/LISTA-DE-ESPERA.md.

   await entrarNaLista({ perfil: "viajante", nome, email });   // erro: Error com mensagem para a tela
--------------------------------------------------------------------------- */

import { semFormula } from "./validar";

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
  const utm = (k: string) => semFormula(url.get(k), 100);
  return {
    perfil: d.perfil,
    nome: semFormula(d.nome) ?? "",
    email: d.email.trim().toLowerCase(),
    whatsapp: semFormula(d.whatsapp, 20),
    agencia: d.perfil === "agencia" ? semFormula(d.agencia) : null,
    destino: d.perfil === "viajante" ? semFormula(d.destino) : null,
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

async function salvarNoSupabase(linha: Linha): Promise<void> {
  const headers: Record<string, string> = { apikey: SUPABASE_KEY, "Content-Type": "application/json" };
  /* chave antiga (anon, um JWT) também vai no Authorization; a publicável (sb_publishable_…) só no apikey */
  if (SUPABASE_KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${SUPABASE_KEY}`;
  /* os parâmetros da função têm o prefixo p_ (p_nome, p_email…) */
  const parametros = Object.fromEntries(Object.entries(linha).map(([k, v]) => [`p_${k}`, v]));
  const res = await comTempoLimite(`${SUPABASE_URL}/rest/v1/rpc/entrar_na_lista_espera`, { method: "POST", headers, body: JSON.stringify(parametros) });
  if (!res.ok) {
    console.error("[lista de espera] o Supabase respondeu", res.status);
    throw new Error(ERRO_SERVIDOR);
  }
}

async function enviarAoWebhook(linha: Linha): Promise<void> {
  const corpo = new URLSearchParams({ criado_em: new Date().toISOString() });
  for (const [k, v] of Object.entries(linha)) if (v) corpo.set(k, v);
  const res = await comTempoLimite(WEBHOOK, { method: "POST", body: corpo });
  if (!res.ok) {
    console.error("[lista de espera] o webhook respondeu", res.status);
    throw new Error(ERRO_SERVIDOR);
  }
}

async function guardarNoNavegador(linha: Linha): Promise<void> {
  await new Promise((r) => window.setTimeout(r, 500 + Math.random() * 400));
  let lista: Array<Linha & { criado_em: string }> = [];
  try {
    lista = JSON.parse(window.localStorage.getItem(CHAVE_DEMO) ?? "[]");
  } catch {
    /* conteúdo estragado: recomeça a lista */
  }
  if (lista.some((l) => l.email === linha.email)) return;
  lista.push({ ...linha, criado_em: new Date().toISOString() });
  window.localStorage.setItem(CHAVE_DEMO, JSON.stringify(lista));
}

export async function entrarNaLista(dados: Inscricao): Promise<void> {
  const linha = linhaDe(dados);
  if (DESTINO === "supabase") return salvarNoSupabase(linha);
  if (DESTINO === "webhook") return enviarAoWebhook(linha);
  return guardarNoNavegador(linha);
}
