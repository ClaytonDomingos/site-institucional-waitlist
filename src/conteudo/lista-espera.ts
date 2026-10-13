import { semFormula } from "@/lib/validar";
import { DESTINOS, MARCA, type IdFuncionalidade } from "./site";

/* ---------------------------------------------------------------------------
   Quiz da lista de espera: as perguntas, na ordem, com textos e opções.
   Uma pergunta por vez, como o /formulario do site da Upside. A tela é
   components/lista/QuizListaEspera.tsx.

   O perfil (1ª pergunta) escolhe o ramo: viajante ou agência. Pergunta com
   `para` só aparece naquele ramo.

   Os ids das opções são o que vai para o banco. A API (RESPOSTAS em
   api/src/validar.ts) e a tabela (api/sql/002_quiz.sql) aceitam só estes:
   mudou um id aqui, mude lá também (o pnpm testar:api confere).
--------------------------------------------------------------------------- */

export type Perfil = "viajante" | "agencia";

export interface Opcao<T extends string = string> {
  id: T;
  rotulo: string;
  descricao?: string;
}

export const PERFIS: Opcao<Perfil>[] = [
  { id: "viajante", rotulo: "Viajante", descricao: "Quero planejar as minhas viagens" },
  { id: "agencia", rotulo: "Agência de viagens", descricao: "Quero entregar roteiros aos meus clientes" },
];

export const QUANDO = [
  { id: "3-meses", rotulo: "Nos próximos 3 meses" },
  { id: "6-meses", rotulo: "Daqui a 3 a 6 meses" },
  { id: "mais-tarde", rotulo: "Daqui a mais de 6 meses" },
  { id: "sem-data", rotulo: "Ainda não tenho data" },
] as const satisfies readonly Opcao[];

export const COM_QUEM = [
  { id: "so-eu", rotulo: "Só eu" },
  { id: "casal", rotulo: "Em casal" },
  { id: "familia", rotulo: "Com a família" },
  { id: "amigos", rotulo: "Com amigos" },
] as const satisfies readonly Opcao[];

/** as 6 funcionalidades da campanha (FUNCIONALIDADES), com um rótulo curto para escolher */
export const INTERESSES = [
  { id: "personalizado", rotulo: "Roteiro do meu jeito" },
  { id: "mapa", rotulo: "Mapa e como chegar" },
  { id: "ajustes", rotulo: "Mudar o roteiro durante a viagem" },
  { id: "assistente", rotulo: "Assistente de viagem com IA" },
  { id: "foto", rotulo: "Descobrir o lugar pela foto" },
  { id: "compartilhar", rotulo: "Planejar com quem vai junto" },
] as const satisfies readonly Opcao<IdFuncionalidade>[];

/** faixas que batem com os planos para agências (30 e 100 roteiros por mês) */
export const VIAGENS_MES = [
  { id: "ate-10", rotulo: "Até 10" },
  { id: "11-30", rotulo: "De 11 a 30" },
  { id: "31-100", rotulo: "De 31 a 100" },
  { id: "mais-100", rotulo: "Mais de 100" },
] as const satisfies readonly Opcao[];

export type Quando = (typeof QUANDO)[number]["id"];
export type ComQuem = (typeof COM_QUEM)[number]["id"];
export type Interesse = (typeof INTERESSES)[number]["id"];
export type ViagensMes = (typeof VIAGENS_MES)[number]["id"];

/** o que a pessoa respondeu, por id da pergunta */
export interface Respostas {
  perfil?: Perfil;
  destino?: string;
  quando?: Quando;
  com_quem?: ComQuem;
  interesses?: Interesse[];
  agencia?: string;
  viagens_mes?: ViagensMes;
  nome?: string;
  email?: string;
  whatsapp?: string;
}

export type IdPergunta = keyof Respostas;

/** texto fixo ou que usa uma resposta anterior ("Marina, qual é o seu melhor e-mail?") */
type Texto = string | ((r: Respostas) => string);

interface Base {
  id: IdPergunta;
  /** só neste ramo; sem `para`, vale para os dois */
  para?: Perfil;
  titulo: Texto;
  descricao?: Texto;
  /** sem resposta, o botão vira "Pular" */
  opcional?: boolean | ((r: Respostas) => boolean);
}

