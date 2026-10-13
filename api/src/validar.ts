/* ---------------------------------------------------------------------------
   Validação da inscrição, com as mesmas regras do formulário do site
   (src/lib/validar.ts e src/components/secoes/ListaEspera.tsx). O site já
   valida, mas a API é pública: qualquer um pode chamá-la direto.
--------------------------------------------------------------------------- */

export type Perfil = "viajante" | "agencia";

/** a linha gravada na tabela lista_espera */
export interface Inscricao {
  perfil: Perfil;
  nome: string;
  email: string;
  whatsapp: string | null;
  agencia: string | null;
  destino: string | null;
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

  return {
    ok: true,
    inscricao: {
      perfil,
      nome,
      email,
      whatsapp,
      agencia,
      destino: perfil === "viajante" ? semFormula(d.destino) : null,
      utm_source: semFormula(d.utm_source, 100),
      utm_medium: semFormula(d.utm_medium, 100),
      utm_campaign: semFormula(d.utm_campaign, 100),
    },
  };
}
