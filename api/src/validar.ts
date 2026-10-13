/* ---------------------------------------------------------------------------
   Validação da inscrição, com as mesmas regras do quiz do site
   (src/lib/validar.ts e src/components/lista/QuizListaEspera.tsx). O site já
   valida, mas a API é pública: qualquer um pode chamá-la direto.
--------------------------------------------------------------------------- */

export type Perfil = "viajante" | "agencia";

/** Respostas de escolha do quiz: só estes ids. São os das opções em
 *  src/conteudo/lista-espera.ts e os da tabela (api/sql/002_quiz.sql); o pnpm testar:api confere. */
export const RESPOSTAS = {
  quando: ["3-meses", "6-meses", "mais-tarde", "sem-data"],
  com_quem: ["so-eu", "casal", "familia", "amigos"],
  interesses: ["personalizado", "mapa", "ajustes", "assistente", "foto", "compartilhar"],
  viagens_mes: ["ate-10", "11-30", "31-100", "mais-100"],
} as const;

/** a linha gravada na tabela lista_espera */
export interface Inscricao {
  perfil: Perfil;
  nome: string;
  email: string;
  whatsapp: string | null;
  agencia: string | null;
  destino: string | null;
  quando: string | null;
  com_quem: string | null;
  interesses: string[] | null;
  viagens_mes: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

/** Texto livre sem espaços nem os caracteres que fazem a célula virar fórmula numa planilha (= + - @) no começo. */
export function semFormula(valor: unknown, max = 120): string | null {
  return typeof valor === "string" ? valor.trim().replace(/^[\s=+@-]+/, "").slice(0, max) || null : null;
}

/** e-mail comum, que não começa com caractere de fórmula */
const EMAIL = /^[^\s@=+-][^\s@]*@[^\s@]+\.[^\s@]{2,}$/;

/** Resposta de escolha única: vazia vira null; fora da lista, `false` (inválida). */
function escolha(valor: unknown, aceitas: readonly string[]): string | null | false {
  if (valor == null || valor === "") return null;
  return typeof valor === "string" && aceitas.includes(valor) ? valor : false;
}

/** Interesses: lista de ids conhecidos, sem repetir, na ordem das opções. Vazia vira null; algo estranho, `false`. */
function interessesDe(valor: unknown): string[] | null | false {
  if (valor == null) return null;
  const aceitos: readonly string[] = RESPOSTAS.interesses;
  if (!Array.isArray(valor) || valor.some((v) => typeof v !== "string" || !aceitos.includes(v))) return false;
  const marcados = aceitos.filter((i) => valor.includes(i));
  return marcados.length ? marcados : null;
}

export function validarInscricao(corpo: unknown): { ok: true; inscricao: Inscricao } | { ok: false; erro: string } {
  if (!corpo || typeof corpo !== "object") return { ok: false, erro: "Envie a inscrição em JSON." };
  const d = corpo as Record<string, unknown>;

  const perfil = d.perfil;
  if (perfil !== "viajante" && perfil !== "agencia") return { ok: false, erro: "Perfil inválido: use viajante ou agencia." };

  const nome = semFormula(d.nome);
  if (!nome || nome.length < 3) return { ok: false, erro: "Informe o nome." };

  const email = typeof d.email === "string" ? d.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) return { ok: false, erro: "E-mail inválido." };

  const whatsapp = semFormula(d.whatsapp, 20);
  const digitos = whatsapp?.replace(/\D/g, "").length ?? 0;
  if (whatsapp && digitos !== 10 && digitos !== 11) return { ok: false, erro: "WhatsApp inválido: use (99) 99999-9999." };

  const agencia = perfil === "agencia" ? semFormula(d.agencia) : null;
  if (perfil === "agencia" && (!agencia || agencia.length < 2 || !whatsapp)) return { ok: false, erro: "Agência precisa de nome e WhatsApp." };

  /* respostas do quiz: opcionais (inscrições de antes do quiz não têm), mas, se vierem, têm de ser conhecidas */
  const viajante = perfil === "viajante";
  const quando = viajante ? escolha(d.quando, RESPOSTAS.quando) : null;
  const com_quem = viajante ? escolha(d.com_quem, RESPOSTAS.com_quem) : null;
  const interesses = viajante ? interessesDe(d.interesses) : null;
  const viagens_mes = viajante ? null : escolha(d.viagens_mes, RESPOSTAS.viagens_mes);
  if (quando === false) return { ok: false, erro: "Resposta inválida em quando." };
  if (com_quem === false) return { ok: false, erro: "Resposta inválida em com_quem." };
  if (interesses === false) return { ok: false, erro: "Resposta inválida em interesses." };
  if (viagens_mes === false) return { ok: false, erro: "Resposta inválida em viagens_mes." };

  return {
    ok: true,
    inscricao: {
      perfil,
      nome,
      email,
      whatsapp,
      agencia,
      destino: viajante ? semFormula(d.destino) : null,
      quando,
      com_quem,
      interesses,
      viagens_mes,
      utm_source: semFormula(d.utm_source, 100),
      utm_medium: semFormula(d.utm_medium, 100),
      utm_campaign: semFormula(d.utm_campaign, 100),
    },
  };
}
