/* ---------------------------------------------------------------------------
   Gera src/conteudo/exemplo-paris.ts a partir do app do protótipo: roda o
   seed (o próprio gerador de roteiros), pega o roteiro "exemplo-paris" e
   calcula a margem do Sena de cada parada com a geometria real do rio.

   Roda com o tsx do app (é ele que resolve os imports @/… de lá):
     cd ../clayton-ari-meu-guia
     npx tsx ../clayton-ari-meu-guia-site/scripts/exportar-exemplo.ts
--------------------------------------------------------------------------- */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { criarSeed, TOKEN_EXEMPLO } from "../../clayton-ari-meu-guia/src/mocks/seed";
import { RIO_SENA } from "../../clayton-ari-meu-guia/src/mocks/geo";
import { fotoAtracao } from "../../clayton-ari-meu-guia/src/mocks/images";
import { margemDoRio } from "../../clayton-ari-meu-guia/src/lib/geo";
import { corDia } from "../../clayton-ari-meu-guia/src/lib/labels";

const SAIDA = fileURLToPath(new URL("../src/conteudo/exemplo-paris.ts", import.meta.url));

const s = criarSeed();
const r = s.roteiros.find((x) => x.shareToken === TOKEN_EXEMPLO);
if (!r) throw new Error(`roteiro ${TOKEN_EXEMPLO} não encontrado no seed`);
const porId = new Map(s.atracoes.map((a) => [a.id, a]));

const minutos = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return a * 60 + b;
};
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const r5 = (n: number) => Math.round(n * 1e5) / 1e5;
const r1 = (n: number) => Math.round(n * 10) / 10;
const idFoto = (url: string) => url.match(/photo-([\w-]+?)\?/)?.[1] ?? null;

/* objeto JS numa linha: { chave: valor, … } */
const obj = (o: object): string =>
  "{ " +
  Object.entries(o)
    .map(([k, v]) => `${k}: ${v && typeof v === "object" ? obj(v) : JSON.stringify(v)}`)
    .join(", ") +
  " }";

const dias = r.dias.map((d) => {
  let n = 0;
  const paradas = d.paradas.flatMap((p) => {
    const a = p.atracaoId ? porId.get(p.atracaoId) : undefined;
    const ll = a ? { lat: a.lat, lng: a.lng } : p.local;
    if (!ll) return [];
    const refeicao = p.tipo === "refeicao";
    if (!refeicao) n++;
    const rec = p.trechoAnterior?.opcoes.find((o) => o.recomendado);
    return [
      {
        numero: refeicao ? null : n,
        nome: refeicao ? (p.titulo ?? "Almoço") : (a?.nome ?? "Parada"),
        lat: r5(ll.lat),
        lng: r5(ll.lng),
        inicio: p.horarioInicio,
        fim: hhmm(minutos(p.horarioInicio) + p.duracaoMin),
        margem: a && !a.foraDoCentro ? margemDoRio(a, RIO_SENA.pontos) : null,
        trecho: rec ? { modo: rec.modo, min: rec.duracaoMin, km: r1(p.trechoAnterior.distanciaKm) } : null,
        foto: a ? idFoto(fotoAtracao(a.id, a.categoria)) : null,
      },
    ];
  });
  return {
    numero: d.numero,
    cor: corDia(d.numero),
    tema: d.tema,
    distanciaKm: r1(d.distanciaTotalKm),
    deslocamentoMin: d.tempoDeslocamentoMin,
    foraDoCentro: d.paradas.some((p) => (p.atracaoId ? porId.get(p.atracaoId)?.foraDoCentro : false)),
    paradas,
  };
});

const serDia = ({ paradas, ...cab }: (typeof dias)[number]) =>
  `    {\n      ${obj(cab).slice(2, -2)},\n      paradas: [\n${paradas.map((p) => `        ${obj(p)},`).join("\n")}\n      ],\n    },`;

const h = r.hospedagem;
const ts = `/* ---------------------------------------------------------------------------
   Roteiro de exemplo "${r.titulo}", exportado do app do
   protótipo (criarSeed() → roteiro "exemplo-paris", montado pelo próprio
   gerador do Meu Guia). Coordenadas conferidas no Nominatim e margem do Sena
   calculada com a geometria real do rio (pnpm validar:geo no app).
   \`foto\` é o id da foto no Unsplash (images.unsplash.com/photo-<id>).
   NÃO edite à mão: gere de novo com scripts/exportar-exemplo.ts.
--------------------------------------------------------------------------- */

export type Margem = "norte" | "sul" | null;
export type ModoTrecho = "a_pe" | "transporte_publico" | "taxi_app" | "carro" | "trem";

export interface ParadaExemplo {
  /** número da parada no dia; refeição não tem número */
  numero: number | null;
  nome: string;
  lat: number;
  lng: number;
  inicio: string;
  fim: string;
  margem: Margem;
  /** trecho recomendado até aqui (da parada anterior ou da hospedagem) */
  trecho: { modo: ModoTrecho; min: number; km: number } | null;
  foto: string | null;
}

export interface DiaExemplo {
  numero: number;
  cor: string;
  tema: string;
  distanciaKm: number;
  deslocamentoMin: number;
  /** bate-volta fora da cidade (Versalhes): não entra no enquadramento de "todos os dias" */
  foraDoCentro: boolean;
  paradas: ParadaExemplo[];
}

export const EXEMPLO = {
  titulo: ${JSON.stringify(r.titulo)},
  destino: "Paris",
  qtdDias: ${r.qtdDias},
  hospedagem: { nome: ${JSON.stringify(h.nome)}, endereco: ${JSON.stringify(h.endereco)}, lat: ${h.lat}, lng: ${h.lng}, margem: ${JSON.stringify(margemDoRio(h, RIO_SENA.pontos))} as Margem },
  dias: [
${dias.map(serDia).join("\n")}
  ] as DiaExemplo[],
};
`;

writeFileSync(SAIDA, ts);
console.log(`ok ${dias.reduce((t, d) => t + d.paradas.length, 0)} paradas em ${dias.length} dias → ${SAIDA}`);
