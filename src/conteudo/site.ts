import { foto } from "./imagens";

/* ---------------------------------------------------------------------------
   Conteúdo do site: marca, funcionalidades, empresa, números, destinos,
   planos e dúvidas. Números e preços são os da base do app do protótipo
   (mocks + admin): 10 destinos publicados, 157 atrações verificadas, planos
   de /admin/planos. Quando a base mudar, atualize aqui. Não espalhe esses
   dados pelas seções.
--------------------------------------------------------------------------- */

/** nome do produto, como nos criativos da campanha (no protótipo do app, "Meu Guia") */
export const MARCA = "Seja Seu Guia";

/** o fecho da campanha (último criativo) */
export const SLOGAN = { titulo: "O mundo do seu jeito", texto: "Planeje, explore, descubra e compartilhe experiências." };

export type IdFuncionalidade = "personalizado" | "mapa" | "ajustes" | "assistente" | "foto" | "compartilhar";

/** As 6 funcionalidades principais, na ordem dos criativos da campanha. Título e resumo são os dos
 *  criativos (sem o ponto de exclamação; "Perdida?" virou "Se perder?"); os itens dizem como funciona no app. */
export const FUNCIONALIDADES: Array<{ id: IdFuncionalidade; titulo: string; resumo: string; itens: string[] }> = [
  {
    id: "personalizado",
    titulo: "Seu roteiro, suas escolhas",
    resumo: "Crie um roteiro personalizado de acordo com os seus interesses.",
    itens: [
      "Escolha destino, datas, quem vai, estilo, ritmo e orçamento em uns 2 minutos",
      "O roteiro sai dia a dia, partindo do seu hotel e juntando o que fica perto",
      "Só entram atrações conferidas, com horário e ingresso atualizados",
    ],
  },
  {
    id: "mapa",
    titulo: "Se perder? Nunca mais",
    resumo: "Acompanhe seu roteiro no mapa e encontre suas atrações com facilidade.",
    itens: [
      "O mapa de cada dia, com a rota saindo do hotel e o ponto azul de onde você está",
      "Como chegar em cada trecho: a pé, metrô com a linha certa, táxi ou app",
      "Um toque abre o caminho no Google Maps",
    ],
  },
  {
    id: "ajustes",
    titulo: "Mudou de ideia? Tudo bem",
    resumo: "Ajuste seus planos e deixe o roteiro se reorganizar automaticamente.",
    itens: [
      "Arraste uma parada para outro horário ou outro dia: horários e caminhos se refazem sozinhos",
      "Troque uma atração por outra ali perto, do mesmo estilo",
      "Não deu tempo? O que ficou para trás entra nos próximos dias, perto de onde você já vai estar",
      "Você vê a prévia de cada mudança antes de aplicar",
    ],
  },
  {
    id: "assistente",
    titulo: "Sua assistente de viagem",
    resumo: "Tire dúvidas, receba dicas e descubra novas possibilidades com IA.",
    itens: [
      "Pergunte como numa conversa: onde comer, o que tem por perto, que horas fecha",
      "Respostas com a dica de quem conhece o lugar e quanto os viajantes gastam ali",
      "Sugestões para o seu dia, a partir de onde você está no roteiro",
    ],
  },
  {
    id: "foto",
    titulo: "Fotografou? Descubra",
    resumo: "Tire uma foto e conheça a história do lugar e suas curiosidades.",
    itens: [
      "Reconhece monumentos, igrejas e museus pela foto",
      "História, curiosidades, horário, ingresso e a dica do especialista",
      "Ouça a explicação em voz alta enquanto caminha",
    ],
  },
  {
    id: "compartilhar",
    titulo: "Viajar junto começa no planejamento",
    resumo: "Compartilhe seu roteiro com amigos e familiares e planeje experiências juntos.",
    itens: [
      "Mande o roteiro pelo WhatsApp: abre no celular de quem recebe, sem cadastro",
      "Todo mundo vê os dias, o mapa, os horários e como chegar",
      "Para quem prefere o papel, o PDF com letra grande e caixas para marcar",
    ],
  },
];

/** dados de contato fictícios, como no protótipo: troque pelos reais antes de publicar */
export const EMPRESA = {
  nome: MARCA,
  email: "contato@sejaseuguia.com.br",
  telefone: "(11) 3456-7890",
  endereco: "Av. Paulista, 1000, conj. 101, Bela Vista, São Paulo/SP",
};

