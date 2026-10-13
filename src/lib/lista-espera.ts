import type { Perfil, Respostas } from "@/conteudo/lista-espera";
import { semFormula } from "./validar";

/* ---------------------------------------------------------------------------
   Lista de espera: para onde vão as inscrições do quiz.

   1. api            VITE_LISTA_ESPERA_API (ex.: /api): a API Hono de api/,
                     que grava no Postgres. Em produção (Railway) o mesmo
                     servidor serve o site e a API, e o valor /api já vem de
                     .env.production.
   2. demonstracao   sem a variável: guarda no localStorage deste navegador.
                     Serve para apresentar o site, não para captar inscrições.

   E-mail repetido recebe a mesma resposta de um novo (a API ignora em
   silêncio), para o quiz não revelar quem já está na lista.
   Passo a passo em docs/LISTA-DE-ESPERA.md.

   await entrarNaLista({ perfil: "viajante", nome, email });   // erro: Error com mensagem para a tela
--------------------------------------------------------------------------- */

/** as respostas do quiz; perfil, nome e e-mail são obrigatórios */
export type Inscricao = Respostas & { perfil: Perfil; nome: string; email: string };

export type Destino = "api" | "demonstracao";

const API = (import.meta.env.VITE_LISTA_ESPERA_API ?? "").trim().replace(/\/+$/, "");

export const DESTINO: Destino = API ? "api" : "demonstracao";

const CHAVE_DEMO = "meuguia-lista-espera";
const TEMPO_LIMITE_MS = 12000;
const ERRO_REDE = "Não conseguimos falar com o servidor. Confira sua conexão e tente de novo.";
const ERRO_SERVIDOR = "A lista de espera não respondeu agora. Tente de novo em alguns minutos.";
const ERRO_LIMITE = "Muitas inscrições seguidas deste endereço. Tente de novo em alguns minutos.";

/** a linha que é salva: as respostas do ramo escolhido + de onde a pessoa veio (UTM) */
function linhaDe(d: Inscricao) {
  const url = new URLSearchParams(window.location.search);
  const utm = (k: string) => semFormula(url.get(k), 100);
  const viajante = d.perfil === "viajante";
  return {
    perfil: d.perfil,
    nome: semFormula(d.nome) ?? "",
    email: d.email.trim().toLowerCase(),
    whatsapp: semFormula(d.whatsapp, 20),
    agencia: viajante ? null : semFormula(d.agencia),
    destino: viajante ? semFormula(d.destino) : null,
    quando: viajante ? (d.quando ?? null) : null,
    com_quem: viajante ? (d.com_quem ?? null) : null,
    interesses: viajante && d.interesses?.length ? d.interesses : null,
    viagens_mes: viajante ? null : (d.viagens_mes ?? null),
    utm_source: utm("utm_source"),
    utm_medium: utm("utm_medium"),
    utm_campaign: utm("utm_campaign"),
  };
}

type Linha = ReturnType<typeof linhaDe>;

async function enviarParaApi(linha: Linha): Promise<void> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), TEMPO_LIMITE_MS);
  let res: Response;
  try {
    res = await fetch(`${API}/lista-espera`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(linha), signal: ctrl.signal });
  } catch {
    throw new Error(ERRO_REDE);
  } finally {
    window.clearTimeout(timer);
  }
  if (res.status === 429) throw new Error(ERRO_LIMITE);
  if (!res.ok) {
    console.error("[lista de espera] a API respondeu", res.status);
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
  return DESTINO === "api" ? enviarParaApi(linha) : guardarNoNavegador(linha);
}
