import type { ReactNode } from "react";
import { BedDouble, Check, Clock3, GripVertical, Share2, Smartphone, SlidersHorizontal } from "lucide-react";
import { IMG } from "@/conteudo/imagens";
import { cn } from "@/lib/format";
import { Frame } from "@/components/ui";
import { Container, TituloSecao } from "@/components/base";
import { FotoComTela } from "@/components/FotoComTela";
import { MiniAssistente, MiniComoChegar, MiniGastos, MiniPdf } from "@/components/MiniTelas";

/* ---------------------------------------------------------------------------
   Funcionalidades: o fluxo em 3 passos e os destaques (foto do Unsplash +
   miniatura da tela do app), alternando os lados. O modo viagem fica numa
   faixa escura própria (ModoViagem.tsx), entre as duas partes.
--------------------------------------------------------------------------- */

const PASSOS = [
  { titulo: "Responda o questionário", texto: "Destino, datas, quem vai, estilo, ritmo e onde você vai dormir. Leva uns 2 minutos." },
  { titulo: "Receba o roteiro com mapa", texto: "Dia a dia, partindo do hotel, com horários, como chegar e quanto custa cada dia." },
  { titulo: "Viaje com o PDF ou o celular", texto: "Imprima com letra grande ou use o modo viagem, que se adapta ao que você conseguiu ver." },
];

function Destaque({
  titulo,
  texto,
  itens,
  foto,
  alt,
  mini,
  invertido,
}: {
  titulo: string;
  texto: string;
  itens: string[];
  foto: string;
  alt: string;
  mini: ReactNode;
  invertido?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={cn(invertido && "lg:order-2")}>
        <h3 className="text-title-1 font-semibold text-fg">{titulo}</h3>
        <p className="mt-3 max-w-lg text-headline font-normal text-muted">{texto}</p>
        <ul className="mt-5 space-y-2.5">
          {itens.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-body text-fg">
              <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <FotoComTela src={foto} alt={alt} tela={mini} lado={invertido ? "direita" : "esquerda"} />
    </div>
  );
}

export function Funcionalidades() {
  return (
    <section id="funcionalidades" className="py-14 sm:py-20">
      <Container>
        <TituloSecao
          titulo="Tudo o que um roteiro precisa para funcionar na rua"
          subtitulo="Do questionário ao último dia de viagem: o Meu Guia planeja com você e continua do seu lado durante o passeio."
        />

        <ol className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className="tile flex items-start gap-3 p-4">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface-3 text-body-2 font-semibold text-fg num">{i + 1}</span>
              <span>
                <span className="block text-body font-semibold text-fg">{p.titulo}</span>
                <span className="mt-0.5 block text-body-2 text-muted">{p.texto}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-16 space-y-20 sm:mt-24 sm:space-y-28">
          <Destaque
            titulo="Como chegar em cada trecho"
            texto="Entre uma parada e outra, o roteiro mostra o melhor jeito de ir, com a linha do metrô e a estação certas, e não uma estimativa genérica."
            itens={[
              "A pé, transporte público, táxi ou app e carro, com tempo e custo de cada opção",
              "Instruções escritas por quem conhece: saída, sentido do trem, onde sentar",
              "Um toque abre o trajeto no Google Maps",
            ]}
            foto={IMG.metroConcorde}
            alt="Plataforma da estação Concorde do metrô de Paris"
            mini={<MiniComoChegar />}
          />
          <Destaque
            invertido
            titulo="PDF para imprimir, com letra grande"
            texto="Para quem prefere o papel ou não quer depender do celular: o roteiro inteiro numa versão fácil de ler e de seguir."
            itens={[
              "Letra grande, caixas para marcar e o mapa de cada dia",
              "Telefones úteis do destino: emergência, embaixada e consulado",
              "QR Code que abre o mesmo roteiro no celular",
            ]}
            foto={IMG.oculosNoMapa}
            alt="Óculos, lápis e um mapa de papel sobre a mesa"
            mini={<MiniPdf />}
          />
        </div>
      </Container>
    </section>
  );
}

const MAIS = [
  { icon: BedDouble, titulo: "Partindo da hospedagem", texto: "Cada dia começa e termina onde você dorme, com as paradas agrupadas por bairro." },
  { icon: Clock3, titulo: "Horários conferidos", texto: "Nada de chegar ao Louvre numa terça: o roteiro respeita os dias de fechamento." },
  { icon: GripVertical, titulo: "Arraste para reorganizar", texto: "Mude a ordem ou o dia de uma parada; horários e trajetos se recalculam na hora." },
  { icon: SlidersHorizontal, titulo: "No seu ritmo", texto: "Tranquilo, moderado ou intenso. Para a melhor idade, sem longas caminhadas e escadas." },
  { icon: Share2, titulo: "Link para quem vai junto", texto: "Compartilhe o roteiro com a família pelo WhatsApp, sem pedir cadastro." },
  { icon: Smartphone, titulo: "Instala na tela inicial", texto: "Sem loja de aplicativos: abre como app e funciona com internet fraca." },
];

export function MaisFuncionalidades() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="space-y-20 sm:space-y-28">
          <Destaque
            titulo="Quanto os viajantes gastam de verdade"
            texto="Ninguém sabe quanto custa comer por dia no destino. O Meu Guia sabe, porque os viajantes registram o que gastaram."
            itens={[
              "Mediana e faixa comum de café, almoço e jantar, por orçamento",
              "Registrou um gasto? Veja na hora se ficou acima ou abaixo",
              "Estimado e realizado por dia, para a viagem não estourar",
            ]}
            foto={IMG.cafeParis}
            alt="Mesas de um café de esquina em Paris"
            mini={<MiniGastos />}
          />
          <Destaque
            invertido
            titulo="Assistente de viagem com IA"
            texto="Parou na frente de um monumento e quer saber o que é? Tire uma foto: o assistente reconhece o lugar e conta a história."
            itens={[
              "História, curiosidades, horário, ingresso e a dica do especialista",
              "Ouça em voz alta enquanto caminha",
              "Pergunte quem construiu ou o que tem por perto",
            ]}
            foto={IMG.fotoArcoDoTriunfo}
            alt="Turista fotografando o Arco do Triunfo com o celular"
            mini={<MiniAssistente />}
          />
        </div>

        <Frame className="mt-20 sm:mt-28" title="E mais" subtitle="O que faz diferença no meio da viagem" padded={false} panelClassName="overflow-hidden">
          {/* o vão de 1px sobre o fundo bg-line desenha os fios entre os itens, com qualquer nº de colunas */}
          <ul className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {MAIS.map((m) => (
              <li key={m.titulo} className="flex items-start gap-3 bg-surface-2 p-4">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-tile border border-line bg-surface-2 text-fg shadow-xs">
                  <m.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-body font-semibold text-fg">{m.titulo}</span>
                  <span className="mt-0.5 block text-body-2 text-muted">{m.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </Frame>
      </Container>
    </section>
  );
}