/** âncoras do cabeçalho e do rodapé, na ordem da página */
export const SECOES = [
  { id: "funcionalidades", label: "Funcionalidades" },
  { id: "curadoria", label: "Curadoria" },
  { id: "agencias", label: "Para agências" },
  { id: "destinos", label: "Destinos" },
  { id: "planos", label: "Planos" },
  { id: "duvidas", label: "Dúvidas" },
] as const;

export const ROTEIROS_GRATIS = 2;

/** destinos publicados no lançamento, com o nº de atrações verificadas na base */
export const DESTINOS = [
  { id: "paris", nome: "Paris", pais: "França", verificadas: 39, capa: foto("1502602898657-3e91760cbb34", 800) },
  { id: "gramado-canela", nome: "Gramado e Canela", pais: "Brasil", verificadas: 22, capa: foto("1668717342589-722a71ddb579", 800) },
  { id: "roma", nome: "Roma", pais: "Itália", verificadas: 14, capa: foto("1555992828-ca4dbe41d294", 800) },
  { id: "amsterda", nome: "Amsterdã", pais: "Países Baixos", verificadas: 14, capa: foto("1584003564911-a7a321c84e1c", 800) },
  { id: "nova-york", nome: "Nova York", pais: "Estados Unidos", verificadas: 14, capa: foto("1485871981521-5b1fd3805eee", 800) },
  { id: "fortaleza", nome: "Fortaleza", pais: "Brasil", verificadas: 14, capa: foto("1621409928767-d0e0587b73f8", 800) },
  { id: "florenca", nome: "Florença", pais: "Itália", verificadas: 10, capa: foto("1541370976299-4d24ebbc9077", 800) },
  { id: "lisboa", nome: "Lisboa", pais: "Portugal", verificadas: 10, capa: foto("1585208798174-6cedd86e019a", 800) },
  { id: "buenos-aires", nome: "Buenos Aires", pais: "Argentina", verificadas: 10, capa: foto("1725499267114-15531716d101", 800) },
  { id: "rio-de-janeiro", nome: "Rio de Janeiro", pais: "Brasil", verificadas: 10, capa: foto("1544989164-22f292ae11b7", 800) },
];

export const TOTAL_VERIFICADAS = DESTINOS.reduce((s, d) => s + d.verificadas, 0);

export interface Plano {
  id: string;
  nome: string;
  preco: string;
  periodo: string;
  descricao: string;
  recursos: Array<string | { label: string; included: boolean }>;
  destaque?: boolean;
}

export const PRECO_MAPA_VIRTUAL = "R$ 9,90";

export const PLANOS_VIAJANTE: Plano[] = [
  {
    id: "gratis",
    nome: "Grátis",
    preco: "R$ 0",
    periodo: "no cadastro",
    descricao: "Para experimentar, sem cartão de crédito.",
    recursos: [`${ROTEIROS_GRATIS} roteiros grátis no cadastro`, "Mapa do roteiro e PDF com letra grande", "Como chegar em cada trecho", `Mapa virtual: + ${PRECO_MAPA_VIRTUAL} por roteiro`],
  },
  {
    id: "avulso",
    nome: "Roteiro avulso",
    preco: "R$ 9,90",
    periodo: "/roteiro",
    descricao: "Um roteiro completo, sem assinatura.",
    recursos: ["1 roteiro completo, sem assinatura", "Mapa do roteiro e PDF com letra grande", "Como chegar em cada trecho", `Mapa virtual: + ${PRECO_MAPA_VIRTUAL} por roteiro`],
  },
  {
    id: "mensal",
    nome: "Mensal",
    preco: "R$ 49,90",
    periodo: "/mês",
    descricao: "Para quem planeja várias viagens.",
    recursos: ["10 roteiros por mês", "Mapa do roteiro e PDF com letra grande", "Como chegar em cada trecho", `Mapa virtual: + ${PRECO_MAPA_VIRTUAL} por roteiro`, "Gerar variações do mesmo roteiro"],
  },
  {
    id: "anual",
    nome: "Anual",
    preco: "R$ 199,90",
    periodo: "/ano",
    descricao: "Equivale a R$ 16,66 por mês.",
    recursos: ["Roteiros ilimitados", "Mapa do roteiro e PDF com letra grande", "Como chegar em cada trecho", "Mapa virtual incluso em todos os roteiros", "Reajuste automático no modo viagem"],
    destaque: true,
  },
];