export type Pergunta =
  /** escolha única: avança sozinha ao escolher */
  | (Base & { tipo: "escolha"; opcoes: readonly Opcao[]; erro: string })
  /** várias escolhas, com "Continuar" */
  | (Base & { tipo: "varias"; opcoes: readonly Opcao[] })
  | (Base & { tipo: "texto"; placeholder: string; autoComplete: string; minimo: number; erro?: string; sugestoes?: readonly string[] })
  | (Base & { tipo: "email"; placeholder: string })
  | (Base & { tipo: "whatsapp"; placeholder: string; erro: string });

const primeiroNome = (r: Respostas) => (semFormula(r.nome) ?? "").split(/\s+/)[0];
const agencia = (r: Respostas) => r.perfil === "agencia";

export const PERGUNTAS: Pergunta[] = [
  {
    id: "perfil",
    tipo: "escolha",
    titulo: "Para começar, você é…",
    opcoes: PERFIS,
    erro: "Escolha uma opção para continuar",
  },
  {
    id: "destino",
    para: "viajante",
    tipo: "texto",
    titulo: "Para onde é a sua próxima viagem?",
    descricao: "Os destinos mais pedidos entram primeiro. Vale lugar que ainda não está na lista.",
    opcional: true,
    placeholder: "Ex.: Paris, Gramado, Santiago",
    autoComplete: "off",
    minimo: 0,
    sugestoes: DESTINOS.map((d) => d.nome),
  },
  {
    id: "quando",
    para: "viajante",
    tipo: "escolha",
    titulo: "Quando você vai viajar?",
    descricao: "Assim o aviso chega a tempo de planejar.",
    opcoes: QUANDO,
    erro: "Escolha uma opção para continuar",
  },
  {
    id: "com_quem",
    para: "viajante",
    tipo: "escolha",
    titulo: "Com quem você vai?",
    opcoes: COM_QUEM,
    erro: "Escolha uma opção para continuar",
  },
  {
    id: "interesses",
    para: "viajante",
    tipo: "varias",
    titulo: `O que você mais quer usar no ${MARCA}?`,
    descricao: "Escolha quantas quiser.",
    opcional: true,
    opcoes: INTERESSES,
  },
  {
    id: "agencia",
    para: "agencia",
    tipo: "texto",
    titulo: "Qual é o nome da agência?",
    placeholder: "Nome fantasia",
    autoComplete: "organization",
    minimo: 2,
    erro: "Informe o nome da agência",
  },
  {
    id: "viagens_mes",
    para: "agencia",
    tipo: "escolha",
    titulo: "Quantas viagens a agência vende por mês?",
    descricao: "Para indicarmos o plano certo quando abrirmos.",
    opcoes: VIAGENS_MES,
    erro: "Escolha uma opção para continuar",
  },
  {
    id: "nome",
    tipo: "texto",
    titulo: (r) => (agencia(r) ? "E qual é o seu nome?" : "Como você se chama?"),
    placeholder: "Nome e sobrenome",
    autoComplete: "name",
    minimo: 3,
    erro: "Informe seu nome",
  },
  {
    id: "email",
    tipo: "email",
    titulo: (r) => (primeiroNome(r) ? `${primeiroNome(r)}, qual é o seu melhor e-mail?` : "Qual é o seu melhor e-mail?"),
    descricao: (r) => (agencia(r) ? "As novidades para agências chegam por ele." : `É por ele que avisamos quando o ${MARCA} abrir.`),
    placeholder: "voce@email.com",
  },
  {
    id: "whatsapp",
    tipo: "whatsapp",
    titulo: (r) => (agencia(r) ? "Qual é o WhatsApp da agência?" : "Quer o aviso também no WhatsApp?"),
    descricao: (r) => (agencia(r) ? "Nosso time chama você por lá quando abrirmos para agências." : "Se preferir só o e-mail, é só pular."),
    opcional: (r) => !agencia(r),
    placeholder: "(99) 99999-9999",
    erro: "Informe o WhatsApp da agência",
  },
];

/** as perguntas do ramo (antes de escolher o perfil, conta o de viajante) */
export function perguntasDe(perfil: Perfil | undefined): Pergunta[] {
  return PERGUNTAS.filter((p) => !p.para || p.para === (perfil ?? "viajante"));
}

export const texto = (t: Texto | undefined, r: Respostas) => (typeof t === "function" ? t(r) : t);
export const opcional = (p: Pergunta, r: Respostas) => (typeof p.opcional === "function" ? p.opcional(r) : !!p.opcional);