export const PLANOS_AGENCIA: Plano[] = [
  {
    id: "essencial",
    nome: "Agência Essencial",
    preco: "R$ 149",
    periodo: "/mês",
    descricao: "Para começar a entregar roteiros aos seus clientes.",
    recursos: [
      "30 roteiros por mês",
      "Até 2 usuários da equipe",
      "Envio do roteiro por WhatsApp",
      { label: "Sua marca no PDF e no link", included: false },
      { label: "Mapa virtual para os clientes", included: false },
      { label: `Sem “Powered by ${MARCA}”`, included: false },
    ],
  },
  {
    id: "pro",
    nome: "Agência Pro",
    preco: "R$ 299",
    periodo: "/mês",
    descricao: "Sua marca no roteiro e mapa virtual para os clientes.",
    recursos: ["100 roteiros por mês", "Até 5 usuários da equipe", "Envio do roteiro por WhatsApp", "Sua marca no PDF e no link", "Mapa virtual para os clientes", `Sem “Powered by ${MARCA}”`],
    destaque: true,
  },
  {
    id: "rede",
    nome: "Agência Rede",
    preco: "R$ 599",
    periodo: "/mês",
    descricao: "Para redes e franquias.",
    recursos: ["Roteiros ilimitados", "Até 15 usuários da equipe", "Envio do roteiro por WhatsApp", "Sua marca no PDF e no link", "Mapa virtual para os clientes", `Sem “Powered by ${MARCA}”`],
  },
];

/** mediana de gastos da comunidade em Paris, orçamento moderado (base do app) */
export const GASTO_ALMOCO_PARIS = { mediana: 22, p25: 16, p75: 30, amostras: 1284, cotacaoEUR: 6.1 };

export const DUVIDAS = [
  {
    id: "quando",
    q: `Quando o ${MARCA} abre para o público?`,
    a: "Estamos na reta final dos testes com viajantes e agências. Quem está na lista de espera recebe o aviso antes de todo mundo, por e-mail e, se você informar, pelo WhatsApp.",
  },
  {
    id: "preco",
    q: "Quanto vai custar?",
    a: `Todo cadastro ganha ${ROTEIROS_GRATIS} roteiros completos, sem cartão. Depois, você escolhe: roteiro avulso por R$ 9,90, Mensal por R$ 49,90 (10 roteiros) ou Anual por R$ 199,90, com roteiros ilimitados e o mapa virtual incluso.`,
  },
  {
    id: "ia",
    q: "O roteiro é feito por inteligência artificial?",
    a: `O roteiro nasce dos seus interesses e de uma base de atrações conferida à mão, com coordenadas reais, horários e ingressos atualizados. O ${MARCA} organiza essa base em dias, partindo do seu hotel, e junta o que fica perto para você andar menos. A inteligência artificial está na assistente de viagem: ela tira dúvidas, dá dicas e conta a história do lugar que você fotografou.`,
  },
  {
    id: "mudar",
    q: "E se eu mudar de ideia no meio da viagem?",
    a: "Mude à vontade: arraste paradas, troque uma atração por outra ali perto ou deixe o roteiro encaixar nos próximos dias o que não deu tempo de ver. Você vê a prévia antes de aplicar, e editar nunca consome crédito.",
  },
  {
    id: "junto",
    q: "Dá para planejar junto com amigos e família?",
    a: "Dá. Compartilhe o roteiro pelo WhatsApp: quem recebe abre no celular, sem cadastro, e vê os dias, o mapa e os horários. Para quem prefere o papel, tem o PDF com letra grande e caixas para marcar.",
  },
  {
    id: "offline",
    q: "Funciona sem internet durante a viagem?",
    a: `O PDF funciona 100% no papel. No celular, o ${MARCA} se instala na tela inicial, sem loja de aplicativos: o roteiro fica salvo e abre mesmo com internet fraca.`,
  },
  {
    id: "destinos",
    q: "Quais destinos estarão disponíveis?",
    a: "No lançamento: Paris, Gramado e Canela, Roma, Amsterdã, Nova York, Fortaleza, Florença, Lisboa, Buenos Aires e Rio de Janeiro. Conte na lista de espera para onde você vai: os destinos mais pedidos entram primeiro.",
  },
  {
    id: "agencia",
    q: "Tenho uma agência de viagens. Como funciona para mim?",
    a: "A agência gera o roteiro a partir da viagem que vendeu, com o destino, as datas e o hotel já preenchidos, e envia ao cliente pelo WhatsApp com a sua marca. Os planos para agências começam em R$ 149 por mês, sem fidelidade.",
  },
  {
    id: "dados",
    q: "O que vocês fazem com os meus dados?",
    a: `Usamos seu nome, e-mail e WhatsApp só para falar sobre o lançamento do ${MARCA}. Não vendemos nem repassamos seus dados. Para sair da lista, escreva para ${EMPRESA.email}.`,
  },
];
